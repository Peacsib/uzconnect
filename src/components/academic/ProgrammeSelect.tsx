import { useProgrammes, useProgrammesByDepartment } from '@/hooks/useAcademicData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface ProgrammeSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  departmentId?: number | null;
  placeholder?: string;
  disabled?: boolean;
  showCode?: boolean;
}

export function ProgrammeSelect({
  value,
  onValueChange,
  departmentId,
  placeholder = 'Select programme',
  disabled = false,
  showCode = true,
}: ProgrammeSelectProps) {
  // If departmentId is provided, filter programmes by department
  const { data: programmes, isLoading } = departmentId
    ? useProgrammesByDepartment(departmentId)
    : useProgrammes();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading programmes...</span>
      </div>
    );
  }

  if (departmentId && (!programmes || programmes.length === 0)) {
    return (
      <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted">
        <span className="text-sm text-muted-foreground">
          No programmes found for selected department
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
        {programmes?.map((programme) => (
          <SelectItem key={programme.id} value={programme.id.toString()}>
            {showCode && (programme as any).code && `${(programme as any).code} - `}
            {programme.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
