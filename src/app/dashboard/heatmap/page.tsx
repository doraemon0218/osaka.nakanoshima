"use client";

import { useState } from "react";
import { ClinicalLabel, ClinicalTooltip } from "@/components/ui/clinical-tooltip";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Stethoscope,
  HeartPulse,
  Pill,
  Microscope,
  FileText,
  UserCircle,
  type LucideIcon,
} from "lucide-react";

/** 役割ごとのアイコン（医師・看護師・薬剤師・検査技師・事務がぱっと見でわかる） */
function getRoleIcon(role: string): LucideIcon {
  if (/医師|麻酔科医|外科医/.test(role)) return Stethoscope;
  if (/看護師|看護助手/.test(role)) return HeartPulse;
  if (/薬剤師/.test(role)) return Pill;
  if (/技師|検査/.test(role)) return Microscope;
  if (/事務|医療事務/.test(role)) return FileText;
  return UserCircle;
}

function RoleIcon({ role, className }: { role: string; className?: string }) {
  const Icon = getRoleIcon(role);
  return <Icon className={cn("inline-block shrink-0", className)} aria-hidden />;
}

/** 部署選択肢（設定と同じ構造・1クリックで選択） */
const DEPT_OPTIONS = [
  ...["東１", "東２", "東３", "東４", "東５", "東６", "東７", "東８", "東９", "東１０"].map((w) => ({ value: `病棟・東・${w}`, label: `病棟・東・${w}` })),
  ...["西１", "西２", "西３", "西４", "西５"].map((w) => ({ value: `病棟・西・${w}`, label: `病棟・西・${w}` })),
  { value: "外来", label: "外来" },
  { value: "手術室", label: "手術室" },
  { value: "検査室・放射線科", label: "検査室・放射線科" },
  { value: "検査室・内視鏡室", label: "検査室・内視鏡室" },
] as const;

type DeptValue = (typeof DEPT_OPTIONS)[number]["value"];

/** MBTI 2文字目・3文字目で4象限を決定（S-N, T-F） */
function getQuadrant(type: string): "ST" | "NT" | "SF" | "NF" {
  const s = type[1]; // S or N
  const t = type[2]; // T or F
  if (s === "S" && t === "T") return "ST";
  if (s === "N" && t === "T") return "NT";
  if (s === "S" && t === "F") return "SF";
  return "NF";
}

/** 対角象限は対立しやすい（ST↔NF, NT↔SF） */
function isConflictPair(q1: string, q2: string): boolean {
  return (q1 === "ST" && q2 === "NF") || (q1 === "NF" && q2 === "ST") || (q1 === "NT" && q2 === "SF") || (q1 === "SF" && q2 === "NT");
}

type Staff = { id: string; name: string; type: string; role: string; department: DeptValue; age: number };

/** 実年齢は隠し、年代のみ表示（ソート用に age は保持） */
function getAgeGroup(age: number): string {
  if (age < 20) return "20代未満";
  const dec = Math.floor(age / 10) * 10;
  return `${dec}代`;
}

/** 部署別ダミースタッフ（各部署で複数名・タイプをばらつかせて対立ペアが出るように） */
function buildStaffByDept(): Record<string, Staff[]> {
  const depts: DeptValue[] = [
    "病棟・東・東１", "病棟・東・東２", "病棟・東・東３", "病棟・東・東４", "病棟・東・東５",
    "病棟・東・東６", "病棟・東・東７", "病棟・東・東８", "病棟・東・東９", "病棟・東・東１０",
    "病棟・西・西１", "病棟・西・西２", "病棟・西・西３", "病棟・西・西４", "病棟・西・西５",
    "外来", "手術室", "検査室・放射線科", "検査室・内視鏡室",
  ];
  const base: Record<string, Staff[]> = {
    "病棟・東・東１": [
      { id: "w1", name: "山田", type: "ISTJ", role: "看護師", department: "病棟・東・東１", age: 28 },
      { id: "w2", name: "佐藤", type: "ENFJ", role: "看護師", department: "病棟・東・東１", age: 35 },
      { id: "w3", name: "鈴木", type: "INTP", role: "医師", department: "病棟・東・東１", age: 42 },
      { id: "w4", name: "高橋", type: "ESFJ", role: "看護助手", department: "病棟・東・東１", age: 24 },
      { id: "w5", name: "伊藤", type: "INTJ", role: "医師", department: "病棟・東・東１", age: 38 },
    ],
    "病棟・東・東２": [
      { id: "w6", name: "渡辺", type: "ESTP", role: "看護師", department: "病棟・東・東２", age: 31 },
      { id: "w7", name: "中村", type: "INFJ", role: "看護師", department: "病棟・東・東２", age: 45 },
      { id: "w8", name: "小林", type: "ENTJ", role: "医師", department: "病棟・東・東２", age: 52 },
    ],
    "病棟・西・西１": [
      { id: "w9", name: "加藤", type: "ISTJ", role: "看護師", department: "病棟・西・西１", age: 29 },
      { id: "w10", name: "吉田", type: "ENFP", role: "理学療法士", department: "病棟・西・西１", age: 36 },
      { id: "w11", name: "山本", type: "ESTJ", role: "看護師", department: "病棟・西・西１", age: 41 },
    ],
    "病棟・西・西２": [
      { id: "w12", name: "松本", type: "INFP", role: "看護師", department: "病棟・西・西２", age: 27 },
      { id: "w13", name: "井上", type: "ENTP", role: "医師", department: "病棟・西・西２", age: 44 },
    ],
    外来: [
      { id: "o1", name: "木村", type: "ISTJ", role: "医師", department: "外来", age: 48 },
      { id: "o2", name: "林", type: "ENFJ", role: "看護師", department: "外来", age: 33 },
      { id: "o3", name: "斎藤", type: "INTP", role: "薬剤師", department: "外来", age: 39 },
      { id: "o4", name: "清水", type: "ESFJ", role: "医療事務", department: "外来", age: 26 },
      { id: "o5", name: "山口", type: "INTJ", role: "医師", department: "外来", age: 55 },
      { id: "o6", name: "松浦", type: "ESTP", role: "看護師", department: "外来", age: 30 },
    ],
    手術室: [
      { id: "s1", name: "森", type: "ISTJ", role: "看護師", department: "手術室", age: 34 },
      { id: "s2", name: "池田", type: "ENFP", role: "麻酔科医", department: "手術室", age: 43 },
      { id: "s3", name: "橋本", type: "ENTJ", role: "外科医", department: "手術室", age: 50 },
      { id: "s4", name: "阿部", type: "ISFJ", role: "看護師", department: "手術室", age: 28 },
    ],
    "検査室・放射線科": [
      { id: "r1", name: "石井", type: "INTP", role: "放射線技師", department: "検査室・放射線科", age: 37 },
      { id: "r2", name: "前田", type: "ESFJ", role: "放射線技師", department: "検査室・放射線科", age: 32 },
      { id: "r3", name: "藤田", type: "INTJ", role: "医師", department: "検査室・放射線科", age: 46 },
    ],
    "検査室・内視鏡室": [
      { id: "e1", name: "岡田", type: "ISTJ", role: "看護師", department: "検査室・内視鏡室", age: 25 },
      { id: "e2", name: "後藤", type: "ENFJ", role: "医師", department: "検査室・内視鏡室", age: 40 },
      { id: "e3", name: "長谷川", type: "INFP", role: "看護師", department: "検査室・内視鏡室", age: 29 },
    ],
  };
  const out: Record<string, Staff[]> = {};
  for (const d of depts) {
    out[d] = base[d] ?? [{ id: `d-${d}`, name: "（担当者）", type: "ISTJ", role: "スタッフ", department: d, age: 35 }];
  }
  return out;
}
const STAFF_BY_DEPT = buildStaffByDept();

const QUADRANT_LABELS = {
  ST: "S-T（感覚・思考）",
  NT: "N-T（直感・思考）",
  SF: "S-F（感覚・感情）",
  NF: "N-F（直感・感情）",
} as const;

const TYPE_COLORS: Record<string, string> = {
  ISTJ: "bg-slate-500/90",
  ENFJ: "bg-emerald-500/90",
  INTP: "bg-blue-500/90",
  ESFJ: "bg-amber-500/90",
  INTJ: "bg-indigo-500/90",
  ESTP: "bg-orange-500/90",
  INFJ: "bg-teal-500/90",
  ENTJ: "bg-rose-500/90",
  ENFP: "bg-green-500/90",
  ESTJ: "bg-amber-600/90",
  INFP: "bg-sky-500/90",
  ENTP: "bg-violet-500/90",
  ISFJ: "bg-lime-500/90",
};

type SortOption = "age_asc" | "age_desc" | "role_asc" | "role_desc";

export default function HeatmapPage() {
  const [department, setDepartment] = useState<DeptValue>(DEPT_OPTIONS[0].value);
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("age_asc");
  const staff = STAFF_BY_DEPT[department] ?? [];

  const roleOptions = Array.from(new Set(staff.map((p) => p.role))).sort();

  const filteredStaff = roleFilter ? staff.filter((p) => p.role === roleFilter) : staff;
  const sortedStaff = [...filteredStaff].sort((a, b) => {
    if (sortBy === "age_asc") return a.age - b.age;
    if (sortBy === "age_desc") return b.age - a.age;
    if (sortBy === "role_asc") return a.role.localeCompare(b.role, "ja") || a.name.localeCompare(b.name, "ja");
    return b.role.localeCompare(a.role, "ja") || b.name.localeCompare(a.name, "ja");
  });

  const byQuadrant = {
    ST: staff.filter((p) => getQuadrant(p.type) === "ST"),
    NT: staff.filter((p) => getQuadrant(p.type) === "NT"),
    SF: staff.filter((p) => getQuadrant(p.type) === "SF"),
    NF: staff.filter((p) => getQuadrant(p.type) === "NF"),
  };

  const conflictPairs: [Staff, Staff][] = [];
  for (let i = 0; i < staff.length; i++) {
    for (let j = i + 1; j < staff.length; j++) {
      const a = staff[i];
      const b = staff[j];
      if (isConflictPair(getQuadrant(a.type), getQuadrant(b.type))) conflictPairs.push([a, b]);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
          人的資本ヒートマップ
          <ClinicalTooltip content="組織メンバーの性格特性（MBTI等）を部署ごとに可視化し、4象限での配置と対立しやすい組み合わせを把握します。">
            <span className="cursor-help text-muted-foreground">?</span>
          </ClinicalTooltip>
        </h2>
        <p className="mt-1 text-muted-foreground">
          部署を選んで、その部署のスタッフを4象限に配置し、対立しやすいペアを確認できます。
        </p>
      </div>

      {/* 部署選択 */}
      <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <label className="mb-2 block text-sm font-medium text-foreground">部署</label>
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value as DeptValue)}
          className="w-full max-w-xs rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {DEPT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* 4象限にスタッフ配置 */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <ClinicalLabel
          label="4象限でのスタッフ配置（S-N軸 × T-F軸）"
          tip="横軸：感覚(S)〜直感(N)、縦軸：思考(T)〜感情(F)。対角の象限にいるスタッフ同士は、価値観の違いから対立しやすい組み合わせになりがちです。"
        />
        <div className="mt-4 grid grid-cols-2 gap-4">
          {(["ST", "NT", "SF", "NF"] as const).map((q) => (
            <div
              key={q}
              className="min-h-[140px] rounded-lg border-2 border-border bg-muted/20 p-4"
            >
              <p className="mb-3 text-xs font-medium text-muted-foreground">
                {QUADRANT_LABELS[q]}
              </p>
              <div className="flex flex-wrap gap-2">
                {byQuadrant[q].map((p) => (
                  <div
                    key={p.id}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg border border-white/50 px-3 py-2 text-xs font-medium text-white shadow",
                      TYPE_COLORS[p.type] ?? "bg-primary"
                    )}
                    title={`${p.name}（${p.role}）${p.type}`}
                  >
                    <RoleIcon role={p.role} className="h-3.5 w-3.5" />
                    {p.name}（{p.type}）
                  </div>
                ))}
                {byQuadrant[q].length === 0 && (
                  <span className="text-xs text-muted-foreground">該当なし</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 対立しやすいスタッフの組み合わせ */}
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-6 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <h3 className="font-medium text-foreground">対立しやすいスタッフの組み合わせ</h3>
          <ClinicalTooltip content="対角象限（STとNF、NTとSF）にいる組み合わせは、コミュニケーションスタイルの違いからすれ違いや対立が起きやすいとされています。役割分担や伝え方の工夫の参考にしてください。">
            <span className="cursor-help text-muted-foreground text-sm">?</span>
          </ClinicalTooltip>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          選択中の部署内で、価値観の軸が対立しやすいペアです。
        </p>
        {conflictPairs.length === 0 ? (
          <p className="text-sm text-muted-foreground">該当する組み合わせはありません。</p>
        ) : (
          <ul className="space-y-2">
            {conflictPairs.map(([a, b], i) => (
              <li
                key={`${a.id}-${b.id}`}
                className="flex items-center gap-2 rounded-md border border-amber-500/20 bg-background px-4 py-2 text-sm"
              >
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                <span className="font-medium text-foreground">{a.name}</span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <RoleIcon role={a.role} className="h-3.5 w-3.5" />
                  {a.type}・{a.role}
                </span>
                <span className="text-muted-foreground">⇄</span>
                <span className="font-medium text-foreground">{b.name}</span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <RoleIcon role={b.role} className="h-3.5 w-3.5" />
                  {b.type}・{b.role}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* メンバー一覧 */}
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h3 className="font-medium text-foreground">メンバー一覧（{department}）</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            年代は実年齢ではなく「〇〇代」で表示しています。役割で絞り込み・並び替えができます。
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-4 rounded-md bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">役割アイコン：</span>
            <span className="flex items-center gap-1.5">
              <Stethoscope className="h-3.5 w-3.5 text-primary" /> 医師
            </span>
            <span className="flex items-center gap-1.5">
              <HeartPulse className="h-3.5 w-3.5 text-primary" /> 看護師
            </span>
            <span className="flex items-center gap-1.5">
              <Pill className="h-3.5 w-3.5 text-primary" /> 薬剤師
            </span>
            <span className="flex items-center gap-1.5">
              <Microscope className="h-3.5 w-3.5 text-primary" /> 検査技師
            </span>
            <span className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-primary" /> 事務
            </span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">役割で絞り込み</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">すべて</option>
                {roleOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">並び替え</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="age_asc">年代順（若い順）</option>
                <option value="age_desc">年代順（上の順）</option>
                <option value="role_asc">役割順（あいうえお）</option>
                <option value="role_desc">役割順（逆）</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-3 text-left font-medium text-foreground">名前</th>
                <th className="px-6 py-3 text-left font-medium text-foreground">年代</th>
                <th className="px-6 py-3 text-left font-medium text-foreground">役割</th>
                <th className="px-6 py-3 text-left font-medium text-foreground">MBTI</th>
                <th className="px-6 py-3 text-left font-medium text-foreground">象限</th>
              </tr>
            </thead>
            <tbody>
              {sortedStaff.map((p) => (
                <tr key={p.id} className="border-b border-border">
                  <td className="px-6 py-3 font-medium text-foreground">{p.name}</td>
                  <td className="px-6 py-3 text-muted-foreground">{getAgeGroup(p.age)}</td>
                  <td className="px-6 py-3">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <RoleIcon role={p.role} className="h-4 w-4 text-primary" />
                    {p.role}
                  </span>
                </td>
                  <td className="px-6 py-3">
                    <span
                      className={cn(
                        "inline-block rounded px-2 py-0.5 text-xs font-medium text-white",
                        TYPE_COLORS[p.type] ?? "bg-primary"
                      )}
                    >
                      {p.type}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {QUADRANT_LABELS[getQuadrant(p.type)]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
