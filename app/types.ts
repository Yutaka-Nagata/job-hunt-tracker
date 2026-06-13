// ステータスは動的（ユーザーが追加・削除可能）
// SelectionStatus は後方互換のために残す
export type SelectionStatus = string;

// デフォルトのステータス一覧（初回起動時のシード）
export const STATUS_ORDER: string[] = [
  "検討中", "未応募", "インターン説明会", "カジュアル面談",
  "ES", "ES提出", "コーディングテスト", "結果待ち",
  "一次面接", "エンジニア面接", "二次面接", "最終面接",
  "合格", "内定", "落選", "不合格", "辞退",
];

export type Desirability = "SS" | "S" | "A" | "B" | "C" | "";

export const DESIRABILITY_ORDER: Record<Desirability, number> = {
  SS: 5, S: 4, A: 3, B: 2, C: 1, "": 0,
};

export interface Company {
  id: string;
  name: string;
  industry: string;
  jobType: string;
  status: string;
  desirability: Desirability;
  appliedAt?: string;
  deadline?: string;
  interviewDate?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  companyId?: string;
  title: string;
  dueDate?: string;
  done: boolean;
  notes?: string;
  createdAt: string;
}
