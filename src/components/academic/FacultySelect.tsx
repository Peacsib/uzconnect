import { useFaculties } from '@/hooks/useAcademicData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface FacultySelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function FacultySelect({
  value,
  onValueChange,
  placeholder = 'Select faculty',
  disabled = false,
}: FacultySelectProps) {
  const { data: faculties, isLoading } = useFaculties();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading faculties...</span>
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {faculties?.map((faculty) => (
          <SelectItem key={faculty.id} value={faculty.id.toString()}>
            {faculty.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
