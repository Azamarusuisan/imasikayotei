"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { Member } from "@/lib/types";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    member: Member | null;
    onSave: (id: string, name: string, color: string) => void;
    onDelete: (id: string) => void;
};

const PRESET_COLORS = [
    "#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981",
    "#06B6D4", "#F97316", "#EF4444", "#6366F1", "#14B8A6",
];

export function EditMemberModal({ open, onOpenChange, member, onSave, onDelete }: Props) {
    const [name, setName] = useState("");
    const [color, setColor] = useState(PRESET_COLORS[0]);
    const [confirmDelete, setConfirmDelete] = useState(false);

    useEffect(() => {
        if (member) {
            setName(member.name);
            setColor(member.color);
            setConfirmDelete(false);
        }
    }, [member]);

    if (!member) return null;

    const handleSave = () => {
        if (!name.trim()) return;
        onSave(member.id, name.trim(), color);
        onOpenChange(false);
    };

    const handleDelete = () => {
        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }
        onDelete(member.id);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>メンバーを編集</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="edit-member-name">名前 *</Label>
                        <Input
                            id="edit-member-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSave()}
                            autoFocus
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>カラー</Label>
                        <div className="flex flex-wrap gap-2">
                            {PRESET_COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    className={`w-8 h-8 rounded-full transition-all ${color === c ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : "hover:scale-105"
                                        }`}
                                    style={{ backgroundColor: c }}
                                    onClick={() => setColor(c)}
                                />
                            ))}
                        </div>
                    </div>

                    {name.trim() && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                            <span className="text-sm font-medium">{name}</span>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex !justify-between">
                    <Button
                        variant={confirmDelete ? "destructive" : "ghost"}
                        size="sm"
                        onClick={handleDelete}
                    >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {confirmDelete ? "本当に削除" : "削除"}
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            キャンセル
                        </Button>
                        <Button onClick={handleSave} disabled={!name.trim()}>
                            保存
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
