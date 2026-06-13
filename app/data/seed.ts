import { Company, Task } from "../types";

const t = "2026-06-14T00:00:00Z";

// ステータス優先順位: 志望度（合格/落選/辞退）> 選択（結果待ち/検討中）> Next選考
export const seedCompanies: Company[] = [
  // フリー株式会社: Next選考=エンジニア面接
  { id: "c01", name: "フリー株式会社", industry: "フィンテック", jobType: "ソフトウェアエンジニア",
    status: "エンジニア面接", desirability: "SS", appliedAt: "2026-05-29",
    notes: "10日間就業型インターン（16万円）。エンジニア面接が次ステップ。Go/Ruby/TypeScript等。",
    createdAt: t, updatedAt: t },
  // ドワンゴ: 選択=結果待ち
  { id: "c02", name: "ドワンゴ", industry: "エンタメ", jobType: "エンジニア",
    status: "結果待ち", desirability: "A",
    notes: "3か月長期インターン。時給2,000円。コーディングテスト・顔写真提出済み。",
    createdAt: t, updatedAt: t },
  // チームラボ: 志望度=辞退
  { id: "c03", name: "チームラボ", industry: "IT・クリエイティブ", jobType: "エンジニア",
    status: "辞退", desirability: "",
    notes: "10日間インターン（東京対面）。時給1,250円。辞退。",
    createdAt: t, updatedAt: t },
  // ラクスル: 志望度=A(非該当), 選択=応募完了(非該当), Next選考=空 → 未応募
  { id: "c04", name: "ラクスル株式会社", industry: "IT・印刷", jobType: "エンジニア",
    status: "未応募", desirability: "A", deadline: "2026-06-17",
    notes: "5daysインターン（9/7〜9/11）。時給2,000円。ES・コーディングテスト〆切 6/17。",
    createdAt: t, updatedAt: t },
  // レアゾン: Next選考=一次面接
  { id: "c05", name: "レアゾン・ホールディングス", industry: "IT", jobType: "ソフトウェアエンジニア",
    status: "一次面接", desirability: "S", deadline: "2026-06-22",
    notes: "3daysインターン（スポーツ×テック、東京）。日給2万。ES・履歴書・コーディングテスト提出済み。",
    createdAt: t, updatedAt: t },
  // 大塚商会: 志望度=辞退
  { id: "c06", name: "大塚商会", industry: "IT商社", jobType: "データサイエンティスト",
    status: "辞退", desirability: "",
    notes: "8日間インターン（東京）。時給2,500円。辞退。",
    createdAt: t, updatedAt: t },
  // LINEヤフー: Next選考=一次面接
  { id: "c07", name: "LINEヤフー", industry: "IT・メディア", jobType: "エンジニア",
    status: "一次面接", desirability: "SS", deadline: "2026-06-25",
    notes: "ハッカソン型インターン（福岡 9/2〜9/18）。時給2,000円。履歴書・プレゼン〆切 6/25。",
    createdAt: t, updatedAt: t },
  // PKSHA: 志望度=落選
  { id: "c08", name: "PKSHA", industry: "AI", jobType: "ソフトウェアエンジニア",
    status: "落選", desirability: "",
    notes: "1ヶ月インターン（AI×アプリ開発）。時給3,000円。",
    createdAt: t, updatedAt: t },
  // Works Human Intelligence: CSV外、Webテスト完了
  { id: "c09", name: "Works Human Intelligence", industry: "HR SaaS", jobType: "エンジニア",
    status: "結果待ち", desirability: "",
    notes: "Webテスト完了済み。",
    createdAt: t, updatedAt: t },
  // ナレッジワーク: 選択=結果待ち
  { id: "c10", name: "ナレッジワーク", industry: "SaaS", jobType: "フルスタックエンジニア",
    status: "結果待ち", desirability: "S", deadline: "2026-06-30",
    notes: "1ヶ月就業型インターン（Go/Next.js/GCP）。時給2,000円〜。コーディングテスト・応募完了。",
    createdAt: t, updatedAt: t },
  // ゲームフリーク: Next選考=コーディングテスト
  { id: "c11", name: "株式会社ゲームフリーク", industry: "ゲーム", jobType: "エンジニア",
    status: "コーディングテスト", desirability: "B", deadline: "2026-06-21",
    notes: "インターン（東京対面）。報酬なし。コーディングテスト〆切 6/21。",
    createdAt: t, updatedAt: t },
  // SanSan: 志望度=落選
  { id: "c12", name: "SanSan", industry: "SaaS", jobType: "エンジニア",
    status: "落選", desirability: "",
    notes: "1か月or2週間長期インターン。",
    createdAt: t, updatedAt: t },
  // はてな: 選択=結果待ち
  { id: "c13", name: "はてな", industry: "IT", jobType: "エンジニア",
    status: "結果待ち", desirability: "S", appliedAt: "2026-06-15",
    notes: "3週間インターン（京都+リモート）。時給1,340円。参加者は新卒面接確約。",
    createdAt: t, updatedAt: t },
  // メンバーズ: Next選考=ES
  { id: "c14", name: "メンバーズ", industry: "デジタルマーケティング", jobType: "エンジニア",
    status: "ES", desirability: "A", deadline: "2026-06-18",
    notes: "ES〆切 6/18。",
    createdAt: t, updatedAt: t },
  // オプティム: Next選考=ES
  { id: "c15", name: "オプティム", industry: "AI・IT", jobType: "エンジニア",
    status: "ES", desirability: "A",
    notes: "2週間or1週間インターン（リモート+対面）。日当1万。ES作成中。",
    createdAt: t, updatedAt: t },
  // DeNA: Next選考=一次面接
  { id: "c16", name: "DeNA", industry: "ゲーム・IT", jobType: "エンジニア",
    status: "一次面接", desirability: "A",
    notes: "就業型インターン1週間〜1か月（7〜12月）。時給2,500円。選考日程調整中。",
    createdAt: t, updatedAt: t },
  // Progate: Next選考=コーディングテスト
  { id: "c17", name: "Progate", industry: "教育IT", jobType: "エンジニア",
    status: "コーディングテスト", desirability: "A", deadline: "2026-06-30",
    notes: "Gitをゼロから実装する5daysインターン。ES・コーディングテスト進行中（〆切 6/30）。",
    createdAt: t, updatedAt: t },
  // TOKIUM: 志望度=落選
  { id: "c18", name: "TOKIUM", industry: "フィンテック", jobType: "エンジニア",
    status: "落選", desirability: "",
    notes: "Claude Code活用の就業型インターン。",
    createdAt: t, updatedAt: t },
  // SuperShip: Next選考=カジュアル面談
  { id: "c19", name: "SuperShip", industry: "IT", jobType: "エンジニア",
    status: "カジュアル面談", desirability: "B",
    notes: "カジュアル面談が次ステップ。",
    createdAt: t, updatedAt: t },
  // サイエンスアーツ: 志望度=合格
  { id: "c20", name: "サイエンスアーツ", industry: "IT", jobType: "エンジニア",
    status: "合格", desirability: "",
    notes: "5Days実務型インターン（対面、東京）。",
    createdAt: t, updatedAt: t },
  // 共同通信社: 志望度=辞退
  { id: "c21", name: "一般社団法人共同通信社", industry: "メディア", jobType: "エンジニア",
    status: "辞退", desirability: "",
    notes: "1week就業型インターン（東京・大阪）。時給2,500円。",
    createdAt: t, updatedAt: t },
  // DATUM STUDIO: 選択=検討中
  { id: "c22", name: "DATUM STUDIO", industry: "AI・データ", jobType: "データエンジニア",
    status: "検討中", desirability: "B",
    notes: "5daysインターン（データ基盤構築）。報酬90,000円+交通宿泊費。",
    createdAt: t, updatedAt: t },
  // ウェルスナビ: 志望度=辞退
  { id: "c23", name: "ウェルスナビ", industry: "フィンテック", jobType: "エンジニア",
    status: "辞退", desirability: "",
    notes: "10daysセキュリティ系対面インターン（東京）。時給1,500〜2,000円。",
    createdAt: t, updatedAt: t },
  // GMOメディア: 志望度=落選
  { id: "c24", name: "GMOメディア", industry: "IT・メディア", jobType: "フルスタックエンジニア",
    status: "落選", desirability: "",
    notes: "5days就業型インターン（渋谷）。時給2,000円。",
    createdAt: t, updatedAt: t },
  // いい生活: 志望度=落選
  { id: "c25", name: "いい生活", industry: "不動産IT", jobType: "エンジニア",
    status: "落選", desirability: "",
    notes: "5daysインターン（東京）。日当1万。",
    createdAt: t, updatedAt: t },
  // ピクシブ: 志望度=落選
  { id: "c26", name: "ピクシブ", industry: "IT・クリエイティブ", jobType: "エンジニア",
    status: "落選", desirability: "",
    notes: "インターン。",
    createdAt: t, updatedAt: t },
  // CARTA HOLDINGS: Next選考=エンジニア面接
  { id: "c27", name: "株式会社CARTA HOLDINGS", industry: "デジタルマーケティング", jobType: "エンジニア",
    status: "エンジニア面接", desirability: "SS",
    notes: "3週間インターン（東京、8/10〜8/28）。14万円。",
    createdAt: t, updatedAt: t },
  // フォルシア: 選択=結果待ち
  { id: "c28", name: "フォルシア株式会社", industry: "IT", jobType: "エンジニア",
    status: "結果待ち", desirability: "SS",
    notes: "5daysインターン・AIエージェント活用コース（8/31〜9/4）。日当2万×5日。",
    createdAt: t, updatedAt: t },
  // MIXI: 志望度=落選
  { id: "c29", name: "MIXI", industry: "エンタメ・IT", jobType: "エンジニア",
    status: "落選", desirability: "",
    notes: "1か月長期就業型インターン（フルリモート）。時給2,500円。",
    createdAt: t, updatedAt: t },
  // ラクス: 志望度=辞退
  { id: "c30", name: "ラクス", industry: "SaaS", jobType: "エンジニア",
    status: "辞退", desirability: "",
    notes: "3daysインターン（8/26〜8/28）。報酬なし。",
    createdAt: t, updatedAt: t },
  // うるる: Next選考=カジュアル面談
  { id: "c31", name: "うるる", industry: "IT", jobType: "エンジニア",
    status: "カジュアル面談", desirability: "S",
    notes: "3daysインターン（東京、8/5〜8/7）。報酬36,000円。",
    createdAt: t, updatedAt: t },
  // ウォンテッドリー: 選択=検討中
  { id: "c32", name: "ウォンテッドリー", industry: "HR Tech", jobType: "データサイエンティスト",
    status: "検討中", desirability: "A", deadline: "2026-06-30",
    notes: "機械学習チーム就業型インターン（2週間）。時給2,500円。〆切 6/30。",
    createdAt: t, updatedAt: t },
  // ギフティ: Next選考=一次面接
  { id: "c33", name: "株式会社ギフティ", industry: "IT・EC", jobType: "エンジニア",
    status: "一次面接", desirability: "B",
    notes: "5days実務体験型インターン（東京）。3万円。",
    createdAt: t, updatedAt: t },
  // スタンバイ: 志望度=落選
  { id: "c34", name: "スタンバイ", industry: "HR Tech", jobType: "エンジニア",
    status: "落選", desirability: "",
    notes: "4daysインターン（東京、8/18〜8/21）。3万6千円。",
    createdAt: t, updatedAt: t },
  // アンドパッド: 志望度=落選
  { id: "c35", name: "アンドパッド", industry: "建設Tech", jobType: "エンジニア",
    status: "落選", desirability: "",
    notes: "20日間長期インターン（東京、リモート+対面）。時給2,500円。",
    createdAt: t, updatedAt: t },
];

export const seedTasks: Task[] = [
  { id: "t01", companyId: "c01", title: "コーディングテスト", dueDate: "2026-06-01", done: true, createdAt: t },
  { id: "t02", companyId: "c01", title: "選考日程調整", dueDate: "2026-06-05", done: true, createdAt: t },
  { id: "t03", companyId: "c02", title: "コーディングテスト", dueDate: "2026-06-07", done: true, createdAt: t },
  { id: "t04", companyId: "c02", title: "顔写真準備", dueDate: "2026-06-07", done: true, createdAt: t },
  { id: "t05", companyId: "c03", title: "ES提出", dueDate: "2026-06-14", done: true, createdAt: t },
  { id: "t06", companyId: "c03", title: "コーディングテスト", dueDate: "2026-06-14", done: true, createdAt: t },
  { id: "t07", companyId: "c03", title: "履歴書作成", dueDate: "2026-06-14", done: true, createdAt: t },
  { id: "t08", companyId: "c04", title: "ES提出", dueDate: "2026-06-17", done: false, createdAt: t },
  { id: "t09", companyId: "c04", title: "コーディングテスト", dueDate: "2026-06-17", done: false, createdAt: t },
  { id: "t10", companyId: "c05", title: "コーディングテスト", dueDate: "2026-06-03", done: true, createdAt: t },
  { id: "t11", companyId: "c05", title: "ES提出", dueDate: "2026-06-22", done: true, createdAt: t },
  { id: "t12", companyId: "c05", title: "履歴書作成", dueDate: "2026-06-22", done: true, createdAt: t },
  { id: "t13", companyId: "c06", title: "コーディングテスト", dueDate: "2026-06-02", done: true, createdAt: t },
  { id: "t14", companyId: "c07", title: "コーディングテスト", dueDate: "2026-05-31", done: true, createdAt: t },
  { id: "t15", companyId: "c07", title: "履歴書作成", dueDate: "2026-06-25", done: false, createdAt: t },
  { id: "t16", companyId: "c07", title: "自己紹介プレゼン準備", dueDate: "2026-06-25", done: false, createdAt: t },
  { id: "t17", companyId: "c08", title: "ES提出", dueDate: "2026-06-01", done: true, createdAt: t },
  { id: "t18", companyId: "c08", title: "履歴書作成", dueDate: "2026-06-01", done: true, createdAt: t },
  { id: "t19", companyId: "c09", title: "Webテスト", dueDate: "2026-06-03", done: true, createdAt: t },
  { id: "t20", companyId: "c10", title: "コーディングテスト", dueDate: "2026-06-05", done: true, createdAt: t },
  { id: "t21", companyId: "c10", title: "応募", dueDate: "2026-06-30", done: true, createdAt: t },
  { id: "t22", companyId: "c11", title: "コーディングテスト", dueDate: "2026-06-21", done: false, createdAt: t },
  { id: "t23", companyId: "c12", title: "コーディングテスト", dueDate: "2026-05-27", done: true, createdAt: t },
  { id: "t24", companyId: "c13", title: "応募", dueDate: "2026-06-15", done: true, createdAt: t },
  { id: "t25", companyId: "c14", title: "ES提出", dueDate: "2026-06-18", done: false, createdAt: t },
  { id: "t26", companyId: "c15", title: "ES提出", done: false, createdAt: t },
  { id: "t27", companyId: "c16", title: "選考日程調整", done: false, createdAt: t },
  { id: "t28", companyId: "c17", title: "ES提出", dueDate: "2026-06-30", done: false, createdAt: t },
  { id: "t29", companyId: "c17", title: "コーディングテスト", dueDate: "2026-06-30", done: false, createdAt: t },
];
