# Ministry Lens

Church management and ministry insights — track people, households, attendance, discipleship, finances, and more for your organization.

Built with Next.js 15 (App Router), Supabase, Tailwind CSS, and shadcn/ui. Deployed to Cloudflare Workers via OpenNext.

## Quick start

1. Create a [Supabase project](https://database.new).

2. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` from your project's API settings.

3. Apply database migrations:

   ```bash
   npm run db:push
   ```

4. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server (Turbopack) |
| `npm run build` | Production Next.js build |
| `npm run build:cf` | OpenNext build for Cloudflare |
| `npm run deploy` | Build and deploy Worker (`sheepcount`) |
| `npm run storybook` | Component docs on port 6006 |
| `npm run db:push` | Push Supabase migrations |
| `npm run db:status` | List migration status |

## Project layout

| Directory | Description |
|-----------|-------------|
| [app/](./app/README.md) | Next.js routes, auth, and providers |
| [app/(protected)/](./app/(protected)/README.md) | Authenticated feature pages |
| [lib/](./lib/README.md) | Business logic, context providers, Supabase access |
| [components/](./components/README.md) | Shared UI and shadcn primitives |
| [supabase/](./supabase/README.md) | SQL migrations and CLI config |
| [docs/](./docs/README.md) | Production checklists and guides |

## Deploy to Cloudflare

Set `NEXT_PUBLIC_*` variables in the Cloudflare dashboard (Workers & Pages → sheepcount → Settings → Variables), or use a local `.dev.vars` file for `wrangler`.

```bash
npm run deploy
```

See [docs/PRODUCTION_SECURITY.md](./docs/PRODUCTION_SECURITY.md) before go-live.

## Stack

- [Next.js](https://nextjs.org) App Router
- [Supabase](https://supabase.com) — auth, Postgres, storage, RLS
- [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [OpenNext Cloudflare](https://opennext.js.org/cloudflare) + Wrangler
