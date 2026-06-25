"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useProperties } from "@/lib/properties";

export function ManagePropertyTypesTab() {
  const {
    activePropertyTypes,
    addPropertyType,
    removePropertyType,
    isSaving,
  } = useProperties();
  const [newType, setNewType] = useState("");

  const handleAdd = async () => {
    const success = await addPropertyType(newType);
    if (success) setNewType("");
  };

  return (
    <Card className="border-slate-200/60 dark:border-zinc-700/60 max-w-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Property types</CardTitle>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          Customize the categories used when registering church properties and
          equipment.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={newType}
            onChange={e => setNewType(e.target.value)}
            placeholder="e.g. Audio Equipment"
            className="rounded-lg"
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleAdd();
              }
            }}
          />
          <Button
            type="button"
            onClick={() => void handleAdd()}
            disabled={isSaving || !newType.trim()}
            className="rounded-lg shrink-0 bg-slate-900 hover:bg-slate-800"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>

        {activePropertyTypes.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No types yet.</p>
        ) : (
          <div className="space-y-2">
            {activePropertyTypes.map(type => (
              <div
                key={type.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200/60 px-3 py-2 dark:border-zinc-700/60"
              >
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {type.name}
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-slate-500 hover:text-rose-600"
                  disabled={isSaving}
                  onClick={() => void removePropertyType(type.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
