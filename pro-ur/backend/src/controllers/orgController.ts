import { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Validation schemas
const createOrgSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1)
});

export class OrgController {
  static async getOrg(req: Request, res: Response, next: any) {
    try {
      const orgId = req.params.id;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Check if user is a member of the organization
      const membership = await prisma.organizationMembership.findUnique({
        where: {
          userId_organizationId: {
            userId,
            organizationId: orgId
          }
        }
      });

      if (!membership) {
        return res.status(403).json({ error: 'User is not a member of this organization' });
      }

      const organization = await prisma.organization.findUnique({
        where: { id: orgId },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      });

      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      res.json(organization);
    } catch (error) {
      next(error);
    }
  }

  static async createOrg(req: Request, res: Response, next: any) {
    try {
      const { name, slug } = createOrgSchema.parse(req.body);
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Check if slug is already taken
      const existingOrg = await prisma.organization.findUnique({
        where: { slug }
      });

      if (existingOrg) {
        return res.status(409).json({ error: 'Organization slug already taken' });
      }

      // Create organization with the user as admin
      const organization = await prisma.organization.create({
        data: {
          name,
          slug,
          members: {
            create: {
              userId,
              role: 'ADMIN'
            }
          }
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      });

      res.status(201).json(organization);
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
}