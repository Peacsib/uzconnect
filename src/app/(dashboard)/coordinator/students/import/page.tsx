"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Download, FileText, CheckCircle, XCircle, AlertCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import api from "@/services/api";

interface ImportProgress {
  status: "queued" | "processing" | "completed" | "failed";
  total_rows: number;
  success_count: number;
  failure_count: number;
  errors: Array<{ row: number; message: string }>;
  created_at: string;
}

export default function StudentImport() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      if (!selectedFile.name.endsWith('.csv')) {
        toast.error("Please select a CSV file");
        return;
      }
      
      // Validate file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/students/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { job_id, total_rows } = response.data;
      setJobId(job_id);
      toast.success(`Import started! Processing ${total_rows} students...`);
      
      // Start polling for progress
      pollProgress(job_id);
    } catch (error: any) {
      console.error("Import error:", error);
      toast.error(error.response?.data?.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const pollProgress = async (id: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await api.get(`/students/import/status/${id}`);
        const progressData: ImportProgress = response.data;
        setProgress(progressData);

        if (progressData.status === "completed" || progressData.status === "failed") {
          clearInterval(interval);
          
          if (progressData.status === "completed") {
            toast.success(
              `Import completed! ${progressData.success_count} students imported successfully.`
            );
          } else {
            toast.error("Import failed. Please check the errors below.");
          }
        }
      } catch (error) {
        console.error("Progress poll error:", error);
        clearInterval(interval);
      }
    }, 2000); // Poll every 2 seconds
  };

  const downloadTemplate = async () => {
    try {
      const response = await api.get("/students/import/template", {
        responseType: "blob",
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "student_import_template.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success("Template downloaded successfully");
    } catch (error) {
      console.error("Template download error:", error);
      toast.error("Failed to download template");
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6" />
          Bulk Import Students
        </h1>
        <p className="text-muted-foreground mt-1">
          Upload a CSV file to import multiple students at once
        </p>
      </div>

      {/* Instructions Card */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          How to Import Students
        </h2>
        <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
          <li>Download the CSV template below</li>
          <li>Fill in student details (one student per row)</li>
          <li>Save the file and upload it here</li>
          <li>Wait for the import to complete</li>
          <li>Students will receive their login credentials via email</li>
        </ol>
        
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Note:</strong> Default password will be the student's registration number.
            Students should change their password on first login.
          </p>
        </div>
      </Card>

      {/* Download Template */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Step 1: Download Template</h2>
        <Button onClick={downloadTemplate} variant="outline" className="w-full sm:w-auto">
          <Download className="w-4 h-4 mr-2" />
          Download CSV Template
        </Button>
      </Card>

      {/* Upload File */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Step 2: Upload Filled CSV</h2>
        <div className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="w-12 h-12 text-muted-foreground" />
              <p className="text-sm font-medium">
                {file ? file.name : "Click to select CSV file"}
              </p>
              <p className="text-xs text-muted-foreground">
                Maximum file size: 10MB
              </p>
            </label>
          </div>

          {file && (
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full"
            >
              {uploading ? "Uploading..." : "Upload and Import"}
            </Button>
          )}
        </div>
      </Card>

      {/* Progress */}
      {progress && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Import Progress</h2>
          
          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center gap-2">
              {progress.status === "completed" && (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
              {progress.status === "failed" && (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              {(progress.status === "queued" || progress.status === "processing") && (
                <AlertCircle className="w-5 h-5 text-blue-600 animate-pulse" />
              )}
              <span className="font-medium capitalize">{progress.status}</span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="text-2xl font-bold">{progress.total_rows}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{progress.success_count}</div>
                <div className="text-xs text-muted-foreground">Success</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{progress.failure_count}</div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
            </div>

            {/* Errors */}
            {progress.errors && progress.errors.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-sm mb-2 text-red-600">Errors:</h3>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {progress.errors.map((error, index) => (
                    <div key={index} className="text-sm p-2 bg-red-50 dark:bg-red-950 rounded">
                      <span className="font-medium">Row {error.row}:</span> {error.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {progress.status === "completed" && (
              <div className="flex gap-2">
                <Button onClick={() => router.push("/coordinator/students")} className="flex-1">
                  View Students
                </Button>
                <Button
                  onClick={() => {
                    setFile(null);
                    setJobId(null);
                    setProgress(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Import More
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
