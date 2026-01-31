import { Router } from 'express';
import { AppContext } from '../app';
import { makeChallengeController } from '../controllers/challenge';
import { authenticate } from '../middleware/auth';


export const makeChallengeRoutes = (ctx: AppContext): Router => {
  const router = Router();
  const controller = makeChallengeController(ctx);
  
    router.post('/', authenticate, controller.sendChallenge);
    router.get('/', authenticate,  controller.getUserChallenges);
    
    router.post('/finish/:id', authenticate, controller.finishChallenge);
  
  return router;
};
