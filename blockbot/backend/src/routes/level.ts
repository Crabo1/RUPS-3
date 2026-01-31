import { Router } from 'express';
import { AppContext } from '../app';
import { authenticate } from '../middleware/auth';
import { makeLevelController } from '../controllers/level'

export const makeLevelRoutes = (ctx: AppContext): Router => {
  const router = Router();
  const controller = makeLevelController(ctx);

  router.get('/', authenticate, controller.index);
  router.get('/:level_id', authenticate, controller.show);
  router.post('/add', authenticate, controller.create);

  return router;
};
