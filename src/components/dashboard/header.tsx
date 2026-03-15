"use client";

import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">
          Field Intelligence OS
        </h1>
        <p className="text-sm text-muted-foreground">
          振り返りながら、経営意思決定支援を
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          ヘルプ
        </Button>
        <Button size="sm">新規提案</Button>
      </div>
    </header>
  );
}
