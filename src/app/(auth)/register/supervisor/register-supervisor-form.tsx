"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import Link from "next/link"

const schema = z.object({
  name: z.string().min(2, "Full name required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Minimum 8 characters"),
  companyName: z.string().min(2, "Company name required"),
  position: z.string().min(2, "Position required"),
  phone: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export function RegisterSupervisorForm() {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    const res = await fetch("/api/auth/register/supervisor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json()
      toast.error(err.message || "Registration failed")
      return
    }
    toast.success("Registration submitted! Await coordinator approval.")
    router.push("/login")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {[
        { name: "name", label: "Full name", placeholder: "Tendai Moyo" },
        { name: "email", label: "Work email", placeholder: "you@company.co.zw" },
        { name: "password", label: "Password", placeholder: "Min 8 characters", type: "password" },
        { name: "companyName", label: "Company name", placeholder: "Econet Wireless" },
        { name: "position", label: "Job title / Position", placeholder: "Senior Engineer" },
        { name: "phone", label: "Phone (optional)", placeholder: "+263 77 123 4567" },
      ].map((f) => (
        <div key={f.name}>
          <label className="text-sm font-medium mb-1.5 block">{f.label}</label>
          <input
            {...register(f.name as keyof FormData)}
            type={f.type || "text"}
            placeholder={f.placeholder}
            className="w-full px-4 py-2.5 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
          />
          {errors[f.name as keyof FormData] && (
            <p className="text-destructive text-xs mt-1">{errors[f.name as keyof FormData]?.message}</p>
          )}
        </div>
      ))}
      <button type="submit" disabled={isSubmitting} className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2">
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {isSubmitting ? "Submitting..." : "Register as Supervisor"}
      </button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account? <Link href="/login" className="text-primary hover:underline">Sign in</Link>
      </p>
    </form>
  )
}