# lib/types

Shared TypeScript types that are not tied to a single feature module.

| File | Purpose |
|------|---------|
| `tenant.ts` | `AuthUser`, `TenantMembership`, org role types |
| `organization-settings.ts` | Org-level settings shape (modules, branding toggles) |

Domain-specific types usually live next to their module — e.g. in `lib/supabase/*.ts` or `lib/growth-track/types.ts`.

Generated database row types are in `lib/database.types.ts` (from Supabase CLI).
