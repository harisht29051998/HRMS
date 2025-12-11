import { Router } from 'express';
import { SectionController } from '../controllers/sectionController';

export const sectionRoutes = Router();

sectionRoutes.post('/:id', SectionController.createSection); // Create section for a project
sectionRoutes.patch('/:id', SectionController.updateSection); // Update a section

export default sectionRoutes;