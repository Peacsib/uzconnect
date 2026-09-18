"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, GraduationCap, Loader2, AlertCircle } from "lucide-react";
import { ProgrammeCombobox } from "@/components/academic/ProgrammeCombobox";
import { useProgrammes } from "@/hooks/useAcademicData";

export default function RegisterStudentPage() {
  const router = useRouter();
  const { data: programmes } = useProgrammes();

  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    regNumber: "",
    programmeId: "149", // Default: HWWMS (BSc Honours Water and Waste Management Systems) or first
    phone: "",
  });

  const handleChange = (field: string, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  // Derive email prefix
  const emailPrefix = useMemo(() => {
    if (!formData.email.includes("@")) return "";
    return formData.email.split("@")[0].trim().toUpperCase();
  }, [formData.email]);

  // Check if regNumber matches email prefix
  const isRegNumberMatching = useMemo(() => {
    if (!emailPrefix || !formData.regNumber) return true;
    return formData.regNumber.trim().toUpperCase() === emailPrefix;
  }, [emailPrefix, formData.regNumber]);

  // Step 1 Validation
  const handleNext = () => {
    if (!formData.fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast.error("Please enter your valid university email (e.g. R2421428@uofzmail.uz.ac.zw).");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    // Auto-populate regNumber from email prefix if empty or default
    const prefix = formData.email.split("@")[0].trim().toUpperCase();
    if (prefix && (!formData.regNumber || formData.regNumber === "")) {
      setFormData((prev) => ({ ...prev, regNumber: prefix }));
    }

    setStep(2);
  };

  

  // Step 2 Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanReg = formData.regNumber.trim().toUpperCase();
    const cleanPrefix = emailPrefix.trim().toUpperCase();

    if (!cleanReg) {
      toast.error("Registration number is required (e.g. R2421428).");
      return;
    }

    // CRITICAL: Flag if email prefix does not match registration number
    if (cleanPrefix && cleanReg !== cleanPrefix) {
      toast.error(
        `Registration number (${cleanReg}) must match your email prefix (${cleanPrefix}). Student emails are formatted as <regNumber>@uofzmail.uz.ac.zw.`
      );
      return;
    }

    if (!formData.programmeId) {
      toast.error("Please select your degree programme.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          regNumber: cleanReg,
          programmeId: Number(formData.programmeId),
          phone: formData.phone.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create account.");
      }

      toast.success("Account created successfully! You can now sign in.");
      router.push("/login?registered=" + encodeURIComponent(cleanReg));
    } catch (err: any) {
      toast.error(err.message || "Registration failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 md:p-8 relative bg-cover bg-center"
      style={{ backgroundImage: "url(/homepage-background.webp)" }}
    >
      {/* Deep Navy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#001a33]/90 via-[#002147]/85 to-[#003d66]/90" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
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
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 relative">
          {/* Top Gold/Navy Accent Bar */}
          <div className="h-1.5 bg-gradient-to-r from-[#003366] via-[#ff8c00] to-[#ffa726] rounded-t-2xl" />

          {/* Header */}
          <div className="px-6 pt-6 pb-4 text-center border-b border-gray-100">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#003366] to-[#002147] mb-2 shadow-md">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Student Registration</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Step {step} of 2: {step === 1 ? "Account Basics" : "Academic Degree"}
            </p>

            {/* Step Progress Pill Indicator */}
            <div className="flex items-center justify-center gap-2 mt-3">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step === 1 ? "w-12 bg-[#003366]" : "w-6 bg-green-600"
                }`}
              />
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step === 2 ? "w-12 bg-[#ff8c00]" : "w-6 bg-gray-200"
                }`}
              />
            </div>
          </div>

          {/* Form Body */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div>
                    <Label className="text-xs font-semibold text-gray-700">Full Name</Label>
                    <Input
                      placeholder="e.g. Tendai Moyo"
                      value={formData.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      className="mt-1 h-10 text-sm"
                      autoFocus
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-gray-700">University Student Email</Label>
                    </div>
                    <Input
                      type="email"
                      placeholder="e.g. R2421428@uofzmail.uz.ac.zw"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="mt-1 h-10 text-sm"
                    />
                    <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ff8c00]" />
                      Format: <strong className="text-gray-700">&lt;regNumber&gt;@uofzmail.uz.ac.zw</strong>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <Label className="text-xs font-semibold text-gray-700">Password</Label>
                      <div className="relative mt-1">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Min 6 chars"
                          value={formData.password}
                          onChange={(e) => handleChange("password", e.target.value)}
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
                      <Label className="text-xs font-semibold text-gray-700">Confirm</Label>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Re-type"
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange("confirmPassword", e.target.value)}
                        className="mt-1 h-10 text-sm"
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleNext}
                    className="w-full h-11 mt-2 bg-gradient-to-r from-[#003366] to-[#002147] hover:from-[#002147] hover:to-[#001a33] text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    Continue to Academic Info
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  key="step2"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-gray-700">
                        Registration Number
                      </Label>
                      {emailPrefix && (
                        <span className="text-[11px] text-gray-500 font-mono">
                          Email Prefix: <strong className="text-[#003366]">{emailPrefix}</strong>
                        </span>
                      )}
                    </div>
                    <Input
                      placeholder="e.g. R2421428"
                      value={formData.regNumber}
                      onChange={(e) => handleChange("regNumber", e.target.value)}
                      className={`mt-1 h-10 text-sm font-mono uppercase font-bold tracking-wide ${
                        !isRegNumberMatching ? "border-red-500 focus-visible:ring-red-500 bg-red-50/50" : ""
                      }`}
                      autoFocus
                    />

                    {/* Mismatch Warning Alert */}
                    {!isRegNumberMatching && (
                      <div className="mt-1.5 p-2 rounded-lg bg-red-50 border border-red-200 flex items-start gap-1.5 text-[11px] text-red-700 leading-tight">
                        <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>Registration number mismatch!</strong> Your email prefix is <strong>{emailPrefix}</strong>, so your registration number must be <strong>{emailPrefix}</strong>.
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                      Degree Programme
                    </Label>
                    <ProgrammeCombobox
                      value={formData.programmeId}
                      onValueChange={(val) => handleChange("programmeId", val)}
                      placeholder="Search or select your degree programme..."
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-gray-700">
                      Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
                    </Label>
                    <Input
                      placeholder="+263 77 123 4567"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="mt-1 h-10 text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      disabled={loading}
                      className="h-11 px-4 border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || !isRegNumberMatching}
                      className="flex-1 h-11 bg-gradient-to-r from-[#ff8c00] to-[#ffa726] hover:from-[#e67e00] hover:to-[#ff8c00] text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Complete Registration
                          <CheckCircle2 className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-white/70 mt-4">
          Already registered?{" "}
          <Link href="/login" className="text-[#ffa726] font-semibold hover:underline">
            Sign In here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
