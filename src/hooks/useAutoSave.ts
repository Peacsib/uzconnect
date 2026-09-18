"use client";

import { useEffect, useState, useCallback } from "react";

export interface UseAutoSaveOptions<T> {
  key: string;
  data: T;
  enabled?: boolean;
  intervalMs?: number;
  onSave?: (data: T) => void;
  onRestore?: (data: T) => void;
}

export function useAutoSave<T>({
  key,
  data,
  enabled = true,
  intervalMs = 30000,
  onSave,
  onRestore,
}: UseAutoSaveOptions<T>) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(`autosave_${key}`);
      if (saved && onRestore) {
        onRestore(JSON.parse(saved));
      }
    } catch (e) {}
  }, [key]);

  const clearDraft = useCallback(async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(`autosave_${key}`);
    }
  }, [key]);

  return { lastSaved, isSaving, clearDraft };
}
