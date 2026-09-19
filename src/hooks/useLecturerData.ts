"use client";

import { useState, useEffect, useCallback } from "react";

export function useLecturers() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLecturers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/lecturers");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setData(json.data);
      } else {
        setData([]);
      }
    } catch {
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLecturers();
  }, [fetchLecturers]);

  return { data, isLoading, refetch: fetchLecturers };
}

export function useLecturer(id: string | null) {
  const { data: lecturers, isLoading } = useLecturers();
  const item = lecturers.find((l) => l.id === id);
  return { data: item, isLoading };
}

export function useLecturersByDepartment(department: string | null) {
  const { data: lecturers, isLoading } = useLecturers();
  const filtered = department ? lecturers.filter((l) => l.department === department) : lecturers;
  return { data: filtered, isLoading };
}

export function useSearchLecturers(query: string) {
  const { data: lecturers, isLoading } = useLecturers();
  const q = query.toLowerCase();
  const filtered = lecturers.filter((l) => l.name.toLowerCase().includes(q) || l.department.toLowerCase().includes(q));
  return { data: filtered, isLoading };
}

export function useRefreshLecturers() {
  return { refetch: () => {} };
}
