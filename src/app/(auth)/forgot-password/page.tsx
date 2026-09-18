import { Metadata } from "next"
export const metadata: Metadata = { title: "Forgot Password" }
export default function ForgotPasswordPage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Reset password</h2>
        <p className="text-muted-foreground mt-2">Enter your email and we will send instructions.</p>
      </div>
      <p className="text-sm text-muted-foreground bg-muted rounded-lg p-4">Password reset via email is coming soon. Please contact your coordinator.</p>
    </div>
  )
}