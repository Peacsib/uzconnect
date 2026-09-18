"use client";

import { lecturers } from "@/utils/mockData";

export function useLecturers() {
  return { data: lecturers, isLoading: false };
}

export function useLecturer(id: string | null) {
  const item = lecturers.find((l) => l.id === id);
  return { data: item, isLoading: false };
}

export function useLecturersByDepartment(department: string | null) {
  const filtered = department ? lecturers.filter((l) => l.department === department) : lecturers;
  return { data: filtered, isLoading: false };
}

export function useSearchLecturers(query: string) {
  const q = query.toLowerCase();
  const filtered = lecturers.filter((l) => l.name.toLowerCase().includes(q) || l.department.toLowerCase().includes(q));
  return { data: filtered, isLoading: false };
}

export function useRefreshLecturers() {
  return { refetch: () => {} };
}
