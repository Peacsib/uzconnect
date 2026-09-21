import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { format, parseISO } from "date-fns";

export interface MarkedLogbookEntry {
  week: number;
  weekEndingDate: string;
  objectives: string;
  actualTasks: string;
  reflection: string;
  status: string;
  supervisorComment?: string;
  supervisorApproved: boolean;
  lecturerApproved: boolean;
}

export interface MarkedLogbookPDFProps {
  studentName: string;
  regNumber: string;
  faculty?: string;
  department?: string;
  programme?: string;
  hostInstitution?: string;
  supervisorName?: string;
  lecturerName?: string;
  entries: MarkedLogbookEntry[];
  generatedDate?: string;
}

// Cloudinary CDN URL for optimized UZ crest
const UZ_CREST = "https://res.cloudinary.com/dqbairwkx/image/upload/f_auto,q_auto,w_200/wrl-connect/static/uz-crest";
const NAVY = "#003366"; // Official UZ Royal Navy
const GOLD = "#ff8c00"; // Official UZ Amber Gold
const GREEN = "#27ae60";
const RED = "#e74c3c";

const s = StyleSheet.create({
  page: { padding: 28, fontSize: 8.5, fontFamily: "Helvetica", lineHeight: 1.35, color: "#1a1a1a" },
  bold: { fontFamily: "Helvetica-Bold" },
  navy: { color: NAVY },

  // Header
  crest: { width: 46, height: 46, alignSelf: "center", marginBottom: 3 },
  uniName: { fontSize: 12, fontFamily: "Helvetica-Bold", textAlign: "center", color: NAVY, marginBottom: 2, letterSpacing: 0.5 },
  title: { fontSize: 10, fontFamily: "Helvetica-Bold", textAlign: "center", color: NAVY, marginBottom: 8 },

  // Detail rows
  detailRow: { flexDirection: "row", marginBottom: 4 },
  detailLabel: { fontFamily: "Helvetica-Bold", color: NAVY, marginRight: 4, fontSize: 8, width: 95 },
  detailValue: {
    flex: 1,
    borderBottomWidth: 0.8,
    borderBottomColor: "#cbd5e1",
    paddingBottom: 1,
    fontSize: 8,
    color: "#0f172a",
  },
  detailHalf: { flexDirection: "row", width: "50%" },

  // Summary stats
  summarySection: { 
    marginVertical: 7, 
    padding: 6, 
    backgroundColor: "#f8fafc", 
    borderRadius: 3,
    borderWidth: 0.8,
    borderColor: "#e2e8f0" 
  },
  summaryTitle: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: NAVY, marginBottom: 3 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 1.5 },
  summaryLabel: { fontSize: 7.5, color: "#475569" },
  summaryValue: { fontSize: 7.5, fontFamily: "Helvetica-Bold" },

  // Table
  tableBorder: { borderWidth: 1, borderColor: NAVY, marginTop: 4 },
  tableHeader: { 
    flexDirection: "row", 
    borderBottomWidth: 1, 
    borderBottomColor: NAVY, 
    backgroundColor: "#e8eff7" 
  },
  tableRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#cbd5e1" },
  cell: { padding: 3, borderRightWidth: 0.5, borderRightColor: "#cbd5e1", fontSize: 6.8 },
  headerCell: { 
    padding: 3, 
    borderRightWidth: 0.5, 
    borderRightColor: NAVY, 
    fontSize: 7, 
    fontFamily: "Helvetica-Bold", 
    color: NAVY 
  },
  
  // Status badges
  statusApproved: { color: GREEN, fontFamily: "Helvetica-Bold" },
  statusRejected: { color: RED, fontFamily: "Helvetica-Bold" },
  statusPending: { color: GOLD, fontFamily: "Helvetica-Bold" },
  
  // Comment section
  commentBox: { 
    backgroundColor: "#fffdf5", 
    padding: 3, 
    marginTop: 1.5, 
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: "#fde68a",
  },
  commentLabel: { fontSize: 5.5, fontFamily: "Helvetica-Bold", color: "#92400e", marginBottom: 1 },
  commentText: { fontSize: 6, color: "#1e293b", fontStyle: "italic" },

  // Signatures
  sigSection: { marginTop: 10 },
  sigTitle: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: NAVY, marginBottom: 6 },
  sigRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 7 },
  sigLabel: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: NAVY, marginRight: 4, width: 140 },
  sigLine: {
    flex: 1,
    borderBottomWidth: 0.8,
    borderBottomColor: "#000",
    borderBottomStyle: "dashed" as const,
    height: 10,
    marginRight: 12,
  },
  sigDateLabel: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: NAVY, marginRight: 4 },
  sigDateLine: {
    width: 75,
    borderBottomWidth: 0.8,
    borderBottomColor: "#000",
    borderBottomStyle: "dashed" as const,
    height: 10,
  },

  // Bottom section
  bottomSection: { flexDirection: "row", marginTop: 8, alignItems: "flex-start" },
  disclaimer: { flex: 1, fontSize: 5.8, textAlign: "justify", paddingRight: 10, fontStyle: "italic", color: "#475569" },
  stampBox: {
    width: 75,
    height: 52,
    borderWidth: 1.2,
    borderColor: NAVY,
    alignItems: "center",
    justifyContent: "center",
  },
  stampText: { fontSize: 6.5, color: "#64748b", textAlign: "center", fontFamily: "Helvetica-Bold" },

  // Footer
  footer: { 
    position: "absolute", 
    bottom: 14, 
    left: 28, 
    right: 28, 
    fontSize: 6, 
    color: "#94a3b8", 
    textAlign: "center",
    borderTopWidth: 0.5,
    borderTopColor: "#e2e8f0",
    paddingTop: 3
  },
});

function formatDateSafe(dateStr?: string): string {
  if (!dateStr) return "-";
  try {
    const d = typeof dateStr === "string" && dateStr.includes("T") ? parseISO(dateStr) : new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : format(d, "dd/MM/yy");
  } catch {
    return dateStr || "-";
  }
}

export default function MarkedLogbookPDF({
  studentName,
  regNumber,
  faculty = "Faculty of Science and Technology",
  department = "Department of Computer Science",
  programme = "BSc Computer Science Honours",
  hostInstitution = "Industrial Attachment Organization",
  supervisorName = "Workplace Supervisor",
  lecturerName = "Academic Supervisor",
  entries = [],
  generatedDate,
}: MarkedLogbookPDFProps) {
  const totalEntries = entries.length;
  const approvedCount = entries.filter((e) => 
    e.supervisorApproved || 
    e.lecturerApproved || 
    (e.status || "").toLowerCase() === "approved"
  ).length;
  const rejectedCount = entries.filter((e) => (e.status || "").toLowerCase() === "rejected").length;
  const pendingCount = entries.filter((e) => {
    const st = (e.status || "").toLowerCase();
    return st === "draft" || st === "submitted" || st === "pending_supervisor" || st === "pending_lecturer";
  }).length;
  const completionRate = totalEntries > 0 ? Math.round((approvedCount / totalEntries) * 100) : 0;

  const getStatusDisplay = (status: string) => {
    const sLower = (status || "").toLowerCase();
    switch (sLower) {
      case "approved":
        return { text: "Approved", style: s.statusApproved };
      case "rejected":
        return { text: "Rejected", style: s.statusRejected };
      case "pending_supervisor":
        return { text: "Pending Sup.", style: s.statusPending };
      case "pending_lecturer":
        return { text: "Pending Lec.", style: s.statusPending };
      case "submitted":
        return { text: "Submitted", style: s.statusPending };
      case "draft":
        return { text: "Draft", style: s.statusPending };
      default:
        return { text: status || "Pending", style: s.statusPending };
    }
  };

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={s.page}>
        {/* Header */}
        <Image src={UZ_CREST} style={s.crest} />
        <Text style={s.uniName}>UNIVERSITY OF ZIMBABWE</Text>
        <Text style={s.title}>OFFICIAL INDUSTRIAL LOGBOOK REPORT - WORK-RELATED LEARNING</Text>

        {/* Student Details */}
        <View style={s.detailRow}>
          <Text style={s.detailLabel}>Faculty:</Text>
          <Text style={s.detailValue}>{faculty || "Faculty of Science and Technology"}</Text>
        </View>

        <View style={s.detailRow}>
          <Text style={s.detailLabel}>Department:</Text>
          <Text style={s.detailValue}>{department || "Department of Computer Science"}</Text>
        </View>

        <View style={s.detailRow}>
          <Text style={s.detailLabel}>Programme:</Text>
          <Text style={s.detailValue}>{programme || "BSc Computer Science Honours"}</Text>
        </View>

        <View style={s.detailRow}>
          <View style={s.detailHalf}>
            <Text style={s.detailLabel}>Student Name:</Text>
            <Text style={s.detailValue}>{studentName || "Student Intern"}</Text>
          </View>
          <View style={[s.detailHalf, { marginLeft: 10 }]}>
            <Text style={[s.detailLabel, { width: 85 }]}>Reg. Number:</Text>
            <Text style={s.detailValue}>{regNumber || "UZ"}</Text>
          </View>
        </View>

        <View style={s.detailRow}>
          <Text style={s.detailLabel}>Host Institution:</Text>
          <Text style={s.detailValue}>{hostInstitution || "Industrial Attachment Organization"}</Text>
        </View>

        {/* Summary Statistics */}
        <View style={s.summarySection}>
          <Text style={s.summaryTitle}>Logbook Performance & Review Summary</Text>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Total Weekly Entries: <Text style={s.summaryValue}>{totalEntries}</Text></Text>
            <Text style={s.summaryLabel}>Approved: <Text style={[s.summaryValue, { color: GREEN }]}>{approvedCount}</Text></Text>
            <Text style={s.summaryLabel}>Rejected: <Text style={[s.summaryValue, { color: RED }]}>{rejectedCount}</Text></Text>
            <Text style={s.summaryLabel}>Pending Review: <Text style={[s.summaryValue, { color: GOLD }]}>{pendingCount}</Text></Text>
            <Text style={s.summaryLabel}>Curricular Completion: <Text style={s.summaryValue}>{completionRate}%</Text></Text>
          </View>
        </View>

        {/* Table */}
        <View style={s.tableBorder}>
          {/* Header row */}
          <View style={s.tableHeader}>
            <View style={[s.headerCell, { width: "5%", textAlign: "center" }]}>
              <Text>Wk</Text>
            </View>
            <View style={[s.headerCell, { width: "8%", textAlign: "center" }]}>
              <Text>Week Ending</Text>
            </View>
            <View style={[s.headerCell, { width: "23%" }]}>
              <Text>Objectives / Planned Activities</Text>
            </View>
            <View style={[s.headerCell, { width: "22%" }]}>
              <Text>Actual Tasks Executed</Text>
            </View>
            <View style={[s.headerCell, { width: "19%" }]}>
              <Text>Reflective Summary & Learning</Text>
            </View>
            <View style={[s.headerCell, { width: "9%", textAlign: "center" }]}>
              <Text>Status</Text>
            </View>
            <View style={[s.headerCell, { width: "14%", borderRightWidth: 0 }]}>
              <Text>Supervisor Sign-off</Text>
            </View>
          </View>

          {/* Data rows */}
          {entries.map((entry, i) => {
            const statusDisplay = getStatusDisplay(entry.status);
            return (
              <View key={i} style={s.tableRow} wrap={false}>
                <View style={[s.cell, { width: "5%", textAlign: "center" }]}>
                  <Text style={s.bold}>{entry.week}</Text>
                </View>
                <View style={[s.cell, { width: "8%", textAlign: "center" }]}>
                  <Text>{formatDateSafe(entry.weekEndingDate)}</Text>
                </View>
                <View style={[s.cell, { width: "23%" }]}>
                  <Text>{entry.objectives || "-"}</Text>
                </View>
                <View style={[s.cell, { width: "22%" }]}>
                  <Text>{entry.actualTasks || "-"}</Text>
                </View>
                <View style={[s.cell, { width: "19%" }]}>
                  <Text>{entry.reflection || "-"}</Text>
                </View>
                <View style={[s.cell, { width: "9%", textAlign: "center" }]}>
                  <Text style={statusDisplay.style}>{statusDisplay.text}</Text>
                </View>
                <View style={[s.cell, { width: "14%", borderRightWidth: 0 }]}>
                  {entry.supervisorComment ? (
                    <View style={s.commentBox}>
                      <Text style={s.commentLabel}>Comment:</Text>
                      <Text style={s.commentText}>{entry.supervisorComment}</Text>
                    </View>
                  ) : (
                    <Text style={{ fontSize: 6, color: "#94a3b8" }}>{entry.supervisorApproved ? "Approved ✓" : "Pending"}</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Signatures */}
        <View style={s.sigSection}>
          <Text style={s.sigTitle}>Verification, Assessment & Official Signatures:</Text>

          {/* Student */}
          <View style={s.sigRow}>
            <Text style={s.sigLabel}>Student ({studentName || "Student Intern"}):</Text>
            <View style={s.sigLine} />
            <Text style={s.sigDateLabel}>Date:</Text>
            <View style={s.sigDateLine} />
          </View>

          {/* Supervisor */}
          <View style={s.sigRow}>
            <Text style={s.sigLabel}>Supervisor ({supervisorName || "Workplace Supervisor"}):</Text>
            <View style={s.sigLine} />
            <Text style={s.sigDateLabel}>Date:</Text>
            <View style={s.sigDateLine} />
          </View>

          {/* Lecturer */}
          <View style={s.sigRow}>
            <Text style={s.sigLabel}>Academic Lecturer ({lecturerName || "Academic Supervisor"}):</Text>
            <View style={s.sigLine} />
            <Text style={s.sigDateLabel}>Date:</Text>
            <View style={s.sigDateLine} />
          </View>
        </View>

        {/* Bottom section */}
        <View style={s.bottomSection}>
          <Text style={s.disclaimer}>
            This marked logbook report constitutes the authentic academic record of work-related learning tasks, reflections, 
            and workplace supervisor sign-offs under the University of Zimbabwe Industrial Attachment regulations. 
            All entries must be validated by the host organization and academic department.
          </Text>
          <View style={s.stampBox}>
            <Text style={s.stampText}>OFFICIAL STAMP</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={s.footer}>
          Generated on {generatedDate || format(new Date(), "dd MMMM yyyy 'at' HH:mm")} | University of Zimbabwe Work-Related Learning Unit | Completion: {completionRate}%
        </Text>
      </Page>
    </Document>
  );
}
