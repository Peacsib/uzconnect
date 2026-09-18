"use client";

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, FileIcon, Loader2, AlertCircle } from 'lucide-react';
import { validateFile, formatFileSize, isImageFile, FILE_CONSTRAINTS } from '@/lib/fileValidation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  accept?: string;
  maxSize?: number;
  disabled?: boolean;
  currentFile?: File | null;
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
}

export function FileUpload({
  onFileSelect,
  onFileRemove,
  accept = '.jpg,.jpeg,.png,.pdf',
  disabled = false,
  currentFile = null,
  label = 'Upload File',
  helperText = 'JPG, PNG, or PDF (max 5MB)',
  error,
  required = false,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError.message);
      return;
    }

    // Generate preview for images
    if (isImageFile(file)) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    onFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0] || null;
    handleFileChange(file);
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileRemove?.();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 transition-colors',
          isDragging && 'border-primary bg-primary/5',
          error && 'border-red-500',
          !isDragging && !error && 'border-border hover:border-primary/50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
          aria-label={label}
        />

        {currentFile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded"
                />
              ) : (
                <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                  <FileIcon className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium truncate max-w-[200px]">
                  {currentFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(currentFile.size)}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <div className="space-y-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClick}
                disabled={disabled}
              >
                Choose File
              </Button>
              <p className="text-xs text-muted-foreground">
                or drag and drop
              </p>
            </div>
          </div>
        )}
      </div>

      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}

      {error && (
        <div className="flex items-center space-x-1 text-red-500">
          <AlertCircle className="w-4 h-4" />
          <p className="text-xs">{error}</p>
        </div>
      )}
    </div>
  );
}
