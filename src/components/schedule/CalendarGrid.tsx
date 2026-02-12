"use client";

import { useMemo, useState } from "react";
import { Event, Member } from "@/lib/types";
import { getWeekDays, getTimeSlots, DAY_LABELS, formatTime, formatDate } from "@/lib/utils/date";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

type Props = {
  currentDate: Date;
  events: Event[];
  members: Member[];
};

const SLOT_HEIGHT = 28; // px per 30min slot
const START_HOUR = 9;
const END_HOUR = 20;
const TOTAL_SLOTS = (END_HOUR - START_HOUR) * 2;

function getEventPosition(event: Event) {
  const start = new Date(event.startISO);
  const end = new Date(event.endISO);
  const startMinutes = (start.getHours() - START_HOUR) * 60 + start.getMinutes();
  const endMinutes = (end.getHours() - START_HOUR) * 60 + end.getMinutes();
  const top = (startMinutes / 30) * SLOT_HEIGHT;
  const height = ((endMinutes - startMinutes) / 30) * SLOT_HEIGHT;
  return { top: Math.max(0, top), height: Math.max(SLOT_HEIGHT, height) };
}

function EventBlock({ event, members }: { event: Event; members: Member[] }) {
  const { top, height } = getEventPosition(event);
  const assignees = members.filter((m) => event.assigneeIds.includes(m.id));
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="absolute left-0.5 right-0.5 rounded-md bg-blue-500/90 text-white text-xs px-1.5 py-0.5 overflow-hidden cursor-pointer hover:bg-blue-600/90 transition-colors z-10 text-left"
          style={{ top: `${top}px`, height: `${height}px` }}
          onClick={() => setOpen(true)}
        >
          <div className="font-medium truncate">{event.title}</div>
          <div className="text-blue-100 truncate">{assignees.length}名</div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" side="right">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">{event.title}</h4>
          <div className="text-xs text-muted-foreground">
            {formatTime(event.startISO)} 〜 {formatTime(event.endISO)}
          </div>
          <div className="flex flex-wrap gap-1">
            {assignees.map((m) => (
              <Badge key={m.id} variant="secondary" className="text-xs">
                <span
                  className="inline-block w-2 h-2 rounded-full mr-1"
                  style={{ backgroundColor: m.color }}
                />
                {m.name}
              </Badge>
            ))}
          </div>
          {event.notes && (
            <p className="text-xs text-muted-foreground border-t pt-2 mt-2">{event.notes}</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function CalendarGrid({ currentDate, events, members }: Props) {
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
  const timeSlots = useMemo(() => getTimeSlots(), []);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, Event[]>();
    weekDays.forEach((day) => {
      const dateStr = formatDate(day);
      map.set(
        dateStr,
        events.filter((e) => formatDate(new Date(e.startISO)) === dateStr)
      );
    });
    return map;
  }, [weekDays, events]);

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <div className="text-4xl mb-3">📅</div>
        <p className="text-sm">この週にはイベントがありません</p>
        <p className="text-xs mt-1">右上の「+ 商談を追加」から登録できます</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b">
          <div className="p-2 text-xs text-muted-foreground" />
          {weekDays.map((day, i) => {
            const isToday = formatDate(day) === formatDate(new Date());
            return (
              <div
                key={i}
                className={`p-2 text-center text-xs font-medium border-l ${
                  isToday ? "bg-blue-50 text-blue-700" : "text-muted-foreground"
                }`}
              >
                <div>{DAY_LABELS[i]}</div>
                <div className={`text-lg font-bold ${isToday ? "text-blue-700" : "text-foreground"}`}>
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)]">
          {/* Time labels */}
          <div>
            {timeSlots.map((slot, i) => (
              <div
                key={i}
                className="text-xs text-muted-foreground text-right pr-2 border-b border-dashed"
                style={{ height: `${SLOT_HEIGHT}px`, lineHeight: `${SLOT_HEIGHT}px` }}
              >
                {slot.endsWith(":00") ? slot : ""}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, dayIdx) => {
            const dateStr = formatDate(day);
            const dayEvents = eventsByDay.get(dateStr) || [];
            return (
              <div key={dayIdx} className="relative border-l">
                {/* Grid lines */}
                {timeSlots.map((_, i) => (
                  <div
                    key={i}
                    className={`border-b ${i % 2 === 0 ? "border-border" : "border-dashed border-border/50"}`}
                    style={{ height: `${SLOT_HEIGHT}px` }}
                  />
                ))}
                {/* Events */}
                {dayEvents.map((event) => (
                  <EventBlock key={event.id} event={event} members={members} />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
