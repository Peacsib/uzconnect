"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface LazyPDFDownloadProps {
  document: any;
  fileName: string;
  buttonText?: string;
  className?: string;
}

export function LazyPDFDownload({
  document,
  fileName,
  buttonText = "Download PDF",
  className = "",
}: LazyPDFDownloadProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const blob = await pdf(document).toBlob();
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleDownload} disabled={loading} className={className}>
      <Download className="mr-2 h-4 w-4" />
      {loading ? "Preparing PDF..." : buttonText}
    </Button>
  );
}
