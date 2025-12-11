import { Router } from 'express';
import { TaskController } from '../controllers/taskController';

export const taskRoutes = Router();

taskRoutes.get('/projects/:id/tasks', TaskController.getTasks);
taskRoutes.post('/projects/:id/tasks', TaskController.createTask);
taskRoutes.patch('/:id', TaskController.updateTask);
taskRoutes.delete('/:id', TaskController.deleteTask);

export default taskRoutes;