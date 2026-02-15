"use client";

import { useMemo, useState, useEffect } from "react";
import { Event, Member } from "@/lib/types";
import { getWeekDays, formatTime, formatDate } from "@/lib/utils/date";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Props = {
  currentDate: Date;
  events: Event[];
  members: Member[];
};

const SLOT_HEIGHT = 48;
const START_HOUR = 9;
const END_HOUR = 22;
const TOTAL_HOURS = END_HOUR - START_HOUR; // 11
const GRID_HEIGHT = TOTAL_HOURS * SLOT_HEIGHT * 2; // 11 * 48 * 2 = 1056px

const JP_DAY_LABELS = ["月", "火", "水", "木", "金", "土", "日"];

function getEventPosition(event: Event) {
  const start = new Date(event.startISO);
  const end = new Date(event.endISO);
  const startMinutes = (start.getHours() - START_HOUR) * 60 + start.getMinutes();
  const endMinutes = (end.getHours() - START_HOUR) * 60 + end.getMinutes();
  const top = (startMinutes / 30) * SLOT_HEIGHT;
  const height = ((endMinutes - startMinutes) / 30) * SLOT_HEIGHT;
  return { top: Math.max(0, top), height: Math.max(SLOT_HEIGHT / 2, height) };
}

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function EventBlock({ event, members }: { event: Event; members: Member[] }) {
  const { top, height } = getEventPosition(event);
  const assignees = members.filter((m) => event.assigneeIds.includes(m.id));
  const [open, setOpen] = useState(false);

  const primaryColor = assignees[0]?.color || "#3B82F6";
  const bgColor = hexToRgba(primaryColor, 0.18);
  const borderColor = primaryColor;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="absolute left-0.5 right-0.5 rounded text-xs px-1.5 py-0.5 overflow-hidden cursor-pointer transition-shadow hover:shadow-md z-10 text-left border-l-[3px]"
          style={{
            top: `${top}px`,
            height: `${height}px`,
            backgroundColor: bgColor,
            borderLeftColor: borderColor,
            color: "#1a1a1a",
          }}
          onClick={() => setOpen(true)}
        >
          <div className="font-medium truncate leading-tight text-[11px]">{event.title}</div>
          <div className="truncate text-muted-foreground text-[10px]">
            {formatTime(event.startISO)} – {formatTime(event.endISO)}
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0 shadow-lg border rounded-lg overflow-hidden" side="right" align="start">
        <div className="h-1.5 w-full" style={{ backgroundColor: primaryColor }} />
        <div className="p-3 space-y-2">
          <div>
            <h4 className="font-bold text-base leading-tight">{event.title}</h4>
            <div className="text-xs text-muted-foreground mt-1">
              {formatDate(new Date(event.startISO))} ⋅ {formatTime(event.startISO)} – {formatTime(event.endISO)}
            </div>
          </div>
          {assignees.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {assignees.map((m) => (
                <span key={m.id} className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                  <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: m.color }} />
                  {m.name}
                </span>
              ))}
            </div>
          )}
          {event.notes && (
            <div className="text-xs bg-muted/50 p-2 rounded">{event.notes}</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function CurrentTimeIndicator() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (!now) return null;

  const h = now.getHours();
  if (h < START_HOUR || h >= END_HOUR) return null;

  const minutesFromStart = (h - START_HOUR) * 60 + now.getMinutes();
  const top = (minutesFromStart / 30) * SLOT_HEIGHT;

  return (
    <div
      className="absolute left-0 right-0 flex items-center z-20 pointer-events-none"
      style={{ top: `${top}px` }}
    >
      <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-[5px]" />
      <div className="h-[2px] w-full bg-red-500" />
    </div>
  );
}

export function CalendarGrid({ currentDate, events, members }: Props) {
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  const hours = useMemo(() => {
    const hs: number[] = [];
    for (let h = START_HOUR; h <= END_HOUR; h++) hs.push(h);
    return hs;
  }, []);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, Event[]>();
    weekDays.forEach((day) => {
      const dateStr = formatDate(day);
      map.set(dateStr, events.filter((e) => formatDate(new Date(e.startISO)) === dateStr));
    });
    return map;
  }, [weekDays, events]);

  const todayStr = formatDate(new Date());

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* ===== Header Row ===== */}
      <div className="flex border-b border-gray-200 bg-gray-50/60">
        {/* Time column spacer */}
        <div className="w-14 shrink-0" />
        {/* Day headers */}
        {weekDays.map((day, i) => {
          const isToday = formatDate(day) === todayStr;
          return (
            <div key={i} className="flex-1 py-2 text-center border-l border-gray-200">
              <div className={`text-[11px] font-medium ${isToday ? "text-blue-600" : "text-gray-500"}`}>
                {JP_DAY_LABELS[i]}
              </div>
              <div
                className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm mt-0.5 ${isToday
                  ? "bg-blue-600 text-white font-medium"
                  : "text-gray-800"
                  }`}
              >
                {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== Scrollable Time Grid ===== */}
      <div className="overflow-y-auto overflow-x-auto" style={{ maxHeight: "70vh" }}>
        <div className="flex" style={{ minWidth: 700 }}>
          {/* ----- Time Axis (left) ----- */}
          <div className="w-14 shrink-0 relative select-none" style={{ height: `${GRID_HEIGHT}px` }}>
            {hours.map((h, i) => (
              <div
                key={h}
                className="absolute w-full pr-2 text-right text-[11px] text-gray-400 leading-none"
                style={{ top: `${i * SLOT_HEIGHT * 2 - 6}px` }}
              >
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {/* ----- Day Columns ----- */}
          {weekDays.map((day, dayIdx) => {
            const dateStr = formatDate(day);
            const dayEvents = eventsByDay.get(dateStr) || [];
            const isToday = dateStr === todayStr;

            return (
              <div
                key={dayIdx}
                className={`flex-1 relative border-l border-gray-200 ${isToday ? "bg-blue-50/30" : ""}`}
                style={{ height: `${GRID_HEIGHT}px` }}
              >
                {/* Horizontal grid lines (hours + half-hours) */}
                {Array.from({ length: TOTAL_HOURS * 2 + 1 }, (_, i) => {
                  const isHourLine = i % 2 === 0;
                  return (
                    <div
                      key={i}
                      className={`absolute w-full ${isHourLine ? "border-b border-gray-200" : "border-b border-gray-100 border-dashed"
                        }`}
                      style={{ top: `${i * SLOT_HEIGHT}px` }}
                    />
                  );
                })}

                {/* Current time indicator */}
                {isToday && <CurrentTimeIndicator />}

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
