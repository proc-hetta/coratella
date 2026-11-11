import * as z from 'zod';

/** A positive integer written in decimal digits, e.g. a route or form id. */
export const numericId = z.string().regex(/^\d+$/).transform(Number);
