import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient, RefreshToken } from '@prisma/client';

const prisma = new PrismaClient();

interface JWTPayload {
  userId: string;
  email: string;
}

export class AuthService {
  private static readonly ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'fallback_access_secret';
  private static readonly REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'fallback_refresh_secret';
  private static readonly ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
  private static readonly REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

  public static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  public static async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  public static generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY
    });
  }

  public static generateRefreshToken(payload: JWTPayload): string {
    return jwt.sign(
      { ...payload, jti: uuidv4() }, 
      this.REFRESH_TOKEN_SECRET, 
      { expiresIn: this.REFRESH_TOKEN_EXPIRY }
    );
  }

  public static verifyAccessToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, this.ACCESS_TOKEN_SECRET) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  public static verifyRefreshToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, this.REFRESH_TOKEN_SECRET) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  public static async createRefreshToken(userId: string, token: string): Promise<RefreshToken> {
    const expiresAt = new Date();
    const expiryHours = parseInt(this.REFRESH_TOKEN_EXPIRY.replace('d', '')) * 24;
    expiresAt.setHours(expiresAt.getHours() + expiryHours);

    return await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt
      }
    });
  }

  public static async getValidRefreshToken(token: string): Promise<RefreshToken | null> {
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!refreshToken || refreshToken.revoked || new Date() > refreshToken.expiresAt) {
      return null;
    }

    return refreshToken;
  }

  public static async revokeRefreshToken(tokenId: string): Promise<void> {
    await prisma.refreshToken.update({
      where: { id: tokenId },
      data: { revoked: true }
    });
  }

  public static async rotateRefreshToken(oldToken: string): Promise<{ newToken: string; newExpiry: Date } | null> {
    const oldRefreshToken = await this.getValidRefreshToken(oldToken);
    
    if (!oldRefreshToken) {
      return null;
    }

    // Revoke the old token
    await this.revokeRefreshToken(oldRefreshToken.id);

    // Generate a new refresh token
    const payload = { userId: oldRefreshToken.userId, email: oldRefreshToken.user.email };
    const newToken = this.generateRefreshToken(payload);
    
    const newRefreshToken = await this.createRefreshToken(oldRefreshToken.userId, newToken);
    
    return {
      newToken: newRefreshToken.token,
      newExpiry: newRefreshToken.expiresAt
    };
  }
}