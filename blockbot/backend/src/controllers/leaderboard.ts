import { NextFunction, Request, Response } from 'express';
import { AppContext } from '../app';
import { HttpError } from '../errors';
import { getConfig } from '../config';
import { AuthRequest } from '../middleware/auth';
import { b } from 'vitest/dist/chunks/suite.d.FvehnV49.js';

interface CreateBody {
    name: string
}

export interface LeaderboardController {
    getUsersLeaderboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    create(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    join(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}

export const makeLeaderboardController = ({ queries }: AppContext): LeaderboardController => {
    const config = getConfig();

    return {
        create: async (req, res, next) => {
            try {
                const { name } = req.body as CreateBody;
                
                if (!req.userId) {
                    next(new HttpError(401, 'Unauthorized'));
                }

                let leaderboard = await queries.getLeaderboardByUser(req.userId!);
                let inLeaderboard = await queries.getUserLeaderdboard(req.userId!);

                console.log(leaderboard)
                console.log(inLeaderboard)

                if(inLeaderboard != null) {
                    console.log("Removing form leaderboard");
                    await queries.removeFromLeaderbaord(req.userId!);
                }
                
                if(leaderboard != null) {
                    await queries.removeLeaderboard(leaderboard.id);
                }

                let newLeaderboard = await queries.createLeaderbaord(name, req.userId!);

                await queries.addToLeaderbaord(req.userId!, newLeaderboard.id);

                if(newLeaderboard == null) {
                    next(new HttpError(500, "Failed to create leaderboard"));
                }

                res.status(200).json(newLeaderboard)

            } catch(error: any) {
                next(new HttpError(500, error.message));
            }
        },

        join: async (req, res, next) => {
            try {
                const { id } = req.params;
                
                if (!req.userId) {
                    next(new HttpError(401, 'Unauthorized'));
                }

                let userLeaderbaord = await queries.getLeaderboardByUser(req.userId!);
                let leaderboard = await queries.getLeaderboardById(parseInt(id));
                let inLeaderboard = await queries.getUserLeaderdboard(req.userId!);

                if(leaderboard == null) {
                    res.status(404).json({
                        message: "Leaderbaord does not exist"
                    });
                    console.log("bad bad bad")
                    return;
                }

                if(inLeaderboard != null && inLeaderboard.leaderboard == parseInt(id)) {
                    res.status(200).send();
                    return;
                }
                
                if(inLeaderboard != null) {
                    await queries.removeFromLeaderbaord(req.userId!);
                }

                if(userLeaderbaord != null) {
                    await queries.removeLeaderboard(userLeaderbaord.id);
                }

                await queries.addToLeaderbaord(req.userId!, parseInt(id));

                res.status(200).send();
            } catch(error: any) {
                next(new HttpError(500, error.message));
            }
        },

        getStatus: async (req, res, next) => {
            try {
                if (!req.userId) {
                    next(new HttpError(401, 'Unauthorized'));
                    return;
                }

                let userLeaderboard = await queries.getUserLeaderdboard(req.userId!);

                if(userLeaderboard == null) {
                    next(new HttpError(404, 'Leaderboard doesn\'t exist'));
                    return;
                }

                let data = await queries.getLeaderboardData(userLeaderboard.leaderboard);

                res.status(200).json(data);
            } catch(error: any) {
                next(new HttpError(500, error.message));
            }
        },
        
        getUsersLeaderboard: async (req: AuthRequest, res: Response, next: NextFunction) => {
            try {
                if(!req.userId) {
                    next(new HttpError(401, 'Unauthorized'));
                    return;
                }

                let userLeaderboard = await queries.getUserLeaderdboard(req.userId!);

                if(userLeaderboard == null) {
                    next(new HttpError(404, 'Leaderboard doesn\'t exist'));
                    return;
                }

                let data = await queries.getLeaderboardById(userLeaderboard.leaderboard);

                res.status(200).json(data);
            } catch(error: any) {
                next(new HttpError(500, error.message))
            }
        }
    }
}

