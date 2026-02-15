"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatYearMonth } from "@/lib/utils/date";

type Props = {
  weekStart: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
};

export function WeekNavigation({ weekStart, onPrev, onNext, onToday }: Props) {
  return (
    <div className="flex items-center gap-4">
      <Button variant="outline" size="sm" onClick={onToday} className="font-normal">
        今日
      </Button>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onPrev} className="h-8 w-8 rounded-full">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onNext} className="h-8 w-8 rounded-full">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      <span className="text-xl font-normal text-foreground ml-2">
        {formatYearMonth(weekStart)}
      </span>
    </div>
  );
}
