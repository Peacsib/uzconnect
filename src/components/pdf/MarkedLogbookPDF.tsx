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
  faculty: string;
  department: string;
  programme: string;
  hostInstitution: string;
  supervisorName: string;
  lecturerName: string;
  entries: MarkedLogbookEntry[];
  generatedDate?: string;
}

// Cloudinary CDN URL for optimized UZ crest
const UZ_CREST = "https://res.cloudinary.com/dqbairwkx/image/upload/f_auto,q_auto,w_200/wrl-connect/static/uz-crest";
const BLUE = "#1a5276";
const GREEN = "#27ae60";
const RED = "#e74c3c";

const s = StyleSheet.create({
  page: { padding: 30, fontSize: 9, fontFamily: "Helvetica", lineHeight: 1.4 },
  bold: { fontFamily: "Helvetica-Bold" },
  blue: { color: BLUE },

  // Header
  crest: { width: 50, height: 50, alignSelf: "center", marginBottom: 4 },
  uniName: { fontSize: 12, fontFamily: "Helvetica-Bold", textAlign: "center", color: BLUE, marginBottom: 2 },
  title: { fontSize: 10, fontFamily: "Helvetica-Bold", textAlign: "center", color: BLUE, marginBottom: 10 },

  // Detail rows
  detailRow: { flexDirection: "row", marginBottom: 5 },
  detailLabel: { fontFamily: "Helvetica-Bold", color: BLUE, marginRight: 4, fontSize: 8 },
  detailValue: {
    flex: 1,
    borderBottomWidth: 0.8,
    borderBottomColor: "#000",
    borderBottomStyle: "dashed" as const,
    paddingBottom: 1,
    fontSize: 8,
  },
  detailHalf: { flexDirection: "row", width: "50%" },

  note: { fontSize: 7, marginTop: 4, marginBottom: 8, fontStyle: "italic", color: BLUE },

  // Summary stats
  summarySection: { marginBottom: 10, padding: 8, backgroundColor: "#f8f9fa", borderRadius: 4 },
  summaryTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", color: BLUE, marginBottom: 4 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  summaryLabel: { fontSize: 8, color: "#555" },
  summaryValue: { fontSize: 8, fontFamily: "Helvetica-Bold" },

  // Table
  tableBorder: { borderWidth: 1, borderColor: "#000" },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#000", backgroundColor: "#e8f4f8" },
  tableRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#000" },
  cell: { padding: 3, borderRightWidth: 0.5, borderRightColor: "#000", fontSize: 7 },
  headerCell: { padding: 3, borderRightWidth: 0.5, borderRightColor: "#000", fontSize: 7, fontFamily: "Helvetica-Bold" },
  
  // Status badges
  statusApproved: { color: GREEN, fontFamily: "Helvetica-Bold" },
  statusRejected: { color: RED, fontFamily: "Helvetica-Bold" },
  statusPending: { color: "#f39c12", fontFamily: "Helvetica-Bold" },
  
  // Comment section
  commentBox: { 
    backgroundColor: "#fff9e6", 
    padding: 4, 
    marginTop: 2, 
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: "#f39c12",
  },
  commentLabel: { fontSize: 6, fontFamily: "Helvetica-Bold", color: "#856404", marginBottom: 2 },
  commentText: { fontSize: 6, color: "#333", fontStyle: "italic" },

  // Signatures
  sigSection: { marginTop: 12 },
  sigTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", color: BLUE, marginBottom: 8 },
  sigRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 10 },
  sigLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", color: BLUE, marginRight: 4 },
  sigLine: {
    flex: 1,
    borderBottomWidth: 0.8,
    borderBottomColor: "#000",
    borderBottomStyle: "dashed" as const,
    height: 12,
    marginRight: 10,
  },
  sigDateLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", color: BLUE, marginRight: 4 },
  sigDateLine: {
    width: 80,
    borderBottomWidth: 0.8,
    borderBottomColor: "#000",
    borderBottomStyle: "dashed" as const,
    height: 12,
  },

  // Bottom section
  bottomSection: { flexDirection: "row", marginTop: 10, alignItems: "flex-start" },
  disclaimer: { flex: 1, fontSize: 6, textAlign: "justify", paddingRight: 10, fontStyle: "italic" },
  stampBox: {
    width: 80,
    height: 60,
    borderWidth: 1.5,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  stampText: { fontSize: 7, color: "#999" },

  // Footer
  footer: { 
    position: "absolute", 
    bottom: 20, 
    left: 30, 
    right: 30, 
    fontSize: 6, 
    color: "#999", 
    textAlign: "center",
    borderTopWidth: 0.5,
    borderTopColor: "#ccc",
    paddingTop: 4,
  },
});

export default function MarkedLogbookPDF({
  studentName,
  regNumber,
  faculty,
  department,
  programme,
  hostInstitution,
  supervisorName,
  lecturerName,
  entries,
  generatedDate,
}: MarkedLogbookPDFProps) {
  // Calculate summary statistics
  const totalEntries = entries.length;
  const approvedCount = entries.filter(e => e.status === 'approved').length;
  const rejectedCount = entries.filter(e => e.status === 'rejected').length;
  const pendingCount = entries.filter(e => 
    e.status === 'draft' || 
    e.status === 'submitted' || 
    e.status === 'pending_supervisor' || 
    e.status === 'pending_lecturer'
  ).length;
  const completionRate = totalEntries > 0 ? Math.round((approvedCount / totalEntries) * 100) : 0;

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'approved': return { text: 'Approved', style: s.statusApproved };
      case 'rejected': return { text: 'Rejected', style: s.statusRejected };
      case 'pending_supervisor': return { text: 'Pending Supervisor', style: s.statusPending };
      case 'pending_lecturer': return { text: 'Pending Lecturer', style: s.statusPending };
      case 'draft': return { text: 'Draft', style: s.statusPending };
      default: return { text: status, style: s.statusPending };
    }
  };

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={s.page}>
        {/* Header */}
        <Image src={UZ_CREST} style={s.crest} />
        <Text style={s.uniName}>UNIVERSITY OF ZIMBABWE</Text>
        <Text style={s.title}>
          Marked Logbook Report - Work-Related Learning
        </Text>

        {/* Student Details */}
        <View style={s.detailRow}>
          <Text style={s.detailLabel}>Faculty:</Text>
          <Text style={s.detailValue}>{faculty}</Text>
        </View>

        <View style={s.detailRow}>
          <Text style={s.detailLabel}>Department:</Text>
          <Text style={s.detailValue}>{department}</Text>
        </View>

        <View style={s.detailRow}>
          <Text style={s.detailLabel}>Programme:</Text>
          <Text style={s.detailValue}>{programme}</Text>
        </View>

        <View style={s.detailRow}>
          <View style={s.detailHalf}>
            <Text style={s.detailLabel}>Student Name:</Text>
            <Text style={s.detailValue}>{studentName}</Text>
          </View>
          <View style={[s.detailHalf, { marginLeft: 10 }]}>
            <Text style={s.detailLabel}>Reg. Number:</Text>
            <Text style={s.detailValue}>{regNumber}</Text>
          </View>
        </View>

        <View style={s.detailRow}>
          <Text style={s.detailLabel}>Host Institution:</Text>
          <Text style={s.detailValue}>{hostInstitution}</Text>
        </View>

        {/* Summary Statistics */}
        <View style={s.summarySection}>
          <Text style={s.summaryTitle}>Summary Statistics</Text>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Total Entries:</Text>
            <Text style={s.summaryValue}>{totalEntries}</Text>
          </View>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Approved:</Text>
            <Text style={[s.summaryValue, { color: GREEN }]}>{approvedCount}</Text>
          </View>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Rejected:</Text>
            <Text style={[s.summaryValue, { color: RED }]}>{rejectedCount}</Text>
          </View>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Pending:</Text>
            <Text style={[s.summaryValue, { color: "#f39c12" }]}>{pendingCount}</Text>
          </View>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Completion Rate:</Text>
            <Text style={s.summaryValue}>{completionRate}%</Text>
          </View>
        </View>

        {/* Table */}
        <View style={s.tableBorder}>
          {/* Header row */}
          <View style={s.tableHeader}>
            <View style={[s.headerCell, { width: "6%" }]}>
              <Text>Week</Text>
            </View>
            <View style={[s.headerCell, { width: "8%" }]}>
              <Text>Week{"\n"}Ending</Text>
            </View>
            <View style={[s.headerCell, { width: "22%" }]}>
              <Text>Objectives / To-do List</Text>
            </View>
            <View style={[s.headerCell, { width: "20%" }]}>
              <Text>Actual Tasks</Text>
            </View>
            <View style={[s.headerCell, { width: "18%" }]}>
              <Text>Reflection</Text>
            </View>
            <View style={[s.headerCell, { width: "10%" }]}>
              <Text>Status</Text>
            </View>
            <View style={[s.headerCell, { width: "16%", borderRightWidth: 0 }]}>
              <Text>Supervisor Comment</Text>
            </View>
          </View>

          {/* Data rows */}
          {entries.map((entry, i) => {
            const statusDisplay = getStatusDisplay(entry.status);
            return (
              <View key={i} style={s.tableRow} wrap={false}>
                <View style={[s.cell, { width: "6%", textAlign: "center" }]}>
                  <Text>{entry.week}</Text>
                </View>
                <View style={[s.cell, { width: "8%" }]}>
                  <Text>{format(parseISO(entry.weekEndingDate), "dd/MM/yy")}</Text>
                </View>
                <View style={[s.cell, { width: "22%" }]}>
                  <Text>{entry.objectives}</Text>
                </View>
                <View style={[s.cell, { width: "20%" }]}>
                  <Text>{entry.actualTasks}</Text>
                </View>
                <View style={[s.cell, { width: "18%" }]}>
                  <Text>{entry.reflection}</Text>
                </View>
                <View style={[s.cell, { width: "10%" }]}>
                  <Text style={statusDisplay.style}>{statusDisplay.text}</Text>
                </View>
                <View style={[s.cell, { width: "16%", borderRightWidth: 0 }]}>
                  {entry.supervisorComment ? (
                    <View style={s.commentBox}>
                      <Text style={s.commentLabel}>Comment:</Text>
                      <Text style={s.commentText}>{entry.supervisorComment}</Text>
                    </View>
                  ) : (
                    <Text style={{ fontSize: 6, color: "#999" }}>-</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Signatures */}
        <View style={s.sigSection}>
          <Text style={s.sigTitle}>Verification & Approval:</Text>

          {/* Student */}
          <View style={s.sigRow}>
            <Text style={s.sigLabel}>Student:</Text>
            <View style={s.sigLine} />
            <Text style={s.sigDateLabel}>Date:</Text>
            <View style={s.sigDateLine} />
          </View>

          {/* Supervisor */}
          <View style={s.sigRow}>
            <Text style={s.sigLabel}>Supervisor ({supervisorName}):</Text>
            <View style={s.sigLine} />
            <Text style={s.sigDateLabel}>Date:</Text>
            <View style={s.sigDateLine} />
          </View>

          {/* Lecturer */}
          <View style={s.sigRow}>
            <Text style={s.sigLabel}>Lecturer ({lecturerName}):</Text>
            <View style={s.sigLine} />
            <Text style={s.sigDateLabel}>Date:</Text>
            <View style={s.sigDateLine} />
          </View>
        </View>

        {/* Bottom section */}
        <View style={s.bottomSection}>
          <Text style={s.disclaimer}>
            This marked logbook report contains supervisor feedback and approval status for all submitted entries. 
            It serves as an official record of the student's work-related learning activities and assessments. 
            This document must be signed by all parties and officially stamped for validation.
          </Text>
          <View style={s.stampBox}>
            <Text style={s.stampText}>Official{"\n"}Stamp</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={s.footer}>
          Generated on {generatedDate || format(new Date(), "dd MMMM yyyy 'at' HH:mm")} | 
          University of Zimbabwe - Work-Related Learning Platform | 
          Completion Rate: {completionRate}%
        </Text>
      </Page>
    </Document>
  );
}
