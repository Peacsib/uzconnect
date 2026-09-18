"use client";

import { departments as deptList } from "@/utils/mockData";

export function useDepartments() {
  const data = deptList.map((name, i) => ({ id: i + 1, name, faculty_id: 1 }));
  return { data, isLoading: false };
}

export function useDepartmentsByFaculty(facultyId: any) {
  const data = deptList.map((name, i) => ({ id: i + 1, name, faculty_id: facultyId || 1 }));
  return { data, isLoading: false };
}

export function useFaculties() {
  const data = [
    { id: 1, name: "Faculty of Science" },
    { id: 2, name: "Faculty of Engineering" },
    { id: 3, name: "Faculty of Commerce" },
  ];
  return { data, isLoading: false };
}

export function useProgrammes() {
  const data = [
    { id: 1, name: "BSc Honours Computer Science", department_id: 1 },
    { id: 2, name: "BSc Honours Information Systems", department_id: 2 },
    { id: 3, name: "BSc Honours Software Engineering", department_id: 3 },
  ];
  return { data, isLoading: false };
}

export function useProgrammesByDepartment(deptId: any) {
  const data = [
    { id: 1, name: "BSc Honours Computer Science", department_id: deptId || 1 },
    { id: 2, name: "BSc Honours Information Systems", department_id: deptId || 2 },
    { id: 3, name: "BSc Honours Software Engineering", department_id: deptId || 3 },
  ];
  return { data, isLoading: false };
}
