import { z } from 'zod/v4';

export const User = z.object({
    id: z.number().positive(),
    username: z.string(),
    email: z.string(),
    password: z.string(),
    createdAt: z.date()
});

export const Level = z.object({
    id: z.number().positive(),
    name: z.string(),
    description: z.string(),
    level: z.string(),
    pos: z.number().positive().nullable(),
    level_matrix: z.string().array(),
    object_matrix: z.string().array(),
    actions: z.string().array(),
    createdAt: z.date()
});

export const Leaderboard = z.object({
    id: z.number().positive(),
    name: z.string(),
    creator: z.number(),
    createdAt: z.date()
});

export const LevelsUsers = z.object({
    id: z.number().positive(),
    user: z.number().positive(),
    level: z.number().positive(),
    blocks_used: z.string(),
    stars: z.number().positive()
});

export const LevelOverview = z.object({
    user: z.number().positive(),
    stars: z.number().positive(),
});

export const UsersLeaderboard = z.object({
    id: z.number().positive(),
    user: z.number().positive(),
    leaderboard: z.number().positive()
});

export const LeaderboardRow = z.object({
    user: z.string(),
    total_stars: z.number().positive()
});

export type User = z.infer<typeof User>;
export type Level = z.infer<typeof Level>;
export type Leaderboard = z.infer<typeof Leaderboard>;
export type LevelsUsers = z.infer<typeof LevelsUsers>;
export type LevelOverview = z.infer<typeof LevelOverview>;
export type UsersLeaderboard = z.infer<typeof UsersLeaderboard>;
export type LeaderboardRow = z.infer<typeof LeaderboardRow>;
