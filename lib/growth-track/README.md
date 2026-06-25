# lib/growth-track

Helpers for the Growth Track feature — membership stages, overview metrics, and cell-group utilities.

## Files

| File | Purpose |
|------|---------|
| `types.ts` | Growth track–specific types |
| `stage-config.ts` | Stage definitions and labels |
| `overview.ts` | Overview tab aggregations |
| `build-people.ts` | Build people lists for stage views |
| `cell-group-utils.ts` | Cell group membership helpers |

The main provider and UI-facing API live in `lib/growth-track.tsx`. This folder holds pure logic that the provider and `app/(protected)/growth-track/` import.

Data persistence is in `lib/supabase/growth-track.ts`.
