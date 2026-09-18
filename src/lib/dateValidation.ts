/**
 * Date validation utilities
 * Ensures consistent date validation across the application
 */

export interface DateValidationError {
  field: string;
  message: string;
  code: 'INVALID_DATE' | 'END_BEFORE_START' | 'DATE_IN_PAST' | 'DATE_TOO_FAR';
}

/**
 * Check if a date string is valid
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validate that end date is after start date
 */
export function validateDateRange(
  startDate: string,
  endDate: string
): DateValidationError | null {
  if (!isValidDate(startDate)) {
    return {
      field: 'start_date',
      message: 'Start date is invalid',
      code: 'INVALID_DATE',
    };
  }

  if (!isValidDate(endDate)) {
    return {
      field: 'end_date',
      message: 'End date is invalid',
      code: 'INVALID_DATE',
    };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end <= start) {
    return {
      field: 'end_date',
      message: 'End date must be after start date',
      code: 'END_BEFORE_START',
    };
  }

  return null;
}

/**
 * Validate that date is not in the past
 */
export function validateNotPast(
  dateString: string,
  fieldName: string = 'date'
): DateValidationError | null {
  if (!isValidDate(dateString)) {
    return {
      field: fieldName,
      message: `${fieldName} is invalid`,
      code: 'INVALID_DATE',
    };
  }

  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date < today) {
    return {
      field: fieldName,
      message: `${fieldName} cannot be in the past`,
      code: 'DATE_IN_PAST',
    };
  }

  return null;
}

/**
 * Validate that date is within reasonable range (not too far in future)
 */
export function validateDateNotTooFar(
  dateString: string,
  maxYears: number = 5,
  fieldName: string = 'date'
): DateValidationError | null {
  if (!isValidDate(dateString)) {
    return {
      field: fieldName,
      message: `${fieldName} is invalid`,
      code: 'INVALID_DATE',
    };
  }

  const date = new Date(dateString);
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + maxYears);

  if (date > maxDate) {
    return {
      field: fieldName,
      message: `${fieldName} cannot be more than ${maxYears} years in the future`,
      code: 'DATE_TOO_FAR',
    };
  }

  return null;
}

/**
 * Calculate duration between two dates in days
 */
export function calculateDuration(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Format duration for display
 */
export function formatDuration(days: number): string {
  if (days < 7) {
    return `${days} day${days !== 1 ? 's' : ''}`;
  } else if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks !== 1 ? 's' : ''}`;
  } else if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} month${months !== 1 ? 's' : ''}`;
  } else {
    const years = Math.floor(days / 365);
    return `${years} year${years !== 1 ? 's' : ''}`;
  }
}

/**
 * Get minimum date for date picker (today)
 */
export function getMinDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Get maximum date for date picker (5 years from now)
 */
export function getMaxDate(yearsAhead: number = 5): string {
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + yearsAhead);
  return maxDate.toISOString().split('T')[0];
}

/**
 * Validate placement dates (comprehensive)
 */
export function validatePlacementDates(
  startDate: string,
  endDate: string
): DateValidationError | null {
  // Check if dates are valid
  const rangeError = validateDateRange(startDate, endDate);
  if (rangeError) return rangeError;

  // Check if start date is not in the past
  const pastError = validateNotPast(startDate, 'Start date');
  if (pastError) return pastError;

  // Check if dates are not too far in future
  const farError = validateDateNotTooFar(endDate, 5, 'End date');
  if (farError) return farError;

  // Check minimum duration (at least 1 week)
  const duration = calculateDuration(startDate, endDate);
  if (duration < 7) {
    return {
      field: 'end_date',
      message: 'Placement must be at least 1 week long',
      code: 'END_BEFORE_START',
    };
  }

  // Check maximum duration (not more than 2 years)
  if (duration > 730) {
    return {
      field: 'end_date',
      message: 'Placement cannot be longer than 2 years',
      code: 'DATE_TOO_FAR',
    };
  }

  return null;
}
