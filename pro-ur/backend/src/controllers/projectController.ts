import { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Validation schemas
const createProjectSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  color: z.string().optional().default('#3B82F6')
});

export class ProjectController {
  static async getProjects(req: Request, res: Response, next: any) {
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

      const projects = await prisma.project.findMany({
        where: { organizationId: orgId },
        include: {
          sections: {
            orderBy: { position: 'asc' }
          }
        }
      });

      res.json(projects);
    } catch (error) {
      next(error);
    }
  }

  static async createProject(req: Request, res: Response, next: any) {
    try {
      const orgId = req.params.id;
      const userId = req.userId;
      const { title, description, color } = createProjectSchema.parse(req.body);

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

      // Create project
      const project = await prisma.project.create({
        data: {
          title,
          description,
          color,
          organizationId: orgId
        },
        include: {
          sections: true
        }
      });

      res.status(201).json(project);
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