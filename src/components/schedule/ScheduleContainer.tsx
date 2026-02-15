"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, UserPlus } from "lucide-react";
import { useScheduleStore } from "@/lib/useScheduleStore";
import { Member } from "@/lib/types";
import { WeekNavigation } from "./WeekNavigation";
import { CalendarGrid } from "./CalendarGrid";
import { AvailabilityGrid } from "./AvailabilityGrid";
import { AddEventModal } from "./AddEventModal";
import { AddMemberModal } from "./AddMemberModal";
import { EditMemberModal } from "./EditMemberModal";

export function ScheduleContainer() {
  const store = useScheduleStore();
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

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
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setMemberModalOpen(true)}>
              <UserPlus className="h-4 w-4 mr-1" />
              メンバー追加
            </Button>
            <Button onClick={() => setEventModalOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              商談を追加
            </Button>
          </div>
        </div>

        {/* Members Strip — click to edit */}
        {store.members.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-4">
            {store.members.map((m) => (
              <button
                key={m.id}
                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
                onClick={() => setEditingMember(m)}
                title="クリックして編集"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                {m.name}
              </button>
            ))}
          </div>
        )}

        {/* Week Navigation */}
        <div className="mb-4">
          <WeekNavigation
            weekStart={store.weekRange.start}
            onPrev={store.goToPrevWeek}
            onNext={store.goToNextWeek}
            onToday={store.goToToday}
          />
        </div>

        {/* Loading */}
        {store.loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="calendar" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="calendar">共通カレンダー</TabsTrigger>
              <TabsTrigger value="availability">メンバー空き</TabsTrigger>
            </TabsList>

            <TabsContent value="calendar">
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
                onSlotChange={store.setAvailabilitySlot}
                onBulkChange={store.bulkSetAvailability}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Modals */}
      <AddEventModal
        open={eventModalOpen}
        onOpenChange={setEventModalOpen}
        members={store.members}
        availability={store.availability}
        events={store.events}
        onSave={store.addEvent}
        defaultDate={store.currentDate}
      />
      <AddMemberModal
        open={memberModalOpen}
        onOpenChange={setMemberModalOpen}
        onSave={store.addMember}
      />
      <EditMemberModal
        open={!!editingMember}
        onOpenChange={(open) => { if (!open) setEditingMember(null); }}
        member={editingMember}
        onSave={store.updateMember}
        onDelete={store.removeMember}
      />
    </div>
  );
}
