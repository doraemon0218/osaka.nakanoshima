"use client";

import { useState, useEffect, useCallback } from "react";
import {
  PersonalityDiagnosis,
  type PersonalityState,
  type Axis,
} from "@/components/settings/personality-diagnosis";
import { User, Bell, Save, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const AXES: Axis[] = ["IE", "SN", "TF", "JP"];

const NOTIFY_OPTIONS = [
  { value: "on_request", label: "承認依頼が来るたびに" },
  { value: "daily", label: "毎日16:30に" },
  { value: "daily_start", label: "毎朝始業時に" },
  { value: "weekly_monday", label: "毎週月曜日の始業時に" },
] as const;

const STORAGE_KEY = "app-settings";

const DEPARTMENTS = ["病棟", "外来", "手術室", "検査室"] as const;
const WARD_EAST = ["東１", "東２", "東３", "東４", "東５", "東６", "東７", "東８", "東９", "東１０"] as const;
const WARD_WEST = ["西１", "西２", "西３", "西４", "西５"] as const;
const EXAM_ROOMS = ["放射線科", "内視鏡室"] as const;

/** 病院スタッフ職種一覧（1クリックで選択） */
const JOB_TYPES = [
  "医師",
  "看護師",
  "准看護師",
  "薬剤師",
  "臨床検査技師",
  "放射線技師",
  "理学療法士",
  "作業療法士",
  "言語聴覚士",
  "管理栄養士",
  "栄養士",
  "医療事務",
  "事務職",
  "看護助手",
  "介護職員",
  "その他",
] as const;

type Department = (typeof DEPARTMENTS)[number];
type ExamRoom = (typeof EXAM_ROOMS)[number];
type JobTypeOption = (typeof JOB_TYPES)[number];

type StoredSettings = {
  birthDate: string;
  department: Department;
  wardDirection?: "東" | "西";
  wardNumber?: string;
  examinationRoom?: ExamRoom;
  jobType: string;
  joinYear: string;
  notifyFrequency: (typeof NOTIFY_OPTIONS)[number]["value"];
  workStartTime: string;
  personality?: PersonalityState;
};

function loadSettings(): Partial<StoredSettings> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw) as Record<string, unknown>;
    const personality = data.personality as Partial<PersonalityState> | undefined;
    const scores = personality?.scores;
    const step = personality?.step;
    const currentQ = personality?.currentQ;
    const validStep =
      step === "intro" || step === "questions" || step === "result" ? step : undefined;
    const validScores =
      scores && typeof scores === "object" && AXES.every((k) => typeof (scores as Record<string, unknown>)[k] === "number")
        ? { IE: Number((scores as Record<string, unknown>).IE) || 0, SN: Number((scores as Record<string, unknown>).SN) || 0, TF: Number((scores as Record<string, unknown>).TF) || 0, JP: Number((scores as Record<string, unknown>).JP) || 0 }
        : undefined;
    const validCurrentQ =
      typeof currentQ === "number" && currentQ >= 0 && currentQ <= 3 ? currentQ : undefined;

    const dep = data.department as string | undefined;
    const validDepartment = dep && DEPARTMENTS.includes(dep as Department) ? (dep as Department) : undefined;
    const validWardDir = data.wardDirection === "東" || data.wardDirection === "西" ? data.wardDirection : undefined;
    const validExamRoom = data.examinationRoom && EXAM_ROOMS.includes(data.examinationRoom as ExamRoom) ? (data.examinationRoom as ExamRoom) : undefined;

    return {
      birthDate: typeof data.birthDate === "string" ? data.birthDate : "",
      department: validDepartment ?? "外来",
      wardDirection: validWardDir,
      wardNumber: typeof data.wardNumber === "string" ? data.wardNumber : undefined,
      examinationRoom: validExamRoom,
      jobType: typeof data.jobType === "string" ? data.jobType : "",
      joinYear: typeof data.joinYear === "string" ? data.joinYear : "",
      notifyFrequency: ((): (typeof NOTIFY_OPTIONS)[number]["value"] => {
        const v = data.notifyFrequency;
        if (v && NOTIFY_OPTIONS.some((o) => o.value === v)) return v as (typeof NOTIFY_OPTIONS)[number]["value"];
        return "on_request";
      })(),
      workStartTime: typeof data.workStartTime === "string" ? data.workStartTime : "09:00",
      personality:
        validStep !== undefined || validScores !== undefined || validCurrentQ !== undefined
          ? {
              scores: validScores ?? { IE: 0, SN: 0, TF: 0, JP: 0 },
              step: validStep ?? "intro",
              currentQ: validCurrentQ ?? 0,
            }
          : undefined,
    };
  } catch {
    return {};
  }
}

function saveSettings(settings: StoredSettings) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

/** 性格診断の状態だけを既存設定にマージして保存（診断完了時に自動保存） */
function mergePersonalityIntoStorage(personality: PersonalityState) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const current = raw ? (JSON.parse(raw) as Partial<StoredSettings>) : {};
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...current, personality })
    );
  } catch {
    // ignore
  }
}

export default function SettingsPage() {
  const [birthDate, setBirthDate] = useState("");
  const [department, setDepartment] = useState<Department>("外来");
  const [wardDirection, setWardDirection] = useState<"東" | "西" | "">("");
  const [wardNumber, setWardNumber] = useState("");
  const [examinationRoom, setExaminationRoom] = useState<ExamRoom | "">("");
  const [deptMenuOpen, setDeptMenuOpen] = useState(false);
  const [jobType, setJobType] = useState("");
  const [joinYear, setJoinYear] = useState("");
  const [notifyFrequency, setNotifyFrequency] = useState<(typeof NOTIFY_OPTIONS)[number]["value"]>("on_request");
  const [workStartTime, setWorkStartTime] = useState("09:00");
  const [saved, setSaved] = useState(false);
  const [personality, setPersonality] = useState<PersonalityState | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const loaded = loadSettings();
    if (loaded.birthDate !== undefined) setBirthDate(loaded.birthDate);
    if (loaded.department !== undefined) setDepartment(loaded.department);
    if (loaded.wardDirection !== undefined) setWardDirection(loaded.wardDirection);
    if (loaded.wardNumber !== undefined) setWardNumber(loaded.wardNumber);
    if (loaded.examinationRoom !== undefined) setExaminationRoom(loaded.examinationRoom);
    if (loaded.jobType !== undefined) setJobType(loaded.jobType);
    if (loaded.joinYear !== undefined) setJoinYear(loaded.joinYear);
    if (loaded.notifyFrequency !== undefined) setNotifyFrequency(loaded.notifyFrequency);
    if (loaded.workStartTime !== undefined) setWorkStartTime(loaded.workStartTime);
    if (loaded.personality !== undefined) setPersonality(loaded.personality);
  }, [mounted]);

  /** 現在の部署選択を表示用ラベルに */
  const departmentDisplayLabel =
    department === "病棟" && wardDirection && wardNumber
      ? `病棟・${wardDirection}・${wardNumber}`
      : department === "検査室" && examinationRoom
        ? `検査室・${examinationRoom}`
        : department;

  const handleSelectDepartment = (d: Department, wardDir?: "東" | "西", wardNum?: string, examRoom?: ExamRoom) => {
    setDepartment(d);
    if (d === "病棟" && wardDir && wardNum) {
      setWardDirection(wardDir);
      setWardNumber(wardNum);
      setExaminationRoom("");
    } else if (d === "検査室" && examRoom) {
      setExaminationRoom(examRoom);
      setWardDirection("");
      setWardNumber("");
    } else {
      setWardDirection("");
      setWardNumber("");
      setExaminationRoom("");
    }
    setDeptMenuOpen(false);
  };

  const handlePersonalityStateChange = useCallback((state: PersonalityState) => {
    setPersonality(state);
    mergePersonalityIntoStorage(state);
  }, []);

  const handleSave = () => {
    const settings: StoredSettings = {
      birthDate,
      department,
      ...(department === "病棟" && wardDirection && wardNumber && {
        wardDirection: wardDirection as "東" | "西",
        wardNumber,
      }),
      ...(department === "検査室" && examinationRoom && { examinationRoom: examinationRoom as ExamRoom }),
      jobType,
      joinYear,
      notifyFrequency,
      workStartTime,
      ...(personality && { personality }),
    };
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  if (!mounted) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-sm text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          設定
        </h2>
        <p className="mt-1 text-muted-foreground">
          アプリの設定はここで行えます。
        </p>
      </div>

      {/* プロフィール：生年月日・部署（病棟は東西・番号）・職種・入職年 */}
      <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">プロフィール</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">生年月日</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="relative">
            <label className="mb-1 block text-sm font-medium text-foreground">部署</label>
            <button
              type="button"
              onClick={() => setDeptMenuOpen((o) => !o)}
              onBlur={() => setTimeout(() => setDeptMenuOpen(false), 150)}
              className="flex w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-left text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <span>{departmentDisplayLabel || "選択してください"}</span>
              <span className="text-muted-foreground">{deptMenuOpen ? "▲" : "▼"}</span>
            </button>
            {deptMenuOpen && (
              <div className="absolute left-0 top-full z-20 mt-1 flex min-w-[200px] rounded-lg border border-border bg-card shadow-lg">
                {/* 第1階層 */}
                <ul className="flex flex-col py-1">
                  <li className="relative group/item">
                    <span className="flex cursor-default items-center justify-between px-4 py-2 text-sm text-foreground group-hover/item:bg-primary/10">
                      病棟
                      <span className="text-muted-foreground">▶</span>
                    </span>
                    <ul className="absolute left-full top-0 hidden min-w-[120px] rounded-lg border border-border bg-card py-1 shadow-lg group-hover/item:block">
                      <li className="relative group/east">
                        <span className="flex cursor-default items-center justify-between px-4 py-2 text-sm text-foreground group-hover/east:bg-primary/10">
                          東
                          <span className="text-muted-foreground">▶</span>
                        </span>
                        <ul className="absolute left-full top-0 hidden min-w-[80px] rounded-lg border border-border bg-card py-1 shadow-lg group-hover/east:block">
                          {WARD_EAST.map((w) => (
                            <li key={w}>
                              <button
                                type="button"
                                className="w-full px-4 py-2 text-left text-sm hover:bg-primary/10"
                                onClick={() => handleSelectDepartment("病棟", "東", w)}
                              >
                                {w}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </li>
                      <li className="relative group/west">
                        <span className="flex cursor-default items-center justify-between px-4 py-2 text-sm text-foreground group-hover/west:bg-primary/10">
                          西
                          <span className="text-muted-foreground">▶</span>
                        </span>
                        <ul className="absolute left-full top-0 hidden min-w-[80px] rounded-lg border border-border bg-card py-1 shadow-lg group-hover/west:block">
                          {WARD_WEST.map((w) => (
                            <li key={w}>
                              <button
                                type="button"
                                className="w-full px-4 py-2 text-left text-sm hover:bg-primary/10"
                                onClick={() => handleSelectDepartment("病棟", "西", w)}
                              >
                                {w}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="w-full px-4 py-2 text-left text-sm hover:bg-primary/10"
                      onClick={() => handleSelectDepartment("外来")}
                    >
                      外来
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="w-full px-4 py-2 text-left text-sm hover:bg-primary/10"
                      onClick={() => handleSelectDepartment("手術室")}
                    >
                      手術室
                    </button>
                  </li>
                  <li className="relative group/exam">
                    <span className="flex cursor-default items-center justify-between px-4 py-2 text-sm text-foreground group-hover/exam:bg-primary/10">
                      検査室
                      <span className="text-muted-foreground">▶</span>
                    </span>
                    <ul className="absolute left-full top-0 hidden min-w-[120px] rounded-lg border border-border bg-card py-1 shadow-lg group-hover/exam:block">
                      {EXAM_ROOMS.map((r) => (
                        <li key={r}>
                          <button
                            type="button"
                            className="w-full px-4 py-2 text-left text-sm hover:bg-primary/10"
                            onClick={() => handleSelectDepartment("検査室", undefined, undefined, r)}
                          >
                            {r}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </li>
                </ul>
              </div>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">職種</label>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">選択してください</option>
              {JOB_TYPES.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
              {jobType && !JOB_TYPES.includes(jobType as JobTypeOption) && (
                <option value={jobType}>{jobType}</option>
              )}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">入職年</label>
            <input
              type="number"
              min={1990}
              max={2030}
              value={joinYear}
              onChange={(e) => setJoinYear(e.target.value)}
              placeholder="例: 2020"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </section>

      {/* 通知頻度 */}
      <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">通知頻度</h3>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          承認依頼などの通知をいつ受け取るか選べます。「始業時」を選んだ場合は、下の始業時刻が使われます。
        </p>
        <div className="space-y-3">
          {NOTIFY_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <input
                type="radio"
                name="notify_frequency"
                value={opt.value}
                checked={notifyFrequency === opt.value}
                onChange={() => setNotifyFrequency(opt.value)}
                className="h-4 w-4 border-border text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-foreground">{opt.label}</span>
            </label>
          ))}
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-foreground">始業時刻</label>
          <input
            type="time"
            value={workStartTime}
            onChange={(e) => setWorkStartTime(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            「毎朝始業時」「毎週月曜日の始業時」を選んだ場合に使用します。
          </p>
        </div>
      </section>

      {/* 保存ボタン・保存完了メッセージ */}
      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={handleSave} className="gap-2" size="lg">
          <Save className="h-4 w-4" />
          設定内容を保存する
        </Button>
        {saved && (
          <span className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
            <CheckCircle className="h-5 w-5 shrink-0" />
            設定を保存しました。
          </span>
        )}
      </div>

      {/* あなたの性格診断（結果は自動保存され、いつでも確認できます） */}
      <section>
        {personality?.step === "result" && (
          <p className="mb-3 text-sm text-muted-foreground">
            診断結果は保存されています。設定画面を開くたびにいつでも確認できます。
          </p>
        )}
        <PersonalityDiagnosis
          key={personality ? `loaded-${personality.step}` : "default"}
          initialState={personality ?? undefined}
          onStateChange={handlePersonalityStateChange}
        />
      </section>
    </div>
  );
}
