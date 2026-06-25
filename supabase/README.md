# supabase

Database schema, RLS policies, and local Supabase CLI configuration.

## Migrations

SQL migrations live in `migrations/` and are applied in timestamp order. Naming convention:

```
YYYYMMDDHHMMSS_short_description.sql
```

Common npm scripts:

```bash
npm run db:push    # push migrations to linked remote project
npm run db:status  # list applied vs pending migrations
```

For local development, use the [Supabase CLI](https://supabase.com/docs/guides/cli) (`supabase start`, `supabase db reset`).

## Multi-tenancy

Tables are scoped by `organization_id`. RLS policies ensure members only access rows for orgs they belong to. Platform admin helpers are defined in dedicated migrations.

## Storage buckets

Defined in migrations (see [../docs/PRODUCTION_SECURITY.md](../docs/PRODUCTION_SECURITY.md)):

- `avatars`
- `organization-logos`
- `property-images`

## After schema changes

1. Push migrations.
2. Regenerate `lib/database.types.ts`.
3. Update `lib/supabase/<module>.ts` and any affected providers.

`config.toml` mirrors local auth settings; production auth URL and rate limits are configured in the Supabase dashboard.
