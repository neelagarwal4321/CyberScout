import pino from 'pino';
export const logger = pino({ name: 'live-class-service', level: process.env.NODE_ENV === 'production' ? 'info' : 'debug', transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined });
