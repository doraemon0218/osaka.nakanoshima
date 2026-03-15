import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Field Intelligence OS
        </h1>
        <p className="text-muted-foreground">
          振り返りながら、経営意思決定支援を
        </p>
      </div>
      <Button asChild>
        <Link href="/dashboard">ダッシュボードへ</Link>
      </Button>
    </div>
  );
}
