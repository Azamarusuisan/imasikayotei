import { Member, Event, AvailabilitySlot, MemberCandidate } from "../types";
import { overlap } from "./date";

/**
 * 指定した時間帯でメンバーの空き状況を計算する
 * - AvailabilitySlot(available) が選択時間帯を完全にカバーしているか
 * - 既存イベントとの重なりがないか
 */
export function calculateCandidates(
  members: Member[],
  startISO: string,
  endISO: string,
  availabilitySlots: AvailabilitySlot[],
  existingEvents: Event[]
): MemberCandidate[] {
  if (!startISO || !endISO) return members.map((m) => ({ member: m, status: "available" as const }));

  return members.map((member) => {
    // このメンバーのavailableスロットを取得
    const memberAvailSlots = availabilitySlots.filter(
      (s) => s.memberId === member.id && s.status === "available"
    );

    // 選択時間帯がavailableスロットでカバーされているかチェック
    const isCoveredByAvailability = memberAvailSlots.some((slot) => {
      const slotStart = new Date(slot.startISO).getTime();
      const slotEnd = new Date(slot.endISO).getTime();
      const selStart = new Date(startISO).getTime();
      const selEnd = new Date(endISO).getTime();
      return slotStart <= selStart && slotEnd >= selEnd;
    });

    // 既存イベントとの重なりチェック
    const hasEventConflict = existingEvents.some(
      (event) =>
        event.assigneeIds.includes(member.id) &&
        overlap(startISO, endISO, event.startISO, event.endISO)
    );

    if (!isCoveredByAvailability || hasEventConflict) {
      return { member, status: "conflict" as const };
    }

    return { member, status: "available" as const };
  });
}

/** 空いているメンバーを先頭にソート */
export function sortCandidatesAvailableFirst(candidates: MemberCandidate[]): MemberCandidate[] {
  return [...candidates].sort((a, b) => {
    if (a.status === "available" && b.status !== "available") return -1;
    if (a.status !== "available" && b.status === "available") return 1;
    return 0;
  });
}
