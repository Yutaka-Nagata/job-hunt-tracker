"use client";
import { useState } from "react";
import { useApp } from "./context";
import Link from "next/link";
import { Desirability, DESIRABILITY_ORDER } from "./types";
import { CheckSquare, CalendarDays, AlertCircle, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDatetime, isOverdue, toDatetimeLocalValue } from "./utils";

function localDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function interviewTime(dateStr: string): string {
  if (!dateStr.includes("T")) return "";
  const t = dateStr.split("T")[1]?.slice(0, 5);
  return t === "00:00" ? "" : (t ?? "");
}

const DESIRABILITY_COLOR: Record<Desirability, string> = {
  SS: "text-gray-900 font-bold",
  S:  "text-gray-700 font-semibold",
  A:  "text-gray-600",
  B:  "text-gray-500",
  C:  "text-gray-400",
  "": "",
};

type MemoTarget =
  | { type: "task"; id: string; title: string; notes: string }
  | { type: "interview"; id: string; name: string; notes: string; interviewDate: string };

export default function Dashboard() {
  const { companies, setCompanies, tasks, setTasks } = useApp();
  const [memo, setMemo] = useState<MemoTarget | null>(null);

  const pendingTasks = tasks.filter((t) => !t.done);
  const overdueTasks = pendingTasks.filter((t) => t.dueDate && isOverdue(t.dueDate));

  const today = new Date().toISOString().slice(0, 10);
  const upcomingInterviews = companies
    .filter((c) => c.interviewDate && c.interviewDate >= today)
    .sort((a, b) => a.interviewDate!.localeCompare(b.interviewDate!));

  const companyIds = [...new Set(pendingTasks.map((t) => t.companyId ?? ""))];
  const taskGroups = companyIds.map((cid) => {
    const company = companies.find((c) => c.id === cid) ?? null;
    const groupTasks = [...pendingTasks.filter((t) => (t.companyId ?? "") === cid)].sort((a, b) => {
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate) return -1; if (b.dueDate) return 1; return 0;
    });
    const earliest = groupTasks.find((t) => t.dueDate)?.dueDate ?? "9999";
    return { cid, company, groupTasks, earliest };
  }).sort((a, b) => {
    // 締め切りが近い順、締め切りなしは末尾
    if (!a.company) return 1; if (!b.company) return -1;
    return a.earliest.localeCompare(b.earliest);
  });

  function toggleDone(id: string) {
    setTasks(tasks.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  }

  function saveMemo() {
    if (!memo) return;
    if (memo.type === "task") {
      setTasks(tasks.map((t) => t.id === memo.id ? { ...t, notes: memo.notes } : t));
    } else {
      setCompanies(companies.map((c) => c.id === memo.id
        ? { ...c, notes: memo.notes, interviewDate: memo.interviewDate, updatedAt: new Date().toISOString() }
        : c));
    }
    setMemo(null);
  }

  return (
    <div className="space-y-9">
      <h1 className="text-2xl font-semibold text-gray-800">ダッシュボード</h1>

      <div className="grid md:grid-cols-2 gap-5 sm:gap-9 items-start">
        {/* 未完了タスク */}
        <section className="bg-white rounded-lg shadow-sm p-4 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <CheckSquare size={20} className="text-brand-500" />
              <h2 className="text-lg font-semibold text-gray-800">未完了タスク</h2>
              <span className="text-xs font-medium bg-brand-50 text-brand-500 px-2.5 py-1 rounded-full">
                {pendingTasks.length}件
              </span>
              {overdueTasks.length > 0 && (
                <span className="flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                  <AlertCircle size={11} />超過 {overdueTasks.length}
                </span>
              )}
            </div>
            <Link href="/tasks" className="text-xs text-brand-500 hover:underline shrink-0">すべて →</Link>
          </div>

          {taskGroups.length === 0 ? (
            <p className="text-center py-10 text-gray-400 text-sm">未完了タスクはありません</p>
          ) : (
            <div className="space-y-4">
              {taskGroups.map(({ cid, company, groupTasks }) => (
                <div key={cid} className="border border-gray-100 rounded-lg overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 flex items-center gap-3">
                    {company ? (
                      <>
                        <span className="text-sm font-semibold text-gray-800 truncate">{company.name}</span>
                        {company.desirability && (
                          <span className={`text-xs shrink-0 ${DESIRABILITY_COLOR[company.desirability]}`}>
                            {company.desirability}
                          </span>
                        )}
                        <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-200 shrink-0">
                          {company.status}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm font-semibold text-gray-500">会社なし</span>
                    )}
                    <span className="ml-auto text-xs text-gray-400 shrink-0">{groupTasks.length}件</span>
                  </div>
                  <ul className="divide-y divide-gray-50">
                    {groupTasks.map((t) => {
                      const over = t.dueDate && isOverdue(t.dueDate);
                      return (
                        <li key={t.id} className="px-4 py-3.5 flex items-start gap-3">
                          <button
                            onClick={() => toggleDone(t.id)}
                            className="w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors border-gray-300 hover:border-brand-500"
                          >
                            <Check size={12} className="text-gray-300" />
                          </button>
                          <button
                            onClick={() => setMemo({ type: "task", id: t.id, title: t.title, notes: t.notes ?? "" })}
                            className="flex-1 min-w-0 text-left"
                          >
                            <p className="text-sm text-gray-800 truncate hover:text-brand-500 transition-colors">
                              {t.title}
                              {t.notes && <span className="ml-1.5 text-xs text-gray-400">📝</span>}
                            </p>
                            {t.dueDate && (
                              <p className={`text-sm font-semibold mt-1 ${over ? "text-gray-700" : "text-brand-500"}`}>
                                {formatDatetime(t.dueDate)}
                                {over && <span className="ml-2 text-xs font-normal text-gray-400">期限超過</span>}
                              </p>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 直近の面接日程 */}
        <section className="bg-white rounded-lg shadow-sm p-4 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <CalendarDays size={20} className="text-brand-500" />
              <h2 className="text-lg font-semibold text-gray-800">直近の面接日程</h2>
              <span className="text-xs font-medium bg-brand-50 text-brand-500 px-2.5 py-1 rounded-full">
                {upcomingInterviews.length}件
              </span>
            </div>
            <Link href="/companies" className="text-xs text-brand-500 hover:underline shrink-0">企業一覧 →</Link>
          </div>

          {upcomingInterviews.length === 0 ? (
            <p className="text-center py-10 text-gray-400 text-sm">直近の面接日程がありません</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {upcomingInterviews.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => setMemo({ type: "interview", id: c.id, name: c.name, notes: c.notes ?? "", interviewDate: c.interviewDate ?? "" })}
                    className="w-full py-3.5 flex items-start gap-3 text-left hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors"
                  >
                    <span className="text-sm font-bold text-brand-500 shrink-0 mt-0.5 leading-snug">
                      {formatDatetime(c.interviewDate)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {c.name}
                        {c.notes && <span className="ml-2 text-xs text-gray-400">📝</span>}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs bg-brand-50 text-brand-500 px-2 py-0.5 rounded-full">{c.status}</span>
                        {c.desirability && (
                          <span className={`text-xs ${DESIRABILITY_COLOR[c.desirability]}`}>志望度 {c.desirability}</span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* ミニカレンダー */}
          <MiniCalendar
            interviews={companies.filter((c) => c.interviewDate)}
            today={today}
            onUpdate={(id, interviewDate, notes) =>
              setCompanies(companies.map((c) => c.id === id
                ? { ...c, interviewDate, notes, updatedAt: new Date().toISOString() }
                : c))
            }
          />
        </section>
      </div>

      {/* メモモーダル */}
      {memo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-sm w-full max-w-md p-5 sm:p-8 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">
                  {memo.type === "task" ? "タスク" : "企業・面接"}
                </p>
                <h2 className="font-semibold text-gray-800">
                  {memo.type === "task" ? memo.title : memo.name}
                </h2>
              </div>
              <button onClick={() => setMemo(null)} className="text-gray-400 hover:text-gray-600 shrink-0"><X size={20} /></button>
            </div>
            {memo.type === "interview" && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">面接日時</label>
                <input
                  className="input"
                  type="datetime-local"
                  value={toDatetimeLocalValue(memo.interviewDate)}
                  onChange={(e) => setMemo({ ...memo, interviewDate: e.target.value })}
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">メモ</label>
              <textarea
                className="input resize-none"
                rows={5}
                placeholder="メモを入力..."
                value={memo.notes}
                onChange={(e) => setMemo({ ...memo, notes: e.target.value })}
                autoFocus={memo.type === "task"}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setMemo(null)} className="px-5 py-3 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">キャンセル</button>
              <button onClick={saveMemo} className="flex items-center gap-2 px-5 py-3 text-sm bg-brand-500 text-white rounded-lg hover:opacity-90 font-medium">
                <Check size={15} /> 保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- ミニカレンダー ----
import type { Company } from "./types";

type CalendarPopup = { id: string; name: string; status: string; interviewDate: string; notes: string };

function MiniCalendar({
  interviews, today, onUpdate,
}: {
  interviews: Company[];
  today: string;
  onUpdate: (id: string, interviewDate: string, notes: string) => void;
}) {
  const [popup, setPopup] = useState<CalendarPopup | null>(null);
  const now = new Date();
  const [curYear, setCurYear] = useState(now.getFullYear());
  const [curMonth, setCurMonth] = useState(now.getMonth());

  const year = curYear;
  const month = curMonth;

  const todayYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const curYM   = `${year}-${String(month + 1).padStart(2, "0")}`;
  const minYM   = `${now.getFullYear() - 1}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const maxYM   = `${now.getFullYear() + 1}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  function prevMonth() {
    if (curYM <= minYM) return;
    if (month === 0) { setCurYear(y => y - 1); setCurMonth(11); }
    else setCurMonth(m => m - 1);
    setPopup(null);
  }
  function nextMonth() {
    if (curYM >= maxYM) return;
    if (month === 11) { setCurYear(y => y + 1); setCurMonth(0); }
    else setCurMonth(m => m + 1);
    setPopup(null);
  }

  // 月初の曜日オフセット（月曜始まり）
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;

  // 日付セルを構築
  type Cell = { dateStr: string; day: number; inMonth: boolean };
  const cells: Cell[] = [];
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    cells.push({ dateStr: localDateStr(d), day: d.getDate(), inMonth: false });
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    cells.push({ dateStr: localDateStr(date), day: d, inMonth: true });
  }
  const remaining = (7 - (cells.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d);
    cells.push({ dateStr: localDateStr(date), day: d, inMonth: false });
  }

  // 日付 → 面接リスト のマップ（全期間）
  const map = new Map<string, Company[]>();
  interviews.forEach((c) => {
    if (!c.interviewDate) return;
    const key = c.interviewDate.slice(0, 10);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(c);
  });

  const weeks: Cell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div className="mt-6 pt-6 border-t border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          disabled={curYM <= minYM}
          className="p-1 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <p className="text-xs font-semibold text-gray-600">
          {year}年{month + 1}月
          {curYM === todayYM && <span className="ml-2 text-brand-500">（今月）</span>}
        </p>
        <button
          onClick={nextMonth}
          disabled={curYM >= maxYM}
          className="p-1 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
      <table className="w-full border-collapse table-fixed">
        <thead>
          <tr>
            {["月","火","水","木","金","土","日"].map((w) => (
              <th key={w} className="text-[11px] text-gray-400 font-medium text-center pb-2">{w}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, wi) => (
            <tr key={wi}>
              {week.map(({ dateStr, day, inMonth }) => {
                const isToday = dateStr === today;
                const dayInterviews = map.get(dateStr) ?? [];
                return (
                  <td key={dateStr} className="align-top pb-2 text-center">
                    {/* 日付番号 */}
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium ${
                      isToday
                        ? "bg-brand-500 text-white font-bold"
                        : inMonth
                        ? "text-gray-700"
                        : "text-gray-300"
                    }`}>
                      {day}
                    </span>
                    {/* 面接バッジ */}
                    {dayInterviews.map((c, i) => {
                      const time = interviewTime(c.interviewDate ?? "");
                      return (
                        <div key={i} className="mt-0.5 px-0.5">
                          <button
                            onClick={() => setPopup({ id: c.id, name: c.name, status: c.status, interviewDate: c.interviewDate ?? "", notes: c.notes ?? "" })}
                            className="block w-full text-[10px] leading-tight bg-brand-50 text-brand-500 rounded px-1 py-0.5 truncate text-left hover:bg-brand-100 transition-colors"
                          >
                            <span className="block truncate">{c.name.slice(0, 5)}</span>
                            {time && <span className="block text-[9px] text-brand-500/70">{time}</span>}
                          </button>
                        </div>
                      );
                    })}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* カレンダーバッジクリック → 編集フォーム（直下に展開） */}
      {popup && (
        <div className="mt-3 border border-brand-100 rounded-lg p-4 space-y-3 bg-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-gray-400">{popup.status}</p>
              <p className="text-sm font-semibold text-gray-800">{popup.name}</p>
            </div>
            <button onClick={() => setPopup(null)} className="text-gray-300 hover:text-gray-500 shrink-0">
              <X size={15} />
            </button>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">面接日時</label>
            <input
              className="input text-sm"
              type="datetime-local"
              value={toDatetimeLocalValue(popup.interviewDate)}
              onChange={(e) => setPopup({ ...popup, interviewDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">メモ</label>
            <textarea
              className="input resize-none text-sm"
              rows={3}
              placeholder="メモを入力..."
              value={popup.notes}
              onChange={(e) => setPopup({ ...popup, notes: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setPopup(null)} className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg">キャンセル</button>
            <button
              onClick={() => { onUpdate(popup.id, popup.interviewDate, popup.notes); setPopup(null); }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs bg-brand-500 text-white rounded-lg hover:opacity-90 font-medium"
            >
              <Check size={13} /> 保存
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
