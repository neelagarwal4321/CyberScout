import { z } from 'zod';

export const googleCallbackSchema = z.object({
  body: z.object({
    code: z.string().min(1),
    code_verifier: z.string().optional(),
  }),
});

export const refreshSchema = z.object({
  cookies: z.object({
    refresh_token: z.string().min(1),
  }),
});
