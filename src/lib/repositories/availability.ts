import { AvailabilitySlot } from "../types";
import { overlap } from "../utils/date";
import { createDummyAvailability } from "./dummy-data";

const slots: AvailabilitySlot[] = createDummyAvailability();

export const availabilityRepository = {
  list(weekStart: Date, weekEnd: Date): AvailabilitySlot[] {
    return slots.filter((s) =>
      overlap(s.startISO, s.endISO, weekStart.toISOString(), weekEnd.toISOString())
    );
  },

  getByMember(memberId: string, weekStart: Date, weekEnd: Date): AvailabilitySlot[] {
    return this.list(weekStart, weekEnd).filter((s) => s.memberId === memberId);
  },
};
