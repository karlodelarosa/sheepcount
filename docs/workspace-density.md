# Workspace density

The authenticated desktop workspace uses a 15px rem base at viewport widths of 1024px and above (93.75% of the configured font size). This scales typography, spacing, icons, sidebar offsets, and portal content together without CSS zoom or transforms. Public pages, mobile, print, and browser zoom keep their existing behavior.

Shared desktop refinements:

- Sidebar: 14rem wide, with matching content offset and tighter navigation spacing.
- Page headers: 24px title token, 48px icon container, less bottom padding, and 36px actions before rem scaling.
- Collection toolbars: 36px search/filter controls before rem scaling.
- Metric cards: smaller icon/value tokens and padding.
- Other cards, tables, dialogs, and controls inherit the modest rem adjustment. Custom padding overrides remain intact.

Mobile keeps its 16px base and existing 44px header actions / 48px collection search fields. Density does not alter breakpoints or use browser zoom.

The `Layout/Workspace Density` Storybook preview composes the shared components for visual checks. Chromium checks at 1366×768, 1440×900, 1920×1080, and 390×844 verified the expected root size, responsive controls, no horizontal overflow, and no page exceptions. Full authenticated pages still require a signed-in session.
