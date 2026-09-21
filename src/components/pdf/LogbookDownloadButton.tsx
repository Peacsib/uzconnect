"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import MarkedLogbookPDF, { MarkedLogbookEntry } from "./MarkedLogbookPDF";

// Dynamic import of PDFDownloadLink with SSR disabled to ensure zero hydration issues
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => null,
  }
);

export interface LogbookDownloadButtonProps {
  studentName: string;
  regNumber: string;
  faculty?: string;
  department?: string;
  programme?: string;
  hostInstitution?: string;
  supervisorName?: string;
  lecturerName?: string;
  entries: Array<{
    week: number;
    weekEndingDate: string;
    objectives: string;
    actualTasks: string;
    reflection?: string;
    status: string;
    supervisorComment?: string;
    supervisorApproved?: boolean;
    lecturerApproved?: boolean;
  }>;
  buttonText?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export default function LogbookDownloadButton({
  studentName,
  regNumber,
  faculty = "Faculty of Science and Technology",
  department = "Department of Computer Science",
  programme = "BSc Computer Science Honours",
  hostInstitution = "Industrial Attachment Organization",
  supervisorName = "Workplace Supervisor",
  lecturerName = "Academic Supervisor",
  entries = [],
  buttonText = "Download Marked Logbook",
  variant = "outline",
  size = "sm",
  className = "",
}: LogbookDownloadButtonProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!entries || entries.length === 0) {
    return null;
  }

  // Pre-hydration placeholder to avoid SSR mismatch
  if (!isMounted) {
    return (
      <Button
        variant={variant}
        size={size}
        disabled
        className={`text-xs h-9 border-[#003366]/30 dark:border-blue-500/30 text-[#003366] dark:text-blue-400 font-medium ${className}`}
      >
        <FileDown className="w-3.5 h-3.5 mr-1.5" />
        {buttonText}
      </Button>
    );
  }

  const safeEntries: MarkedLogbookEntry[] = entries.map((e) => ({
    week: e.week,
    weekEndingDate: e.weekEndingDate,
    objectives: e.objectives || "",
    actualTasks: e.actualTasks || "",
    reflection: e.reflection || "",
    status: (e.status || "draft").toLowerCase(),
    supervisorComment: e.supervisorComment,
    supervisorApproved: Boolean(e.supervisorApproved),
    lecturerApproved: Boolean(e.lecturerApproved),
  }));

  const cleanStudentName = studentName || "Student";
  const cleanRegNumber = regNumber || "UZ";
  const fileName = `Marked_Logbook_${cleanStudentName.replace(/[^a-zA-Z0-9]/g, "_")}_${cleanRegNumber.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;

  const pdfDocument = (
    <MarkedLogbookPDF
      studentName={cleanStudentName}
      regNumber={cleanRegNumber}
      faculty={faculty}
      department={department}
      programme={programme}
      hostInstitution={hostInstitution}
      supervisorName={supervisorName}
      lecturerName={lecturerName}
      entries={safeEntries}
    />
  );

  return (
    <PDFDownloadLink document={pdfDocument} fileName={fileName}>
      {({ loading }) => (
        <Button
          variant={variant}
          size={size}
          disabled={loading}
          className={`text-xs h-9 border-[#003366]/30 dark:border-blue-500/30 text-[#003366] dark:text-blue-400 hover:bg-[#003366]/5 dark:hover:bg-blue-500/10 font-medium cursor-pointer shadow-2xs ${className}`}
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <FileDown className="w-3.5 h-3.5 mr-1.5" />
              {buttonText}
            </>
          )}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
