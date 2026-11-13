"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { startTransition, useOptimistic } from "react";
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar/index";
import { ChevronDown, Settings } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible/index";
import { useTheme } from "@/context/theme-context";
import { usePeople } from "@/lib/people";
import { APP_NAME } from "@/lib/branding";
import { BrandingLogo } from "@/components/branding-logo";
import { cn } from "@/lib/utils";
import { useEntitlements } from "@/lib/subscription/use-entitlements";
import {
  DASHBOARD_MENU_ITEM,
  SIDEBAR_MENU_REGISTRY,
  type ViewRoute,
} from "@/lib/subscription/plans";
import { isGroupEnabled } from "@/lib/subscription/entitlements";
import { isMenuItemShownInNavigation } from "@/lib/navigation-visibility";
import { useOrganizationSettings } from "@/lib/organization-settings";
import { Skeleton } from "@/components/ui/skeleton";

function SidebarNavSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      <Skeleton className="h-7 w-full rounded-lg" />
      {[0, 1, 2].map(group => (
        <div key={group} className="space-y-1">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-7 w-full rounded-lg" />
          <Skeleton className="h-7 w-[88%] rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function Sidebar() {
  const { settings } = useTheme();
  const { people, hydrated } = usePeople();
  const { entitlements, isLoading } = useEntitlements();
  const { settings: orgSettings, hydrated: orgSettingsHydrated } =
    useOrganizationSettings();
  const router = useRouter();
  const pathname = usePathname();
  const [activePath, setActivePath] = useOptimistic(pathname);

  const activeMemberCount = people.filter(p => p.status === "Active").length;

  const getPath = (view: ViewRoute) => {
    if (view === "dashboard") {
      return "/dashboard";
    }

    return `/${view}`;
  };

  const isActive = (view: ViewRoute) => {
    const path = getPath(view);
    if (view === "dashboard") {
      return activePath === path;
    }
    return activePath === path || activePath.startsWith(`${path}/`);
  };

  const navigateTo = (view: ViewRoute) => {
    startTransition(() => {
      setActivePath(getPath(view));
      router.push(getPath(view));
    });
  };

  const sidebarItemClass = (active: boolean, disabled = false) =>
    cn(
      "w-full px-3 py-2 lg:py-1.5 rounded-xl transition-colors duration-150 text-sm",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      disabled
        ? "opacity-50 cursor-not-allowed text-muted-foreground"
        : active
          ? "bg-[var(--accent-color)] text-[var(--accent-color-foreground)]"
          : "hover:bg-muted text-foreground",
    );

  const visibleGroups = SIDEBAR_MENU_REGISTRY.map(group => ({
    ...group,
    items: group.items.filter(item =>
      isMenuItemShownInNavigation(item.key, orgSettings, entitlements.modules),
    ),
  })).filter(
    group =>
      isGroupEnabled(entitlements.modules, group.key) && group.items.length > 0,
  );

  const showDashboard = isMenuItemShownInNavigation(
    DASHBOARD_MENU_ITEM.key,
    orgSettings,
    entitlements.modules,
  );

  return (
    <SidebarComponent className="w-60 lg:w-56 shrink-0 border-r border-border/60 bg-card/80 backdrop-blur-sm text-sm">
      <SidebarHeader className="border-b border-border/60 px-5 py-4 lg:px-4 lg:py-3">
        <div className="flex items-center gap-2">
          <BrandingLogo className="w-7 h-7" iconClassName="w-3.5 h-3.5" />
          <div className="min-w-0">
            <h2 className="text-foreground text-sm font-semibold truncate">
              {APP_NAME}
            </h2>
            <p className="text-muted-foreground text-xs truncate">
              {settings?.organizationName || "My Church"}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3 lg:p-2">
        <SidebarMenu className="space-y-0.5">
          {isLoading || !orgSettingsHydrated ? (
            <SidebarNavSkeleton />
          ) : (
            <>
              {showDashboard && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(DASHBOARD_MENU_ITEM.route)}
                    className={sidebarItemClass(
                      isActive(DASHBOARD_MENU_ITEM.route),
                    )}
                  >
                    <Link
                      href={getPath(DASHBOARD_MENU_ITEM.route)}
                      onNavigate={event => {
                        event.preventDefault();
                        navigateTo(DASHBOARD_MENU_ITEM.route);
                      }}
                      aria-current={
                        isActive(DASHBOARD_MENU_ITEM.route) ? "page" : undefined
                      }
                    >
                      <DASHBOARD_MENU_ITEM.icon className="w-4 h-4 mr-2" />
                      <span>{DASHBOARD_MENU_ITEM.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {visibleGroups.map(group => (
                <Collapsible
                  key={group.key}
                  defaultOpen={group.defaultOpen ?? true}
                  className="group/collapsible"
                >
                  <SidebarGroup>
                    <CollapsibleTrigger asChild>
                      <SidebarGroupLabel className="px-2.5 py-2 lg:py-1.5 text-xs font-semibold text-foreground hover:text-foreground cursor-pointer flex items-center justify-between group-data-[state=open]/collapsible:text-foreground">
                        <span>{group.title}</span>
                        <ChevronDown className="w-3 h-3 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                      </SidebarGroupLabel>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarGroupContent>
                        <SidebarMenu className="space-y-1">
                          {group.items.map(item => {
                            const disabled = item.comingSoon ?? false;

                            return (
                              <SidebarMenuItem key={item.key}>
                                <SidebarMenuButton
                                  disabled={disabled}
                                  asChild={!disabled}
                                  isActive={!disabled && isActive(item.route)}
                                  tooltip={disabled ? "Coming soon" : undefined}
                                  className={sidebarItemClass(
                                    !disabled && isActive(item.route),
                                    disabled,
                                  )}
                                >
                                  {disabled ? (
                                    <>
                                      <item.icon className="w-4 h-4 mr-2" />
                                      <span>{item.title}</span>
                                    </>
                                  ) : (
                                    <Link
                                      href={getPath(item.route)}
                                      onNavigate={event => {
                                        event.preventDefault();
                                        navigateTo(item.route);
                                      }}
                                      aria-current={
                                        isActive(item.route)
                                          ? "page"
                                          : undefined
                                      }
                                    >
                                      <item.icon className="w-4 h-4 mr-2" />
                                      <span>{item.title}</span>
                                    </Link>
                                  )}
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            );
                          })}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </CollapsibleContent>
                  </SidebarGroup>
                </Collapsible>
              ))}
            </>
          )}

          <SidebarMenuItem className="mt-2">
            <SidebarMenuButton
              asChild
              isActive={isActive("settings")}
              className={sidebarItemClass(isActive("settings"))}
            >
              <Link
                href="/settings"
                onNavigate={event => {
                  event.preventDefault();
                  navigateTo("settings");
                }}
                aria-current={isActive("settings") ? "page" : undefined}
              >
                <Settings className="w-4 h-4 mr-2" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-border/60">
        <div className="px-3 py-2 rounded-xl bg-muted/50 border border-border/60 text-xs">
          <p className="text-foreground">Active Members</p>
          <p className="text-muted-foreground">
            {hydrated ? `${activeMemberCount} people` : "Loading..."}
          </p>
        </div>
      </SidebarFooter>
    </SidebarComponent>
  );
}
