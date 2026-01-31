import { Router } from 'express';
import { AppContext } from '../app';
import { makeUserController } from '../controllers/user';
import { authenticate } from '../middleware/auth';

export const makeUserRoutes = (ctx: AppContext): Router => {
  const router = Router();
  const controller = makeUserController(ctx);

  router.post('/register', controller.register);
  router.post('/login', controller.login);
  router.get('/profile', authenticate, controller.getProfile);
  // router.get('/logout', controller.logout);

  return router;
};
