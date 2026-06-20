"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTenant } from "@/app/providers/tenant-provider";
import { useEvents } from "@/lib/events";
import { useGrowthTrack } from "@/lib/growth-track";
import { usePeople } from "@/lib/people";
import { getOrganizationId } from "@/lib/supabase/tenant";
import { useServiceAttendance } from "@/lib/service-attendance";
import { buildNotifications } from "./build-notifications";
import {
  loadReadNotificationIds,
  saveReadNotificationIds,
} from "./read-state";
import type { AppNotification, NotificationTab } from "./types";

export function useNotifications() {
  const { tenant } = useTenant();
  const organizationId = getOrganizationId(tenant);

  const { people, hydrated: peopleHydrated } = usePeople();
  const { growthPeople, hydrated: growthHydrated } = useGrowthTrack();
  const {
    attendanceRows,
    primarySundayServiceId,
    hydrated: attendanceHydrated,
  } = useServiceAttendance();
  const { events, hydrated: eventsHydrated } = useEvents();

  const hydrated =
    peopleHydrated && growthHydrated && attendanceHydrated && eventsHydrated;

  const notifications = useMemo(
    () =>
      buildNotifications({
        growthPeople,
        people,
        attendanceRows,
        primarySundayServiceId,
        events,
      }),
    [growthPeople, people, attendanceRows, primarySundayServiceId, events],
  );

  const [readIds, setReadIds] = useState<Set<string>>(() =>
    loadReadNotificationIds(organizationId),
  );

  useEffect(() => {
    setReadIds(loadReadNotificationIds(organizationId));
  }, [organizationId]);

  const persistReadIds = useCallback(
    (next: Set<string>) => {
      setReadIds(next);
      if (organizationId) {
        saveReadNotificationIds(organizationId, next);
      }
    },
    [organizationId],
  );

  const markRead = useCallback(
    (id: string) => {
      persistReadIds(new Set([...readIds, id]));
    },
    [persistReadIds, readIds],
  );

  const markAllRead = useCallback(
    (ids: string[]) => {
      persistReadIds(new Set([...readIds, ...ids]));
    },
    [persistReadIds, readIds],
  );

  const withReadState = useCallback(
    (items: AppNotification[]) =>
      items.map(item => ({
        ...item,
        unread: !readIds.has(item.id),
      })),
    [readIds],
  );

  const actionNotifications = useMemo(
    () => withReadState(notifications.filter(item => item.tab === "actions")),
    [notifications, withReadState],
  );

  const upcomingNotifications = useMemo(
    () => withReadState(notifications.filter(item => item.tab === "upcoming")),
    [notifications, withReadState],
  );

  const unreadByTab = useMemo(
    () => ({
      actions: actionNotifications.filter(item => item.unread).length,
      upcoming: upcomingNotifications.filter(item => item.unread).length,
    }),
    [actionNotifications, upcomingNotifications],
  );

  const totalUnread = unreadByTab.actions + unreadByTab.upcoming;

  const getTabNotifications = useCallback(
    (tab: NotificationTab) =>
      tab === "actions" ? actionNotifications : upcomingNotifications,
    [actionNotifications, upcomingNotifications],
  );

  return {
    hydrated,
    actionNotifications,
    upcomingNotifications,
    unreadByTab,
    totalUnread,
    markRead,
    markAllRead,
    getTabNotifications,
  };
}

export type NotificationWithReadState = AppNotification & { unread: boolean };
