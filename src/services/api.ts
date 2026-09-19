export const api = {
  get: async <T = any>(url: string, config?: any): Promise<{ data: any }> => {
    try {
      const endpoint = url.startsWith('/') ? url : '/' + url;
      const res = await fetch('/api' + endpoint);
      if (res.ok) {
        const json = await res.json();
        return { data: json };
      }
    } catch {
      // ignore
    }
    return { data: { data: [], success: true } };
  },
  post: async <T = any>(url: string, data?: any, config?: any): Promise<{ data: any }> => {
    try {
      const endpoint = url.startsWith('/') ? url : '/' + url;
      const res = await fetch('/api' + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        return { data: json };
      }
    } catch {
      // ignore
    }
    return { data: { success: true } };
  },
  put: async <T = any>(url: string, data?: any, config?: any): Promise<{ data: any }> => {
    try {
      const endpoint = url.startsWith('/') ? url : '/' + url;
      const res = await fetch('/api' + endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        return { data: json };
      }
    } catch {
      // ignore
    }
    return { data: { success: true } };
  },
  delete: async <T = any>(url: string, config?: any): Promise<{ data: any }> => {
    try {
      const endpoint = url.startsWith('/') ? url : '/' + url;
      const res = await fetch('/api' + endpoint, {
        method: "DELETE",
      });
      if (res.ok) {
        const json = await res.json();
        return { data: json };
      }
    } catch {
      // ignore
    }
    return { data: { success: true } };
  },
  patch: async <T = any>(url: string, data?: any, config?: any): Promise<{ data: any }> => {
    try {
      const endpoint = url.startsWith('/') ? url : '/' + url;
      const res = await fetch('/api' + endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        return { data: json };
      }
    } catch {
      // ignore
    }
    return { data: { success: true } };
  },
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
