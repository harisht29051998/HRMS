import { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '../services/authService';

const prisma = new PrismaClient();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const refreshSchema = z.object({
  refreshToken: z.string()
});

export class AuthController {
  static async register(req: Request, res: Response, next: any) {
    try {
      const { email, password, firstName, lastName } = registerSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(409).json({ error: 'User with this email already exists' });
      }

      // Hash password
      const hashedPassword = await AuthService.hashPassword(password);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName
        }
      });

      // Create personal organization for the user
      const organization = await prisma.organization.create({
        data: {
          name: `${firstName}'s Workspace`,
          slug: `${firstName.toLowerCase()}-${Date.now()}`,
          members: {
            create: {
              userId: user.id,
              role: 'ADMIN'
            }
          }
        }
      });

      // Generate tokens
      const accessTokenPayload = { userId: user.id, email: user.email };
      const accessToken = AuthService.generateAccessToken(accessTokenPayload);
      const refreshToken = AuthService.generateRefreshToken(accessTokenPayload);
      
      // Store refresh token in database
      await AuthService.createRefreshToken(user.id, refreshToken);

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m'
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: any) {
    try {
      const { email, password } = loginSchema.parse(req.body);

      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Verify password
      const isValidPassword = await AuthService.comparePasswords(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate tokens
      const accessTokenPayload = { userId: user.id, email: user.email };
      const accessToken = AuthService.generateAccessToken(accessTokenPayload);
      const refreshToken = AuthService.generateRefreshToken(accessTokenPayload);
      
      // Store refresh token in database
      await AuthService.createRefreshToken(user.id, refreshToken);

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m'
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: any) {
    try {
      const { refreshToken } = refreshSchema.parse(req.body);

      // Get valid refresh token from DB
      const validToken = await AuthService.getValidRefreshToken(refreshToken);

      if (!validToken) {
        return res.status(403).json({ error: 'Invalid or expired refresh token' });
      }

      // Rotate refresh token
      const rotatedTokens = await AuthService.rotateRefreshToken(refreshToken);

      if (!rotatedTokens) {
        return res.status(403).json({ error: 'Failed to rotate refresh token' });
      }

      // Generate new access token
      const newAccessTokenPayload = { 
        userId: validToken.userId, 
        email: validToken.user.email 
      };
      const newAccessToken = AuthService.generateAccessToken(newAccessTokenPayload);

      res.json({
        message: 'Tokens refreshed successfully',
        tokens: {
          accessToken: newAccessToken,
          refreshToken: rotatedTokens.newToken,
          expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m'
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: any) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(400).json({ error: 'Access token required' });
      }

      const payload = AuthService.verifyAccessToken(token);

      if (!payload) {
        return res.status(403).json({ error: 'Invalid access token' });
      }

      // Find and revoke the refresh token associated with this user
      const userRefreshToken = await prisma.refreshToken.findFirst({
        where: {
          userId: payload.userId,
          revoked: false
        }
      });

      if (userRefreshToken) {
        await AuthService.revokeRefreshToken(userRefreshToken.id);
      }

      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }
}