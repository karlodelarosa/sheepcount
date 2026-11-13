# Navigation and motion

Navigation feedback takes priority over animation. The existing design and data providers are preserved; no motion dependency was added.

## Audit and changes

- Sidebar actions previously used `router.push` buttons and derived selection only from the committed pathname. Links now provide Next prefetching, native new-tab behavior, and optimistic selection inside the navigation transition. Selection automatically returns to the committed pathname when a transition finishes or is interrupted. Matching uses path segments so similarly named routes do not share an active state.
- Protected routes lacked a shared `loading.tsx`. A route skeleton now preserves the surrounding shell during route work. Blank nested Suspense fallbacks and text/spinner-only page hydration states use the same skeleton. Existing purpose-built skeletons remain in place. Client effect-based data fetching still needs its own hydrated/loading branch; a route boundary cannot catch those requests.
- PageTransition keyed and remounted its whole subtree on pathname changes and faded from invisible over 500ms. It now preserves its subtree and adds no delay or opacity gate.
- Tabs already deferred panel rendering and preserved visited drafts. Their copied controlled state could remain out of sync if a parent declined a selection. Optimistic selection now derives from the controlled value, with separate uncontrolled state. Suspense skeletons, keyboard semantics, and visited panel state are preserved.
- Shared component slots use color, border, opacity, and shadow transitions with common tokens. Overlay entry/exit durations are consistent. Cards do not lift; tables do not animate their geometry. Sonner keeps its built-in toast lifecycle and swipe behavior.
- Stable scrollbar space reduces width jumps. Reduced-motion CSS covers Tailwind animations, shared component animations, skeleton pulsing, and decorative motion.

## Reuse

Use `PageSkeleton` for page-level loading or preserve a more accurate existing skeleton. Keep loading boundaries inside the persistent shell. Avoid null Suspense fallbacks for visible content.

Use the shared Tabs component for local/nested tabs. Visited panels intentionally stay mounted to retain form drafts. Do not replace that behavior with pathname-keyed page wrappers or exit-before-enter animations.

Use these CSS tokens for new shared interactions:

| Token | Value | Purpose |
| --- | --- | --- |
| `--motion-fast` | 120ms | Hover, focus, selection, panel reveal |
| `--motion-normal` | 180ms | Overlay entry |
| `--motion-exit` | 100ms | Overlay exit |
| `--motion-ease` | cubic-bezier(0.2, 0, 0, 1) | Shared easing |

Animate visual properties rather than layout. Never delay routing or a data update to finish an animation. Do not replace populated content with a page skeleton for a background refresh.

## Validation

Unit tests cover the existing domain behavior. Chromium tab stories verify selection, navigation away from suspended content, draft retention, and a parent refusing a controlled selection. Full authenticated navigation requires a signed-in session; the local app redirects unauthenticated requests to login.

Verified for this change: 72 unit tests, four Chromium tab stories, production build, and ESLint on the shared changes and replaced loading states pass. An isolated Chromium check confirmed 120ms normal feedback, effectively zero reduced-motion duration, and no page exceptions. Storybook emits its existing async `act` warning for the suspended-content fixture and a process-shutdown timeout; the tests themselves pass.
