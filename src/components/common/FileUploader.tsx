"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, FileText, Image, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FileUploaderProps {
  accept?: string;
  maxSizeMB?: number;
  multiple?: boolean;
  onFilesSelected?: (files: File[]) => void;
  className?: string;
}

interface FilePreview {
  file: File;
  id: string;
  preview?: string;
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return Image;
  if (type.includes("pdf") || type.includes("document")) return FileText;
  return File;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUploader({ accept = ".pdf,.docx,.doc,.xlsx,.jpg,.png", maxSizeMB = 10, multiple = false, onFilesSelected, className }: FileUploaderProps) {
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback((incoming: FileList | File[]) => {
    const fileArray = Array.from(incoming);
    const maxBytes = maxSizeMB * 1024 * 1024;
    const valid: FilePreview[] = [];

    for (const file of fileArray) {
      if (file.size > maxBytes) {
        toast.error(`${file.name} exceeds ${maxSizeMB}MB limit`);
        continue;
      }
      const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
      valid.push({ file, id: `${file.name}-${Date.now()}-${Math.random()}`, preview });
    }

    if (valid.length === 0) return;

    const updated = multiple ? [...files, ...valid] : valid.slice(0, 1);
    setFiles(updated);
    onFilesSelected?.(updated.map((f) => f.file));
  }, [files, maxSizeMB, multiple, onFilesSelected]);

  const removeFile = (id: string) => {
    const updated = files.filter((f) => {
      if (f.id === id && f.preview) URL.revokeObjectURL(f.preview);
      return f.id !== id;
    });
    setFiles(updated);
    onFilesSelected?.(updated.map((f) => f.file));
  };

  return (
    <div className={className}>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); processFiles(e.dataTransfer.files); }}
        className={`relative cursor-pointer border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => e.target.files && processFiles(e.target.files)}
        />
        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">
          {dragOver ? "Drop files here" : "Drag & drop files here, or click to browse"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {accept.replace(/\./g, "").toUpperCase().replace(/,/g, ", ")} · Max {maxSizeMB}MB
        </p>
      </div>

      {/* File Previews */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-2"
          >
            {files.map((f) => {
              const Icon = getFileIcon(f.file.type);
              return (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-3 p-2 rounded-lg border bg-muted/30"
                >
                  {f.preview ? (
                    <img src={f.preview} alt={f.file.name} className="w-10 h-10 rounded object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-primary/5 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{f.file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatSize(f.file.size)}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
