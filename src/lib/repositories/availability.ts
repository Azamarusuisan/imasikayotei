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

  async upsertSlot(
    memberId: string,
    startISO: string,
    endISO: string,
    status: "available" | "busy" | "off"
  ): Promise<AvailabilitySlot | null> {
    // First, check if a slot already exists for this member and time range
    const { data: existing } = await supabase
      .from("availability_slots")
      .select("id")
      .eq("member_id", memberId)
      .eq("start_iso", startISO)
      .eq("end_iso", endISO)
      .maybeSingle();

    if (existing) {
      // Update existing slot
      const { data, error } = await supabase
        .from("availability_slots")
        .update({ status })
        .eq("id", existing.id)
        .select("id, member_id, start_iso, end_iso, status")
        .single();

      if (error) {
        console.error("Failed to update availability:", error.message);
        return null;
      }
      return toSlot(data as AvailabilityRow);
    } else {
      // Insert new slot
      const { data, error } = await supabase
        .from("availability_slots")
        .insert({ member_id: memberId, start_iso: startISO, end_iso: endISO, status })
        .select("id, member_id, start_iso, end_iso, status")
        .single();

      if (error) {
        console.error("Failed to create availability:", error.message);
        return null;
      }
      return toSlot(data as AvailabilityRow);
    }
  },

  async deleteSlot(memberId: string, startISO: string, endISO: string): Promise<boolean> {
    const { error } = await supabase
      .from("availability_slots")
      .delete()
      .eq("member_id", memberId)
      .eq("start_iso", startISO)
      .eq("end_iso", endISO);

    if (error) {
      console.error("Failed to delete availability:", error.message);
      return false;
    }
    return true;
  },
};
