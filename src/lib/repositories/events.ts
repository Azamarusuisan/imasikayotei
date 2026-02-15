import { supabase } from "../supabase";
import { Event } from "../types";

type EventRow = {
  id: string;
  title: string;
  start_iso: string;
  end_iso: string;
  assignee_ids: string[];
  notes: string;
};

function toEvent(row: EventRow): Event {
  return {
    id: row.id,
    title: row.title,
    startISO: row.start_iso,
    endISO: row.end_iso,
    assigneeIds: row.assignee_ids || [],
    notes: row.notes || "",
  };
}

export const eventsRepository = {
  async list(weekStart: Date, weekEnd: Date): Promise<Event[]> {
    const { data, error } = await supabase
      .from("events")
      .select("id, title, start_iso, end_iso, assignee_ids, notes")
      .gte("end_iso", weekStart.toISOString())
      .lte("start_iso", weekEnd.toISOString())
      .order("start_iso", { ascending: true });

    if (error) {
      console.error("Failed to fetch events:", error.message);
      return [];
    }

    return (data as EventRow[]).map(toEvent);
  },

  async create(event: Omit<Event, "id">): Promise<Event | null> {
    const { data, error } = await supabase
      .from("events")
      .insert({
        title: event.title,
        start_iso: event.startISO,
        end_iso: event.endISO,
        assignee_ids: event.assigneeIds,
        notes: event.notes,
      })
      .select("id, title, start_iso, end_iso, assignee_ids, notes")
      .single();

    if (error) {
      console.error("Failed to create event:", error.message);
      return null;
    }

    return toEvent(data as EventRow);
  },

  async getAll(): Promise<Event[]> {
    const { data, error } = await supabase
      .from("events")
      .select("id, title, start_iso, end_iso, assignee_ids, notes")
      .order("start_iso", { ascending: true });

    if (error) {
      console.error("Failed to fetch all events:", error.message);
      return [];
    }

    return (data as EventRow[]).map(toEvent);
  },
};
