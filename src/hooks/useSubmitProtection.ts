"use client";

import { useState, useCallback } from "react";

export interface UseSubmitProtectionOptions {
  onSubmit: (idempotencyKey: string) => Promise<void>;
  cooldownMs?: number;
}

export function useSubmitProtection({ onSubmit, cooldownMs = 2000 }: UseSubmitProtectionOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const key = "key_" + Date.now();
      await onSubmit(key);
    } finally {
      setTimeout(() => setIsSubmitting(false), cooldownMs);
    }
  }, [isSubmitting, onSubmit, cooldownMs]);

  return { isSubmitting, handleSubmit, resetSubmit: () => setIsSubmitting(false) };
}
