# app

Next.js App Router entry points.

## Structure

| Path | Purpose |
|------|---------|
| `(protected)/` | Authenticated app shell — sidebar, providers, feature pages |
| `auth/` | Sign-in, sign-up, password reset, OAuth callback |
| `onboarding/` | New organization setup flow |
| `providers/` | Root-level React providers (`TenantProvider`) |
| `helpers/` | Small app-local utilities |

Public and experimental routes (`chat/`, `gsap2/`, `test/`) are not part of the main product shell.

## Auth flow

1. `middleware.ts` refreshes the Supabase session on each request.
2. `app/providers/tenant-provider.tsx` loads the signed-in user and org membership.
3. Protected routes under `(protected)/` assume a valid tenant; unauthenticated users are redirected via middleware.

## Conventions

- Feature UI lives in `app/(protected)/<feature>/` with optional `_components/` and `_lib/` subfolders.
- Shared layout chrome (sidebar, top bar) is in `app/(protected)/_components/`.
- Prefer colocating feature-specific components under the feature folder rather than `components/`.

See [(protected)/README.md](./(protected)/README.md) for the feature route map.
