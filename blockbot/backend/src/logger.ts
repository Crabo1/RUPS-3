import pino, { Logger } from 'pino';

export function makeLogger(): Logger {
  return pino({
    redact: ['req.headers.authorization', 'req.headers.cookie'],
  });
}
