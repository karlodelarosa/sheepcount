"use client";

import { useMemo } from "react";
import { LayoutGrid } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useOrganizationSettings } from "@/lib/organization-settings";
import { useEntitlements } from "@/lib/subscription/use-entitlements";
import { isItemEnabled } from "@/lib/subscription/entitlements";
import {
  DASHBOARD_MENU_ITEM,
  SIDEBAR_MENU_REGISTRY,
  type ModuleItemKey,
} from "@/lib/subscription/plans";
import { isMenuItemVisibleInNav } from "@/lib/types/organization-settings";

export function NavigationVisibilitySettings() {
  const { entitlements, isLoading: entitlementsLoading } = useEntitlements();
  const {
    settings,
    hydrated,
    isSaving,
    setMenuItemHidden,
  } = useOrganizationSettings();

  const hiddenMenuItems = settings.hiddenMenuItems ?? [];

  const visibleMenuGroups = useMemo(() => {
    const dashboardEnabled = isItemEnabled(
      entitlements.modules,
      DASHBOARD_MENU_ITEM.key,
    );

    const groups = SIDEBAR_MENU_REGISTRY.map(group => ({
      ...group,
      items: group.items.filter(item =>
        isItemEnabled(entitlements.modules, item.key),
      ),
    })).filter(group => group.items.length > 0);

    return { dashboardEnabled, groups };
  }, [entitlements.modules]);

  const handleToggle = async (itemKey: ModuleItemKey, visible: boolean) => {
    await setMenuItemHidden(itemKey, !visible);
  };

  const isReady = hydrated && !entitlementsLoading;

  return (
    <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle>Menu Settings</CardTitle>
            <CardDescription>
              Show or hide sidebar menu items for everyone in your organization
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isReady ? (
          <p className="text-sm text-muted-foreground">Loading menu options...</p>
        ) : (
          <>
            {visibleMenuGroups.dashboardEnabled ? (
              <MenuItemRow
                title={DASHBOARD_MENU_ITEM.title}
                groupLabel="General"
                visible={isMenuItemVisibleInNav(
                  DASHBOARD_MENU_ITEM.key,
                  hiddenMenuItems,
                )}
                disabled={isSaving}
                onVisibleChange={visible =>
                  handleToggle(DASHBOARD_MENU_ITEM.key, visible)
                }
              />
            ) : null}

            {visibleMenuGroups.groups.map(group => (
              <div key={group.key} className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {group.title}
                </p>
                <div className="space-y-2">
                  {group.items.map(item => (
                    <MenuItemRow
                      key={item.key}
                      title={item.title}
                      comingSoon={item.comingSoon}
                      visible={isMenuItemVisibleInNav(
                        item.key,
                        hiddenMenuItems,
                      )}
                      disabled={isSaving}
                      onVisibleChange={visible =>
                        handleToggle(item.key, visible)
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function MenuItemRow({
  title,
  groupLabel,
  comingSoon,
  visible,
  disabled,
  onVisibleChange,
}: {
  title: string;
  groupLabel?: string;
  comingSoon?: boolean;
  visible: boolean;
  disabled?: boolean;
  onVisibleChange: (visible: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-background/50 p-4">
      <div className="min-w-0">
        <p className="text-foreground">{title}</p>
        <p className="text-muted-foreground text-sm">
          {groupLabel ?? (comingSoon ? "Coming soon" : "Sidebar menu item")}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {comingSoon ? (
          <Badge variant="secondary" className="text-xs">
            Coming soon
          </Badge>
        ) : null}
        <Switch
          checked={visible}
          disabled={disabled}
          onCheckedChange={onVisibleChange}
          aria-label={`${visible ? "Hide" : "Show"} ${title} in navigation`}
        />
      </div>
    </div>
  );
}
