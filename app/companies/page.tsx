"use client";
import { useEffect, useState } from "react";
import { useApp } from "../context";
import { Company, Desirability, DESIRABILITY_ORDER } from "../types";
import { newId } from "../store";
import {
  Plus, Pencil, Trash2, X, Check, ArrowUpDown, Filter,
  Settings, ArrowUp, ArrowDown, GripVertical,
} from "lucide-react";
import { formatDatetime, toDatetimeLocalValue } from "../utils";

const INTERVIEW_STATUSES = ["一次面接", "エンジニア面接", "二次面接", "最終面接"];

const STATUS_COLOR_MAP: Record<string, string> = {
  未応募: "bg-gray-100 text-gray-500", 検討中: "bg-gray-100 text-gray-500",
  インターン説明会: "bg-gray-100 text-gray-600", カジュアル面談: "bg-gray-100 text-gray-600",
  ES: "bg-gray-200 text-gray-600", ES提出: "bg-gray-200 text-gray-700",
  コーディングテスト: "bg-gray-200 text-gray-700", 結果待ち: "bg-gray-200 text-gray-600",
  一次面接: "bg-brand-50 text-brand-500", エンジニア面接: "bg-brand-50 text-brand-500",
  二次面接: "bg-brand-100 text-brand-500", 最終面接: "bg-brand-100 text-brand-500 font-medium",
  合格: "bg-gray-700 text-white", 内定: "bg-gray-900 text-white font-bold",
  落選: "bg-gray-100 text-gray-400", 不合格: "bg-gray-100 text-gray-400",
  辞退: "bg-gray-100 text-gray-400",
};
const statusColor = (s: string) => STATUS_COLOR_MAP[s] ?? "bg-gray-100 text-gray-600";

const DESIRABILITY_COLOR: Record<Desirability, string> = {
  SS: "bg-gray-900 text-white font-bold", S: "bg-gray-700 text-white font-semibold",
  A: "bg-gray-500 text-white", B: "bg-gray-200 text-gray-700",
  C: "bg-gray-100 text-gray-500", "": "",
};

type SortKey = "desirability" | "deadline" | "interviewDate" | "status";
type SortDir = "asc" | "desc";

const UI_KEY = "shukatsu_ui_companies";

interface UIState {
  filterStatuses: string[];
  filterDesirabilities: string[];
  sortKey: SortKey;
  sortDir: SortDir;
}

const DEFAULT_UI: UIState = {
  filterStatuses: [], filterDesirabilities: [],
  sortKey: "desirability", sortDir: "desc",
};
// UIStateのsortKeyの型を合わせるためにキャスト用ヘルパー
function isSortKey(v: string): v is SortKey {
  return ["desirability", "deadline", "interviewDate", "status"].includes(v);
}

const emptyForm = (defaultStatus: string): Omit<Company, "id" | "createdAt" | "updatedAt"> => ({
  name: "", industry: "", jobType: "", status: defaultStatus,
  desirability: "", appliedAt: "", deadline: "", interviewDate: "", notes: "",
});

function toggleSet<T>(set: Set<T>, val: T): Set<T> {
  const next = new Set(set);
  next.has(val) ? next.delete(val) : next.add(val);
  return next;
}

export default function CompaniesPage() {
  const { companies, setCompanies, statuses, setStatuses } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm(statuses[0] ?? "未応募"));
  const [showStatusManager, setShowStatusManager] = useState(false);
  const [newStatusInput, setNewStatusInput] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const [filterStatuses, setFilterStatuses] = useState<Set<string>>(new Set());
  const [filterDesirabilities, setFilterDesirabilities] = useState<Set<Desirability | "未設定">>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>(DEFAULT_UI.sortKey);
  const [sortDir, setSortDir] = useState<SortDir>(DEFAULT_UI.sortDir);
  const [uiLoaded, setUiLoaded] = useState(false);

  // LocalStorageから復元
  useEffect(() => {
    try {
      const saved = localStorage.getItem(UI_KEY);
      if (saved) {
        const p: UIState = JSON.parse(saved);
        setFilterStatuses(new Set(p.filterStatuses ?? []));
        setFilterDesirabilities(new Set(p.filterDesirabilities ?? []) as Set<Desirability | "未設定">);
        if (p.sortKey && isSortKey(p.sortKey)) setSortKey(p.sortKey);
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
        filterStatuses: [...filterStatuses],
        filterDesirabilities: [...filterDesirabilities],
        sortKey, sortDir,
      };
      localStorage.setItem(UI_KEY, JSON.stringify(state));
    } catch {}
  }, [filterStatuses, filterDesirabilities, sortKey, sortDir, uiLoaded]);

  function openAdd() {
    setEditId(null);
    setForm(emptyForm(statuses[0] ?? "未応募"));
    setShowForm(true);
  }
  function openEdit(c: Company) {
    setEditId(c.id);
    setForm({
      name: c.name, industry: c.industry, jobType: c.jobType,
      status: c.status, desirability: c.desirability ?? "",
      appliedAt: c.appliedAt ?? "", deadline: c.deadline ?? "",
      interviewDate: c.interviewDate ?? "", notes: c.notes,
    });
    setShowForm(true);
  }
  function save() {
    if (!form.name.trim()) return;
    const now = new Date().toISOString();
    if (editId) {
      setCompanies(companies.map((c) => c.id === editId ? { ...c, ...form, updatedAt: now } : c));
    } else {
      setCompanies([...companies, { ...form, id: newId(), createdAt: now, updatedAt: now }]);
    }
    setShowForm(false);
  }
  function remove(id: string) {
    if (confirm("この企業を削除しますか？")) setCompanies(companies.filter((c) => c.id !== id));
  }

  // ステータス管理
  function addStatus() {
    const s = newStatusInput.trim();
    if (!s || statuses.includes(s)) return;
    setStatuses([...statuses, s]);
    setNewStatusInput("");
  }
  function removeStatus(s: string) {
    const count = companies.filter((c) => c.status === s).length;
    if (count > 0 && !confirm(`「${s}」を使用している企業が${count}社あります。それでも削除しますか？`)) return;
    setStatuses(statuses.filter((x) => x !== s));
    if (filterStatuses.has(s)) setFilterStatuses(toggleSet(filterStatuses, s));
  }
  function onDragStart(i: number) { setDragIndex(i); }
  function onDragOver(e: React.DragEvent, i: number) { e.preventDefault(); setDragOverIndex(i); }
  function onDrop(i: number) {
    if (dragIndex === null || dragIndex === i) { setDragIndex(null); setDragOverIndex(null); return; }
    const next = [...statuses];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(i, 0, moved);
    setStatuses(next);
    setDragIndex(null);
    setDragOverIndex(null);
  }
  function onDragEnd() { setDragIndex(null); setDragOverIndex(null); }

  const filtered = companies.filter((c) => {
    if (filterStatuses.size > 0 && !filterStatuses.has(c.status)) return false;
    if (filterDesirabilities.size > 0) {
      const key: Desirability | "未設定" = c.desirability || "未設定";
      if (!filterDesirabilities.has(key)) return false;
    }
    return true;
  });

  const dir = sortDir === "asc" ? 1 : -1;
  const sorted = [...filtered].sort((a, b) => {
    if (sortKey === "desirability") {
      const diff = DESIRABILITY_ORDER[b.desirability ?? ""] - DESIRABILITY_ORDER[a.desirability ?? ""];
      return diff !== 0 ? dir * diff : a.name.localeCompare(b.name, "ja");
    }
    if (sortKey === "deadline") {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1; if (!b.deadline) return -1;
      return dir * a.deadline.localeCompare(b.deadline);
    }
    if (sortKey === "interviewDate") {
      if (!a.interviewDate && !b.interviewDate) return 0;
      if (!a.interviewDate) return 1; if (!b.interviewDate) return -1;
      return dir * a.interviewDate.localeCompare(b.interviewDate);
    }
    if (sortKey === "status") {
      return dir * (statuses.indexOf(a.status) - statuses.indexOf(b.status));
    }
    return 0;
  });

  const activeFilterCount = filterStatuses.size + filterDesirabilities.size;
  const showInterviewDate = INTERVIEW_STATUSES.includes(form.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">企業管理</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowStatusManager(true)}
            className="flex items-center gap-2 border border-gray-300 text-gray-600 px-4 py-3 rounded-lg text-sm font-medium hover:bg-gray-50">
            <Settings size={15} /> ステータス管理
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 bg-brand-500 text-white px-5 py-3 rounded-lg text-sm font-medium hover:opacity-90">
            <Plus size={16} /> 企業を追加
          </button>
        </div>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          <Filter size={13} />フィルター（複数選択可）
          {activeFilterCount > 0 && (
            <button onClick={() => { setFilterStatuses(new Set()); setFilterDesirabilities(new Set()); }}
              className="ml-1 text-brand-500 hover:underline">
              リセット ({activeFilterCount})
            </button>
          )}
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-2">ステータス</p>
          <div className="flex gap-2 flex-wrap">
            {statuses.map((s) => {
              const active = filterStatuses.has(s);
              return (
                <button key={s} onClick={() => setFilterStatuses(toggleSet(filterStatuses, s))}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors font-medium ${active ? "border-brand-500 bg-brand-50 text-brand-500" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>
                  {s}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-2">志望度</p>
          <div className="flex gap-2 flex-wrap">
            {(["SS", "S", "A", "B", "C", "未設定"] as const).map((d) => {
              const active = filterDesirabilities.has(d);
              return (
                <button key={d} onClick={() => setFilterDesirabilities(toggleSet(filterDesirabilities, d))}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors font-medium ${active ? "bg-brand-500 text-white border-brand-500" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ソート */}
      <div className="flex items-center gap-3 text-xs text-gray-500 px-1">
        <ArrowUpDown size={13} />
        <span>並び替え：</span>
        {([["desirability","志望度"],["deadline","締切"],["interviewDate","面接日程"],["status","ステータス"]] as [SortKey,string][]).map(([k, l]) => (
          <button key={k} onClick={() => {
            if (sortKey === k) setSortDir(d => d === "asc" ? "desc" : "asc");
            else { setSortKey(k); setSortDir(k === "desirability" ? "desc" : "asc"); }
          }}
            className={`flex items-center gap-1 px-3 py-1 rounded ${sortKey === k ? "bg-brand-50 text-brand-500 font-medium" : "hover:bg-gray-100"}`}>
            {l}
            {sortKey === k && (sortDir === "asc" ? <ArrowUp size={11} /> : <ArrowDown size={11} />)}
          </button>
        ))}
        <span className="ml-auto text-gray-400">{sorted.length}社</span>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          {activeFilterCount > 0 ? "条件に一致する企業がありません" : "企業を追加してください"}
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((c) => (
            <div key={c.id} className="bg-white rounded-lg shadow-sm p-6 flex items-start justify-between gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-semibold text-gray-800">{c.name}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor(c.status)}`}>{c.status}</span>
                  {c.desirability && (
                    <span className={`text-xs px-2.5 py-1 rounded-full ${DESIRABILITY_COLOR[c.desirability]}`}>
                      志望度 {c.desirability}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-2 flex gap-4 flex-wrap">
                  {c.industry && <span>{c.industry}</span>}
                  {c.jobType && <span>{c.jobType}</span>}
                  {c.interviewDate && (
                    <span className="text-gray-700 font-medium">面接: {formatDatetime(c.interviewDate)}</span>
                  )}
                  {c.deadline && <span>締切: {formatDatetime(c.deadline)}</span>}
                </div>
                {c.notes && <p className="text-sm text-gray-600 mt-3 line-clamp-2">{c.notes}</p>}
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(c)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><Pencil size={15} /></button>
                <button onClick={() => remove(c.id)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 企業フォームモーダル */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-sm w-full max-w-lg p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg text-gray-800">{editId ? "企業を編集" : "企業を追加"}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <Field label="企業名 *">
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="株式会社〇〇" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="業界">
                  <input className="input" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="IT・通信" />
                </Field>
                <Field label="職種">
                  <input className="input" value={form.jobType} onChange={(e) => setForm({ ...form, jobType: e.target.value })} placeholder="エンジニア" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="ステータス">
                  <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {statuses.map((s) => <option key={s}>{s}</option>)}
                    {editId && !statuses.includes(form.status) && (
                      <option value={form.status}>{form.status}</option>
                    )}
                  </select>
                </Field>
                <Field label="志望度">
                  <select className="input" value={form.desirability} onChange={(e) => setForm({ ...form, desirability: e.target.value as Desirability })}>
                    <option value="">未設定</option>
                    {(["SS","S","A","B","C"] as Desirability[]).map((d) => <option key={d}>{d}</option>)}
                  </select>
                </Field>
              </div>
              {showInterviewDate && (
                <Field label="面接日時">
                  <input className="input" type="datetime-local"
                    value={toDatetimeLocalValue(form.interviewDate ?? "")}
                    onChange={(e) => setForm({ ...form, interviewDate: e.target.value })} />
                </Field>
              )}
              <div className="grid grid-cols-2 gap-4">
                <Field label="応募日">
                  <input className="input" type="date" value={form.appliedAt} onChange={(e) => setForm({ ...form, appliedAt: e.target.value })} />
                </Field>
                <Field label="締切日時">
                  <input className="input" type="datetime-local"
                    value={toDatetimeLocalValue(form.deadline ?? "")}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                </Field>
              </div>
              <Field label="メモ">
                <textarea className="input resize-none" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="面接の感想、企業研究メモなど" />
              </Field>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowForm(false)} className="px-5 py-3 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">キャンセル</button>
              <button onClick={save} className="flex items-center gap-2 px-5 py-3 text-sm bg-brand-500 text-white rounded-lg hover:opacity-90 font-medium">
                <Check size={15} /> 保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ステータス管理モーダル */}
      {showStatusManager && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-sm w-full max-w-md p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg text-gray-800">ステータス管理</h2>
              <button onClick={() => setShowStatusManager(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">新しいステータスを追加</label>
              <div className="flex gap-2">
                <input className="input flex-1" value={newStatusInput}
                  onChange={(e) => setNewStatusInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addStatus()}
                  placeholder="例：リクルーター面談" />
                <button onClick={addStatus}
                  disabled={!newStatusInput.trim() || statuses.includes(newStatusInput.trim())}
                  className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-40 shrink-0">
                  <Plus size={16} />
                </button>
              </div>
              {newStatusInput.trim() && statuses.includes(newStatusInput.trim()) && (
                <p className="text-xs text-gray-400 mt-1">すでに存在します</p>
              )}
            </div>

            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">
                ステータス一覧（{statuses.length}件）
              </p>
              <p className="text-xs text-gray-400 mb-3">ドラッグして順番を変更できます。この順番がフィルター・ソートに反映されます。</p>
              <ul className="space-y-1">
                {statuses.map((s, i) => {
                  const count = companies.filter((c) => c.status === s).length;
                  const isDragging = dragIndex === i;
                  const isOver = dragOverIndex === i && dragIndex !== i;
                  return (
                    <li
                      key={s}
                      draggable
                      onDragStart={() => onDragStart(i)}
                      onDragOver={(e) => onDragOver(e, i)}
                      onDrop={() => onDrop(i)}
                      onDragEnd={onDragEnd}
                      className={`flex items-center gap-2 py-2 border-b border-gray-100 last:border-0 transition-opacity select-none ${isDragging ? "opacity-40" : "opacity-100"} ${isOver ? "border-t-2 border-t-brand-500" : ""}`}
                    >
                      <GripVertical size={16} className="text-gray-300 shrink-0 cursor-grab active:cursor-grabbing" />
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-1 truncate ${statusColor(s)}`}>{s}</span>
                      {count > 0 && <span className="text-xs text-gray-400 shrink-0">{count}社</span>}
                      <button onClick={() => removeStatus(s)}
                        className="p-1.5 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded shrink-0">
                        <Trash2 size={14} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="flex justify-end">
              <button onClick={() => setShowStatusManager(false)}
                className="px-5 py-3 text-sm bg-brand-500 text-white rounded-lg hover:opacity-90 font-medium">
                完了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-2">{label}</label>
      {children}
    </div>
  );
}
