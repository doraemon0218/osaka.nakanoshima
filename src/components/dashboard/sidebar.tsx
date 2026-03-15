"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  MessageSquare,
  Settings,
  Activity,
  CheckCircle2,
  Circle,
  Building2,
  Briefcase,
  Heart,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { resetDemoStorage } from "@/lib/demo-reset";

const navItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard/chat-logs", label: "自分が主のチャット一覧", icon: MessageSquare },
  { href: "/dashboard/consensus", label: "承認待ちの提案一覧", icon: CheckCircle2 },
  { href: "/dashboard/reports", label: "院長いいねリスト", icon: FileText },
  { href: "/dashboard/thanks", label: "あなたのおかげで", icon: Heart },
  { href: "/dashboard/activity", label: "アクティビティ", icon: Activity },
  { href: "/dashboard/settings", label: "設定", icon: Settings },
  { href: "/dashboard/planning", label: "経営企画室", icon: Briefcase },
  { href: "/dashboard/director", label: "院長", icon: Building2 },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleResetDemo = () => {
    resetDemoStorage();
    setResetMessage("デモを初期値に戻しました");
    setTimeout(() => setResetMessage(null), 2500);
  };

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
            (item.href !== "/dashboard/director" &&
              item.href !== "/dashboard/planning" &&
              pathname.startsWith(item.href));
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
      {/* デモ用：初期値に戻す */}
      <div className="border-t border-[hsl(var(--sidebar-border))] px-4 py-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 border-[hsl(var(--sidebar-border))] bg-transparent text-[hsl(var(--sidebar-foreground))]/90 hover:bg-[hsl(var(--sidebar-accent))]/80"
          onClick={handleResetDemo}
        >
          <RotateCcw className="h-4 w-4 shrink-0" />
          初期値に戻す
        </Button>
        {resetMessage && (
          <p className="mt-2 text-center text-xs text-[hsl(var(--sidebar-foreground))]/70">
            {resetMessage}
          </p>
        )}
      </div>
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
