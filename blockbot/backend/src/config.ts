import * as dotenv from 'dotenv';
import { z } from 'zod/v4';

export const Config = z.object({
  port: z.coerce.number().int().positive(),
  databaseUrl: z.string(),
  jwt_secret: z.string(),
  jwt_ttl: z.string(),
  frontend_url: z.string(),
});
export type Config = z.infer<typeof Config>;

function readFromEnv(name: string, prefix?: string): string | undefined {
  return process.env[`${prefix ?? ''}${name}`];
}

export const getConfig = (prefix?: string): Config => {
  dotenv.config();
  return Config.parse({
    port: readFromEnv('PORT', prefix),
    databaseUrl: readFromEnv('DATABASE_URL', prefix),
    jwt_secret: readFromEnv('JWT_SECRET', prefix),
    jwt_ttl: readFromEnv('JWT_TTL', prefix),
    frontend_url: readFromEnv('FRONTEND_URL', prefix),
  });
};
