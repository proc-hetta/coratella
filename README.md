# Coratella

A lovely blog from lovely people of `/proc/hetta` project

## Tests

### Unit and integration

```sh
pnpm test:unit          # watch mode
pnpm test:unit --run    # single run
```

[Vitest](https://vitest.dev) runs `src/**/*.test.ts`. The database layer runs against an in-memory
[PGlite](https://pglite.dev) instance with the real migrations applied, so no running Postgres is
required. Post rendering is pinned by the HTML snapshots in `src/tests/__snapshots__`; update them
with `pnpm test:unit --run -u` only when a rendering change is intended.

### End-to-end

```sh
pnpm exec playwright install chromium   # first time only
pnpm test:e2e
```

[Playwright](https://playwright.dev) runs `tests/e2e/**/*.test.ts` against a production build
(`pnpm build && pnpm preview`). It starts a disposable `postgres:18-alpine` container on port
`54329`, so Docker must be available. Every test starts from an empty database with a single
`admin` user.

### Everything

```sh
pnpm test
```
