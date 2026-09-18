"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, Loader2, Download } from "lucide-react";
import { useImportStudents, useImportStatus } from "@/hooks/useApi";
import { toast } from "sonner";

interface ImportStudentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportStudentsModal({ open, onOpenChange }: ImportStudentsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const importMutation = useImportStudents();
  const { data: importStatus } = useImportStatus(jobId || '', !!jobId);

  const handleFileSelect = (selectedFile: File) => {
    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    const validExtensions = ['.csv', '.xlsx'];
    
    const fileExtension = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf('.'));
    
    if (!validTypes.includes(selectedFile.type) && !validExtensions.includes(fileExtension)) {
      toast.error('Invalid file type. Please upload a CSV or Excel file.');
      return;
    }
    
    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB
      toast.error('File size exceeds 10MB limit.');
      return;
    }
    
    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    
    try {
      const result = await importMutation.mutateAsync(file);
      setJobId(result.job_id);
      toast.success(`Import started! Processing ${result.total_rows} rows.`);
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const handleClose = () => {
    if (importStatus?.status === 'processing') {
      if (!confirm('Import is still in progress. Are you sure you want to close?')) {
        return;
      }
    }
    
    setFile(null);
    setJobId(null);
    onOpenChange(false);
  };

  const downloadTemplate = () => {
    const csvContent = 'reg_number,surname,name,programme_code,email,phone\nR2421428,Chirwa,Tatenda,HSWENG,r2421428@students.uz.ac.zw,+263771234567\nR2421429,Moyo,Rumbidzai,HDS,,+263772345678';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const progress = importStatus?.total_rows 
    ? ((importStatus.success_count + importStatus.failure_count) / importStatus.total_rows) * 100 
    : 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Students</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file to bulk import students. Required columns: reg_number, surname, name, programme_code
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Download */}
          <Alert>
            <Download className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Need a template? Download the sample CSV file.</span>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                Download Template
              </Button>
            </AlertDescription>
          </Alert>

          {/* File Upload Area */}
          {!jobId && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
              
              {file ? (
                <div className="space-y-3">
                  <FileSpreadsheet className="w-12 h-12 mx-auto text-primary" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setFile(null)}>
                    Remove File
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="font-medium">Drop your file here or click to browse</p>
                    <p className="text-sm text-muted-foreground">CSV or Excel files up to 10MB</p>
                  </div>
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    Select File
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Import Progress */}
          {jobId && importStatus && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {importStatus.status === 'queued' && 'Queued...'}
                  {importStatus.status === 'processing' && 'Processing...'}
                  {importStatus.status === 'completed' && 'Completed'}
                  {importStatus.status === 'failed' && 'Failed'}
                </span>
                <span className="text-sm text-muted-foreground">
                  {importStatus.success_count + importStatus.failure_count} / {importStatus.total_rows || 0}
                </span>
              </div>
              
              <Progress value={progress} className="h-2" />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Success</p>
                    <p className="text-2xl font-bold text-green-600">{importStatus.success_count}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium">Failed</p>
                    <p className="text-2xl font-bold text-red-600">{importStatus.failure_count}</p>
                  </div>
                </div>
              </div>

              {/* Errors */}
              {importStatus.errors && importStatus.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Errors:</h4>
                  <div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-muted rounded-lg">
                    {importStatus.errors.map((error: any, index: number) => (
                      <div key={index} className="text-sm">
                        <span className="font-mono text-red-600">Row {error.row}</span>
                        {error.reg_number && <span className="text-muted-foreground"> ({error.reg_number})</span>}
                        : {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              {importStatus?.status === 'completed' || importStatus?.status === 'failed' ? 'Close' : 'Cancel'}
            </Button>
            
            {!jobId && (
              <Button 
                onClick={handleImport} 
                disabled={!file || importMutation.isPending}
                className="bg-primary"
              >
                {importMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Starting Import...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Start Import
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
