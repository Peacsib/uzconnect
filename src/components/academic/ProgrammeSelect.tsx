"use client";

import { ProgrammeCombobox } from "./ProgrammeCombobox";

interface ProgrammeSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  departmentId?: number | null;
  placeholder?: string;
  disabled?: boolean;
  showCode?: boolean;
}

export function ProgrammeSelect({
  value,
  onValueChange,
  placeholder = "Select programme...",
  disabled = false,
}: ProgrammeSelectProps) {
  return (
    <ProgrammeCombobox
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}
