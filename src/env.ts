import { defineEnvVars } from '@sveltejs/kit/env';
import * as z from 'zod';

const optional = z.string().optional();

export const variables = defineEnvVars({
  DATABASE_URL: { schema: optional, description: 'Postgres connection string' },
  CORATELLA_SECRET: { schema: optional, description: 'Secret used to sign session tokens' },
  TORCOLO_URL: { schema: optional, description: 'Torcolo file storage base URL' },
  TORCOLO_TOKEN: { schema: optional, description: 'Torcolo API token' },
  PUBLIC_TITLE: { public: true, schema: optional, description: 'Blog title' },
  PUBLIC_LOGO: { public: true, schema: optional, description: 'Fallback logo URL' },
  PUBLIC_LOGOLIGHT: { public: true, schema: optional, description: 'Logo URL for light mode' },
  PUBLIC_LOGODARK: { public: true, schema: optional, description: 'Logo URL for dark mode' },
});
