import { Router } from 'express';
import { OrgController } from '../controllers/orgController';

export const orgRoutes = Router();

orgRoutes.get('/:id', OrgController.getOrg);
orgRoutes.post('/', OrgController.createOrg);

export default orgRoutes;