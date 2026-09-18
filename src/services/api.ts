export const api = {
  get: async <T = any>(url: string, config?: any): Promise<{ data: T }> => Promise.resolve({ data: [] as any }),
  post: async <T = any>(url: string, data?: any, config?: any): Promise<{ data: T }> => Promise.resolve({ data: {} as any }),
  put: async <T = any>(url: string, data?: any, config?: any): Promise<{ data: T }> => Promise.resolve({ data: {} as any }),
  delete: async <T = any>(url: string, config?: any): Promise<{ data: T }> => Promise.resolve({ data: {} as any }),
  patch: async <T = any>(url: string, data?: any, config?: any): Promise<{ data: T }> => Promise.resolve({ data: {} as any }),
};

export const placementSubmissionsApi = {
  create: async (data: any) => Promise.resolve({ data }),
  getAll: async () => Promise.resolve({ data: [] }),
  assign: async (id: string, data: any) => Promise.resolve({ data }),
  confirm: async (id: string) => Promise.resolve({ data: {} }),
  reject: async (id: string, data: any) => Promise.resolve({ data: {} }),
};

export default api;
