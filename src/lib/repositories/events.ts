import { Event } from "../types";
import { overlap } from "../utils/date";
import { createDummyEvents } from "./dummy-data";

let events: Event[] = createDummyEvents();
let nextId = 100;

export const eventsRepository = {
  list(weekStart: Date, weekEnd: Date): Event[] {
    return events.filter((e) =>
      overlap(e.startISO, e.endISO, weekStart.toISOString(), weekEnd.toISOString())
    );
  },

  create(event: Omit<Event, "id">): Event {
    const newEvent: Event = { ...event, id: `e${nextId++}` };
    events = [...events, newEvent];
    return newEvent;
  },

  getAll(): Event[] {
    return [...events];
  },
};
