# Production security checklist

Complete these steps in hosted dashboards before go-live. Local `supabase/config.toml` mirrors auth rate limits for development only.

## Supabase (hosted project dashboard)

### Authentication → URL configuration

1. Set **Site URL** to your production origin (e.g. `https://app.example.com`).
2. Add **Redirect URLs**:
   - `https://app.example.com/auth/callback`
   - `https://app.example.com/auth/update-password`
3. Remove unused localhost URLs from production if not needed.

### Authentication → Rate limits

Enable and tune limits for:

- Sign-in / sign-up (`sign_in_sign_ups`) — recommended 30 per 5 minutes per IP
- Email sent (`email_sent`) — password reset abuse
- Token refresh (`token_refresh`)

Hosted dashboard: **Authentication → Rate Limits**.

### Storage

Confirm bucket limits (already set in migrations):

| Bucket | Max size | MIME types |
|--------|----------|------------|
| `avatars` | 5 MB | jpeg, png, webp, gif |
| `organization-logos` | 5 MB | jpeg, png, webp, gif |
| `property-images` | 5 MB | jpeg, png, webp, gif |

Review in **Storage → Policies** after applying migrations.

## Cloudflare (production zone)

### SSL/TLS

- Set encryption mode to **Full (strict)**
- Enable **Always Use HTTPS**
- Enable **HSTS** (max-age ≥ 6 months, include subdomains if applicable)

### Security

1. **Bot Fight Mode** — Security → Bots
2. **WAF managed rules** — Security → WAF → Managed rules → enable OWASP Core Ruleset
3. **Rate limiting** — Security → WAF → Rate limiting rules:
   - Path matches `/auth/*`
   - 30 requests per minute per IP (adjust for shared office networks)
   - Action: Block

### Workers Builds (Git deploy)

In **Workers & Pages → sheepcount → Settings → Builds**, use OpenNext commands — not `npm run build` + `wrangler deploy`:

| Setting | Command |
|---------|---------|
| Build command | `npm run build:cf` |
| Deploy command | `npx opennextjs-cloudflare deploy` |

Or use a single deploy step: `npm run deploy` (builds and deploys in one command).

`npm run build` only runs `next build` and does **not** produce `.open-next/`, so `opennextjs-cloudflare deploy` will fail with "Could not find compiled Open Next config".

Copy env vars into **Build variables and secrets** (same as runtime variables below) so the Next.js build can inline `NEXT_PUBLIC_*` values.

### Workers variables

Set in **Workers & Pages → sheepcount → Settings → Variables**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`

Copy values from `.env.example` / your Supabase project settings. Do not commit production keys to `wrangler.jsonc`.

## After deploy

1. Sign in as a church admin — dashboard, sidebar, add person should work unchanged.
2. Try `get_org_entitlements` with another org UUID — should return `{}` (blocked).
3. Test auth callback redirect: `/auth/callback?next=//evil.com` should land on `/dashboard`.
4. Monitor CSP reports from `Content-Security-Policy-Report-Only` before enforcing CSP.
