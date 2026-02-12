"use client";

import { useState, useCallback, useMemo } from "react";
import { Event, AvailabilitySlot, Member } from "./types";
import { getWeekRange, prevWeek, nextWeek } from "./utils/date";
import { eventsRepository, availabilityRepository, membersRepository } from "./repositories";

export function useScheduleStore() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [refreshKey, setRefreshKey] = useState(0);

  const weekRange = useMemo(() => getWeekRange(currentDate), [currentDate]);

  const members: Member[] = useMemo(() => membersRepository.list(), []);

  const events: Event[] = useMemo(
    () => eventsRepository.list(weekRange.start, weekRange.end),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [weekRange.start.getTime(), weekRange.end.getTime(), refreshKey]
  );

  const availability: AvailabilitySlot[] = useMemo(
    () => availabilityRepository.list(weekRange.start, weekRange.end),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [weekRange.start.getTime(), weekRange.end.getTime()]
  );

  const goToPrevWeek = useCallback(() => setCurrentDate((d) => prevWeek(d)), []);
  const goToNextWeek = useCallback(() => setCurrentDate((d) => nextWeek(d)), []);
  const goToToday = useCallback(() => setCurrentDate(new Date()), []);

  const addEvent = useCallback((event: Omit<Event, "id">) => {
    eventsRepository.create(event);
    setRefreshKey((k) => k + 1);
  }, []);

  return {
    currentDate,
    weekRange,
    members,
    events,
    availability,
    goToPrevWeek,
    goToNextWeek,
    goToToday,
    addEvent,
  };
}
