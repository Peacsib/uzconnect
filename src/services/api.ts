export const api = {
  get: async <T = any>(url: string, config?: any): Promise<{ data: T }> => Promise.resolve({ data: [] as any }),
  post: async <T = any>(url: string, data?: any, config?: any): Promise<{ data: T }> => Promise.resolve({ data: {} as any }),
  put: async <T = any>(url: string, data?: any, config?: any): Promise<{ data: T }> => Promise.resolve({ data: {} as any }),
  delete: async <T = any>(url: string, config?: any): Promise<{ data: T }> => Promise.resolve({ data: {} as any }),
  patch: async <T = any>(url: string, data?: any, config?: any): Promise<{ data: T }> => Promise.resolve({ data: {} as any }),
};

export const placementSubmissionsApi = {
  create: async (data: any) => {
    const res = await fetch("/api/placements/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: data.company_name,
        companyAddress: data.company_address,
        companyCity: data.city || data.company_city,
        supervisorName: data.supervisor_name,
        supervisorEmail: data.supervisor_email,
        supervisorPhone: data.supervisor_phone,
        positionTitle: data.position_title,
        startDate: data.start_date,
        endDate: data.end_date,
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Failed to submit placement");
    }
    return json;
  },
  getAll: async () => {
    const res = await fetch("/api/coordinator/placements");
    return res.json();
  },
  assign: async (id: string, data: any) => {
    const res = await fetch("/api/coordinator/placements/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId: id, lecturerId: data.lecturer_id }),
    });
    return res.json();
  },
  confirm: async (id: string) => {
    const res = await fetch("/api/coordinator/placements/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId: id }),
    });
    return res.json();
  },
  reject: async (id: string, data: any) => Promise.resolve({ data: {} }),
};

export default api;
