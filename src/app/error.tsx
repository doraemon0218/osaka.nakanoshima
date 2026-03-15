"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-8">
      <div className="text-center space-y-2">
        <h1 className="text-xl font-bold text-foreground">エラーが発生しました</h1>
        <p className="text-sm text-muted-foreground max-w-md">
          {error.message}
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={() => reset()}>再試行</Button>
        <Button variant="outline" asChild>
          <a href="/">トップへ</a>
        </Button>
      </div>
    </div>
  );
}
