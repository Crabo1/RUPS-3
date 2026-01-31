import { Router } from 'express';
import { makeHealthController } from '../controllers/health';
import { AppContext } from '../app';

export const makeHealthRoutes = (ctx: AppContext): Router => {
  const router = Router();
  const controller = makeHealthController(ctx);

  router.get('/', controller.healthCheck);
  router.get('/deep', controller.DbHealthCheck);

  return router;
};
