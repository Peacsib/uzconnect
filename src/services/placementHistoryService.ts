export const placementHistoryService = {
  getStudentHistory: async (studentId: string) => {
    return [
      {
        id: "h1",
        placementId: "pl1",
        organizationName: "Econet Wireless",
        role: "Software Developer Intern",
        startDate: "2026-01-15",
        endDate: "2026-06-30",
        completionStatus: "ongoing" as const,
        supervisorName: "Tendai Moyo",
        transitions: []
      }
    ];
  }
};
