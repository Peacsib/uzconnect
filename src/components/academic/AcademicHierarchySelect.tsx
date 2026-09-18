"use client";

import { useState, useEffect } from 'react';
import { FacultySelect } from './FacultySelect';
import { DepartmentSelect } from './DepartmentSelect';
import { ProgrammeSelect } from './ProgrammeSelect';
import { Label } from '@/components/ui/label';

interface AcademicHierarchySelectProps {
  onProgrammeChange: (programmeId: string) => void;
  initialFacultyId?: string;
  initialDepartmentId?: string;
  initialProgrammeId?: string;
  disabled?: boolean;
  showLabels?: boolean;
}

/**
 * Cascading selector for Faculty → Department → Programme
 * Automatically filters departments by faculty and programmes by department
 */
export function AcademicHierarchySelect({
  onProgrammeChange,
  initialFacultyId,
  initialDepartmentId,
  initialProgrammeId,
  disabled = false,
  showLabels = true,
}: AcademicHierarchySelectProps) {
  const [facultyId, setFacultyId] = useState<string | undefined>(initialFacultyId);
  const [departmentId, setDepartmentId] = useState<string | undefined>(initialDepartmentId);
  const [programmeId, setProgrammeId] = useState<string | undefined>(initialProgrammeId);

  // Reset department when faculty changes
  useEffect(() => {
    if (facultyId !== initialFacultyId) {
      setDepartmentId(undefined);
      setProgrammeId(undefined);
    }
  }, [facultyId, initialFacultyId]);

  // Reset programme when department changes
  useEffect(() => {
    if (departmentId !== initialDepartmentId) {
      setProgrammeId(undefined);
    }
  }, [departmentId, initialDepartmentId]);

  // Notify parent when programme changes
  useEffect(() => {
    if (programmeId) {
      onProgrammeChange(programmeId);
    }
  }, [programmeId, onProgrammeChange]);

  return (
    <div className="space-y-4">
      {/* Faculty Selection */}
      <div className="space-y-2">
        {showLabels && <Label>Faculty</Label>}
        <FacultySelect
          value={facultyId}
          onValueChange={setFacultyId}
          disabled={disabled}
          placeholder="Select faculty"
        />
      </div>

      {/* Department Selection (enabled only after faculty is selected) */}
      <div className="space-y-2">
        {showLabels && <Label>Department</Label>}
        <DepartmentSelect
          value={departmentId}
          onValueChange={setDepartmentId}
          facultyId={facultyId ? parseInt(facultyId) : null}
          disabled={disabled || !facultyId}
          placeholder={facultyId ? 'Select department' : 'Select faculty first'}
        />
      </div>

      {/* Programme Selection (enabled only after department is selected) */}
      <div className="space-y-2">
        {showLabels && <Label>Programme</Label>}
        <ProgrammeSelect
          value={programmeId}
          onValueChange={setProgrammeId}
          departmentId={departmentId ? parseInt(departmentId) : null}
          disabled={disabled || !departmentId}
          placeholder={departmentId ? 'Select programme' : 'Select department first'}
          showCode={true}
        />
      </div>
    </div>
  );
}
