"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Activity,
  Sparkles,
  CheckCircle2,
  Grid3X3,
  Circle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/dashboard/summarize", label: "AIサマライズ", icon: Sparkles },
  { href: "/dashboard/consensus", label: "コンセンサス・ビュー", icon: CheckCircle2 },
  { href: "/dashboard/heatmap", label: "人的資本ヒートマップ", icon: Grid3X3 },
  { href: "/dashboard/reports", label: "レポート", icon: FileText },
  { href: "/dashboard/patients", label: "患者一覧", icon: Users },
  { href: "/dashboard/activity", label: "アクティビティ", icon: Activity },
  { href: "/dashboard/settings", label: "設定", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex w-64 flex-col border-r border-[hsl(var(--sidebar-border))]",
        "bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))]"
      )}
    >
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-[hsl(var(--sidebar-border))] px-6">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-[hsl(var(--primary-foreground))]" />
          <span className="font-semibold tracking-tight">
            Field Intelligence OS
          </span>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-auto p-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))]"
                  : "text-[hsl(var(--sidebar-foreground))]/80 hover:bg-[hsl(var(--sidebar-accent))]/80 hover:text-[hsl(var(--sidebar-foreground))]"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      {/* 実行中ステータスインジケーター */}
      <div className="border-t border-[hsl(var(--sidebar-border))] px-4 py-3">
        <div className="flex items-center gap-2 rounded-lg bg-[hsl(var(--sidebar-accent))]/80 px-3 py-2">
          <Circle className="h-2.5 w-2.5 shrink-0 animate-pulse fill-green-500 text-green-500" />
          <span className="text-xs font-medium text-[hsl(var(--sidebar-foreground))]">
            実行中
          </span>
        </div>
      </div>
      <div className="border-t border-[hsl(var(--sidebar-border))] p-4">
        <p className="text-xs text-[hsl(var(--sidebar-foreground))]/60">
          デモアプリ v0.1
        </p>
      </div>
    </aside>
  );
}
