import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { HttpError } from '../errors'
import { getConfig } from '../config'

export interface AuthRequest extends Request {
    userId?: number;
}

export const authenticate = ( req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new HttpError(401, 'No token provided'));
        }

        const token = authHeader!.split(' ')[1];
        const config = getConfig();

        const decoded = jwt.verify(token, config.jwt_secret) as any;
        req.userId = decoded.userId || decoded.id;

        return next();
    }
    catch (error) {
        if (error instanceof HttpError) {
            return next(error)
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return next(new HttpError(401, 'Invalid token'));
        }
        if (error instanceof jwt.TokenExpiredError) {
            return next(new HttpError(401, 'Token expired'));
        } else {
            return next(new HttpError(401, 'Authentication failed'));
        }
    }
};
