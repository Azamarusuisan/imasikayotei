"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useScheduleStore } from "@/lib/useScheduleStore";
import { WeekNavigation } from "./WeekNavigation";
import { CalendarGrid } from "./CalendarGrid";
import { AvailabilityGrid } from "./AvailabilityGrid";
import { AddEventModal } from "./AddEventModal";

export function ScheduleContainer() {
  const store = useScheduleStore();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight">スケジュール管理</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              商談・メンバーの空き状況を管理
            </p>
          </div>
          <Button onClick={() => setModalOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            商談を追加
          </Button>
        </div>

        {/* Week Navigation */}
        <div className="mb-4">
          <WeekNavigation
            weekStart={store.weekRange.start}
            weekEnd={store.weekRange.end}
            onPrev={store.goToPrevWeek}
            onNext={store.goToNextWeek}
            onToday={store.goToToday}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="calendar">共通カレンダー</TabsTrigger>
            <TabsTrigger value="availability">メンバー空き</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="border rounded-lg p-4 bg-card">
            <CalendarGrid
              currentDate={store.currentDate}
              events={store.events}
              members={store.members}
            />
          </TabsContent>

          <TabsContent value="availability" className="border rounded-lg p-4 bg-card">
            <AvailabilityGrid
              currentDate={store.currentDate}
              members={store.members}
              availability={store.availability}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal */}
      <AddEventModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        members={store.members}
        availability={store.availability}
        events={store.events}
        onSave={store.addEvent}
        defaultDate={store.currentDate}
      />
    </div>
  );
}
