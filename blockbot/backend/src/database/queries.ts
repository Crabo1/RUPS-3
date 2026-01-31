import { HttpError } from '../errors';
import { getPool } from './pool';
import { Leaderboard, LevelsUsers, LeaderboardRow, User, UsersLeaderboard, LevelOverview, Level } from './types'
import bcrypt from 'bcrypt'

export interface Queries {
    checkConnection(): Promise<boolean>;
    addToLeaderbaord(user: number, leaderboard: number): Promise<void>;
    getFinishedGames(user: number): Promise<Array<LevelOverview>>
    getFinishedGame(user: number, level: number): Promise<LevelsUsers | null>
    removeFromLeaderbaord(user: number): Promise<void>;
    getLeaderboardData(leaderboard: number): Promise<Array<LeaderboardRow>>
    getUserLeaderdboard(user: number): Promise<UsersLeaderboard | null>;
    removeLeaderboard(id: number): Promise<void>;
    createLeaderbaord(name: string, creator: number): Promise<Leaderboard>;
    getLeaderboardById(id: number): Promise<Leaderboard | null>;
    getLeaderboardByUser(creator: number): Promise<Leaderboard | null>;
    createUser(username: string, email: string, password: string): Promise<User>;
    getUserByUsername(username: string): Promise<User | null>;
    getUserById(id: number): Promise<User | null>;
    getUserCompletedGameById(userId: number, gameId: number): Promise<LevelsUsers | null>;
    createCompletedGame(userId: number, gameId: number, blocks_used: string, stars: number, completed: boolean): Promise<LevelsUsers | null>;
    updateCompletedGame(userId: number, gameId: number, blocks_used: string, stars: number, completed: boolean): Promise<LevelsUsers | null>;
    getLevels(): Promise<Level[] | null>;
    getLevel(levelId: number): Promise<Level | null>;
    createLevel(name: string, description: string, level: string, pos: number, level_matrix: string[][], object_matrix: string[][], actions: string[]): Promise<Level>;
    createChallenge(challenger_id: number, challengee_id: number): Promise<any>;
    getUserChallenges(userId: number): Promise<any[]>;
    getChallengeById(id: number): Promise<any>;
    updateUserStars(userId: number, stars: number): Promise<User>;
    updateChallengeCompleted(challengeId: number): Promise<any>;
    getUserStars(userId: number): Promise<any>;
    deductStarsFromLevels(userId: number, starsToDeduct: number): Promise<number>;
    saveChallengeResults(challengeId: number, score: number, selected_answers: any, stars_won: number): Promise<any>;
    /*getAllPeople(): Promise<Person[]>;
    addPerson(person: Person): Promise<Person>;*/
}

export const makeQueries = (databaseUrl: string): Queries => {
    const pool = getPool(databaseUrl);

    return {
        getLeaderboardData: async (leaderboard: number) => {
            const { rows } = await pool.query<LeaderboardRow>(`
                WITH latest_entries AS (
                    SELECT DISTINCT ON (lu.user, lu.level)
                        lu.id,
                        lu.user,
                        lu.level,
                        lu.stars
                    FROM levels_users lu
                    ORDER BY lu.user, lu.level, lu.id DESC
                )
                SELECT
                    us.username AS user,
                    SUM(le.stars) AS total_stars
                FROM users_leaderboard ul
                LEFT JOIN latest_entries le ON le.user = ul.user
                LEFT JOIN "user" us ON us.id = ul.user
                WHERE ul.leaderboard = $1
                GROUP BY us.username
                ORDER BY total_stars DESC`,
                [leaderboard]
            );

            return rows;
        },

        checkConnection: async () => {
            try {
                const { rows } = await pool.query<{ conn_test: number }>('SELECT 1 as conn_test');
                return rows[0].conn_test === 1;
            } catch {
                return false;
            }
        },

        getFinishedGames: async (user: number) => {
            const { rows } = await pool.query<LevelOverview>(`
                SELECT DISTINCT ON ("user", level) 
                    level,
                    stars
                FROM levels_users
                WHERE "user" = $1 AND stars != 0 
                ORDER BY "user", level, stars DESC`,
                [user]
            )

            return rows;
        },

        getFinishedGame: async (user: number, level: number) => {
            const { rows } = await pool.query(
                `SELECT *
                FROM levels_users
                WHERE "user" = $1 AND level = $2
                ORDER BY stars DESC
                LIMIT 1`,
                [user, level]
            )

            return rows[0] || null;
        },

        addToLeaderbaord: async (user: number, leaderboard: number) => {
            const { rowCount } = await pool.query<UsersLeaderboard>(
                `INSERT INTO "users_leaderboard" ("user", leaderboard)
                 VALUES ($1, $2)
                 RETURNING id, "user", leaderboard`,
                [user, leaderboard]
            );

            if (rowCount === 0) {
                throw new HttpError(500, "Failed to add user to leaderboard");
            }
        },

        removeFromLeaderbaord: async (user: number) => {
            const { rowCount } = await pool.query(
                `DELETE FROM "users_leaderboard" WHERE "user" = $1`,
                [user]
            );

            if (rowCount === 0) {
                throw new HttpError(404, "User not in any leaderbaords");
            }
        },

        getUserLeaderdboard: async (user: number) => {
            const { rows, rowCount } = await pool.query<UsersLeaderboard>(
                `SELECT id, "user", Leaderboard
                 FROM "users_leaderboard"
                 WHERE "user" = $1`,
                [user]
            );

            return rows[0] || null;
        },

        removeLeaderboard: async (id: number) => {
            const { rowCount } = await pool.query(
                `DELETE FROM "leaderboard" WHERE id = $1`,
                [id]
            );

            if (rowCount === 0) {
                throw new HttpError(404, "Failed to delete specified leaderboard");
            }
        },

        getLeaderboardById: async (id: number) => {
            const { rows } = await pool.query<Leaderboard>(
                `SELECT id, name, creator, "createdAt"
                 FROM "leaderboard"
                 WHERE id = $1`,
                [id]
            );

            return rows[0] || null;
        },

        getLeaderboardByUser: async (creator: number) => {
            const { rows } = await pool.query<Leaderboard>(
                `SELECT id, name, creator, "createdAt"
                 FROM "leaderboard"
                 WHERE creator = $1
                 LIMIT 1`,
                [creator]
            );

            return rows[0] || null;
        },

        createLeaderbaord: async (name: string, creator: number) => {
            const { rows, rowCount } = await pool.query<Leaderboard>(
                `INSERT INTO "leaderboard" (name, creator)
                 VALUES ($1, $2)
                 RETURNING id, name, creator, "createdAt"`,
                [name, creator]
            );

            if (rowCount !== 1) {
                throw new HttpError(500, 'Failed to create leaderboard');
            }

            return rows[0];
        },

        createUser: async (username: string, email: string, password: string) => {
            try {
                const hashedPassword = await bcrypt.hash(password, 16)
                const { rows, rowCount } = await pool.query<User>(
                    `INSERT INTO "user" (username, email, password)
                     VALUES ($1, $2, $3)
                     RETURNING id, username, email, "createdAt"`,
                    [username, email, hashedPassword]
                );

                if (rowCount !== 1) {
                    throw new HttpError(500, 'Failed to create user');
                }

                return rows[0]
            }
            catch (error: any) {
                throw error
            }
        },

        getUserByUsername: async (username: string) => {
            try {
                const { rows } = await pool.query<User>(
                    `SELECT id, username, email, password, "createdAt"
                     FROM "user"
                     WHERE username = $1`,
                    [username]
                );
                return rows[0] || null;
            }
            catch (error) {
                throw error;
            }
        },

        getUserById: async (id: number) => {
            try {
                const { rows } = await pool.query<User>(
                    `SELECT id, username, email, password, "createdAt"
                     FROM "user"
                     WHERE id = $1`,
                    [id]
                );
                return rows[0] || null;
            }
            catch (error) {
                throw error;
            }
        },

        getUserCompletedGameById: async (userId: number, gameId: number) => {
            try {
                const { rows } = await pool.query<LevelsUsers>(
                    `SELECT id 
                     FROM "levels_users" 
                     WHERE "user" = $1 
                     AND "level" = $2`,
                    [userId, gameId]
                );

                return rows[0] || null;
            } catch (error) {
                throw error;
            }
        },

        updateCompletedGame: async (userId: number, gameId: number, blocks_used: string, stars: number, completed: boolean) => {
            try {
                const { rows } = await pool.query<LevelsUsers>(
                    `UPDATE "levels_users"
                     SET blocks_used = $1,
                         stars = $2
                     WHERE "user" = $3 AND "level" = $4
                     RETURNING *`,
                    [blocks_used, stars, userId, gameId]
                );

                return rows[0] || null
            } catch (error) {
                throw error;
            }
        },

        createCompletedGame: async (userId: number, gameId: number, blocks_used: string, stars: number, completed: boolean) => {
            try {
                const { rows } = await pool.query<LevelsUsers>(
                    `INSERT INTO "levels_users" ("user", "level", blocks_used, stars)
                     VALUES ($1, $2, $3, $4)
                     RETURNING *`,
                    [userId, gameId, blocks_used, stars]
                );

                return rows[0] || null
            } catch (error) {
                throw error;
            }

        },

        getLevels: async () => {
            try {
                const { rows } = await pool.query<Level>(
                    'SELECT * FROM level'
                );

                return rows;
            } catch (error) {
                throw error;
            }
        },

        getLevel: async (levelId: number) => {
            try {
                const { rows } = await pool.query<Level>(
                    `SELECT * 
                     FROM level
                     WHERE id = $1`,
                    [levelId]
                );

                return rows[0] || null;
            } catch (error) {
                throw error;
            }
        },

        createLevel: async (name: string, description: string, level: string, pos: number, level_matrix: string[][], object_matrix: string[][], actions: string[]) => {
            try {
                const { rows, rowCount } = await pool.query<Level>(
                    `INSERT INTO level (name, description, level, pos, level_matrix, object_matrix, actions)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)
                     RETURNING id, name, description`,
                    [name, description, level, pos, level_matrix, object_matrix, actions]
                );

                if (rowCount !== 1) throw new HttpError(500, 'Internal server error');

                return rows[0];
            } catch (error) {
                throw error;
            }
        },
        createChallenge: async (challenger_id: number, challengee_id: number) => {
            const result = await pool.query(
                `INSERT INTO challenges (challenger_id, challengee_id)
                VALUES ($1, $2)
                RETURNING id, challenger_id, challengee_id`,
                [challenger_id, challengee_id]
            );
            return result.rows[0];
        },

        getUserChallenges: async (userId: number) => {
            const result = await pool.query(
                `SELECT c.*, 
                    u1.username as challenger_username,
                    u2.username as challengee_username
             FROM challenges c
             JOIN "user" u1 ON c.challenger_id = u1.id
             JOIN "user" u2 ON c.challengee_id = u2.id
             WHERE c.challenger_id = $1 OR c.challengee_id = $1`,
                [userId]
            );
            return result.rows;
        },

        getChallengeById: async (id: number) => {
            const result = await pool.query(
                `SELECT c.*, 
                    u1.username as challenger_username,
                    u2.username as challengee_username
             FROM challenges c
             JOIN "user" u1 ON c.challenger_id = u1.id
             JOIN "user" u2 ON c.challengee_id = u2.id
             WHERE c.id = $1`,
                [id]
            );
            return result.rows[0];
        },

        updateUserStars: async (userId: number, stars: number) => {
            const result = await pool.query(
                `UPDATE "users_leaderboard" 
                SET total_stars = total_stars + $1
                WHERE id = $2
                RETURNING *`,
                [stars, userId]
            );
            return result.rows[0];
        },
        updateChallengeCompleted: async (challengeId: number) => {
            const result = await pool.query(
                `UPDATE challenges
                SET completed = true
                WHERE id = $1
                RETURNING *`,
                [challengeId]
            );
            return result.rows[0];
        },


        getUserStars: async (userId: number) => {
            const { rows } = await pool.query(
                `SELECT COALESCE(SUM(stars), 0) AS total_stars
            FROM levels_users
            WHERE "user" = $1`,
                [userId]
            );
            const totalStarsNow = rows[0].total_stars;
        },

        deductStarsFromLevels: async (userId: number, starsChange: number) => {
            if (starsChange === 0) return 0;

            const userLevels = await pool.query(
                `SELECT id, stars FROM levels_users WHERE "user" = $1 ORDER BY stars DESC`,
                [userId]
            );

            let remainingChange = Math.abs(starsChange);

            if (starsChange > 0) {
                for (const level of userLevels.rows) {
                    if (remainingChange <= 0) break;
                    const deduction = Math.min(level.stars, remainingChange);
                    await pool.query(`UPDATE levels_users SET stars = stars - $1 WHERE id = $2`, [deduction, level.id]);
                    remainingChange -= deduction;
                }
                return starsChange - remainingChange;
            } else {
                for (const level of userLevels.rows) {
                    await pool.query(`UPDATE levels_users SET stars = stars + $1 WHERE id = $2`, [remainingChange, level.id]);
                    break; 
                }
                return starsChange;
            }
        },


        saveChallengeResults: async (challengeId: number, score: number, selected_answers: any, stars_won: number) => {
            try {
                const result = await pool.query(
                    `INSERT INTO challenge_results 
             (challenge_id, score, selected_answers, stars_won, created_at)
             VALUES ($1, $2, $3, $4, NOW())
             ON CONFLICT (challenge_id) DO UPDATE
             SET score = $2, selected_answers = $3, stars_won = $4, updated_at = NOW()
             RETURNING *`,
                    [challengeId, score, JSON.stringify(selected_answers || []), stars_won]
                );
                return result.rows[0];
            } catch (error) {
                console.error("Error saving challenge results:", error);
                throw error;
            }
        }




    };
}


/*import { Person } from './types';

export interface Queries {
  checkConnection(): Promise<boolean>;
  getAllPeople(): Promise<Person[]>;
  addPerson(person: Person): Promise<Person>;
}

export const makeQueries = (databaseUrl: string): Queries => {
  const pool = getPool(databaseUrl);

  return {
    checkConnection: async () => {
      try {
        const { rows } = await pool.query<{ conn_test: number }>('SELECT 1 as conn_test');
        return rows[0].conn_test === 1;
      } catch {
        return false;
      }
    },
    getAllPeople: async () => {
      const { rows } = await pool.query<Person>(
        `
        SELECT name, age
        FROM people
        `,
      );
      return rows;
    },
    addPerson: async ({ name, age }) => {
      const { rows, rowCount } = await pool.query<Person, [string, number]>(
        `
        INSERT INTO people (name, age)
        VALUES ($1, $2)
        RETURNING name, age
        `,
        [name, age],
      );
      if (rowCount !== 1) {
        throw new HttpError(500, 'Something went wrong');
      }
      return rows[0];
    },
  };
};*/
