"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Event, AvailabilitySlot, Member } from "./types";
import { getWeekRange, prevWeek, nextWeek } from "./utils/date";
import { eventsRepository, availabilityRepository, membersRepository } from "./repositories";

export function useScheduleStore() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const weekRange = useMemo(() => getWeekRange(currentDate), [currentDate]);

  // Fetch members (re-fetch when membersKey changes)
  const [membersKey, setMembersKey] = useState(0);
  useEffect(() => {
    membersRepository.list().then(setMembers);
  }, [membersKey]);

  // Fetch events and availability when week changes or refresh
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      eventsRepository.list(weekRange.start, weekRange.end),
      availabilityRepository.list(weekRange.start, weekRange.end),
    ]).then(([evts, avail]) => {
      if (!cancelled) {
        setEvents(evts);
        setAvailability(avail);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekRange.start.getTime(), weekRange.end.getTime(), refreshKey]);

  const goToPrevWeek = useCallback(() => setCurrentDate((d) => prevWeek(d)), []);
  const goToNextWeek = useCallback(() => setCurrentDate((d) => nextWeek(d)), []);
  const goToToday = useCallback(() => setCurrentDate(new Date()), []);

  const addEvent = useCallback(async (event: Omit<Event, "id">) => {
    await eventsRepository.create(event);
    setRefreshKey((k) => k + 1);
  }, []);

  const addMember = useCallback(async (name: string, color: string) => {
    await membersRepository.create(name, color);
    setMembersKey((k) => k + 1);
  }, []);

  const removeMember = useCallback(async (id: string) => {
    await membersRepository.remove(id);
    setMembersKey((k) => k + 1);
  }, []);

  const updateMember = useCallback(async (id: string, name: string, color: string) => {
    await membersRepository.update(id, name, color);
    setMembersKey((k) => k + 1);
  }, []);

  const setAvailabilitySlot = useCallback(async (
    memberId: string,
    startISO: string,
    endISO: string,
    status: "available" | "busy" | "off" | "none"
  ) => {
    if (status === "none") {
      await availabilityRepository.deleteSlot(memberId, startISO, endISO);
    } else {
      await availabilityRepository.upsertSlot(memberId, startISO, endISO, status);
    }
    setRefreshKey((k) => k + 1);
  }, []);

  const bulkSetAvailability = useCallback(async (
    memberId: string,
    slots: { startISO: string; endISO: string; status: "available" | "busy" | "off" }[]
  ) => {
    if (slots.length === 0) return;
    await availabilityRepository.bulkUpsert(memberId, slots);
    setRefreshKey((k) => k + 1);
  }, []);

  return {
    currentDate,
    weekRange,
    members,
    events,
    availability,
    loading,
    goToPrevWeek,
    goToNextWeek,
    goToToday,
    addEvent,
    addMember,
    removeMember,
    updateMember,
    setAvailabilitySlot,
    bulkSetAvailability,
  };
}
