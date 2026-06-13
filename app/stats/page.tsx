"use client";
import { useApp } from "../context";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { Building2, Trophy, CheckSquare, AlertCircle } from "lucide-react";

const CHART_COLORS = ["#e5e7eb", "#d1d5db", "#9ca3af", "#6b7280", "#4b5563", "#374151", "#1f2937", "#3b5bdb"];

export default function StatsPage() {
  const { companies, tasks, statuses } = useApp();
  const today = new Date().toISOString().split("T")[0];

  // KPI
  const activeCompanies = companies.filter(
    (c) => c.status !== "不合格" && c.status !== "辞退" && c.status !== "落選"
  );
  const offers = companies.filter((c) => c.status === "内定");
  const pendingTasks = tasks.filter((t) => !t.done);
  const overdueTasks = pendingTasks.filter((t) => t.dueDate && t.dueDate < today);

  // ステータス内訳（statuses順で表示）
  const statusCount = statuses
    .map((s) => ({ status: s, count: companies.filter((c) => c.status === s).length }))
    .filter((x) => x.count > 0);

  // チャート用
  const statusData = statusCount.map((d, i) => ({
    name: d.status,
    count: d.count,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const industryMap: Record<string, number> = {};
  companies.forEach((c) => {
    const key = c.industry || "未設定";
    industryMap[key] = (industryMap[key] ?? 0) + 1;
  });
  const industryData = Object.entries(industryMap).map(([name, count]) => ({ name, count }));

  const applied = companies.filter((c) => c.status !== "未応募").length;
  const passed1 = companies.filter((c) =>
    (["一次面接", "エンジニア面接", "二次面接", "最終面接", "合格", "内定"] as string[]).includes(c.status)
  ).length;
  const esRate   = applied > 0 ? Math.round((passed1 / applied) * 100) : null;
  const offerRate = applied > 0 ? Math.round((offers.length / applied) * 100) : null;

  return (
    <div className="space-y-9">
      <h1 className="text-2xl font-semibold text-gray-800">統計</h1>

      {/* KPI カード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard icon={<Building2 className="text-brand-500" />} label="選考中" value={activeCompanies.length} unit="社" />
        <StatCard icon={<Trophy className="text-gray-500" />} label="内定" value={offers.length} unit="社" />
        <StatCard icon={<CheckSquare className="text-gray-500" />} label="未完了タスク" value={pendingTasks.length} unit="件" />
        <StatCard icon={<AlertCircle className="text-gray-500" />} label="期限超過" value={overdueTasks.length} unit="件" alert={overdueTasks.length > 0} />
      </div>

      {/* 選考ステータス内訳 */}
      {statusCount.length > 0 && (
        <section className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="font-semibold text-gray-800 mb-6">選考ステータス内訳</h2>
          <div className="flex flex-wrap gap-3">
            {statusCount.map(({ status, count }) => (
              <div key={status} className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2">
                <span className="text-sm font-medium text-gray-700">{status}</span>
                <span className="text-lg font-semibold text-brand-500">{count}</span>
                <span className="text-xs text-gray-400">社</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 通過率 */}
      <div className="grid grid-cols-2 gap-6">
        <KpiCard label="登録企業数" value={companies.length} unit="社" />
        <KpiCard label="応募済み" value={applied} unit="社" />
        <KpiCard label="書類通過率" value={esRate !== null ? `${esRate}%` : "—"} />
        <KpiCard label="内定率" value={offerRate !== null ? `${offerRate}%` : "—"} />
      </div>

      {companies.length === 0 ? (
        <div className="text-center py-24 text-gray-400">企業を追加すると統計が表示されます</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-9">
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="font-semibold text-gray-800 mb-6">ステータス別（棒グラフ）</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="社数" radius={[4, 4, 0, 0]}>
                  {statusData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </section>

          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="font-semibold text-gray-800 mb-6">ステータス別（円グラフ）</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                  label={({ name, percent }) => `${name} ${Math.round((percent ?? 0) * 100)}%`}
                  labelLine={false}>
                  {statusData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </section>

          {industryData.length > 0 && (
            <section className="bg-white rounded-lg shadow-sm p-8 md:col-span-2">
              <h2 className="font-semibold text-gray-800 mb-6">業界別（棒グラフ）</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={industryData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="社数" fill="#3b5bdb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, unit, alert }: {
  icon: React.ReactNode; label: string; value: number; unit: string; alert?: boolean;
}) {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 flex items-center gap-4 ${alert ? "border border-gray-300" : ""}`}>
      <div className="p-3 bg-gray-50 rounded-lg shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-2xl font-semibold text-gray-800">
          {value}<span className="text-sm font-normal text-gray-600 ml-1">{unit}</span>
        </p>
      </div>
    </div>
  );
}

function KpiCard({ label, value, unit }: { label: string; value: number | string; unit?: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-semibold text-gray-800 mt-2">
        {value}
        {unit && <span className="text-sm font-normal text-gray-600 ml-1">{unit}</span>}
      </p>
    </div>
  );
}
