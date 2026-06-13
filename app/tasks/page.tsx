"use client";
import { useEffect, useState } from "react";
import { useApp } from "../context";
import { Task, DESIRABILITY_ORDER } from "../types";
import { newId } from "../store";
import { Plus, Trash2, X, Check, ArrowUpDown, Filter, ArrowUp, ArrowDown, NotebookPen } from "lucide-react";
import { formatDatetime, toDatetimeLocalValue, isOverdue } from "../utils";

const DESIRABILITY_TEXT: Record<string, string> = {
  SS: "text-gray-900 font-bold",
  S:  "text-gray-700 font-semibold",
  A:  "text-gray-600",
  B:  "text-gray-500",
  C:  "text-gray-400",
};

type SortKey = "deadline" | "desirability" | "company";
type SortDir = "asc" | "desc";
type DoneFilter = "todo" | "all" | "done";

const UI_KEY = "shukatsu_ui_tasks";

interface UIState {
  doneFilter: DoneFilter;
  filterCompanyId: string;
  filterDesirabilities: string[];
  sortKey: SortKey;
  sortDir: SortDir;
}

const DEFAULT_UI: UIState = {
  doneFilter: "todo",
  filterCompanyId: "すべて",
  filterDesirabilities: [],
  sortKey: "deadline",
  sortDir: "asc",
};

export default function TasksPage() {
  const { tasks, setTasks, companies } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", dueDate: "", companyId: "" });
  const [memoTask, setMemoTask] = useState<{ id: string; title: string; notes: string } | null>(null);

  const [doneFilter, setDoneFilter] = useState<DoneFilter>(DEFAULT_UI.doneFilter);
  const [filterCompanyId, setFilterCompanyId] = useState(DEFAULT_UI.filterCompanyId);
  const [filterDesirabilities, setFilterDesirabilities] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>(DEFAULT_UI.sortKey);
  const [sortDir, setSortDir] = useState<SortDir>(DEFAULT_UI.sortDir);
  const [uiLoaded, setUiLoaded] = useState(false);

  // LocalStorageから復元
  useEffect(() => {
    try {
      const saved = localStorage.getItem(UI_KEY);
      if (saved) {
        const p: UIState = JSON.parse(saved);
        setDoneFilter(p.doneFilter ?? DEFAULT_UI.doneFilter);
        setFilterCompanyId(p.filterCompanyId ?? DEFAULT_UI.filterCompanyId);
        setFilterDesirabilities(new Set(p.filterDesirabilities ?? []));
        setSortKey(p.sortKey ?? DEFAULT_UI.sortKey);
        setSortDir(p.sortDir ?? DEFAULT_UI.sortDir);
      }
    } catch {}
    setUiLoaded(true);
  }, []);

  // LocalStorageへ保存
  useEffect(() => {
    if (!uiLoaded) return;
    try {
      const state: UIState = {
        doneFilter, filterCompanyId,
        filterDesirabilities: [...filterDesirabilities],
        sortKey, sortDir,
      };
      localStorage.setItem(UI_KEY, JSON.stringify(state));
    } catch {}
  }, [doneFilter, filterCompanyId, filterDesirabilities, sortKey, sortDir, uiLoaded]);

  function toggleDesirability(val: string) {
    setFilterDesirabilities((prev) => {
      const next = new Set(prev);
      next.has(val) ? next.delete(val) : next.add(val);
      return next;
    });
  }

  function addTask() {
    if (!form.title.trim()) return;
    setTasks([...tasks, { ...form, id: newId(), done: false, createdAt: new Date().toISOString() }]);
    setForm({ title: "", dueDate: "", companyId: "" });
    setShowForm(false);
  }

  function toggleDone(id: string) {
    setTasks(tasks.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  }

  function removeTask(id: string) {
    setTasks(tasks.filter((t) => t.id !== id));
  }

  function saveMemo() {
    if (!memoTask) return;
    setTasks(tasks.map((t) => t.id === memoTask.id ? { ...t, notes: memoTask.notes } : t));
    setMemoTask(null);
  }

  // タスクをフィルタリング
  function filterTask(t: Task): boolean {
    if (doneFilter !== "all" && (doneFilter === "done" ? !t.done : t.done)) return false;
    if (filterCompanyId !== "すべて" && t.companyId !== filterCompanyId) return false;
    if (filterDesirabilities.size > 0) {
      const c = companies.find((c) => c.id === t.companyId);
      const key = c?.desirability || "未設定";
      if (!filterDesirabilities.has(key)) return false;
    }
    return true;
  }

  // 会社ごとにグループ化
  const companyIds = [...new Set(tasks.map((t) => t.companyId ?? ""))];
  const groups = companyIds.map((cid) => {
    const company = companies.find((c) => c.id === cid) ?? null;
    const groupTasks = tasks.filter((t) => (t.companyId ?? "") === cid).filter(filterTask);
    return { companyId: cid, company, tasks: groupTasks };
  }).filter((g) => g.tasks.length > 0);

  // グループをソート
  const dir = sortDir === "asc" ? 1 : -1;
  const sortedGroups = [...groups].sort((a, b) => {
    if (sortKey === "company") {
      const na = a.company?.name ?? "会社なし";
      const nb = b.company?.name ?? "会社なし";
      // "会社なし" を常に末尾
      if (!a.company) return 1;
      if (!b.company) return -1;
      return dir * na.localeCompare(nb, "ja");
    }
    if (sortKey === "desirability") {
      const da = DESIRABILITY_ORDER[a.company?.desirability ?? ""] ?? 0;
      const db = DESIRABILITY_ORDER[b.company?.desirability ?? ""] ?? 0;
      if (!a.company) return 1;
      if (!b.company) return -1;
      return dir * (db - da);
    }
    if (sortKey === "deadline") {
      const earliestDue = (g: typeof groups[0]) =>
        g.tasks.filter((t) => !t.done && t.dueDate).map((t) => t.dueDate!).sort()[0] ?? "9999";
      const da = earliestDue(a);
      const db = earliestDue(b);
      return dir * da.localeCompare(db);
    }
    return 0;
  });

  // グループ内のタスクは締め切り順
  function sortTasksInGroup(ts: Task[]): Task[] {
    return [...ts].sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });
  }

  const companiesWithTasks = companies
    .filter((c) => tasks.some((t) => t.companyId === c.id))
    .sort((a, b) => a.name.localeCompare(b.name, "ja"));

  const totalFiltered = groups.reduce((s, g) => s + g.tasks.length, 0);
  const activeFilterCount =
    (filterCompanyId !== "すべて" ? 1 : 0) +
    filterDesirabilities.size +
    (doneFilter !== "todo" ? 1 : 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">タスク</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-brand-500 text-white px-5 py-3 rounded-lg text-sm font-medium hover:opacity-90">
          <Plus size={16} /> タスクを追加
        </button>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          <Filter size={13} /> フィルター
          {activeFilterCount > 0 && (
            <button
              onClick={() => { setDoneFilter("todo"); setFilterCompanyId("すべて"); setFilterDesirabilities(new Set()); }}
              className="ml-1 text-brand-500 hover:underline"
            >
              リセット ({activeFilterCount})
            </button>
          )}
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-2">完了状態</p>
          <div className="flex gap-2">
            {([["todo", "未完了"], ["all", "すべて"], ["done", "完了"]] as [DoneFilter, string][]).map(([val, label]) => (
              <button key={val} onClick={() => setDoneFilter(val)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${doneFilter === val ? "bg-brand-500 text-white border-brand-500" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-2">志望度（複数選択可）</p>
          <div className="flex gap-2 flex-wrap">
            {(["SS", "S", "A", "B", "C", "未設定"]).map((val) => {
              const active = filterDesirabilities.has(val);
              return (
                <button key={val} onClick={() => toggleDesirability(val)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${active ? "bg-brand-500 text-white border-brand-500" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>
                  {val}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-2">企業</p>
          <select className="input text-xs" value={filterCompanyId} onChange={(e) => setFilterCompanyId(e.target.value)}>
            <option value="すべて">すべての企業</option>
            <option value="">企業なし</option>
            {companiesWithTasks.map((c) => (
              <option key={c.id} value={c.id}>{c.name}{c.desirability ? ` (${c.desirability})` : ""}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ソート */}
      <div className="flex items-center gap-3 text-xs text-gray-500 px-1">
        <ArrowUpDown size={13} />
        <span>並び替え：</span>
        {([["deadline", "締切順"], ["desirability", "志望度順"], ["company", "企業名順"]] as [SortKey, string][]).map(([key, label]) => (
          <button key={key} onClick={() => {
            if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
            else { setSortKey(key); setSortDir("asc"); }
          }}
            className={`flex items-center gap-1 px-3 py-1 rounded transition-colors ${sortKey === key ? "bg-brand-50 text-brand-500 font-medium" : "hover:bg-gray-100"}`}>
            {label}
            {sortKey === key && (sortDir === "asc" ? <ArrowUp size={11} /> : <ArrowDown size={11} />)}
          </button>
        ))}
        <span className="ml-auto text-gray-400">{totalFiltered}件</span>
      </div>

      {/* グループ表示 */}
      {sortedGroups.length === 0 ? (
        <div className="text-center py-24 text-gray-400 text-sm">
          {activeFilterCount > 0 ? "条件に一致するタスクがありません" : "タスクがありません"}
        </div>
      ) : (
        <div className="space-y-5">
          {sortedGroups.map(({ companyId, company, tasks: groupTasks }) => {
            const sorted = sortTasksInGroup(groupTasks);
            const doneCount = sorted.filter((t) => t.done).length;
            return (
              <div key={companyId} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* グループヘッダー */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {company ? (
                      <>
                        <span className="font-semibold text-gray-800 truncate">{company.name}</span>
                        {company.desirability && (
                          <span className={`text-xs shrink-0 ${DESIRABILITY_TEXT[company.desirability] ?? "text-gray-600"}`}>
                            志望度 {company.desirability}
                          </span>
                        )}
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded shrink-0">
                          {company.status}
                        </span>
                      </>
                    ) : (
                      <span className="font-semibold text-gray-500">会社なし</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">
                    {doneCount}/{sorted.length} 完了
                  </span>
                </div>

                {/* タスク一覧 */}
                <ul className="divide-y divide-gray-50">
                  {sorted.map((t) => {
                    const over = !t.done && t.dueDate && isOverdue(t.dueDate);
                    return (
                      <li key={t.id} className="px-6 py-4 flex items-center gap-4">
                        <button
                          onClick={() => toggleDone(t.id)}
                          className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${t.done ? "bg-brand-500 border-brand-500" : "border-gray-300 hover:border-brand-500"}`}
                        >
                          {t.done && <Check size={12} className="text-white" />}
                        </button>
                        <button
                          onClick={() => setMemoTask({ id: t.id, title: t.title, notes: t.notes ?? "" })}
                          className="flex-1 min-w-0 text-left"
                        >
                          <span className={`text-sm font-medium ${t.done ? "line-through text-gray-400" : "text-gray-800"} hover:text-brand-500 transition-colors`}>
                            {t.title}
                          </span>
                          {t.notes && <NotebookPen size={12} className="inline ml-2 text-gray-400" />}
                        </button>
                        {t.dueDate && (
                          <span className={`text-xs font-mono shrink-0 px-2.5 py-1 rounded ${
                            over ? "bg-gray-200 text-gray-800 font-semibold" : "bg-gray-100 text-gray-500"
                          }`}>
                            {formatDatetime(t.dueDate)}
                          </span>
                        )}
                        <button onClick={() => removeTask(t.id)} className="p-1.5 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded shrink-0">
                          <Trash2 size={14} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {/* メモモーダル */}
      {memoTask && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-sm w-full max-w-md p-8 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">タスク</p>
                <h2 className="font-semibold text-gray-800">{memoTask.title}</h2>
              </div>
              <button onClick={() => setMemoTask(null)} className="text-gray-400 hover:text-gray-600 shrink-0"><X size={20} /></button>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">メモ</label>
              <textarea
                className="input resize-none"
                rows={6}
                placeholder="メモを入力..."
                value={memoTask.notes}
                onChange={(e) => setMemoTask({ ...memoTask, notes: e.target.value })}
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setMemoTask(null)} className="px-5 py-3 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">キャンセル</button>
              <button onClick={saveMemo} className="flex items-center gap-2 px-5 py-3 text-sm bg-brand-500 text-white rounded-lg hover:opacity-90 font-medium">
                <Check size={15} /> 保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* タスク追加モーダル */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-sm w-full max-w-md p-8 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg text-gray-800">タスクを追加</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">タイトル *</label>
                <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && addTask()} placeholder="ESを提出する" autoFocus />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">期限（日時）</label>
                <input className="input" type="datetime-local" value={toDatetimeLocalValue(form.dueDate)}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">関連企業</label>
                <select className="input" value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })}>
                  <option value="">なし</option>
                  {[...companies].sort((a, b) => a.name.localeCompare(b.name, "ja")).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}{c.desirability ? ` (${c.desirability})` : ""}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowForm(false)} className="px-5 py-3 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">キャンセル</button>
              <button onClick={addTask} className="flex items-center gap-2 px-5 py-3 text-sm bg-brand-500 text-white rounded-lg hover:opacity-90 font-medium">
                <Check size={15} /> 追加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
