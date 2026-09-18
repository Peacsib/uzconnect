/**
 * Frontend validation utilities matching backend validation rules
 * Provides immediate feedback before API calls
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validate placement submission form
 * Matches backend validation in StorePlacementSubmissionRequest
 */
export function validatePlacementSubmission(data: {
  companyName: string;
  companyAddress: string;
  supervisorName: string;
  supervisorEmail: string;
  supervisorPhone: string;
  startDate: Date | string;
  endDate: Date | string;
  positionTitle: string;
}): ValidationResult {
  const errors: ValidationError[] = [];

  // Company name validation
  if (!data.companyName || data.companyName.trim().length < 2) {
    errors.push({
      field: 'companyName',
      message: 'Company name seems too short. Please enter the full company name (min 2 characters).',
    });
  }

  // Company address validation
  if (!data.companyAddress || data.companyAddress.trim().length < 10) {
    errors.push({
      field: 'companyAddress',
      message: 'Please provide a complete company address (min 10 characters).',
    });
  }

  // Supervisor name validation
  if (!data.supervisorName || data.supervisorName.trim().length < 2) {
    errors.push({
      field: 'supervisorName',
      message: 'Supervisor name is required (min 2 characters).',
    });
  }

  // Supervisor email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.supervisorEmail || !emailRegex.test(data.supervisorEmail)) {
    errors.push({
      field: 'supervisorEmail',
      message: 'Supervisor email must be a valid email address (e.g., name@company.com).',
    });
  }

  // Warn about personal emails (non-blocking)
  if (data.supervisorEmail && (data.supervisorEmail.includes('@gmail.com') || data.supervisorEmail.includes('@yahoo.com'))) {
    console.warn('[Validation] Personal email detected for supervisor:', data.supervisorEmail);
  }

  // Supervisor phone validation
  if (!data.supervisorPhone || data.supervisorPhone.trim().length < 10) {
    errors.push({
      field: 'supervisorPhone',
      message: 'Phone number seems incomplete. Please include area code (min 10 characters).',
    });
  }

  // Position title validation
  if (!data.positionTitle || data.positionTitle.trim().length < 2) {
    errors.push({
      field: 'positionTitle',
      message: 'Position title is required (min 2 characters).',
    });
  }

  // Date validation
  const startDate = typeof data.startDate === 'string' ? new Date(data.startDate) : data.startDate;
  const endDate = typeof data.endDate === 'string' ? new Date(data.endDate) : data.endDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (startDate < today) {
    errors.push({
      field: 'startDate',
      message: 'Start date cannot be in the past.',
    });
  }

  if (endDate <= startDate) {
    errors.push({
      field: 'endDate',
      message: 'End date must be after start date.',
    });
  }

  // Duration check (warn if > 365 days)
  const durationDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  if (durationDays > 365) {
    errors.push({
      field: 'endDate',
      message: 'Placement duration seems unusually long (more than 1 year). Please verify dates.',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate logbook entry form
 * Matches backend validation in StoreLogbookEntryRequest
 */
export function validateLogbookEntry(data: {
  objectives: string;
  actualTasks: string;
  reflection: string;
  weekEndingDate: Date | string;
}): ValidationResult {
  const errors: ValidationError[] = [];

  // Objectives validation (min 20 chars)
  if (!data.objectives || data.objectives.trim().length < 20) {
    errors.push({
      field: 'objectives',
      message: 'Objectives must be at least 20 characters. Please provide meaningful detail.',
    });
  }

  // Actual tasks validation (min 20 chars)
  if (!data.actualTasks || data.actualTasks.trim().length < 20) {
    errors.push({
      field: 'actualTasks',
      message: 'Actual tasks must be at least 20 characters. Please describe what you accomplished.',
    });
  }

  // Reflection validation (min 20 chars)
  if (!data.reflection || data.reflection.trim().length < 20) {
    errors.push({
      field: 'reflection',
      message: 'Reflection must be at least 20 characters. Please provide thoughtful insights.',
    });
  }

  // Week ending date validation (cannot be future)
  const weekEndDate = typeof data.weekEndingDate === 'string' ? new Date(data.weekEndingDate) : data.weekEndingDate;
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (weekEndDate > today) {
    errors.push({
      field: 'weekEndingDate',
      message: 'Week ending date cannot be in the future.',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate rejection comment
 * Matches backend validation in LogbookEntryController reject method
 */
export function validateRejectionComment(comment: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!comment || comment.trim().length === 0) {
    errors.push({
      field: 'comment',
      message: 'You must provide a reason for rejection. This helps the student improve.',
    });
  } else if (comment.trim().length < 10) {
    errors.push({
      field: 'comment',
      message: 'Rejection reason must be at least 10 characters. Please be specific.',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate file upload
 */
export function validateFileUpload(
  file: File,
  options: {
    maxSizeMB?: number;
    allowedTypes?: string[];
  } = {}
): ValidationResult {
  const errors: ValidationError[] = [];
  const { maxSizeMB = 10, allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] } = options;

  // Size validation
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > maxSizeMB) {
    errors.push({
      field: 'file',
      message: `File size (${fileSizeMB.toFixed(2)}MB) exceeds maximum allowed size of ${maxSizeMB}MB.`,
    });
  }

  // Type validation
  if (!allowedTypes.includes(file.type)) {
    errors.push({
      field: 'file',
      message: `File type "${file.type}" is not allowed. Allowed types: ${allowedTypes.join(', ')}.`,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get user-friendly error message from validation errors
 */
export function getErrorMessage(errors: ValidationError[], field: string): string | undefined {
  const error = errors.find(e => e.field === field);
  return error?.message;
}

/**
 * Check if field has error
 */
export function hasError(errors: ValidationError[], field: string): boolean {
  return errors.some(e => e.field === field);
}
