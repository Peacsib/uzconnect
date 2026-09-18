"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  BookOpen, Users, CheckCircle, Wifi, Lock, Eye, EyeOff,
  Building2, GraduationCap, UserPlus, ArrowRight, Loader2, AlertCircle
} from "lucide-react"

const features = [
  {
    icon: BookOpen,
    title: "Digital Logbook",
    desc: "Track your placement progress daily",
  },
  {
    icon: Users,
    title: "Connected",
    desc: "Students, supervisors & lecturers in one place",
  },
  {
    icon: CheckCircle,
    title: "Verified Assessments",
    desc: "Transparent grading & feedback",
  },
  {
    icon: Wifi,
    title: "Offline Ready",
    desc: "Works even without internet access",
  },
]

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<"signin" | "register">("signin")
  const [showPassword, setShowPassword] = useState(false)
  const [emailOrReg, setEmailOrReg] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!emailOrReg.trim() || !password.trim()) return

    setLoading(true)
    setError(null)

    try {
      const res = await signIn("credentials", {
        email: emailOrReg.trim(),
        password,
        redirect: false,
      })

      if (res?.error) {
        setError("Invalid credentials. Please check your email/reg number and password.")
        setLoading(false)
        return
      }

      router.push("/")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Failed to sign in.")
      setLoading(false)
    }
  }

  function fillDemo(email: string, pass: string) {
    setEmailOrReg(email)
    setPassword(pass)
    setError(null)
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0a0e14]">
      {/* Left Hero Panel */}
      <div
        className="w-full lg:w-1/2 relative overflow-hidden flex flex-col justify-between p-8 lg:p-14 text-white min-h-[500px] lg:min-h-screen"
        style={{
          backgroundImage: "url('/homepage-background.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlays matching original */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#001a33]/85 via-[#002147]/75 to-[#003d66]/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

        {/* Content */}
        <div className="relative z-10 flex items-center gap-3">
          <img
            src="/uz-crest.png"
            alt="UZ Crest"
            className="w-11 h-11 drop-shadow-lg object-contain"
          />
          <div>
            <h1 className="text-base font-semibold tracking-tight">WRL Connect</h1>
            <p className="text-xs text-white/75">University of Zimbabwe</p>
          </div>
        </div>

        {/* Tagline */}
        <div className="relative z-10 my-10 lg:my-auto space-y-4 max-w-lg">
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold leading-tight tracking-tight text-white drop-shadow-md">
            <span
              className="inline-block relative"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontStyle: "italic",
                fontSize: "1.15em",
                fontWeight: 600,
                color: "#ffa726",
                textShadow: "0 2px 20px rgba(255, 140, 0, 0.4), 0 0 30px rgba(255, 140, 0, 0.2)",
              }}
            >
              Your
              <svg className="absolute -bottom-1 left-0 w-full h-2" viewBox="0 0 100 8" preserveAspectRatio="none">
                <path d="M0,7 Q25,0 50,5 T100,4" stroke="#ff8c00" strokeWidth="1.5" fill="none" opacity="0.6" />
              </svg>
            </span>{" "}
            Work-Related
            <br />
            Learning Journey,
            <br />
            <span className="text-[#ff8c00]">Simplified.</span>
          </h2>
          <p className="text-sm sm:text-base text-white/90 max-w-md leading-relaxed font-normal">
            Manage placements, submit logbooks, and stay connected with your
            supervisors and lecturers — all in one platform.
          </p>
        </div>

        {/* Bottom Features Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 pt-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all cursor-default"
            >
              <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/20">
                <f.icon className="w-4 h-4 text-white/90" />
              </div>
              <div>
                <h3 className="font-semibold text-xs mb-0.5 text-white/95">{f.title}</h3>
                <p className="text-[11px] text-white/60 leading-snug">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Auth Panel */}
      <div className="flex-1 lg:w-1/2 flex flex-col items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-[#0a0e14] via-[#0f1419] to-[#1a1f2e] relative min-h-screen lg:min-h-0">
        {/* Glow effects */}
        <div className="hidden lg:block absolute top-10 right-10 w-32 h-32 bg-[#ff8c00]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="hidden lg:block absolute bottom-10 left-10 w-40 h-40 bg-[#003366]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Floating Card */}
        <div className="w-full max-w-[430px] relative z-10 bg-white/95 dark:bg-card/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/20">
          {/* Top Gradient Bar */}
          <div className="h-1.5 bg-gradient-to-r from-[#003366] via-[#ff8c00] to-[#ffa726]" />

          {/* Card Header with Crest */}
          <div className="px-8 pt-6 pb-3 text-center border-b border-gray-100 dark:border-border">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#003366] to-[#002147] mb-2 shadow-lg">
              <img src="/uz-crest.png" alt="UZ Crest" className="w-9 h-9 object-contain" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-foreground tracking-tight mb-0.5">
              WRL Connect
            </h2>
            <p className="text-[11px] text-gray-500 font-medium">Work-Related Learning Platform</p>
          </div>

          {/* Tabs */}
          <div className="px-6 lg:px-8 pt-4">
            <div className="flex bg-gray-100 dark:bg-muted rounded-xl p-1 border border-gray-200 dark:border-border">
              <button
                type="button"
                onClick={() => setTab("signin")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                  tab === "signin"
                    ? "bg-white dark:bg-card text-gray-900 dark:text-foreground shadow-md"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                SIGN IN
              </button>
              <button
                type="button"
                onClick={() => setTab("register")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                  tab === "register"
                    ? "bg-white dark:bg-card text-gray-900 dark:text-foreground shadow-md"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                REGISTER
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="px-6 lg:px-8 py-5">
            {tab === "signin" ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-destructive/10 border border-red-200 dark:border-destructive/20 text-red-700 dark:text-destructive text-xs rounded-lg flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="text-gray-700 dark:text-gray-200 text-xs font-bold uppercase tracking-wide mb-1.5 block">
                    EMAIL
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    value={emailOrReg}
                    onChange={(e) => setEmailOrReg(e.target.value)}
                    placeholder="Enter your email or registration number"
                    className="w-full h-10 px-3.5 text-sm rounded-lg border border-gray-300 dark:border-border bg-white dark:bg-background text-gray-900 dark:text-foreground focus:outline-none focus:border-[#ff8c00] focus:ring-2 focus:ring-[#ff8c00]/20 transition"
                  />
                </div>

                <div>
                  <label className="text-gray-700 dark:text-gray-200 text-xs font-bold uppercase tracking-wide mb-1.5 block">
                    PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full h-10 px-3.5 pr-11 text-sm rounded-lg border border-gray-300 dark:border-border bg-white dark:bg-background text-gray-900 dark:text-foreground focus:outline-none focus:border-[#ff8c00] focus:ring-2 focus:ring-[#ff8c00]/20 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <Link
                    href="/forgot-password"
                    className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-gradient-to-r from-[#003366] to-[#002147] text-white hover:from-[#002147] hover:to-[#001a33] font-bold text-sm tracking-wide rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <ArrowRight size={16} />
                      <span>SIGN IN</span>
                    </>
                  )}
                </button>

                {/* Secure badge */}
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 pt-1">
                  <Lock size={12} />
                  <span className="font-medium">Secure, encrypted connection</span>
                </div>

                {/* Demo Logins Quick Fill */}
                <div className="pt-3 border-t border-gray-100 dark:border-border text-center">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block mb-2">
                    Quick Demo Credentials
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => fillDemo("coordinator@uz.ac.zw", "coord123!")}
                      className="px-2 py-1.5 rounded-md bg-gray-50 dark:bg-muted hover:bg-gray-100 text-gray-700 dark:text-gray-200 font-medium border text-left truncate"
                    >
                      👑 Coordinator
                    </button>
                    <button
                      type="button"
                      onClick={() => fillDemo("f.makudza@uz.ac.zw", "lecturer123!")}
                      className="px-2 py-1.5 rounded-md bg-gray-50 dark:bg-muted hover:bg-gray-100 text-gray-700 dark:text-gray-200 font-medium border text-left truncate"
                    >
                      🎓 Lecturer
                    </button>
                    <button
                      type="button"
                      onClick={() => fillDemo("t.moyo@econet.co.zw", "super123!")}
                      className="px-2 py-1.5 rounded-md bg-gray-50 dark:bg-muted hover:bg-gray-100 text-gray-700 dark:text-gray-200 font-medium border text-left truncate"
                    >
                      🏢 Supervisor
                    </button>
                    <button
                      type="button"
                      onClick={() => fillDemo("R2421428", "student123!")}
                      className="px-2 py-1.5 rounded-md bg-gray-50 dark:bg-muted hover:bg-gray-100 text-gray-700 dark:text-gray-200 font-medium border text-left truncate"
                    >
                      📚 Student (Reg No)
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <Link href="/register/supervisor" className="block">
                  <div className="w-full p-3.5 flex items-center gap-3 border-2 border-gray-200 dark:border-border hover:border-[#ff8c00] hover:bg-[#ff8c00]/5 transition-all rounded-xl group cursor-pointer">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#ff8c00] to-[#ffa726] flex items-center justify-center shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-gray-900 dark:text-foreground text-sm">
                        Register as Supervisor
                      </div>
                      <div className="text-xs text-gray-500">Industry placement supervisor</div>
                    </div>
                  </div>
                </Link>

                <Link href="/register/lecturer" className="block">
                  <div className="w-full p-3.5 flex items-center gap-3 border-2 border-gray-200 dark:border-border hover:border-[#003366] hover:bg-[#003366]/5 transition-all rounded-xl group cursor-pointer">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#003366] to-[#002147] flex items-center justify-center shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-gray-900 dark:text-foreground text-sm">
                        Register as Lecturer
                      </div>
                      <div className="text-xs text-gray-500">University academic staff</div>
                    </div>
                  </div>
                </Link>

                <div className="mt-4 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60">
                  <p className="text-xs text-gray-700 dark:text-blue-200 leading-relaxed">
                    <UserPlus className="w-3.5 h-3.5 inline mr-1.5 text-[#003366] dark:text-blue-400" />
                    <strong className="text-gray-900 dark:text-white font-bold">Students:</strong> Your account is
                    created by your department. Use your registration number and password sent to your university email.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-white/60 lg:text-gray-500 mt-5">
          © {new Date().getFullYear()} University of Zimbabwe · WRL Connect
        </p>
      </div>
    </div>
  )
}