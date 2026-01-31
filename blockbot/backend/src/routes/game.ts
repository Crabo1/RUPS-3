import { Router } from 'express';
import { AppContext } from '../app';
import { makeGameController } from '../controllers/game';
import { authenticate } from '../middleware/auth';

export const makeGameRoutes = (ctx: AppContext): Router => {
  const router = Router();
  const controller = makeGameController(ctx);

  router.post('/completed/:game_id', authenticate, controller.completeGame);
  router.get('/', authenticate, controller.getFinishedGames);
  router.get('/:id', authenticate, controller.getFinishedGame);

  return router;
};
