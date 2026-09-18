import { useDepartments, useDepartmentsByFaculty } from '@/hooks/useAcademicData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface DepartmentSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  facultyId?: number | null;
  placeholder?: string;
  disabled?: boolean;
}

export function DepartmentSelect({
  value,
  onValueChange,
  facultyId,
  placeholder = 'Select department',
  disabled = false,
}: DepartmentSelectProps) {
  // If facultyId is provided, filter departments by faculty
  const { data: departments, isLoading } = facultyId
    ? useDepartmentsByFaculty(facultyId)
    : useDepartments();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading departments...</span>
      </div>
    );
  }

  if (facultyId && (!departments || departments.length === 0)) {
    return (
      <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted">
        <span className="text-sm text-muted-foreground">
          No departments found for selected faculty
        </span>
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {departments?.map((department) => (
          <SelectItem key={department.id} value={department.id.toString()}>
            {department.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
