/** 月曜始まりの週範囲を返す */
export function getWeekRange(date: Date): { start: Date; end: Date } {
  const d = new Date(date);
  const day = d.getDay();
  // 月曜 = 1, 日曜 = 0 → 月曜始まりに変換
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { start: monday, end: sunday };
}

/** 週の各日（月〜日）を配列で返す */
export function getWeekDays(date: Date): Date[] {
  const { start } = getWeekRange(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

/** 2つの時間帯が重なるか判定 */
export function overlap(
  aStart: string | Date,
  aEnd: string | Date,
  bStart: string | Date,
  bEnd: string | Date
): boolean {
  const a0 = new Date(aStart).getTime();
  const a1 = new Date(aEnd).getTime();
  const b0 = new Date(bStart).getTime();
  const b1 = new Date(bEnd).getTime();
  return a0 < b1 && b0 < a1;
}

/** 日付を YYYY-MM-DD 形式に */
export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** 時刻を HH:MM 形式に */
export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** 曜日ラベル */
export const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** 時間スロット (9:00〜22:00, 30分刻み) */
export function getTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 9; h < 22; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  slots.push("22:00");
  return slots;
}

/** 週を前に移動 */
export function prevWeek(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - 7);
  return d;
}

/** 週を次に移動 */
export function nextWeek(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + 7);
  return d;
}

/** 年月を「2023年 10月」形式に */
export function formatYearMonth(date: Date): string {
  return `${date.getFullYear()}年 ${date.getMonth() + 1}月`;
}
