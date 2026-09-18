"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ArrowLeft,
  Mail,
  KeyRound,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [emailInput, setEmailInput] = useState("");
  const [confirmedEmail, setConfirmedEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 1: Request Reset Code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailInput.trim()) {
      toast.error("Please enter your email or registration number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Unable to find an account with those details.");
      }

      setConfirmedEmail(data.email);
      // In local development or testing, pre-populate code if returned
      if (data.code) {
        setCode(data.code);
      }

      toast.success(data.message || "Reset verification code generated!");
      setStep(2);
    } catch (err: any) {
      toast.error(err.message || "Failed to process reset request.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Code and Set New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim() || code.trim().length < 6) {
      toast.error("Please enter the 6-digit verification code.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match. Please re-type your password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: confirmedEmail || emailInput.trim(),
          code: code.trim(),
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to reset password.");
      }

      toast.success("Password reset successfully!");
      setStep(3);
      setTimeout(() => {
        router.push("/login?reset=true");
      }, 2500);
    } catch (err: any) {
      toast.error(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 md:p-8 relative bg-cover bg-center"
      style={{ backgroundImage: "url(/homepage-background.webp)" }}
    >
      {/* Deep Navy Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#001a33]/90 via-[#002147]/85 to-[#003d66]/90" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back Link */}
        <div className="mb-4">
          <Link
            href="/login"
            className="inline-flex items-center text-xs md:text-sm text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Sign In
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 relative">
          {/* Top Gold/Navy Accent Bar */}
          <div className="h-1.5 bg-gradient-to-r from-[#003366] via-[#ff8c00] to-[#ffa726] rounded-t-2xl" />

          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              {/* STEP 1: Enter Email / Reg Number */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#003366]/10 dark:bg-amber-500/10 flex items-center justify-center text-[#003366] dark:text-[#ffa726]">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                        Reset Password
                      </h1>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Enter your university email or registration number
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleRequestCode} className="space-y-4">
                    <div>
                      <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Email Address or Reg Number
                      </Label>
                      <Input
                        type="text"
                        placeholder="e.g. R2421428@uofzmail.uz.ac.zw or R2421428"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="mt-1 h-10 text-sm"
                        autoFocus
                      />
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5">
                        We will send a 6-digit recovery code to your registered account.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-10 bg-[#003366] hover:bg-[#002244] text-white font-semibold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending Verification Code...
                        </>
                      ) : (
                        "Send Verification Code"
                      )}
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* STEP 2: Enter Code & New Password */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-[#ff8c00]">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                        Enter Security Code
                      </h1>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-[260px]">
                        Sent to: <strong>{confirmedEmail}</strong>
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          6-Digit Verification Code
                        </Label>
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="text-[11px] text-[#003366] dark:text-[#ffa726] hover:underline"
                        >
                          Change Email
                        </button>
                      </div>
                      <Input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                        className="mt-1 h-11 text-center font-mono text-lg font-bold tracking-[6px]"
                        autoFocus
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        New Password
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Min 6 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="h-10 text-sm pr-9"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Confirm New Password
                      </Label>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="mt-1 h-10 text-sm"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-10 bg-gradient-to-r from-[#ff8c00] to-[#ffa726] hover:from-[#e67e00] hover:to-[#ff8c00] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Updating Password...
                        </>
                      ) : (
                        <>
                          Set New Password & Log In
                          <CheckCircle2 className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* STEP 3: Password Updated Success */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="text-center py-4 space-y-4"
                >
                  <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Password Reset Successfully
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Your credentials have been securely updated. Redirecting to login page...
                    </p>
                  </div>

                  <Button
                    onClick={() => router.push("/login?reset=true")}
                    className="w-full h-10 bg-[#003366] hover:bg-[#002244] text-white text-xs font-semibold rounded-xl"
                  >
                    Go to Login Now
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
