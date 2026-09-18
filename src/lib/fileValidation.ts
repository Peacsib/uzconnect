/**
 * File validation utilities
 * Ensures consistent file validation across the application
 */

export const FILE_CONSTRAINTS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.pdf'],
} as const;

export interface FileValidationError {
  field: string;
  message: string;
  code: 'FILE_TOO_LARGE' | 'INVALID_FILE_TYPE' | 'INVALID_EXTENSION';
}

/**
 * Validate file size
 */
export function validateFileSize(file: File): FileValidationError | null {
  if (file.size > FILE_CONSTRAINTS.MAX_SIZE) {
    const sizeMB = (FILE_CONSTRAINTS.MAX_SIZE / (1024 * 1024)).toFixed(0);
    return {
      field: 'file',
      message: `File is too large. Maximum size is ${sizeMB}MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`,
      code: 'FILE_TOO_LARGE',
    };
  }
  return null;
}

/**
 * Validate file MIME type
 */
export function validateFileType(file: File): FileValidationError | null {
  const allowedTypes = [
    ...FILE_CONSTRAINTS.ALLOWED_IMAGE_TYPES,
    ...FILE_CONSTRAINTS.ALLOWED_DOCUMENT_TYPES,
  ];

  if (!allowedTypes.includes(file.type as any)) {
    return {
      field: 'file',
      message: 'Invalid file type. Only JPG, PNG, and PDF files are allowed.',
      code: 'INVALID_FILE_TYPE',
    };
  }
  return null;
}

/**
 * Validate file extension
 */
export function validateFileExtension(file: File): FileValidationError | null {
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  
  if (!FILE_CONSTRAINTS.ALLOWED_EXTENSIONS.includes(extension as any)) {
    return {
      field: 'file',
      message: `Invalid file extension "${extension}". Only .jpg, .png, and .pdf files are allowed.`,
      code: 'INVALID_EXTENSION',
    };
  }
  return null;
}

/**
 * Comprehensive file validation
 */
export function validateFile(file: File): FileValidationError | null {
  // Check size first (fastest check)
  const sizeError = validateFileSize(file);
  if (sizeError) return sizeError;

  // Check MIME type
  const typeError = validateFileType(file);
  if (typeError) return typeError;

  // Check extension (defense in depth)
  const extensionError = validateFileExtension(file);
  if (extensionError) return extensionError;

  return null;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Check if file is an image
 */
export function isImageFile(file: File): boolean {
  return FILE_CONSTRAINTS.ALLOWED_IMAGE_TYPES.includes(file.type as any);
}

/**
 * Check if file is a PDF
 */
export function isPDFFile(file: File): boolean {
  return FILE_CONSTRAINTS.ALLOWED_DOCUMENT_TYPES.includes(file.type as any);
}
