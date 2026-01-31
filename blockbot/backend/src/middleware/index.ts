import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod/v4';
import { HttpError } from '../errors';
import { HttpLogger, pinoHttp } from 'pino-http';
import { Logger } from 'pino';
import { randomUUID } from 'node:crypto';

interface ErrorBody {
  status: number;
  message: string;
  name: string;
}

export interface Middleware {
  logger: HttpLogger<Request, Response>;
  routeNotFound(req: Request, res: Response, next: NextFunction): void;
  errorHandler(err: Error, req: Request, res: Response<ErrorBody>, next: NextFunction): void;
}

export const makeMiddleware = (logger: Logger): Middleware => {
  return {
    logger: pinoHttp({
      logger: logger.child({ category: 'HttpEvent' }),
      genReqId: function (req, res) {
        const id = randomUUID();
        res.setHeader('X-Request-Id', id);
        return id;
      },
      customLogLevel: function (req, res, err) {
        if (res.statusCode >= 400 && res.statusCode < 500) {
          return 'warn';
        } else if (res.statusCode >= 500 || err) {
          return 'error';
        }
        return 'info';
      },
      quietReqLogger: true,
    }),
    routeNotFound: (_req, _res, _next) => {
      throw new HttpError(404, 'Route not found');
    },
    errorHandler: (err, req, res, _next) => {
      const loggerMsg = 'ErrorHandler';
      if (err instanceof HttpError) {
        req.log.warn(err, loggerMsg);
        res.status(err.status).send({ status: err.status, message: err.message, name: err.name });
        return;
      } else if (err instanceof ZodError) {
        req.log.warn(err, loggerMsg);
        res.status(400).send({ status: 400, message: 'Invalid request', name: 'ZodError' });
        return;
      }

      req.log.error(err, loggerMsg);
      res.status(500).send({
        status: 500,
        message: 'Something went wrong',
        name: 'InternalServerError',
      });
    },
  };
};
