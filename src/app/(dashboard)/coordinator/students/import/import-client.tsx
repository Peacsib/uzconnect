"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { bulkImportStudents } from "@/lib/actions/students"
import { Upload, CheckCircle2, AlertCircle, FileText, ArrowRight } from "lucide-react"

export function StudentImportClient({ programmes }: { programmes: any[] }) {
  const router = useRouter()
  const [csvText, setCsvText] = useState(
    "reg_number,surname,name,programme_code,phone,email\nR220100P,Sibanda,Peace,BSCCS,+263771234567,peacesibx@gmail.com"
  )
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null)

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      if (text) setCsvText(text)
    }
    reader.readAsText(file)
  }

  async function handleImport() {
    setLoading(true)
    setResult(null)

    const lines = csvText.trim().split("\n")
    if (lines.length <= 1) {
      setResult({ imported: 0, errors: ["No data rows found in CSV."] })
      setLoading(false)
      return
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/['"]/g, ""))
    const regIdx = headers.findIndex((h) => h.includes("reg"))
    const nameIdx = headers.findIndex((h) => h === "name" || h === "firstname" || h === "first_name")
    const surnameIdx = headers.findIndex((h) => h === "surname" || h === "lastname" || h === "last_name")
    const progIdx = headers.findIndex((h) => h.includes("prog") || h.includes("code"))
    const emailIdx = headers.findIndex((h) => h.includes("email"))
    const phoneIdx = headers.findIndex((h) => h.includes("phone"))

    const parsedStudents: Array<{
      regNumber: string
      name: string
      email: string
      programmeCode: string
      phone?: string
    }> = []

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(",").map((c) => c.trim().replace(/['"]/g, ""))
      if (row.length < 3 || !row[regIdx >= 0 ? regIdx : 0]) continue

      const regNumber = row[regIdx >= 0 ? regIdx : 0]
      const firstName = nameIdx >= 0 ? row[nameIdx] : ""
      const lastName = surnameIdx >= 0 ? row[surnameIdx] : ""
      const name = firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || regNumber
      const programmeCode = progIdx >= 0 ? row[progIdx] : "BSCCS"
      const email = emailIdx >= 0 && row[emailIdx] ? row[emailIdx] : `${regNumber.toLowerCase()}@uofzmail.uz.ac.zw`
      const phone = phoneIdx >= 0 ? row[phoneIdx] : undefined

      parsedStudents.push({ regNumber, name, email, programmeCode, phone })
    }

    try {
      const res = await bulkImportStudents(parsedStudents)
      setResult(res)
    } catch (err: any) {
      setResult({ imported: 0, errors: [err.message || "Import failed."] })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card rounded-xl border p-6 shadow-sm space-y-6">
      {result && (
        <div
          className={`p-4 rounded-xl border space-y-2 text-sm ${
            result.imported > 0
              ? "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400"
              : "bg-destructive/10 border-destructive/20 text-destructive"
          }`}
        >
          <div className="flex items-center gap-2 font-bold">
            {result.imported > 0 ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>Successfully imported {result.imported} student records!</span>
          </div>
          {result.errors.length > 0 && (
            <div className="text-xs space-y-1">
              <span className="font-semibold">Errors encountered:</span>
              <ul className="list-disc list-inside">
                {result.errors.map((e, idx) => (
                  <li key={idx}>{e}</li>
                ))}
              </ul>
            </div>
          )}
          {result.imported > 0 && (
            <button
              onClick={() => router.push("/coordinator/students")}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold underline"
            >
              <span>View Updated Student Roster</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      )}

      {/* File Upload Box */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-foreground">Upload .csv File</label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="block w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
        />
      </div>

      {/* Direct CSV text box */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-foreground">Or Paste CSV Data Directly</label>
          <span className="text-[11px] text-muted-foreground">Format: reg_number,surname,name,programme_code,phone,email</span>
        </div>
        <textarea
          rows={8}
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          className="w-full p-3 font-mono text-xs rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Available programmes reference */}
      <div className="p-3 bg-muted/40 rounded-lg border text-xs space-y-1">
        <span className="font-semibold text-foreground">Supported Degree Codes:</span>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {programmes.map((p) => (
            <span key={p.id} className="px-2 py-0.5 bg-background border rounded text-[11px] font-mono">
              {p.code} - {p.name}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t flex justify-end">
        <button
          type="button"
          disabled={loading || !csvText.trim()}
          onClick={handleImport}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition shadow disabled:opacity-50"
        >
          <Upload size={16} />
          <span>{loading ? "Importing Cohort..." : "Execute Bulk Import"}</span>
        </button>
      </div>
    </div>
  )
}