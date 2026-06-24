import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Home,
  UserCog,
  Droplets,
  UserCircle,
  HeartHandshake,
  Award,
  Church,
  Tent,
  GraduationCap,
  BookOpen,
  Book,
  CalendarDays,
  Shield,
  GitBranch,
  Building2,
  DollarSign,
  Target,
  Lightbulb,
} from "lucide-react";

export type ModuleGroupKey =
  | "dashboard"
  | "people_membership"
  | "groups_ministry"
  | "attendance"
  | "development"
  | "leadership"
  | "growth_track"
  | "operations"
  | "finance_projects";

export type ModuleItemKey =
  | "dashboard"
  | "people"
  | "workers"
  | "households"
  | "water_baptism"
  | "life_groups"
  | "cell_groups"
  | "work_ministry"
  | "service_attendance"
  | "event_attendance"
  | "training"
  | "discipleship"
  | "bible_study"
  | "programs"
  | "leadership"
  | "growth_track"
  | "properties"
  | "financial"
  | "goal_projects"
  | "church_goals";

export type ViewRoute =
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

export type ModuleToggleMap = Record<string, { enabled: boolean }>;

export type ModulesConfig = {
  groups: ModuleToggleMap;
  items: ModuleToggleMap;
};

export type SubscriptionFeatures = {
  audit_trail?: boolean;
};

export type SubscriptionLimits = {
  max_people: number;
  max_attendance_sessions: number;
  max_admin_seats: number;
  max_member_seats: number;
};

export type SubscriptionUsage = {
  people: number;
  attendance_sessions: number;
  admin_seats: number;
  member_seats: number;
};

export type Entitlements = {
  plan_key: string;
  limits: SubscriptionLimits;
  usage: SubscriptionUsage;
  modules: ModulesConfig;
  features: SubscriptionFeatures;
};

export const MODULE_ITEM_TO_GROUP: Record<ModuleItemKey, ModuleGroupKey | null> =
  {
    dashboard: "dashboard",
    people: "people_membership",
    workers: "people_membership",
    households: "people_membership",
    water_baptism: "people_membership",
    life_groups: "groups_ministry",
    cell_groups: "groups_ministry",
    work_ministry: "groups_ministry",
    service_attendance: "attendance",
    event_attendance: "attendance",
    training: "development",
    discipleship: "development",
    bible_study: "development",
    programs: "development",
    leadership: "leadership",
    growth_track: "growth_track",
    properties: "operations",
    financial: "finance_projects",
    goal_projects: "finance_projects",
    church_goals: "finance_projects",
  };

export const MODULE_ITEM_TO_ROUTE: Record<ModuleItemKey, ViewRoute> = {
  dashboard: "dashboard",
  people: "people",
  workers: "workers",
  households: "households",
  water_baptism: "water-baptism",
  life_groups: "life-groups",
  cell_groups: "cell-groups",
  work_ministry: "work-ministry",
  service_attendance: "service-attendance",
  event_attendance: "event-attendance",
  training: "training",
  discipleship: "discipleship",
  bible_study: "bible-study",
  programs: "program",
  leadership: "leadership",
  growth_track: "growth-track",
  properties: "properties",
  financial: "financial",
  goal_projects: "goal-projects",
  church_goals: "church-goals",
};

export type SidebarMenuItemDef = {
  key: ModuleItemKey;
  title: string;
  icon: LucideIcon;
  route: ViewRoute;
  comingSoon?: boolean;
};

export type SidebarMenuGroupDef = {
  key: ModuleGroupKey;
  title: string;
  defaultOpen?: boolean;
  items: SidebarMenuItemDef[];
};

export const SIDEBAR_MENU_REGISTRY: SidebarMenuGroupDef[] = [
  {
    key: "people_membership",
    title: "People & Membership",
    items: [
      { key: "people", title: "People", icon: Users, route: "people" },
      { key: "workers", title: "Workers", icon: UserCog, route: "workers" },
      { key: "households", title: "Households", icon: Home, route: "households" },
      {
        key: "water_baptism",
        title: "Water Baptism",
        icon: Droplets,
        route: "water-baptism",
      },
    ],
  },
  {
    key: "groups_ministry",
    title: "Groups & Ministry",
    items: [
      {
        key: "life_groups",
        title: "Life Groups",
        icon: UserCircle,
        route: "life-groups",
      },
      {
        key: "cell_groups",
        title: "Cell Groups",
        icon: HeartHandshake,
        route: "cell-groups",
      },
      {
        key: "work_ministry",
        title: "Work Ministry",
        icon: Award,
        route: "work-ministry",
      },
    ],
  },
  {
    key: "attendance",
    title: "Attendance",
    items: [
      {
        key: "service_attendance",
        title: "Service Attendance",
        icon: Church,
        route: "service-attendance",
      },
      {
        key: "event_attendance",
        title: "Event Attendance",
        icon: Tent,
        route: "event-attendance",
      },
    ],
  },
  {
    key: "development",
    title: "Development",
    items: [
      {
        key: "training",
        title: "Training",
        icon: GraduationCap,
        route: "training",
      },
      {
        key: "discipleship",
        title: "Discipleship",
        icon: BookOpen,
        route: "discipleship",
      },
      {
        key: "bible_study",
        title: "Bible Studies",
        icon: Book,
        route: "bible-study",
      },
      {
        key: "programs",
        title: "Programs",
        icon: CalendarDays,
        route: "program",
      },
    ],
  },
  {
    key: "leadership",
    title: "Leadership",
    items: [
      {
        key: "leadership",
        title: "Leadership",
        icon: Shield,
        route: "leadership",
      },
    ],
  },
  {
    key: "growth_track",
    title: "Growth Track",
    items: [
      {
        key: "growth_track",
        title: "Growth Track",
        icon: GitBranch,
        route: "growth-track",
      },
    ],
  },
  {
    key: "operations",
    title: "Operations",
    defaultOpen: false,
    items: [
      {
        key: "properties",
        title: "Properties",
        icon: Building2,
        route: "properties",
        comingSoon: true,
      },
    ],
  },
  {
    key: "finance_projects",
    title: "Finance & Projects",
    defaultOpen: false,
    items: [
      {
        key: "financial",
        title: "Financial",
        icon: DollarSign,
        route: "financial",
        comingSoon: true,
      },
      {
        key: "goal_projects",
        title: "Goal Projects",
        icon: Target,
        route: "goal-projects",
        comingSoon: true,
      },
      {
        key: "church_goals",
        title: "Church Goals",
        icon: Lightbulb,
        route: "church-goals",
        comingSoon: true,
      },
    ],
  },
];

export const DASHBOARD_MENU_ITEM: SidebarMenuItemDef = {
  key: "dashboard",
  title: "Dashboard",
  icon: LayoutDashboard,
  route: "dashboard",
};
