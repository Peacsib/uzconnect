"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

export interface StudentProfileData {
  id: string;
  userId: string;
  name: string;
  email: string;
  regNumber: string;
  phone?: string | null;
  programme: {
    id: number;
    code: string;
    name: string;
    duration: number;
    department: string;
    faculty: string;
  };
  activePlacement?: any;
  latestSubmission?: any;
}

export function useStudentProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const email = user?.email || "";
      const url = email ? `/api/student/profile?email=${encodeURIComponent(email)}` : "/api/student/profile";
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setProfile(json.data);
      } else {
        setError(json.error || "Failed to load student profile");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, isLoading, error, refetch: fetchProfile };
}
