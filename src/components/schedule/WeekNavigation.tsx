"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils/date";

type Props = {
  weekStart: Date;
  weekEnd: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
};

export function WeekNavigation({ weekStart, weekEnd, onPrev, onNext, onToday }: Props) {
  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" size="sm" onClick={onPrev}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={onToday}>
        今日
      </Button>
      <Button variant="outline" size="sm" onClick={onNext}>
        <ChevronRight className="h-4 w-4" />
      </Button>
      <span className="text-sm font-medium text-muted-foreground">
        {formatDate(weekStart)} 〜 {formatDate(weekEnd)}
      </span>
    </div>
  );
}
