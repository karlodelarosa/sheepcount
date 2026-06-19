"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { useTenant } from "@/app/providers/tenant-provider";
import { createClient } from "@/lib/supabase/client";
import { getOrganizationId } from "@/lib/supabase/tenant";
import {
  createChurchEvent,
  fetchChurchEvents,
  fetchEventRegistrations,
  registerForEvent,
  removeEventRegistration,
  updateChurchEvent,
  updateEventRegistration,
  type ChurchEvent,
  type ChurchEventRegistration,
  type CreateChurchEventInput,
  type RegisterForEventInput,
  type UpdateChurchEventInput,
  type UpdateEventRegistrationInput,
} from "@/lib/supabase/events";

type EventsContextValue = {
  events: ChurchEvent[];
  registrations: ChurchEventRegistration[];
  hydrated: boolean;
  isSaving: boolean;
  refreshEvents: () => Promise<void>;
  addEvent: (input: CreateChurchEventInput) => Promise<ChurchEvent | null>;
  updateEvent: (input: UpdateChurchEventInput) => Promise<ChurchEvent | null>;
  registerPersonForEvent: (
    input: RegisterForEventInput,
  ) => Promise<ChurchEventRegistration | null>;
  updateRegistration: (
    input: UpdateEventRegistrationInput,
  ) => Promise<ChurchEventRegistration | null>;
  removeRegistration: (registrationId: string) => Promise<boolean>;
  getEventRegistrations: (eventId: string) => ChurchEventRegistration[];
  getPersonEvents: (personId: string) => Array<{
    registration: ChurchEventRegistration;
    event: ChurchEvent | undefined;
  }>;
  getEventRegistrationCount: (eventId: string) => number;
};

const EventsContext = createContext<EventsContextValue | null>(null);

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong. Please try again.";
}

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const { tenant, isLoading: tenantLoading } = useTenant();
  const supabase = useMemo(() => createClient(), []);
  const organizationId = getOrganizationId(tenant);

  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [registrations, setRegistrations] = useState<ChurchEventRegistration[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const refreshEvents = useCallback(async () => {
    if (!organizationId) {
      setEvents([]);
      setRegistrations([]);
      setHydrated(!tenantLoading);
      return;
    }

    try {
      const [eventData, registrationData] = await Promise.all([
        fetchChurchEvents(supabase, organizationId),
        fetchEventRegistrations(supabase, organizationId),
      ]);

      setEvents(eventData);
      setRegistrations(registrationData);
    } catch (error) {
      toast.error("Failed to load events data", {
        description: getErrorMessage(error),
      });
    } finally {
      setHydrated(true);
    }
  }, [organizationId, supabase, tenantLoading]);

  useEffect(() => {
    if (tenantLoading) return;
    void refreshEvents();
  }, [refreshEvents, tenantLoading]);

  const addEvent = useCallback(
    async (input: CreateChurchEventInput): Promise<ChurchEvent | null> => {
      if (!organizationId) {
        toast.error("No organization found");
        return null;
      }

      setIsSaving(true);
      try {
        const event = await createChurchEvent(supabase, organizationId, input);
        await refreshEvents();
        toast.success("Event created", {
          description: `${event.title} was added.`,
        });
        return event;
      } catch (error) {
        toast.error("Failed to create event", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, refreshEvents, supabase],
  );

  const updateEvent = useCallback(
    async (input: UpdateChurchEventInput): Promise<ChurchEvent | null> => {
      setIsSaving(true);
      try {
        const event = await updateChurchEvent(supabase, input);
        await refreshEvents();
        toast.success("Event updated");
        return event;
      } catch (error) {
        toast.error("Failed to update event", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [refreshEvents, supabase],
  );

  const registerPersonForEvent = useCallback(
    async (input: RegisterForEventInput): Promise<ChurchEventRegistration | null> => {
      setIsSaving(true);
      try {
        const registration = await registerForEvent(supabase, input);
        await refreshEvents();
        toast.success("Registration saved");
        return registration;
      } catch (error) {
        toast.error("Failed to register for event", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [refreshEvents, supabase],
  );

  const updateRegistration = useCallback(
    async (
      input: UpdateEventRegistrationInput,
    ): Promise<ChurchEventRegistration | null> => {
      setIsSaving(true);
      try {
        const registration = await updateEventRegistration(supabase, input);
        await refreshEvents();
        toast.success("Registration updated");
        return registration;
      } catch (error) {
        toast.error("Failed to update registration", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [refreshEvents, supabase],
  );

  const removeRegistration = useCallback(
    async (registrationId: string): Promise<boolean> => {
      setIsSaving(true);
      try {
        await removeEventRegistration(supabase, registrationId);
        await refreshEvents();
        toast.success("Registration removed");
        return true;
      } catch (error) {
        toast.error("Failed to remove registration", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [refreshEvents, supabase],
  );

  const getEventRegistrations = useCallback(
    (eventId: string) => registrations.filter(r => r.eventId === eventId),
    [registrations],
  );

  const getPersonEvents = useCallback(
    (personId: string) =>
      registrations
        .filter(r => r.personId === personId)
        .map(r => ({
          registration: r,
          event: events.find(e => e.id === r.eventId),
        }))
        .sort((a, b) =>
          (b.event?.startDate ?? "").localeCompare(a.event?.startDate ?? ""),
        ),
    [events, registrations],
  );

  const getEventRegistrationCount = useCallback(
    (eventId: string) => registrations.filter(r => r.eventId === eventId).length,
    [registrations],
  );

  return (
    <EventsContext.Provider
      value={{
        events,
        registrations,
        hydrated,
        isSaving,
        refreshEvents,
        addEvent,
        updateEvent,
        registerPersonForEvent,
        updateRegistration,
        removeRegistration,
        getEventRegistrations,
        getPersonEvents,
        getEventRegistrationCount,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const ctx = useContext(EventsContext);
  if (!ctx) {
    throw new Error("useEvents must be used within an EventsProvider");
  }
  return ctx;
}

export type { ChurchEvent, ChurchEventRegistration };
