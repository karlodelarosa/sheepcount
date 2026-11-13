# Cloudflare deployment

Run `npm run deploy` after unit tests, lint, and TypeScript checks pass.

The OpenNext build override is temporary: its two-year date check rejects Next.js 15 after October 21, 2026, but upstream extended Maintenance LTS through January 31, 2027: https://nextjs.org/support-policy. The app uses patched Next.js 15.5.29. Remove the override when OpenNext recognizes the extension or the app moves to Next.js 16, and upgrade before the extended support ends.

To roll back the worker, use `npx wrangler rollback` and select the previous deployment. Database migrations require separate review; rolling back the worker does not revert data.
