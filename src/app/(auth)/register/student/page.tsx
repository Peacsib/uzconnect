"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, GraduationCap, Loader2 } from "lucide-react";
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
    programmeId: "1",
    phone: "",
  });

  const handleChange = (field: string, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  // Step 1 Validation
  const handleNext = () => {
    if (!formData.fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast.error("Please enter a valid university or personal email.");
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
    setStep(2);
  };

  // Step 2 Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.regNumber.trim()) {
      toast.error("Registration number is required (e.g. R214567A).");
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
          regNumber: formData.regNumber.trim().toUpperCase(),
          programmeId: Number(formData.programmeId),
          phone: formData.phone.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create account.");
      }

      toast.success("Account created successfully! You can now sign in.");
      router.push("/login?registered=" + encodeURIComponent(formData.regNumber.trim().toUpperCase()));
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
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/20">
          {/* Top Gold/Navy Accent Bar */}
          <div className="h-1.5 bg-gradient-to-r from-[#003366] via-[#ff8c00] to-[#ffa726]" />

          {/* Header */}
          <div className="px-6 pt-6 pb-4 text-center border-b border-gray-100">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#003366] to-[#002147] mb-2 shadow-md">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Student Registration</h1>
            <p className="text-xs text-gray-500 mt-0.5">Step {step} of 2: {step === 1 ? "Account Basics" : "Academic Info"}</p>

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
                    <Label className="text-xs font-semibold text-gray-700">Email Address</Label>
                    <Input
                      type="email"
                      placeholder="student@students.uz.ac.zw"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="mt-1 h-10 text-sm"
                    />
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
                    <Label className="text-xs font-semibold text-gray-700">
                      Registration Number
                      <span className="text-[10px] text-gray-500 font-normal ml-1.5">(Format: R214567A)</span>
                    </Label>
                    <Input
                      placeholder="e.g. R214567A"
                      value={formData.regNumber}
                      onChange={(e) => handleChange("regNumber", e.target.value)}
                      className="mt-1 h-10 text-sm font-mono uppercase"
                      autoFocus
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-gray-700">Degree Programme</Label>
                    <Select
                      value={formData.programmeId}
                      onValueChange={(val) => handleChange("programmeId", val)}
                    >
                      <SelectTrigger className="mt-1 h-10 text-sm">
                        <SelectValue placeholder="Select your programme" />
                      </SelectTrigger>
                      <SelectContent>
                        {programmes && programmes.length > 0 ? (
                          programmes.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.name}
                            </SelectItem>
                          ))
                        ) : (
                          <>
                            <SelectItem value="1">BSc Honours Computer Science</SelectItem>
                            <SelectItem value="2">BSc Honours Information Systems</SelectItem>
                            <SelectItem value="3">BSc Honours Software Engineering</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
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
                      disabled={loading}
                      className="flex-1 h-11 bg-gradient-to-r from-[#ff8c00] to-[#ffa726] hover:from-[#e67e00] hover:to-[#ff8c00] text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
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
