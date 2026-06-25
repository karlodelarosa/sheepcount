# lib/notifications

In-app notification system for pastoral and operational alerts.

## Files

| File | Purpose |
|------|---------|
| `types.ts` | Notification shape and categories |
| `build-notifications.ts` | Derive notifications from people, attendance, and other domain state |
| `read-state.ts` | Persist which notifications the user has dismissed or read |
| `use-notifications.ts` | React hook for the top bar notification bell |

Notifications are computed client-side from data already loaded by context providers (e.g. people, service attendance). They are not stored as a separate Supabase table unless extended in the future.
