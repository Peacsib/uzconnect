import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { format, parseISO } from "date-fns";

export interface LogbookPDFProps {
  studentName: string;
  regNumber: string;
  faculty: string;
  department: string;
  hostInstitution: string;
  supervisorName: string;
  entries: {
    week: number;
    weekEndingDate: string;
    objectives: string;
    actualTasks: string;
    reflection: string;
  }[];
}

// Cloudinary CDN URL for optimized UZ crest
const UZ_CREST = "https://res.cloudinary.com/dqbairwkx/image/upload/f_auto,q_auto,w_200/wrl-connect/static/uz-crest";
const BLUE = "#1a5276";

const COL_WIDTHS = ["10%", "12%", "28%", "25%", "25%"] as const;

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 9, fontFamily: "Helvetica", lineHeight: 1.4 },
  bold: { fontFamily: "Helvetica-Bold" },
  blue: { color: BLUE },

  // Header
  crest: { width: 60, height: 60, alignSelf: "center", marginBottom: 4 },
  uniName: { fontSize: 13, fontFamily: "Helvetica-Bold", textAlign: "center", color: BLUE, marginBottom: 2 },
  title: { fontSize: 10, fontFamily: "Helvetica-Bold", textAlign: "center", color: BLUE, marginBottom: 12 },

  // Detail rows – full width with dashed underlines
  detailRow: { flexDirection: "row", marginBottom: 6 },
  detailLabel: { fontFamily: "Helvetica-Bold", color: BLUE, marginRight: 4, fontSize: 9 },
  detailValue: {
    flex: 1,
    borderBottomWidth: 0.8,
    borderBottomColor: "#000",
    borderBottomStyle: "dashed" as const,
    paddingBottom: 1,
    fontSize: 9,
  },
  // Shared line (student name + reg number)
  detailHalf: { flexDirection: "row", width: "50%" },

  note: { fontSize: 8, marginTop: 4, marginBottom: 8, fontStyle: "italic", color: BLUE },

  // Table
  tableBorder: { borderWidth: 1, borderColor: "#000" },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#000" },
  tableRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#000" },
  cell: { padding: 3, borderRightWidth: 0.5, borderRightColor: "#000", fontSize: 7.5 },
  headerCell: { padding: 3, borderRightWidth: 0.5, borderRightColor: "#000", fontSize: 7.5, fontFamily: "Helvetica-Bold" },

  // Signatures – inline
  sigSection: { marginTop: 16 },
  sigTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", color: BLUE, marginBottom: 10 },
  sigRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 12 },
  sigLabel: { fontSize: 9, fontFamily: "Helvetica-Bold", color: BLUE, marginRight: 4 },
  sigLine: {
    flex: 1,
    borderBottomWidth: 0.8,
    borderBottomColor: "#000",
    borderBottomStyle: "dashed" as const,
    height: 14,
    marginRight: 12,
  },
  sigDateLabel: { fontSize: 9, fontFamily: "Helvetica-Bold", color: BLUE, marginRight: 4 },
  sigDateLine: {
    width: 100,
    borderBottomWidth: 0.8,
    borderBottomColor: "#000",
    borderBottomStyle: "dashed" as const,
    height: 14,
  },

  // Bottom section – disclaimer left, stamp right
  bottomSection: { flexDirection: "row", marginTop: 14, alignItems: "flex-start" },
  disclaimer: { flex: 1, fontSize: 7, textAlign: "justify", paddingRight: 12, fontStyle: "italic" },
  stampBox: {
    width: 100,
    height: 70,
    borderWidth: 1.5,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  stampText: { fontSize: 8, color: "#999" },
});

export default function LogbookPDF({
  studentName,
  regNumber,
  faculty,
  department,
  hostInstitution,
  supervisorName,
  entries,
}: LogbookPDFProps) {
  return (
    <Document>
      <Page size="A4" orientation="portrait" style={s.page}>
        {/* Header */}
        <Image src={UZ_CREST} style={s.crest} />
        <Text style={s.uniName}>UNIVERSITY OF ZIMBABWE</Text>
        <Text style={s.title}>
          Student Record of Work Done under Work-Related Learning (LOGBOOK)
        </Text>

        {/* Faculty – full width */}
        <View style={s.detailRow}>
          <Text style={s.detailLabel}>Faculty:</Text>
          <Text style={s.detailValue}>{faculty}</Text>
        </View>

        {/* Department – full width */}
        <View style={s.detailRow}>
          <Text style={s.detailLabel}>Department:</Text>
          <Text style={s.detailValue}>{department}</Text>
        </View>

        {/* Name of Student + Reg Number – shared line */}
        <View style={s.detailRow}>
          <View style={s.detailHalf}>
            <Text style={s.detailLabel}>Name of Student:</Text>
            <Text style={s.detailValue}>{studentName}</Text>
          </View>
          <View style={[s.detailHalf, { marginLeft: 12 }]}>
            <Text style={s.detailLabel}>Reg. Number:</Text>
            <Text style={s.detailValue}>{regNumber}</Text>
          </View>
        </View>

        {/* Host Institution – full width */}
        <View style={s.detailRow}>
          <Text style={s.detailLabel}>Name of Host Institution:</Text>
          <Text style={s.detailValue}>{hostInstitution}</Text>
        </View>

        {/* Instruction */}
        <Text style={s.note}>( To be completed by the student )</Text>

        {/* Table */}
        <View style={s.tableBorder}>
          {/* Header row – no background, bold text */}
          <View style={s.tableHeader}>
            <View style={[s.headerCell, { width: COL_WIDTHS[0] }]}>
              <Text>Week</Text>
            </View>
            <View style={[s.headerCell, { width: COL_WIDTHS[1] }]}>
              <Text>Week ending{"\n"}(date)</Text>
            </View>
            <View style={[s.headerCell, { width: COL_WIDTHS[2] }]}>
              <Text>Objectives for the week/To-do list{"\n"}(As approved by the supervisor)</Text>
            </View>
            <View style={[s.headerCell, { width: COL_WIDTHS[3] }]}>
              <Text>Actual completed tasks/{"\n"}outcomes</Text>
            </View>
            <View style={[s.headerCell, { width: COL_WIDTHS[4], borderRightWidth: 0 }]}>
              <Text>Introspection and reflective{"\n"}comments on work covered,{"\n"}variance between objectives{"\n"}and outcomes</Text>
            </View>
          </View>

          {/* Data rows */}
          {entries.map((e, i) => (
            <View key={i} style={s.tableRow} wrap={false}>
              <View style={[s.cell, { width: COL_WIDTHS[0], textAlign: "center" }]}>
                <Text>Week {e.week}</Text>
              </View>
              <View style={[s.cell, { width: COL_WIDTHS[1] }]}>
                <Text>{format(parseISO(e.weekEndingDate), "dd/MM/yyyy")}</Text>
              </View>
              <View style={[s.cell, { width: COL_WIDTHS[2] }]}>
                <Text>{e.objectives}</Text>
              </View>
              <View style={[s.cell, { width: COL_WIDTHS[3] }]}>
                <Text>{e.actualTasks}</Text>
              </View>
              <View style={[s.cell, { width: COL_WIDTHS[4], borderRightWidth: 0 }]}>
                <Text>{e.reflection}</Text>
              </View>
            </View>
          ))}

          {/* Empty rows */}
          {entries.length < 8 &&
            Array.from({ length: 8 - entries.length }).map((_, i) => (
              <View key={`empty-${i}`} style={s.tableRow}>
                {COL_WIDTHS.map((w, ci) => (
                  <View key={ci} style={[s.cell, { width: w, height: 36, borderRightWidth: ci === 4 ? 0 : 0.5 }]}>
                    <Text> </Text>
                  </View>
                ))}
              </View>
            ))}
        </View>

        {/* Signatures */}
        <View style={s.sigSection}>
          <Text style={s.sigTitle}>Signatures:</Text>

          {/* Student: ____ Date: ____ */}
          <View style={s.sigRow}>
            <Text style={s.sigLabel}>Student:</Text>
            <View style={s.sigLine} />
            <Text style={s.sigDateLabel}>Date:</Text>
            <View style={s.sigDateLine} />
          </View>

          {/* Host Supervisor: ____ Date: ____ */}
          <View style={s.sigRow}>
            <Text style={s.sigLabel}>Host Supervisor:</Text>
            <View style={s.sigLine} />
            <Text style={s.sigDateLabel}>Date:</Text>
            <View style={s.sigDateLine} />
          </View>
        </View>

        {/* Bottom: disclaimer left, stamp right */}
        <View style={s.bottomSection}>
          <Text style={s.disclaimer}>
            ( NB: This document must be signed and stamped monthly, and maintained
            in both hardcopy and softcopy formats. Academic assessors require the
            hard copies to be duly signed each month by the host supervisor and
            officially stamped for validation.)
          </Text>
          <View style={s.stampBox}>
            <Text style={s.stampText}>Stamp</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
