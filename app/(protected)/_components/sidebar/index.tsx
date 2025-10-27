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
  Calendar,
  Building2,
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
  TrendingUp,
  Book,
  Network,
  Lightbulb,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible/index";
import { useTheme } from "@/context/theme-context";
import { useTenant } from "@/app/providers/tenant-provider";

type ViewRoute =
  | "dashboard"
  | "people"
  | "general-attendance"
  | "households"
  | "life-groups"
  | "work-ministry"
  | "admin-position"
  | "training"
  | "properties"
  | "financial"
  | "goal-projects"
  | "discipleship"
  | "program"
  | "workers"
  | "settings"
  | "service-attendance"
  | "evangelism"
  | "bible-study"
  | "org-chart"
  | "church-goals";

export function Sidebar() {
  const { settings } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { tenant } = useTenant();

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

  const menuGroups = [
    {
      title: "People & Membership",
      items: [
        { title: "People", icon: Users, value: "people" as const },
        { title: "Workers", icon: UserCog, value: "workers" as const },
        { title: "Households", icon: Home, value: "households" as const },
      ],
    },
    {
      title: "Leadership",
      items: [
        { title: "Admin Positions", icon: Shield, value: "admin-position" as const },
        {
          title: "Organization Chart",
          icon: Network,
          value: "org-chart" as const,
        },
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
        { title: "Work Ministry", icon: Award, value: "work-ministry" as const },
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
      title: "Evangelism & Attendance",
      items: [
        {
          title: "Evangelism Flow",
          icon: TrendingUp,
          value: "evangelism" as const,
        },
        {
          title: "Service Attendance",
          icon: Church,
          value: "service-attendance" as const,
        },
        {
          title: "General Attendance",
          icon: Calendar,
          value: "general-attendance" as const,
        },
      ],
    },
    {
      title: "Operations",
      items: [
        { title: "Properties", icon: Building2, value: "properties" as const },
      ],
    },
    {
      title: "Finance & Projects",
      items: [
        { title: "Financial", icon: DollarSign, value: "financial" as const },
        { title: "Goal Projects", icon: Target, value: "goal-projects" as const },
        {
          title: "Church Goals",
          icon: Lightbulb,
          value: "church-goals" as const,
        },
      ],
    },
  ];

  return (
    <SidebarComponent className="w-64 shrink-0 border-r border-border/60 bg-card/80 backdrop-blur-sm">
      <SidebarHeader className="border-b border-border/60 p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-100 dark:via-slate-200 dark:to-slate-100 flex items-center justify-center shadow-lg">
            <Building2 className="w-5 h-5 text-white dark:text-slate-900" />
          </div>
          <div>
            <h2 className="text-foreground">
              {settings?.organizationName || "My Organization"}
            </h2>
            <p className="text-muted-foreground">Management Suite</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarMenu className="space-y-1">
          {/* Dashboard - Always visible */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => navigateTo("dashboard")}
              isActive={isActive("dashboard")}
              className={`
                w-full px-4 py-3 rounded-xl transition-all duration-200
                ${
                  isActive("dashboard")
                    ? "bg-foreground text-background shadow-lg shadow-foreground/20"
                    : "hover:bg-muted text-foreground"
                }
              `}
            >
              <LayoutDashboard className="w-5 h-5 mr-3" />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Grouped Menu Items */}
          {menuGroups.map((group, groupIndex) => (
            <Collapsible
              key={groupIndex}
              defaultOpen
              className="group/collapsible"
            >
              <SidebarGroup>
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="px-4 py-2 text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-between group-data-[state=open]/collapsible:text-foreground">
                    <span>{group.title}</span>
                    <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu className="space-y-1">
                      {group.items.map(item => (
                        <SidebarMenuItem key={item.value}>
                          <SidebarMenuButton
                            onClick={() => navigateTo(item.value)}
                            isActive={isActive(item.value)}
                            className={`
                              w-full px-4 py-2.5 rounded-xl transition-all duration-200
                              ${
                                isActive(item.value)
                                  ? "bg-foreground text-background shadow-lg shadow-foreground/20"
                                  : "hover:bg-muted text-foreground"
                              }
                            `}
                          >
                            <item.icon className="w-5 h-5 mr-3" />
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
          <SidebarMenuItem className="mt-4">
            <SidebarMenuButton
              onClick={() => navigateTo("settings")}
              isActive={isActive("settings")}
              className={`
                w-full px-4 py-3 rounded-xl transition-all duration-200
                ${
                  isActive("settings")
                    ? "bg-foreground text-background shadow-lg shadow-foreground/20"
                    : "hover:bg-muted text-foreground"
                }
              `}
            >
              <Settings className="w-5 h-5 mr-3" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/60">
        <div className="px-4 py-3 rounded-xl bg-muted/50 border border-border/60">
          <p className="text-foreground">Active Members</p>
          <p className="text-muted-foreground">247 people</p>
        </div>
      </SidebarFooter>
    </SidebarComponent>
  );
}
