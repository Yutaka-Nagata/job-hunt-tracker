"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, CheckSquare, BarChart2, Settings, Download, Upload, ChevronDown } from "lucide-react";
import { useApp } from "../context";
import { saveCompanies, saveTasks, saveStatuses } from "../store";
import { useState, useRef, useEffect } from "react";

const links = [
  { href: "/", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/companies", label: "企業管理", icon: Building2 },
  { href: "/tasks", label: "タスク", icon: CheckSquare },
  { href: "/stats", label: "統計", icon: BarChart2 },
];

export default function Nav() {
  const pathname = usePathname();
  const { companies, tasks, statuses, setCompanies, setTasks, setStatuses } = useApp();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleExport() {
    setOpen(false);
    const data = { companies, tasks, statuses, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shukatsu-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport() {
    setOpen(false);
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (!data.companies || !data.tasks) {
            alert("無効なファイルです。companies と tasks が必要です。");
            return;
          }
          if (!confirm(`インポートすると現在のデータが上書きされます。\n企業: ${data.companies.length}件 / タスク: ${data.tasks.length}件\n続けますか？`)) return;
          setCompanies(data.companies);
          saveCompanies(data.companies);
          setTasks(data.tasks);
          saveTasks(data.tasks);
          if (Array.isArray(data.statuses)) {
            setStatuses(data.statuses);
            saveStatuses(data.statuses);
          }
        } catch {
          alert("JSONの読み込みに失敗しました。");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  return (
    <nav className="sticky top-0 z-40 bg-white border-b shadow-sm">
      <div className="max-w-5xl mx-auto px-6 flex items-center gap-2 h-16">
        <span className="font-semibold text-brand-500 mr-6 text-lg">就活トラッカー</span>
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
              pathname === href
                ? "bg-gray-100 text-brand-500"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}

        {/* 設定ドロップダウン */}
        <div className="ml-auto relative" ref={menuRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className={`flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
              open ? "bg-gray-100 text-brand-500" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Settings size={16} />
            設定
            <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-sm py-1 z-50">
              <button
                onClick={handleImport}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Upload size={14} className="text-gray-400" />
                データをインポート
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Download size={14} className="text-gray-400" />
                データをエクスポート
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
