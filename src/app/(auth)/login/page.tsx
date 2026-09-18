import { Suspense } from "react"
import { Metadata } from "next"
import { LoginForm } from "./login-form"

export const metadata: Metadata = {
  title: "WRL Connect - University of Zimbabwe",
  description: "Work-Related Learning Management System for University of Zimbabwe",
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0e14]" />}>
      <LoginForm />
    </Suspense>
  )
}