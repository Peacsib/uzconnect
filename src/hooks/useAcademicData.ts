"use client";

import staticFaculties from "@/data/faculties.json";
import staticDepartments from "@/data/departments.json";
import staticProgrammes from "@/data/programmes.json";

export interface AcademicProgramme {
  id: number;
  name: string;
  code: string;
  department_id: number;
}

export interface AcademicDepartment {
  id: number;
  name: string;
  faculty_id: number;
}

export interface AcademicFaculty {
  id: number;
  name: string;
}

export function useFaculties() {
  return { data: staticFaculties as AcademicFaculty[], isLoading: false };
}

export function useDepartments() {
  return { data: staticDepartments as AcademicDepartment[], isLoading: false };
}

export function useDepartmentsByFaculty(facultyId: any) {
  const fId = Number(facultyId);
  const data = fId ? staticDepartments.filter((d) => d.faculty_id === fId) : staticDepartments;
  return { data: data as AcademicDepartment[], isLoading: false };
}

export function useProgrammes() {
  return { data: staticProgrammes as AcademicProgramme[], isLoading: false };
}

export function useProgrammesByDepartment(deptId: any) {
  const dId = Number(deptId);
  const data = dId ? staticProgrammes.filter((p) => p.department_id === dId) : staticProgrammes;
  return { data: data as AcademicProgramme[], isLoading: false };
}

export function useProgrammesByFaculty(facultyId: any) {
  const fId = Number(facultyId);
  if (!fId) return { data: staticProgrammes as AcademicProgramme[], isLoading: false };
  const deptsInFac = new Set(staticDepartments.filter((d) => d.faculty_id === fId).map((d) => d.id));
  const data = staticProgrammes.filter((p) => deptsInFac.has(p.department_id));
  return { data: data as AcademicProgramme[], isLoading: false };
}
