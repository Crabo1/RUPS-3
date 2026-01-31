import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Express } from 'express';
import request from 'supertest';
import { getConfig } from '../config';
import { applyMigrations } from '../database/migrate';
import { getPool } from '../database/pool';
import { Queries, makeQueries } from '../database/queries';
import { makeApp } from '../app';
import { makeMiddleware } from '../middleware';
import pino from 'pino';

const logger = pino({ level: 'silent' });

describe('health router', () => {
  const config = getConfig('TEST_');
  let app: Express;
  let queries: Queries;

  beforeAll(async () => {
    await applyMigrations(config.databaseUrl, 'up');
    const middleware = makeMiddleware(logger);
    queries = makeQueries(config.databaseUrl);
    app = makeApp({ queries, middleware });
  });

  afterAll(async () => {
    await applyMigrations(config.databaseUrl, 'down');
    await getPool(config.databaseUrl).end();
  });

  describe('GET /health', () => {
    const url = '/health';

    it('responds with healthy status', async () => {
      const response = await request(app).get(url);
      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.body).toEqual({
        status: 'healthy',
        timestamp: expect.any(String),
      });
    });
  });

  describe('GET /health/deep', () => {
    const url = '/health/deep';

    it('responds with healthy status when database is connected', async () => {
      const response = await request(app).get(url);
      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.body).toEqual({
        status: 'healthy',
        timestamp: expect.any(String),
      });
    });

    it('responds with unhealthy status when database connection fails', async () => {
      vi.spyOn(queries, 'checkConnection').mockRejectedValueOnce(() => {
        throw new Error();
      });

      const response = await request(app).get(url);

      expect(response.statusCode).toBe(503);
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.body).toEqual({
        status: 503,
        message: expect.any(String),
        name: expect.any(String),
      });
    });

    it('responds with unhealthy status when database returns false', async () => {
      vi.spyOn(queries, 'checkConnection').mockResolvedValueOnce(false);

      const response = await request(app).get(url);

      expect(response.statusCode).toBe(503);
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.body).toEqual({
        status: 503,
        message: expect.any(String),
        name: expect.any(String),
      });
    });
  });
});
