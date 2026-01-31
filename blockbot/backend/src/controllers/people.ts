import { NextFunction, Request, Response } from 'express';
//import { Person } from '../database/types';
import { AppContext } from '../app';

/*export interface PeopleController {
  getAllPeople(req: Request, res: Response<Person[]>, next: NextFunction): Promise<void>;
  addPerson(req: Request, res: Response<Person>, next: NextFunction): Promise<void>;
}

export const makePeopleController = ({ queries }: AppContext): PeopleController => {
  return {
    getAllPeople: async (req, res) => {
      const users = await queries.getAllPeople();
      res.send(users);
    },
    addPerson: async (req, res) => {
      const person = Person.parse(req.body);
      const newPerson = await queries.addPerson(person);
      res.send(newPerson);
    },
  };
};*/
