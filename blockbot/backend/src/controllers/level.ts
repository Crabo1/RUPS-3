import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth'
import { AppContext } from '../app';
import { HttpError } from '../errors';

interface LevelBody {
    name: string;
    description: string;
    level: string;
    pos: number;
    actions: string[];
    levelMatrix: string[][];
    objectsMatrix: string[][];
}

export interface LevelController {
    index(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    show(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    create(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
};

export const makeLevelController = ({ queries }: AppContext): LevelController => {
    return {
       index: async(req, res, next) => {
            try {
                if (!req.userId) next(new HttpError(401, 'Unauthorized'));
                
                const levels = await queries.getLevels()

                res.status(200).json({
                    levels
                })
                
            } catch(error) {
                next(error)
            }
       },
        
       show: async(req, res, next) => {
           try {
                if (!req.userId) next(new HttpError(401, 'Unauthorized'));

                const levelId = Number(req.params.level_id);

                if (!levelId) next(new HttpError(404, 'No Level ID Provided'));

                const level = await queries.getLevel(levelId);

                res.status(200).json({
                    level
                });
           } catch(error) {
                next(error)
           }
       },

       create: async(req, res, next) => {
           try {
                if (!req.userId) next(new HttpError(401, 'Unauthorized'));

                const { name, description, level, pos, actions, levelMatrix, objectsMatrix } = req.body as LevelBody;

                console.log(req.body)
                console.log(Array.isArray(levelMatrix))  
                if (!name || name.length <= 0) next(new HttpError(400, 'Name is empty'));
                if (!description || description.length <= 0) next(new HttpError(400, 'Description is empty'));
                if (!level || level.length <= 0) next(new HttpError(400, 'Level is empty'));
                if (!pos || pos < 0) next(new HttpError(400, 'Pos is empty or lower than 0'));
                if (!Array.isArray(actions) || actions.length <= 0) next(new HttpError(400, 'Actions is empty or is not an array'));
                if (!Array.isArray(levelMatrix) || levelMatrix.length <= 0) next(new HttpError(400, 'Level matrix is empty or is not an array'));
                if (!Array.isArray(objectsMatrix) || objectsMatrix.length <= 0) next(new HttpError(400, 'Object matrix is emptry or is not an array'));

                const newLevel = await queries.createLevel(
                    name,
                    description,
                    level,
                    pos,
                    levelMatrix,
                    objectsMatrix,
                    actions
                );

                res.status(201).json({
                    message: 'Level successfully added',
                    level: newLevel
                })

           } catch(error) {
                next(error)
           }
       }
    }
}
