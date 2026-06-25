# lib

Shared business logic, React context providers, and utilities used across the app.

## Layout

| Path | Purpose |
|------|---------|
| `supabase/` | Supabase queries, mutations, and server/client helpers |
| `subscription/` | Plan tiers, module entitlements, and sidebar gating |
| `growth-track/` | Stage config, overview builders, and cell-group helpers |
| `notifications/` | In-app notification types, builders, and read state |
| `types/` | Cross-cutting TypeScript types (tenant, org settings) |
| `auth/` | Auth helpers (e.g. safe redirect after login) |

Feature modules at the root of `lib/` follow a consistent pattern:

- **`lib/supabase/<feature>.ts`** — database access (fetch, create, update, delete)
- **`lib/<feature>.tsx`** — client context provider with hooks (`usePeople`, `useProperties`, etc.)

Providers are composed in `app/(protected)/layout.tsx`. Pages and components should read data through these hooks rather than calling Supabase directly.

## Conventions

- Scope all queries by organization via `getOrganizationId()` from `lib/supabase/tenant`.
- Show toasts for user-facing errors inside providers (`sonner`).
- Keep pure helpers (formatting, labels, path logic) in small `.ts` files at the root of `lib/`.
- Regenerate `database.types.ts` after schema changes (`supabase gen types`).

## Related docs

- [supabase/README.md](./supabase/README.md) — data access layer
- [subscription/README.md](./subscription/README.md) — plans and entitlements
- [../app/(protected)/README.md](../app/(protected)/README.md) — feature routes
