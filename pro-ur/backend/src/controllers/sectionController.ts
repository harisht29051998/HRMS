import { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Validation schemas
const createSectionSchema = z.object({
  title: z.string().min(1),
  position: z.number().optional().default(0)
});

const updateSectionSchema = z.object({
  title: z.string().min(1).optional(),
  position: z.number().optional()
});

export class SectionController {
  static async createSection(req: Request, res: Response, next: any) {
    try {
      const projectId = req.params.id;
      const { title, position } = createSectionSchema.parse(req.body);
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Check if user has access to the project
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          organization: {
            include: {
              members: {
                where: { userId }
              }
            }
          }
        }
      });

      if (!project || project.organization.members.length === 0) {
        return res.status(403).json({ error: 'User does not have access to this project' });
      }

      // Create section
      const section = await prisma.section.create({
        data: {
          title,
          position,
          projectId
        }
      });

      res.status(201).json(section);
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

  static async updateSection(req: Request, res: Response, next: any) {
    try {
      const sectionId = req.params.id;
      const { title, position } = updateSectionSchema.parse(req.body);
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Check if user has access to the section's project
      const section = await prisma.section.findUnique({
        where: { id: sectionId },
        include: {
          project: {
            include: {
              organization: {
                include: {
                  members: {
                    where: { userId }
                  }
                }
              }
            }
          }
        }
      });

      if (!section || section.project.organization.members.length === 0) {
        return res.status(403).json({ error: 'User does not have access to this section' });
      }

      // Update section
      const updatedSection = await prisma.section.update({
        where: { id: sectionId },
        data: {
          title: title ?? undefined,
          position: position ?? undefined
        }
      });

      res.json(updatedSection);
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