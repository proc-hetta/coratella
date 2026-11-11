import { defineParams } from '@sveltejs/kit/params';
import * as z from 'zod';
import { numericId } from '#lib/schemas.ts';

export const params = defineParams({
  number: numericId,
  numberOrNew: z.union([z.literal('new'), numericId]),
});
