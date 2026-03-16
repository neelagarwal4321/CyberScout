import pino from 'pino';
export const logger = pino({ name: 'payment-service', level: process.env.NODE_ENV === 'production' ? 'info' : 'debug', transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined });
