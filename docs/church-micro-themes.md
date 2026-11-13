# Church micro themes

Vision & Themes supports Monthly (12 periods) and Quarterly (4 calendar quarters) views. The switch updates the grid, configured count, progress, and active period. Monthly and quarterly records are independent: changing views does not convert or delete themes. Each view can be edited by organization admins under the existing church goals permissions.

Apply `supabase/migrations/20261114010000_church_quarterly_themes.sql` before deploying the updated app. It adds a cadence column to the existing themes table, defaults existing rows to monthly, and scopes uniqueness by organization, year, cadence, and period. Existing row-level security continues to apply. The existing month column stores 1–12 for monthly records and 1–4 for quarterly records.

The context's `getMonthlyTheme` accepts an optional cadence, defaulting to monthly for existing consumers. Saving a period only replaces the matching cadence's record in client state. Failed saves keep the editor open with its entered content.

Validation: `npx vitest run --project unit` and `npx tsc --noEmit`.

The year selector always includes the current year and one year ahead, plus years with saved goals or themes. For example, in 2026 admins can select 2027 and choose **Set up 2027** to create its annual goal, objectives, and themes in advance. The planning window advances with the calendar year; the page still opens on the current year.
