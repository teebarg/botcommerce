# `app/` — BotCommerce Frontend (TanStack Start)

This directory contains the **TanStack Start** storefront for BotCommerce.

If you’re looking for the main project documentation, start at the repo root `README.md`.

---

## What’s in here

- **Routing**: file-based routes under `app/src/routes/`
- **Server functions**: TanStack Start server endpoints under `app/src/server/` (e.g. `createServerFn(...)`)
- **API client**: `app/src/utils/fetch-api.ts` (backend base URL from `process.env.API_URL`)

---

## Dev

Install:

```sh
pnpm install
```

Configure `API_URL` (recommended):

Create `app/.env`:

```
API_URL=http://localhost:8000
```

Run:

```sh
pnpm dev
```

---

## Build

```sh
pnpm build
pnpm start
```

