import { NextFunction, Request, Response } from 'express';
import { AppContext } from '../app';
import { HttpError } from '../errors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getConfig } from '../config';
import { AuthRequest } from '../middleware/auth';

interface RegisterBody {
    username: string;
    email: string;
    password: string;
}

interface LoginBody {
    username: string;
    password: string;
}

export interface UserController {
    register(req: Request, res: Response, next: NextFunction): Promise<void>;
    login(req: Request, res: Response, next: NextFunction): Promise<void>;
    getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getByUsername?(req: Request, res: Response, next: NextFunction): Promise<void>;
}

export const makeUserController = ({ queries }: AppContext): UserController => {
    const config = getConfig();

    return {
        register: async (req, res, next) => {
            try {
                const { username, email, password } = req.body as RegisterBody;

                if (!username || !email || !password) {
                    return next(new HttpError(400, 'Missing required fields'));
                }

                if (password.length < 6) {
                    return next(new HttpError(400, 'Password must contain at least 6 characters'));
                }
                
                console.error("Details: ", username, email, password);
                const user = await queries.createUser(username, email, password);

                console.log('Created user:', user);

                res.status(201).json({
                    status: 201,
                    message: 'User successfully created',
                    user: user
                });
            }
            catch (error) {
                return next(error);
            }
        },

        login: async (req, res, next) => {
            try {
                const { username, password } = req.body as LoginBody;
                
                if (!username || !password) {
                    return next(new HttpError(400, 'Missing username or password'));
                }

                const user = await queries.getUserByUsername(username);

                if (!user) {
                    return next(new HttpError(401, 'Invalid credentials'));
                }

                const isPasswordValid = await bcrypt.compare(password, user!.password);

                if (!isPasswordValid) {
                    return next(new HttpError(401, 'Invalid credentials'));
                }
                
                const token = jwt.sign({ 
                    userId: user!.id,
                    username: user!.username,
                    email: user!.email
                }, config.jwt_secret, { expiresIn: '1h' });

                res.status(200).json({
                    token
                });
            }
            catch(error) {
                return next(error)
            }
        },

        getProfile: async(req, res, next) => {
            try {
                if (!req.userId) {
                    return next(new HttpError(401, 'Unauthorized'));
                }

                const user = await queries.getUserById(req.userId!);

                if (!user) {
                    return next(new HttpError(404, 'User not found'));
                }

                res.status(200).json({
                    id: user?.id,
                    username: user?.username,
                    email: user?.email
                })
            }
            catch(error) {
                return next(error)
            }
        },

        getByUsername: async(req, res, next) => {
            try {
                const { username } = req.params; 
                if (!username) {
                    return next(new HttpError(400, 'Missing username parameter'));
                }

                const user = await queries.getUserByUsername(username);

                if (!user) {
                    return next(new HttpError(404, 'User not found'));
                }
                res.status(200).json({ id: user.id, username: user.username });
            }
            catch (error) {
                return next(error);
            } }
    }
}
