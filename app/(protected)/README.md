# app/(protected)

Authenticated application routes. Each folder is a product feature; URL paths use kebab-case.

## Feature routes

| Folder | Route | lib provider |
|--------|-------|--------------|
| `dashboard/` | `/dashboard` | — |
| `people/` | `/people` | `PeopleProvider` |
| `households/` | `/households` | (via `PeopleProvider`) |
| `workers/` | `/workers` | — |
| `water-baptism/` | `/water-baptism` | `BaptismProvider` |
| `life-groups/` | `/life-groups` | `GroupsMinistryProvider` |
| `cell-groups/` | `/cell-groups` | `GroupsMinistryProvider` |
| `work-ministry/` | `/work-ministry` | `GroupsMinistryProvider` |
| `service-attendance/` | `/service-attendance` | `ServiceAttendanceProvider` |
| `event-attendance/` | `/event-attendance` | `EventsProvider` |
| `training/` | `/training` | `TrainingProvider` |
| `discipleship/` | `/discipleship` | `DiscipleshipProvider` |
| `bible-study/` | `/bible-study` | `BibleStudyProvider` |
| `program/` | `/program` | `EventsProvider` |
| `leadership/` | `/leadership` | `LeadershipProvider` |
| `growth-track/` | `/growth-track` | `GrowthTrackProvider` |
| `properties/` | `/properties` | `PropertiesProvider` |
| `financial/` | `/financial` | — |
| `goal-projects/` | `/goal-projects` | `GoalProjectsProvider` |
| `church-goals/` | `/church-goals` | `ChurchGoalsProvider` |
| `settings/` | `/settings` | `OrganizationSettingsProvider` |
| `profile/` | `/profile` | — |

Sidebar visibility is controlled by subscription entitlements (`lib/subscription/`) and org settings.

## Folder conventions

```
feature/
  index.tsx          # list or main view
  [id]/              # detail routes
  _components/       # feature-only UI (dialogs, tables)
  _lib/              # feature-only pure helpers
```

## Layout

`layout.tsx` wraps all routes with theme, sidebar, org settings, and domain providers. Add a new provider there when introducing a feature that shares client state across multiple pages.
