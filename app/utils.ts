/** "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm" → 表示用文字列 */
export function formatDatetime(value: string | undefined): string {
  if (!value) return "";
  if (value.includes("T")) {
    const [date, time] = value.split("T");
    const t = time.slice(0, 5);
    return t === "00:00" ? date : `${date} ${t}`;
  }
  return value;
}

/** 既存の "YYYY-MM-DD" 値を datetime-local input 用に変換 */
export function toDatetimeLocalValue(value: string): string {
  if (!value) return "";
  if (value.includes("T")) return value.slice(0, 16);
  return value + "T00:00";
}

/** 期限超過チェック（時刻あり・なし両対応） */
export function isOverdue(value: string): boolean {
  if (!value) return false;
  const now = new Date();
  if (value.includes("T")) return value < now.toISOString().slice(0, 16);
  return value < now.toISOString().slice(0, 10);
}
