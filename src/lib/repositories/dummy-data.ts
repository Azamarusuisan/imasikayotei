import { Member, Event, AvailabilitySlot } from "../types";
import { getWeekRange } from "../utils/date";

export const MEMBERS: Member[] = [
  { id: "m1", name: "Ren", color: "#3B82F6" },
  { id: "m2", name: "Aoi", color: "#8B5CF6" },
  { id: "m3", name: "Mei", color: "#EC4899" },
  { id: "m4", name: "Yuto", color: "#F59E0B" },
  { id: "m5", name: "Hana", color: "#10B981" },
  { id: "m6", name: "Sora", color: "#06B6D4" },
  { id: "m7", name: "Kei", color: "#F97316" },
];

function buildThisWeekISO(dayOffset: number, hour: number, minute: number): string {
  const { start } = getWeekRange(new Date());
  const d = new Date(start);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export function createDummyEvents(): Event[] {
  return [
    {
      id: "e1",
      title: "ABC商事",
      startISO: buildThisWeekISO(0, 10, 0),
      endISO: buildThisWeekISO(0, 11, 30),
      assigneeIds: ["m1", "m2"],
      notes: "初回ヒアリング。予算感の確認。",
    },
    {
      id: "e2",
      title: "XYZ工業",
      startISO: buildThisWeekISO(1, 14, 0),
      endISO: buildThisWeekISO(1, 15, 0),
      assigneeIds: ["m3", "m4", "m5"],
      notes: "提案書レビュー",
    },
    {
      id: "e3",
      title: "DEFコンサル",
      startISO: buildThisWeekISO(2, 9, 0),
      endISO: buildThisWeekISO(2, 10, 0),
      assigneeIds: ["m1"],
      notes: "",
    },
    {
      id: "e4",
      title: "GHIメディア",
      startISO: buildThisWeekISO(3, 16, 0),
      endISO: buildThisWeekISO(3, 17, 30),
      assigneeIds: ["m2", "m6"],
      notes: "契約条件の最終確認",
    },
    {
      id: "e5",
      title: "JKLテック",
      startISO: buildThisWeekISO(4, 11, 0),
      endISO: buildThisWeekISO(4, 12, 0),
      assigneeIds: ["m1", "m3", "m7"],
      notes: "デモ実施",
    },
  ];
}

export function createDummyAvailability(): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = [];
  let id = 1;

  MEMBERS.forEach((member) => {
    for (let day = 0; day < 7; day++) {
      // 土日は off
      if (day >= 5) {
        slots.push({
          id: `a${id++}`,
          memberId: member.id,
          startISO: buildThisWeekISO(day, 9, 0),
          endISO: buildThisWeekISO(day, 20, 0),
          status: "off",
        });
        continue;
      }

      // 平日: 午前 9-12 available
      slots.push({
        id: `a${id++}`,
        memberId: member.id,
        startISO: buildThisWeekISO(day, 9, 0),
        endISO: buildThisWeekISO(day, 12, 0),
        status: "available",
      });

      // 昼休み 12-13 busy
      slots.push({
        id: `a${id++}`,
        memberId: member.id,
        startISO: buildThisWeekISO(day, 12, 0),
        endISO: buildThisWeekISO(day, 13, 0),
        status: "busy",
      });

      // 午後 13-18 available
      slots.push({
        id: `a${id++}`,
        memberId: member.id,
        startISO: buildThisWeekISO(day, 13, 0),
        endISO: buildThisWeekISO(day, 18, 0),
        status: "available",
      });

      // 18-20 off
      slots.push({
        id: `a${id++}`,
        memberId: member.id,
        startISO: buildThisWeekISO(day, 18, 0),
        endISO: buildThisWeekISO(day, 20, 0),
        status: "off",
      });
    }
  });

  // いくつかのメンバーに変則的なスケジュールを追加（上書きでなく、表示上の変化用）
  // Ren: 水曜午後 busy
  const renWedIdx = slots.findIndex(
    (s) => s.memberId === "m1" && new Date(s.startISO).getDay() === 3 && new Date(s.startISO).getHours() === 13
  );
  if (renWedIdx >= 0) {
    slots[renWedIdx] = { ...slots[renWedIdx], status: "busy" };
  }

  // Aoi: 金曜午前 off
  const aoiFriIdx = slots.findIndex(
    (s) => s.memberId === "m2" && new Date(s.startISO).getDay() === 5 && new Date(s.startISO).getHours() === 9
  );
  if (aoiFriIdx >= 0) {
    slots[aoiFriIdx] = { ...slots[aoiFriIdx], status: "off" };
  }

  return slots;
}
