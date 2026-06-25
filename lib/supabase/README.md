# lib/supabase

Supabase client setup and per-domain data access functions.

## Clients

| File | Use |
|------|-----|
| `client.ts` | Browser client (`createBrowserClient`) for client components |
| `server.ts` | Server Components, Route Handlers, and Server Actions |
| `middleware.ts` | Session refresh in Next.js middleware |

Environment variables (see `.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`

## Module files

Each file maps roughly to one product area and exports typed CRUD helpers, for example:

- `people.ts`, `households.ts`, `household-residents.ts`
- `service-attendance.ts`, `events.ts`, `training.ts`
- `properties.ts`, `financial.ts`, `goal-projects.ts`
- `tenant.ts` — org membership and `getOrganizationId()`
- `subscription.ts`, `entitlements.ts` — billing and feature flags

## Conventions

- Accept a Supabase client as the first argument when the caller may be server or browser; providers pass `createClient()` from `client.ts`.
- Export input/output types alongside functions (`CreateXInput`, `UpdateXInput`).
- Rely on RLS policies in `supabase/migrations/` for tenant isolation — do not bypass org scoping in application code.
- Storage uploads (avatars, logos, property images) live next to their domain module when applicable.

## Schema changes

1. Add a migration under `supabase/migrations/`.
2. Run `npm run db:push` (or `supabase db push`).
3. Regenerate types into `lib/database.types.ts`.

See [../../supabase/README.md](../../supabase/README.md) for migration workflow.
