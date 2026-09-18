"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, getStatusColor } from "@/utils/formatters";
import { Upload, FileText, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileUploader } from "@/components/common/FileUploader";
import { useAuth } from "@/context/AuthContext";
import { EmptyState, emptyStates } from "@/components/common/EmptyState";
import { useSubmissions } from "@/hooks/useApi";

const MAX_ANIMATED = 10;

export default function Submissions() {
  const { user } = useAuth();
  const { data: submissions, isLoading } = useSubmissions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff8c00]" />
      </div>
    );
  }

  const mySubs = submissions?.filter((s) => s.student_id === user?.id) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Submissions</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground">
              <Upload className="w-4 h-4 mr-2" />Upload
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Upload Submission</DialogTitle></DialogHeader>
            <FileUploader
              accept=".pdf,.docx,.doc"
              maxSizeMB={10}
              onFilesSelected={(files) => toast.success(`${files.length} file(s) ready to submit`)}
            />
            <div className="flex justify-end">
              <Button className="bg-primary text-primary-foreground" onClick={() => toast.success("Submission uploaded (simulated)")}>
                Submit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {mySubs.length === 0 ? (
        <EmptyState {...emptyStates.submissions} />
      ) : (
        <div className="space-y-3">
          {mySubs.map((sub, i) => (
            <motion.div
              key={sub.id}
              initial={i < MAX_ANIMATED ? { opacity: 0, y: 10 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={i < MAX_ANIMATED ? { delay: i * 0.05 } : undefined}
            >
              <Card className="hover:border-primary/20 transition-colors">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{sub.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Due {formatDate(sub.due_date || "")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getStatusColor(sub.status)}>{sub.status}</Badge>
                    {sub.file_url && (
                      <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
