"use client";

import { useMemo, useState, useCallback, useRef } from "react";
import { Member, AvailabilitySlot } from "@/lib/types";
import { getWeekDays, DAY_LABELS, formatDate, overlap } from "@/lib/utils/date";

type Props = {
  currentDate: Date;
  members: Member[];
  availability: AvailabilitySlot[];
  onSlotChange?: (
    memberId: string,
    startISO: string,
    endISO: string,
    status: "available" | "busy" | "off" | "none"
  ) => void;
  onBulkChange?: (
    memberId: string,
    slots: { startISO: string; endISO: string; status: "available" | "busy" | "off" }[]
  ) => void;
};

const START_HOUR = 9;
const END_HOUR = 22;
const SLOT_HEIGHT = 28;
const SLOTS_PER_HOUR = 2;
const TOTAL_SLOTS = (END_HOUR - START_HOUR) * SLOTS_PER_HOUR;

type SlotStatus = "available" | "busy" | "off" | "none";
type PaintStatus = "available" | "busy" | "off";

function getSlotStatus(
  memberId: string,
  day: Date,
  slotIndex: number,
  availability: AvailabilitySlot[]
): SlotStatus {
  const slotStart = new Date(day);
  slotStart.setHours(START_HOUR + Math.floor(slotIndex / 2), (slotIndex % 2) * 30, 0, 0);
  const slotEnd = new Date(slotStart);
  slotEnd.setMinutes(slotEnd.getMinutes() + 30);

  const matching = availability.find(
    (a) =>
      a.memberId === memberId &&
      overlap(a.startISO, a.endISO, slotStart.toISOString(), slotEnd.toISOString())
  );

  return (matching?.status as SlotStatus) || "none";
}

function getSlotTimes(day: Date, slotIndex: number) {
  const slotStart = new Date(day);
  slotStart.setHours(START_HOUR + Math.floor(slotIndex / 2), (slotIndex % 2) * 30, 0, 0);
  const slotEnd = new Date(slotStart);
  slotEnd.setMinutes(slotEnd.getMinutes() + 30);
  return { startISO: slotStart.toISOString(), endISO: slotEnd.toISOString() };
}

const statusStyles: Record<SlotStatus, { bg: string; label: string }> = {
  available: { bg: "bg-emerald-400/70", label: "空き" },
  busy: { bg: "bg-red-400/60", label: "予定あり" },
  off: { bg: "bg-gray-300/60", label: "休み" },
  none: { bg: "bg-gray-50", label: "未設定" },
};

const paintOptions: { status: PaintStatus; label: string; color: string; activeColor: string }[] = [
  { status: "available", label: "空き", color: "bg-emerald-100 text-emerald-700 border-emerald-300", activeColor: "bg-emerald-500 text-white border-emerald-600 ring-2 ring-emerald-300" },
  { status: "busy", label: "予定あり", color: "bg-red-100 text-red-700 border-red-300", activeColor: "bg-red-500 text-white border-red-600 ring-2 ring-red-300" },
  { status: "off", label: "休み", color: "bg-gray-200 text-gray-700 border-gray-400", activeColor: "bg-gray-600 text-white border-gray-700 ring-2 ring-gray-400" },
];

export function AvailabilityGrid({
  currentDate,
  members,
  availability,
  onSlotChange,
  onBulkChange,
}: Props) {
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [paintStatus, setPaintStatus] = useState<PaintStatus>("available");
  const [saving, setSaving] = useState(false);

  // Drag state
  const isDragging = useRef(false);
  const dragCells = useRef<Set<string>>(new Set());
  const [draggedCells, setDraggedCells] = useState<Set<string>>(new Set());

  const handleMouseDown = useCallback(
    (memberId: string, day: Date, slotIdx: number) => {
      if (!selectedMemberId || selectedMemberId !== memberId || saving) return;
      isDragging.current = true;
      dragCells.current = new Set();
      const key = `${dayKey(day)}-${slotIdx}`;
      dragCells.current.add(key);
      setDraggedCells(new Set(dragCells.current));
    },
    [selectedMemberId, saving]
  );

  const handleMouseEnter = useCallback(
    (memberId: string, day: Date, slotIdx: number) => {
      if (!isDragging.current || selectedMemberId !== memberId) return;
      const key = `${dayKey(day)}-${slotIdx}`;
      dragCells.current.add(key);
      setDraggedCells(new Set(dragCells.current));
    },
    [selectedMemberId]
  );

  const handleMouseUp = useCallback(async () => {
    if (!isDragging.current || !selectedMemberId || !onBulkChange) return;
    isDragging.current = false;

    const slots: { startISO: string; endISO: string; status: PaintStatus }[] = [];
    dragCells.current.forEach((key) => {
      const [dateStr, slotIdxStr] = key.split("-");
      const slotIdx = parseInt(slotIdxStr);
      const day = new Date(dateStr);
      const { startISO, endISO } = getSlotTimes(day, slotIdx);
      slots.push({ startISO, endISO, status: paintStatus });
    });

    if (slots.length > 0) {
      setSaving(true);
      await onBulkChange(selectedMemberId, slots);
      setSaving(false);
    }

    dragCells.current = new Set();
    setDraggedCells(new Set());
  }, [selectedMemberId, onBulkChange, paintStatus]);

  // Quick fill entire day
  const handleFillDay = useCallback(
    async (day: Date) => {
      if (!selectedMemberId || !onBulkChange || saving) return;
      const slots: { startISO: string; endISO: string; status: PaintStatus }[] = [];
      for (let i = 0; i < TOTAL_SLOTS; i++) {
        const { startISO, endISO } = getSlotTimes(day, i);
        slots.push({ startISO, endISO, status: paintStatus });
      }
      setSaving(true);
      await onBulkChange(selectedMemberId, slots);
      setSaving(false);
    },
    [selectedMemberId, onBulkChange, paintStatus, saving]
  );

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <div className="text-4xl mb-3">👥</div>
        <p className="text-sm">メンバーがいません</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      {/* Controls */}
      <div className="space-y-3">
        {/* Member Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-medium">編集するメンバー:</span>
          {members.map((m) => (
            <button
              key={m.id}
              className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all ${selectedMemberId === m.id
                  ? "bg-blue-100 text-blue-800 ring-2 ring-blue-300 font-semibold"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              onClick={() =>
                setSelectedMemberId((prev) => (prev === m.id ? null : m.id))
              }
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
              {m.name}
            </button>
          ))}
        </div>

        {/* Paint Status Selector */}
        {selectedMemberId && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground font-medium">塗るステータス:</span>
            {paintOptions.map((opt) => (
              <button
                key={opt.status}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${paintStatus === opt.status ? opt.activeColor : opt.color
                  }`}
                onClick={() => setPaintStatus(opt.status)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {selectedMemberId && (
          <p className="text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded select-none">
            💡 セルをクリック＆ドラッグで一括塗り。各日の「一括」ボタンで1日分を一気に設定。
          </p>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3">
        {(["available", "busy", "off"] as SlotStatus[]).map((s) => (
          <div key={s} className="flex items-center gap-1">
            <div className={`w-4 h-3 rounded-sm ${statusStyles[s].bg}`} />
            <span className="text-xs text-muted-foreground">{statusStyles[s].label}</span>
          </div>
        ))}
        {saving && (
          <span className="text-xs text-blue-500 ml-2 animate-pulse">保存中...</span>
        )}
      </div>

      {/* Grid */}
      <div className="overflow-x-auto select-none">
        <div className="min-w-[900px]">
          {weekDays.map((day, dayIdx) => {
            const isToday = formatDate(day) === formatDate(new Date());
            const dk = dayKey(day);
            return (
              <div key={dayIdx} className="mb-3">
                <div
                  className={`flex items-center justify-between text-xs font-medium px-2 py-1 rounded-t ${isToday ? "bg-blue-50 text-blue-700" : "bg-muted text-muted-foreground"
                    }`}
                >
                  <span>
                    {DAY_LABELS[dayIdx]} {day.getMonth() + 1}/{day.getDate()}
                  </span>
                  {selectedMemberId && (
                    <button
                      className="text-[10px] px-2 py-0.5 rounded bg-white border hover:bg-gray-50 text-gray-600"
                      onClick={() => handleFillDay(day)}
                      disabled={saving}
                    >
                      一括 {statusStyles[paintStatus].label}
                    </button>
                  )}
                </div>
                <div className="border rounded-b overflow-hidden">
                  {/* Time header */}
                  <div
                    className="grid"
                    style={{
                      gridTemplateColumns: `100px repeat(${TOTAL_SLOTS}, 1fr)`,
                    }}
                  >
                    <div className="p-1 text-xs text-muted-foreground border-b bg-muted/30">
                      メンバー
                    </div>
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
                  {members.map((member) => {
                    const isEditable = selectedMemberId === member.id;
                    return (
                      <div
                        key={member.id}
                        className={`grid transition-colors ${isEditable ? "bg-blue-50/30" : ""
                          }`}
                        style={{
                          gridTemplateColumns: `100px repeat(${TOTAL_SLOTS}, 1fr)`,
                        }}
                      >
                        <div className="flex items-center gap-1.5 px-2 text-xs font-medium border-b truncate">
                          <span
                            className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: member.color }}
                          />
                          {member.name}
                        </div>
                        {Array.from({ length: TOTAL_SLOTS }, (_, slotIdx) => {
                          const status = getSlotStatus(
                            member.id,
                            day,
                            slotIdx,
                            availability
                          );
                          const cellKey = `${dk}-${slotIdx}`;
                          const isBeingPainted = draggedCells.has(cellKey) && isEditable;

                          return (
                            <div
                              key={slotIdx}
                              className={`border-l border-b transition-colors ${isBeingPainted
                                  ? statusStyles[paintStatus].bg + " opacity-70 ring-1 ring-inset ring-blue-400"
                                  : statusStyles[status].bg
                                } ${isEditable ? "cursor-crosshair" : ""}`}
                              style={{ height: `${SLOT_HEIGHT}px` }}
                              title={`${member.name} ${START_HOUR + Math.floor(slotIdx / 2)}:${(slotIdx % 2) * 30 === 0 ? "00" : "30"
                                } - ${statusStyles[status].label}`}
                              onMouseDown={() =>
                                isEditable && handleMouseDown(member.id, day, slotIdx)
                              }
                              onMouseEnter={() =>
                                isEditable && handleMouseEnter(member.id, day, slotIdx)
                              }
                            />
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Format day for use as a unique key */
function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
