# Workspace design conventions

Use the selected organization accent for primary actions (`Button variant="accent"`) and active or unread indicators. Secondary actions use outline or ghost buttons. Keep destructive and status colors semantic.

Directory cards use neutral `bg-card` surfaces, subtle borders, restrained shadows, and consistent heading and supporting text tokens. Category icons use a soft accent surface with an accent stroke; member initials use `bg-foreground text-background`, including the corresponding inverse in dark mode. Counts and role badges stay neutral. Cell-group cards retain their existing content structure.

Church goal setup, Add Theme, and dialog save actions share the accent button variant. Editors and the carry-forward banner use the same neutral surfaces and soft accent icons.

Notifications use a popover for their interactive tabs and mark-read controls, rather than menu-item semantics. Unread rows use the selected soft accent and a visible dot plus screen-reader label. Read rows remain neutral. The panel is constrained to the viewport, its list scrolls independently, and choosing a notification or footer link closes it. Marking a tab read keeps it open. Loading and empty states retain the same typography and neutral surfaces.
