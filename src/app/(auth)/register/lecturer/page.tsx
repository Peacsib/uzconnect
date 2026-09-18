import { Metadata } from "next"
import { RegisterLecturerForm } from "./register-lecturer-form"

export const metadata: Metadata = { title: "Lecturer Registration | UZConnect" }

export default function RegisterLecturerPage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Academic Staff Registration</h2>
        <p className="text-muted-foreground mt-2">Create your University of Zimbabwe lecturer account</p>
      </div>
      <RegisterLecturerForm />
    </div>
  )
}