import { NextFunction, Request, Response } from 'express';
import { AppContext } from '../app';
import { HttpError } from '../errors';

interface HealthResponse {
  status: 'healthy';
  timestamp: string;
}

export interface HealthController {
  healthCheck(req: Request, res: Response<HealthResponse>, next: NextFunction): Promise<void>;
  DbHealthCheck(req: Request, res: Response<HealthResponse>, next: NextFunction): Promise<void>;
}

export const makeHealthController = ({ queries }: AppContext): HealthController => {
  return {
    healthCheck: async (req, res) => {
      res.send({
        status: 'healthy',
        timestamp: new Date().toISOString(),
      });
    },
    DbHealthCheck: async (req, res) => {
      try {
        const isHealthy = await queries.checkConnection();
        if (!isHealthy) throw new Error();
        res.send({
          status: 'healthy',
          timestamp: new Date().toISOString(),
        });
      } catch {
        throw new HttpError(503, 'Service unavailable');
      }
    },
  };
};
