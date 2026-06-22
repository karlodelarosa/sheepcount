"use client";

import { usePathname, useRouter } from "next/navigation";
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
import {
  LayoutDashboard,
  Users,
  Building2,
  Eye,
  Home,
  Award,
  Shield,
  GraduationCap,
  UserCircle,
  DollarSign,
  Target,
  BookOpen,
  CalendarDays,
  UserCog,
  ChevronDown,
  Settings,
  Church,
  Book,
  Lightbulb,
  Tent,
  HeartHandshake,
  GitBranch,
  Droplets,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible/index";
import { useTheme } from "@/context/theme-context";
import { usePeople } from "@/lib/people";
import { useOrganizationSettingsOptional } from "@/lib/organization-settings";
import { APP_NAME } from "@/lib/branding";

type ViewRoute =
  | "dashboard"
  | "people"
  | "households"
  | "life-groups"
  | "cell-groups"
  | "work-ministry"
  | "leadership"
  | "training"
  | "properties"
  | "financial"
  | "goal-projects"
  | "discipleship"
  | "program"
  | "workers"
  | "settings"
  | "service-attendance"
  | "event-attendance"
  | "growth-track"
  | "water-baptism"
  | "bible-study"
  | "church-goals";

export function Sidebar() {
  const { settings } = useTheme();
  const { people, hydrated } = usePeople();
  const orgSettings = useOrganizationSettingsOptional();
  const router = useRouter();
  const pathname = usePathname();

  const activeMemberCount = people.filter(p => p.status === "Active").length;

  const getPath = (view: ViewRoute) => {
    if (view === "dashboard") {
      return "/dashboard";
    }

    return `/${view}`;
  };

  // Helper to determine active state by comparing the current pathname to the link path
  const isActive = (view: ViewRoute) => {
    const path = getPath(view);
    // Dashboard should be an exact match for the root protected path
    if (view === "dashboard") {
      return pathname === path;
    }
    // Other links should check if the pathname starts with their route path
    return pathname.startsWith(path);
  };

  const navigateTo = (view: ViewRoute) => {
    router.push(getPath(view));
  };

  const menuGroups: {
    title: string;
    defaultOpen?: boolean;
    items: {
      title: string;
      icon: React.ComponentType<{ className?: string }>;
      value: ViewRoute;
      disabled?: boolean;
    }[];
  }[] = [
    {
      title: "People & Membership",
      items: [
        { title: "People", icon: Users, value: "people" as const },
        { title: "Workers", icon: UserCog, value: "workers" as const },
        { title: "Households", icon: Home, value: "households" as const },
        ...(orgSettings?.settings.waterBaptismEnabled
          ? [
              {
                title: "Water Baptism",
                icon: Droplets,
                value: "water-baptism" as const,
              },
            ]
          : []),
      ],
    },
    {
      title: "Groups & Ministry",
      items: [
        {
          title: "Life Groups",
          icon: UserCircle,
          value: "life-groups" as const,
        },
        {
          title: "Cell Groups",
          icon: HeartHandshake,
          value: "cell-groups" as const,
        },
        {
          title: "Work Ministry",
          icon: Award,
          value: "work-ministry" as const,
        },
      ],
    },
    {
      title: "Development",
      items: [
        { title: "Training", icon: GraduationCap, value: "training" as const },
        {
          title: "Discipleship",
          icon: BookOpen,
          value: "discipleship" as const,
        },
        { title: "Bible Studies", icon: Book, value: "bible-study" as const },
        { title: "Programs", icon: CalendarDays, value: "program" as const },
      ],
    },
    {
      title: "Leadership",
      items: [
        {
          title: "Leadership",
          icon: Shield,
          value: "leadership" as const,
        },
      ],
    },
    {
      title: "Growth Track",
      items: [
        {
          title: "Growth Track",
          icon: GitBranch,
          value: "growth-track" as const,
        },
      ],
    },
    {
      title: "Attendance",
      items: [
        {
          title: "Service Attendance",
          icon: Church,
          value: "service-attendance" as const,
        },
        {
          title: "Event Attendance",
          icon: Tent,
          value: "event-attendance" as const,
        },
      ],
    },
    {
      title: "Operations",
      defaultOpen: false,
      items: [
        {
          title: "Properties",
          icon: Building2,
          value: "properties" as const,
          disabled: true,
        },
      ],
    },
    {
      title: "Finance & Projects",
      defaultOpen: false,
      items: [
        {
          title: "Financial",
          icon: DollarSign,
          value: "financial" as const,
          disabled: true,
        },
        {
          title: "Goal Projects",
          icon: Target,
          value: "goal-projects" as const,
          disabled: true,
        },
        {
          title: "Church Goals",
          icon: Lightbulb,
          value: "church-goals" as const,
          disabled: true,
        },
      ],
    },
  ];

  return (
    <SidebarComponent className="w-52 shrink-0 border-r border-border/60 bg-card/80 backdrop-blur-sm text-sm">
      <SidebarHeader className="border-b border-border/60 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-100 dark:via-slate-200 dark:to-slate-100 flex items-center justify-center">
            <Eye className="w-3.5 h-3.5 text-white dark:text-slate-900" />
          </div>
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

      <SidebarContent className="p-2">
        <SidebarMenu className="space-y-0.5">
          {/* Dashboard - Always visible */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => navigateTo("dashboard")}
              isActive={isActive("dashboard")}
              className={`
                w-full px-2.5 py-1.5 rounded-lg transition-all duration-200 text-sm
                ${
                  isActive("dashboard")
                    ? "bg-foreground text-background"
                    : "hover:bg-muted text-foreground"
                }
              `}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Grouped Menu Items */}
          {menuGroups.map((group, groupIndex) => (
            <Collapsible
              key={groupIndex}
              defaultOpen={group.defaultOpen ?? true}
              className="group/collapsible"
            >
              <SidebarGroup>
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-between group-data-[state=open]/collapsible:text-foreground">
                    <span>{group.title}</span>
                    <ChevronDown className="w-3 h-3 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu className="space-y-1">
                      {group.items.map(item => (
                        <SidebarMenuItem key={item.value}>
                          <SidebarMenuButton
                            disabled={item.disabled}
                            onClick={
                              item.disabled
                                ? undefined
                                : () => navigateTo(item.value)
                            }
                            isActive={!item.disabled && isActive(item.value)}
                            tooltip={
                              item.disabled ? "Coming soon" : undefined
                            }
                            className={`
                              w-full px-2.5 py-1.5 rounded-lg transition-all duration-200 text-sm
                              ${
                                item.disabled
                                  ? "opacity-50 cursor-not-allowed text-muted-foreground"
                                  : isActive(item.value)
                                    ? "bg-foreground text-background"
                                    : "hover:bg-muted text-foreground"
                              }
                            `}
                          >
                            <item.icon className="w-4 h-4 mr-2" />
                            <span>{item.title}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          ))}

          {/* Settings - Always visible at bottom */}
          <SidebarMenuItem className="mt-2">
            <SidebarMenuButton
              onClick={() => navigateTo("settings")}
              isActive={isActive("settings")}
              className={`
                w-full px-2.5 py-1.5 rounded-lg transition-all duration-200 text-sm
                ${
                  isActive("settings")
                    ? "bg-foreground text-background"
                    : "hover:bg-muted text-foreground"
                }
              `}
            >
              <Settings className="w-4 h-4 mr-2" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-border/60">
        <div className="px-2.5 py-1.5 rounded-lg bg-muted/50 border border-border/60 text-xs">
          <p className="text-foreground">Active Members</p>
          <p className="text-muted-foreground">
            {hydrated ? `${activeMemberCount} people` : "Loading..."}
          </p>
        </div>
      </SidebarFooter>
    </SidebarComponent>
  );
}
