"use client"

import { useState, useEffect, useCallback } from "react"
import {
  placements as initialPlacements,
  submissions as initialSubmissions,
  assessments as initialAssessments,
  logbookEntries as initialLogbook,
  messages as initialMessages,
  placementSubmissions as initialPlacementSubs,
  students as initialStudents,
} from "@/utils/mockData"
import { toast } from "sonner"

let memoryPlacements = [...initialPlacements]
let memorySubmissions = [...initialSubmissions]
let memoryAssessments = [...initialAssessments]
let memoryLogbook = [...initialLogbook]
let memoryMessages = [...initialMessages]
let memoryPlacementSubs = [...initialPlacementSubs]
let memoryStudents = [...initialStudents]

export function usePlacements() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlacements = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/coordinator/placements?type=active");
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        setData(memoryPlacements);
      }
    } catch {
      setData(memoryPlacements);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlacements();
  }, [fetchPlacements]);

  return { data, isLoading, refetch: fetchPlacements };
}

export function usePlacement(id: string) {
  const item = memoryPlacements.find((p) => p.id === id)
  return { data: item, isLoading: false }
}

export function useLogbookEntries() {
  const [data, setData] = useState(memoryLogbook)
  return { data, isLoading: false, refetch: () => setData([...memoryLogbook]) }
}

export function useCreateLogbookEntry() {
  return {
    mutate: (entry: any) => {
      const newEntry = { id: `lb_${Date.now()}`, ...entry, status: "draft", supervisorApproved: false }
      memoryLogbook = [newEntry, ...memoryLogbook]
      toast.success("Logbook entry created successfully")
    },
    mutateAsync: async (entry: any) => {
      const newEntry = { id: `lb_${Date.now()}`, ...entry, status: "draft", supervisorApproved: false }
      memoryLogbook = [newEntry, ...memoryLogbook]
      toast.success("Logbook entry created successfully")
      return newEntry
    },
    isPending: false,
  }
}

export function useUpdateLogbookEntry() {
  return {
    mutate: ({ id, data }: { id: string; data: any }) => {
      memoryLogbook = memoryLogbook.map((e) => (e.id === id ? { ...e, ...data } : e))
      toast.success("Logbook entry updated successfully")
    },
    isPending: false,
  }
}

export function useSubmitLogbookEntry() {
  return {
    mutate: (id: string) => {
      memoryLogbook = memoryLogbook.map((e) => (e.id === id ? { ...e, status: "submitted" } : e))
      toast.success("Logbook entry submitted for approval")
    },
    mutateAsync: async (id: string) => {
      memoryLogbook = memoryLogbook.map((e) => (e.id === id ? { ...e, status: "submitted" } : e))
      toast.success("Logbook entry submitted for approval")
    },
    isPending: false,
  }
}

export function useApproveLogbookEntry() {
  return {
    mutate: ({ id }: { id: string; comment?: string }) => {
      memoryLogbook = memoryLogbook.map((e) => (e.id === id ? { ...e, status: "approved", supervisorApproved: true } : e))
      toast.success("Logbook entry approved")
    },
    mutateAsync: async ({ id }: { id: string; comment?: string }) => {
      memoryLogbook = memoryLogbook.map((e) => (e.id === id ? { ...e, status: "approved", supervisorApproved: true } : e))
      toast.success("Logbook entry approved")
    },
    isPending: false,
  }
}

export function useRejectLogbookEntry() {
  return {
    mutate: ({ id }: { id: string; comment?: string }) => {
      memoryLogbook = memoryLogbook.map((e) => (e.id === id ? { ...e, status: "draft", supervisorApproved: false } : e))
      toast.success("Logbook entry rejected")
    },
    mutateAsync: async ({ id }: { id: string; comment?: string }) => {
      memoryLogbook = memoryLogbook.map((e) => (e.id === id ? { ...e, status: "draft", supervisorApproved: false } : e))
      toast.success("Logbook entry rejected")
    },
    isPending: false,
  }
}

export function useUpdateLogbookDeadline() {
  return {
    mutate: (data?: any) => toast.success("Deadline updated successfully"),
    mutateAsync: async (data?: any) => {
      toast.success("Deadline updated successfully")
    },
    isPending: false,
  }
}

export function useUpcomingDeadlines() {
  return { data: [], isLoading: false }
}

export function useSetPlacementDeadlines() {
  return {
    mutate: (data?: any) => toast.success("Deadlines saved"),
    mutateAsync: async (data?: any) => {
      toast.success("Deadlines saved")
    },
    isPending: false,
  }
}

export function useGetPlacementDeadlines(id: string) {
  return { data: [], isLoading: false }
}

export function useSubmissions() {
  const [data, setData] = useState(memorySubmissions)
  return { data, isLoading: false, refetch: () => setData([...memorySubmissions]) }
}

export function useCreateSubmission() {
  return {
    mutate: (submission: any) => {
      const newSub = { id: `sub_${Date.now()}`, ...submission, status: "submitted" }
      memorySubmissions = [newSub, ...memorySubmissions]
      toast.success("Submission uploaded successfully")
    },
    isPending: false,
  }
}

export function useAssessments() {
  const [data, setData] = useState(memoryAssessments)
  return { data, isLoading: false, refetch: () => setData([...memoryAssessments]) }
}

export function useCreateAssessment() {
  return {
    mutate: (data: any) => {
      const item = { id: `a_${Date.now()}`, ...data, date: new Date().toISOString() }
      memoryAssessments = [item, ...memoryAssessments]
      toast.success("Assessment created successfully")
    },
    mutateAsync: async (data: any) => {
      const item = { id: `a_${Date.now()}`, ...data, date: new Date().toISOString() }
      memoryAssessments = [item, ...memoryAssessments]
      toast.success("Assessment created successfully")
      return item
    },
    isPending: false,
  }
}

export function useUpdateAssessment() {
  return {
    mutate: ({ id, data }: { id: string; data: any }) => {
      memoryAssessments = memoryAssessments.map((a) => (a.id === id ? { ...a, ...data } : a))
      toast.success("Assessment updated")
    },
    isPending: false,
  }
}

export function useSubmitAssessment() {
  return {
    mutate: (assessment: any) => {
      const newA = { id: `ass_${Date.now()}`, ...assessment, submittedAt: new Date().toISOString() }
      memoryAssessments = [newA, ...memoryAssessments]
      toast.success("Assessment submitted successfully")
    },
    mutateAsync: async (assessment: any) => {
      const newA = { id: `ass_${Date.now()}`, ...assessment, submittedAt: new Date().toISOString() }
      memoryAssessments = [newA, ...memoryAssessments]
      toast.success("Assessment submitted successfully")
      return newA
    },
    isPending: false,
  }
}

export function useMessages() {
  const [data, setData] = useState(memoryMessages)
  return { data, isLoading: false, refetch: () => setData([...memoryMessages]) }
}

export const useCreateMessage = useSendMessage;

export function useSendMessage() {
  return {
    mutate: (message: any) => {
      const newMsg = { id: `m_${Date.now()}`, ...message, created_at: new Date().toISOString() }
      memoryMessages = [...memoryMessages, newMsg]
      toast.success("Message sent")
    },
    isPending: false,
  }
}

export function usePlacementSubmissions() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubs = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/coordinator/placements");
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        setData(memoryPlacementSubs);
      }
    } catch {
      setData(memoryPlacementSubs);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubs();
  }, [fetchSubs]);

  return { data, isLoading, refetch: fetchSubs };
}

export function useCreatePlacementSubmission() {
  return {
    mutate: (data: any) => {
      const newSub = { id: `ps_${Date.now()}`, ...data, status: "pending_coordinator", submittedAt: new Date().toISOString() }
      memoryPlacementSubs = [newSub, ...memoryPlacementSubs]
      toast.success("Placement submitted for approval")
    },
    isPending: false,
  }
}

export function useAssignPlacement() {
  return {
    mutate: (data: any) => {
      toast.success("Placement assigned successfully")
    },
    mutateAsync: async (data: any) => {
      toast.success("Placement assigned successfully")
    },
    isPending: false,
  }
}

export function useConfirmPlacement() {
  return {
    mutate: (id: string) => {
      memoryPlacementSubs = memoryPlacementSubs.map((p) => (p.id === id ? { ...p, status: "active" } : p))
      toast.success("Placement confirmed successfully")
    },
    isPending: false,
  }
}

export function useRejectPlacement() {
  return {
    mutate: (id: string) => {
      memoryPlacementSubs = memoryPlacementSubs.map((p) => (p.id === id ? { ...p, status: "rejected" } : p))
      toast.success("Placement rejected")
    },
    isPending: false,
  }
}

export function useStudents(filters?: any) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filters?.search) params.set("search", filters.search);
      if (filters?.faculty_id) params.set("faculty_id", filters.faculty_id);
      if (filters?.department_id) params.set("department_id", filters.department_id);
      if (filters?.programme_id) params.set("programme_id", filters.programme_id);
      if (filters?.page) params.set("page", filters.page.toString());

      const res = await fetch(`/api/coordinator/students?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        setData(memoryStudents);
      }
    } catch {
      setData(memoryStudents);
    } finally {
      setIsLoading(false);
    }
  }, [filters?.search, filters?.faculty_id, filters?.department_id, filters?.programme_id, filters?.page]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return { data, isLoading, refetch: fetchStudents };
}

export function useImportStudents() {
  return {
    mutate: () => toast.success("Import started successfully"),
    mutateAsync: async (file?: any) => {
      toast.success("Import started successfully")
      return { job_id: "job_" + Date.now(), total_rows: 50 }
    },
    isPending: false,
  }
}

export function useImportStatus(jobId?: string, enabled?: boolean) {
  return {
    data: {
      status: "completed",
      total_rows: 5,
      processed_rows: 5,
      successful_rows: 5,
      success_count: 5,
      failed_rows: 0,
      failure_count: 0,
      errors: [],
    },
    isLoading: false,
  }
}

export function useDownloadTemplate() {
  return {
    mutate: () => {
      toast.success("Template download initiated")
    },
    isPending: false,
  }
}

export function useUpdateUser() {
  return {
    mutate: () => toast.success("Profile updated successfully"),
    isPending: false,
  }
}
