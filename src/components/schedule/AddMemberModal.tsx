"use client";

import { useState } from "react";
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

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (name: string, color: string) => void;
};

const PRESET_COLORS = [
    "#3B82F6", // blue
    "#8B5CF6", // violet
    "#EC4899", // pink
    "#F59E0B", // amber
    "#10B981", // emerald
    "#06B6D4", // cyan
    "#F97316", // orange
    "#EF4444", // red
    "#6366F1", // indigo
    "#14B8A6", // teal
];

export function AddMemberModal({ open, onOpenChange, onSave }: Props) {
    const [name, setName] = useState("");
    const [color, setColor] = useState(PRESET_COLORS[0]);

    const handleSave = () => {
        if (!name.trim()) return;
        onSave(name.trim(), color);
        setName("");
        setColor(PRESET_COLORS[0]);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>メンバーを追加</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* 名前 */}
                    <div className="space-y-1.5">
                        <Label htmlFor="member-name">名前 *</Label>
                        <Input
                            id="member-name"
                            placeholder="例: 田中太郎"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSave()}
                            autoFocus
                        />
                    </div>

                    {/* カラー選択 */}
                    <div className="space-y-1.5">
                        <Label>カラー</Label>
                        <div className="flex flex-wrap gap-2">
                            {PRESET_COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    className={`w-8 h-8 rounded-full transition-all ${color === c
                                            ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                                            : "hover:scale-105"
                                        }`}
                                    style={{ backgroundColor: c }}
                                    onClick={() => setColor(c)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* プレビュー */}
                    {name.trim() && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                            <span className="text-sm font-medium">{name}</span>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        キャンセル
                    </Button>
                    <Button onClick={handleSave} disabled={!name.trim()}>
                        追加
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
