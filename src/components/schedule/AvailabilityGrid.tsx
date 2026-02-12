"use client";

import { useMemo } from "react";
import { Member, AvailabilitySlot } from "@/lib/types";
import { getWeekDays, DAY_LABELS, formatDate, overlap } from "@/lib/utils/date";

type Props = {
  currentDate: Date;
  members: Member[];
  availability: AvailabilitySlot[];
};

const START_HOUR = 9;
const END_HOUR = 20;
const SLOT_HEIGHT = 20;
const SLOTS_PER_HOUR = 2;
const TOTAL_SLOTS = (END_HOUR - START_HOUR) * SLOTS_PER_HOUR;

function getSlotStatus(
  memberId: string,
  day: Date,
  slotIndex: number,
  availability: AvailabilitySlot[]
): "available" | "busy" | "off" | "none" {
  const slotStart = new Date(day);
  slotStart.setHours(START_HOUR + Math.floor(slotIndex / 2), (slotIndex % 2) * 30, 0, 0);
  const slotEnd = new Date(slotStart);
  slotEnd.setMinutes(slotEnd.getMinutes() + 30);

  const matching = availability.find(
    (a) =>
      a.memberId === memberId &&
      overlap(a.startISO, a.endISO, slotStart.toISOString(), slotEnd.toISOString())
  );

  return matching?.status || "none";
}

const statusColors: Record<string, string> = {
  available: "bg-emerald-400/70",
  busy: "bg-red-400/60",
  off: "bg-gray-200/60",
  none: "bg-gray-100/30",
};

const statusLabels: Record<string, string> = {
  available: "Available",
  busy: "Busy",
  off: "Off",
  none: "-",
};

export function AvailabilityGrid({ currentDate, members, availability }: Props) {
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <div className="text-4xl mb-3">👥</div>
        <p className="text-sm">メンバーがいません</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[900px]">
        {/* Legend */}
        <div className="flex items-center gap-4 mb-3 px-2">
          <span className="text-xs text-muted-foreground">凡例:</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-3 rounded-sm bg-emerald-400/70" />
            <span className="text-xs">Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-3 rounded-sm bg-red-400/60" />
            <span className="text-xs">Busy</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-3 rounded-sm bg-gray-200/60" />
            <span className="text-xs">Off</span>
          </div>
        </div>

        {/* Per-day view */}
        {weekDays.map((day, dayIdx) => {
          const isToday = formatDate(day) === formatDate(new Date());
          return (
            <div key={dayIdx} className="mb-4">
              <div
                className={`text-xs font-medium px-2 py-1 rounded-t ${
                  isToday ? "bg-blue-50 text-blue-700" : "bg-muted text-muted-foreground"
                }`}
              >
                {DAY_LABELS[dayIdx]} {day.getMonth() + 1}/{day.getDate()}
              </div>
              <div className="border rounded-b overflow-hidden">
                {/* Time header */}
                <div className="grid" style={{ gridTemplateColumns: `100px repeat(${TOTAL_SLOTS}, 1fr)` }}>
                  <div className="p-1 text-xs text-muted-foreground border-b bg-muted/30">メンバー</div>
                  {Array.from({ length: TOTAL_SLOTS }, (_, i) => {
                    const hour = START_HOUR + Math.floor(i / 2);
                    const isHour = i % 2 === 0;
                    return (
                      <div
                        key={i}
                        className="text-[10px] text-center text-muted-foreground border-b border-l bg-muted/30"
                        style={{ height: "24px", lineHeight: "24px" }}
                      >
                        {isHour ? `${hour}` : ""}
                      </div>
                    );
                  })}
                </div>

                {/* Member rows */}
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="grid hover:bg-muted/10 transition-colors"
                    style={{ gridTemplateColumns: `100px repeat(${TOTAL_SLOTS}, 1fr)` }}
                  >
                    <div className="flex items-center gap-1.5 px-2 text-xs font-medium border-b truncate">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: member.color }}
                      />
                      {member.name}
                    </div>
                    {Array.from({ length: TOTAL_SLOTS }, (_, slotIdx) => {
                      const status = getSlotStatus(member.id, day, slotIdx, availability);
                      return (
                        <div
                          key={slotIdx}
                          className={`border-l border-b ${statusColors[status]}`}
                          style={{ height: `${SLOT_HEIGHT}px` }}
                          title={`${member.name} ${START_HOUR + Math.floor(slotIdx / 2)}:${(slotIdx % 2) * 30 === 0 ? "00" : "30"} - ${statusLabels[status]}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
