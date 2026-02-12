"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Member, Event, AvailabilitySlot, MemberCandidate } from "@/lib/types";
import { calculateCandidates, sortCandidatesAvailableFirst } from "@/lib/utils/candidates";
import { formatDate } from "@/lib/utils/date";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: Member[];
  availability: AvailabilitySlot[];
  events: Event[];
  onSave: (event: Omit<Event, "id">) => void;
  defaultDate?: Date;
};

export function AddEventModal({
  open,
  onOpenChange,
  members,
  availability,
  events,
  onSave,
  defaultDate,
}: Props) {
  const today = defaultDate || new Date();
  const [date, setDate] = useState(formatDate(today));
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [customerName, setCustomerName] = useState("");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const startISO = useMemo(() => {
    if (!date || !startTime) return "";
    return new Date(`${date}T${startTime}:00`).toISOString();
  }, [date, startTime]);

  const endISO = useMemo(() => {
    if (!date || !endTime) return "";
    return new Date(`${date}T${endTime}:00`).toISOString();
  }, [date, endTime]);

  const candidates: MemberCandidate[] = useMemo(() => {
    if (!startISO || !endISO) return members.map((m) => ({ member: m, status: "available" as const }));
    const raw = calculateCandidates(members, startISO, endISO, availability, events);
    return sortCandidatesAvailableFirst(raw);
  }, [members, startISO, endISO, availability, events]);

  const displayCandidates = useMemo(() => {
    if (showAvailableOnly) return candidates.filter((c) => c.status === "available");
    return candidates;
  }, [candidates, showAvailableOnly]);

  const toggleAssignee = useCallback((memberId: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  }, []);

  const handleSave = () => {
    if (!customerName.trim() || selectedAssignees.length === 0 || !startISO || !endISO) return;

    onSave({
      title: customerName.trim(),
      startISO,
      endISO,
      assigneeIds: selectedAssignees,
      notes: notes.trim(),
    });

    // Reset
    setCustomerName("");
    setSelectedAssignees([]);
    setNotes("");
    setStartTime("10:00");
    setEndTime("11:00");
    onOpenChange(false);
  };

  const isValid = customerName.trim() && selectedAssignees.length > 0 && startISO && endISO && startISO < endISO;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>商談を追加</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* 日付 */}
          <div className="space-y-1.5">
            <Label htmlFor="event-date">日付</Label>
            <Input
              id="event-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* 時刻 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="event-start">開始時刻</Label>
              <Input
                id="event-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="event-end">終了時刻</Label>
              <Input
                id="event-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {startISO && endISO && startISO >= endISO && (
            <p className="text-xs text-red-500">終了時刻は開始時刻より後にしてください</p>
          )}

          {/* 顧客名 */}
          <div className="space-y-1.5">
            <Label htmlFor="event-customer">顧客名 *</Label>
            <Input
              id="event-customer"
              placeholder="例: ABC商事"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <Separator />

          {/* 担当者候補 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>担当者 *</Label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <Checkbox
                  checked={showAvailableOnly}
                  onCheckedChange={(checked) => setShowAvailableOnly(checked === true)}
                />
                <span className="text-xs text-muted-foreground">空いている人だけ表示</span>
              </label>
            </div>

            <div className="border rounded-lg p-2 space-y-1 max-h-48 overflow-y-auto">
              {displayCandidates.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2 text-center">
                  該当するメンバーがいません
                </p>
              ) : (
                displayCandidates.map(({ member, status }) => {
                  const isSelected = selectedAssignees.includes(member.id);
                  return (
                    <button
                      key={member.id}
                      type="button"
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-sm transition-colors ${
                        isSelected
                          ? "bg-blue-50 border border-blue-200"
                          : "hover:bg-muted/50 border border-transparent"
                      }`}
                      onClick={() => toggleAssignee(member.id)}
                    >
                      <Checkbox checked={isSelected} className="pointer-events-none" />
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: member.color }}
                      />
                      <span className="flex-1 font-medium">{member.name}</span>
                      {status === "available" ? (
                        <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
                          ✅ Available
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">
                          ⚠️ Conflict
                        </Badge>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {selectedAssignees.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedAssignees.map((id) => {
                  const m = members.find((m) => m.id === id);
                  if (!m) return null;
                  return (
                    <Badge key={id} variant="outline" className="text-xs">
                      <span
                        className="w-2 h-2 rounded-full mr-1"
                        style={{ backgroundColor: m.color }}
                      />
                      {m.name}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          <Separator />

          {/* メモ */}
          <div className="space-y-1.5">
            <Label htmlFor="event-notes">メモ（任意）</Label>
            <textarea
              id="event-notes"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              rows={3}
              placeholder="商談の補足情報..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
