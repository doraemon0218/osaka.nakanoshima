"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface ClinicalTooltipProps {
  children: React.ReactNode;
  content: string;
  side?: "top" | "right" | "bottom" | "left";
}

/** 臨床医の視点に立った解説を表示するツールチップ */
export function ClinicalTooltip({
  children,
  content,
  side = "top",
}: ClinicalTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs">
        <p className="text-xs leading-relaxed">{content}</p>
      </TooltipContent>
    </Tooltip>
  );
}

/** 解説文付きのラベル（? アイコンでツールチップ） */
export function ClinicalLabel({
  label,
  tip,
}: {
  label: string;
  tip: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {label}
      <ClinicalTooltip content={tip}>
        <button
          type="button"
          className="inline-flex text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring rounded"
          aria-label={`${label}の説明`}
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </ClinicalTooltip>
    </span>
  );
}
