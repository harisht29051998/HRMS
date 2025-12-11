import { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient, Priority, Status } from '@prisma/client';

const prisma = new PrismaClient();

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.nativeEnum(Priority).optional(),
  status: z.nativeEnum(Status).optional(),
  dueDate: z.string().datetime().optional(),
  assigneeId: z.string().optional(),
  sectionId: z.string(),
  position: z.number().optional().default(0)
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: z.nativeEnum(Priority).optional(),
  status: z.nativeEnum(Status).optional(),
  dueDate: z.string().datetime().optional(),
  assigneeId: z.string().optional().nullable(),
  sectionId: z.string().optional(),
  position: z.number().optional()
});

export class TaskController {
  static async getTasks(req: Request, res: Response, next: any) {
    try {
      const projectId = req.params.id;
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

      const tasks = await prisma.task.findMany({
        where: { projectId },
        include: {
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          section: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });

      res.json(tasks);
    } catch (error) {
      next(error);
    }
  }

  static async createTask(req: Request, res: Response, next: any) {
    try {
      const { title, description, priority, status, dueDate, assigneeId, sectionId, position } = createTaskSchema.parse(req.body);
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

      // If assigneeId is provided, verify the assignee exists and is a member of the organization
      if (assigneeId) {
        const assigneeMembership = await prisma.organizationMembership.findUnique({
          where: {
            userId_organizationId: {
              userId: assigneeId,
              organizationId: section.project.organizationId
            }
          }
        });

        if (!assigneeMembership) {
          return res.status(400).json({ error: 'Assignee is not a member of this organization' });
        }
      }

      // Create task
      const task = await prisma.task.create({
        data: {
          title,
          description,
          priority,
          status,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          assigneeId,
          sectionId,
          position,
          projectId: section.projectId
        },
        include: {
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          section: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });

      res.status(201).json(task);
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

  static async updateTask(req: Request, res: Response, next: any) {
    try {
      const taskId = req.params.id;
      const { title, description, priority, status, dueDate, assigneeId, sectionId, position } = updateTaskSchema.parse(req.body);
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Check if user has access to the task
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          section: {
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
          }
        }
      });

      if (!task || task.section.project.organization.members.length === 0) {
        return res.status(403).json({ error: 'User does not have access to this task' });
      }

      // If assigneeId is provided, verify the assignee exists and is a member of the organization
      if (assigneeId !== undefined && assigneeId !== null) {
        const assigneeMembership = await prisma.organizationMembership.findUnique({
          where: {
            userId_organizationId: {
              userId: assigneeId,
              organizationId: task.section.project.organizationId
            }
          }
        });

        if (!assigneeMembership) {
          return res.status(400).json({ error: 'Assignee is not a member of this organization' });
        }
      }

      // Update task
      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          title: title ?? undefined,
          description: description ?? undefined,
          priority: priority ?? undefined,
          status: status ?? undefined,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          assigneeId: assigneeId ?? undefined,
          sectionId: sectionId ?? undefined,
          position: position ?? undefined
        },
        include: {
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          section: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });

      res.json(updatedTask);
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

  static async deleteTask(req: Request, res: Response, next: any) {
    try {
      const taskId = req.params.id;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Check if user has access to the task
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          section: {
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
          }
        }
      });

      if (!task || task.section.project.organization.members.length === 0) {
        return res.status(403).json({ error: 'User does not have access to this task' });
      }

      await prisma.task.delete({
        where: { id: taskId }
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}