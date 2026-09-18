import { Metadata } from "next"
import { RegisterSupervisorForm } from "./register-supervisor-form"
export const metadata: Metadata = { title: "Supervisor Registration" }
export default function RegisterSupervisorPage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Supervisor Registration</h2>
        <p className="text-muted-foreground mt-2">Create your supervisor account</p>
      </div>
      <RegisterSupervisorForm />
    </div>
  )
}