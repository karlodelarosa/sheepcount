# components

Shared React components used across multiple features.

## Layout

| Path | Purpose |
|------|---------|
| `ui/` | shadcn/ui primitives — one folder per component (`button/`, `dialog/`, etc.) |
| `tutorial/` | Onboarding/tutorial UI from the starter template |
| Root files | App-wide pieces (`branding-logo.tsx`, `birthdate-field.tsx`, `page-transition.tsx`) |

## ui/ conventions

Each component folder typically contains:

- `index.tsx` — component implementation
- `index.stories.tsx` — Storybook stories (run `npm run storybook`)

Install new shadcn components via the project `components.json` config. Prefer extending existing `ui/` primitives over one-off styling in feature folders.

## When to put code here vs app/

- **`components/`** — reusable across two or more features, or generic UI primitives.
- **`app/(protected)/<feature>/_components/`** — dialogs, tables, and forms specific to one feature.
