import { Router } from 'express';
import { ProjectController } from '../controllers/projectController';

export const projectRoutes = Router();

projectRoutes.get('/orgs/:id/projects', ProjectController.getProjects);
projectRoutes.post('/orgs/:id', ProjectController.createProject);

export default projectRoutes;