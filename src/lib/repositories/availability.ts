import { supabase } from "../supabase";
import { AvailabilitySlot } from "../types";

type AvailabilityRow = {
  id: string;
  member_id: string;
  start_iso: string;
  end_iso: string;
  status: "available" | "busy" | "off";
};

function toSlot(row: AvailabilityRow): AvailabilitySlot {
  return {
    id: row.id,
    memberId: row.member_id,
    startISO: row.start_iso,
    endISO: row.end_iso,
    status: row.status,
  };
}

export const availabilityRepository = {
  async list(weekStart: Date, weekEnd: Date): Promise<AvailabilitySlot[]> {
    const { data, error } = await supabase
      .from("availability_slots")
      .select("id, member_id, start_iso, end_iso, status")
      .gte("end_iso", weekStart.toISOString())
      .lte("start_iso", weekEnd.toISOString())
      .order("start_iso", { ascending: true });

    if (error) {
      console.error("Failed to fetch availability:", error.message);
      return [];
    }

    return (data as AvailabilityRow[]).map(toSlot);
  },

  async getByMember(memberId: string, weekStart: Date, weekEnd: Date): Promise<AvailabilitySlot[]> {
    const { data, error } = await supabase
      .from("availability_slots")
      .select("id, member_id, start_iso, end_iso, status")
      .eq("member_id", memberId)
      .gte("end_iso", weekStart.toISOString())
      .lte("start_iso", weekEnd.toISOString())
      .order("start_iso", { ascending: true });

    if (error) {
      console.error("Failed to fetch member availability:", error.message);
      return [];
    }

    return (data as AvailabilityRow[]).map(toSlot);
  },
};
