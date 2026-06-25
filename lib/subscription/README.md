# lib/subscription

Subscription plans, module entitlements, and navigation gating.

## Files

| File | Purpose |
|------|---------|
| `plans.ts` | `SIDEBAR_MENU_REGISTRY`, module group keys, and route mapping |
| `entitlements.ts` | Which modules are enabled for a given plan |
| `plan-highlights.ts` | Marketing copy for upgrade UI |
| `use-entitlements.ts` | React hook consumed by sidebar and feature gates |

## Module groups

Plans unlock **module groups** (e.g. `people_membership`, `attendance`, `finance_projects`). Each group contains **module items** (`people`, `financial`, `growth_track`, etc.) that map to sidebar entries and routes.

`lib/navigation-visibility.ts` combines entitlements with per-org settings to hide or show individual menu items.

## Usage

```tsx
import { useEntitlements } from "@/lib/subscription/use-entitlements";
import { isGroupEnabled } from "@/lib/subscription/entitlements";

const { entitlements, isLoading } = useEntitlements();
const canUseFinance = isGroupEnabled(entitlements.modules, "finance_projects");
```

Database-backed entitlement state is loaded via `lib/supabase/entitlements.ts` and `lib/supabase/subscription.ts`.
