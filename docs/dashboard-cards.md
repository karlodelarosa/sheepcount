# Dashboard summary cards

Use `DashboardMetricCard` from `components/dashboard-metric-card.tsx` for dashboard summary metrics. Existing feature-specific stat-card wrappers delegate to it to preserve their callers.

- Neutral `bg-card` surface, subtle border and shadow, rounded corners.
- Left-aligned circular icon using the selected accent variables, including dark mode.
- Value first, sentence-case label underneath, then supporting text or a trend. Show an em dash when supporting text is unavailable.
- Keep semantic positive/negative colors in trends and retain existing edit actions and progress indicators.
- Keep responsive grids in the containing page; summary cards do not impose a column count.
- Chart, table, and analytical cards retain their existing content layouts.

Legacy `variant`, `accent`, and `featured` props remain accepted by feature wrappers for compatibility; summary appearance comes from the shared component.
