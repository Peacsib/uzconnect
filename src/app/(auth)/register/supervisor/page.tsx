"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";

export default function RegisterSupervisorPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccessExit, setIsSuccessExit] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    jobTitle: "",
    phone: "",
  });

  const handleChange = (field: string, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleNext = () => {
    if (!formData.fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast.error("Please enter a valid work email address.");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company.trim()) {
      toast.error("Please enter your company or organization name.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register/supervisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          company: formData.company.trim(),
          jobTitle: formData.jobTitle.trim() || "Industry Supervisor",
          phone: formData.phone.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register supervisor account.");
      }

      const registeredEmail = formData.email.trim().toLowerCase();
      setIsSuccessExit(true);
      toast.success("Supervisor account registered! Preparing sign-in...", { duration: 3000 });
      setTimeout(() => {
        router.push(`/login?email=${encodeURIComponent(registeredEmail)}&registered=true&cube=1`);
      }, 480);
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
      <div className="absolute inset-0 bg-gradient-to-br from-[#001a33]/90 via-[#002147]/85 to-[#003d66]/90" />

      <div
        className="w-full max-w-md relative z-10"
        style={{ perspective: "1400px", perspectiveOrigin: "center center" }}
      >
        <div className="mb-4">
          <Link
            href="/login"
            className="inline-flex items-center text-xs md:text-sm text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Sign In
          </Link>
        </div>

        <motion.div
          animate={
            isSuccessExit
              ? {
                  rotateY: -82,
                  transformOrigin: "right center",
                  scale: 0.93,
                  opacity: 0.8,
                  transition: {
                    duration: 0.5,
                    ease: [0.32, 0.72, 0, 1] as [number, number, number, number],
                  },
                }
              : { opacity: 1, y: 0, rotateY: 0, scale: 1 }
          }
          style={{ transformStyle: "preserve-3d" }}
          className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/20 relative"
        >
          {isSuccessExit && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-black pointer-events-none rounded-2xl z-40"
            />
          )}
          <div className="h-1.5 bg-gradient-to-r from-[#ff8c00] via-[#ffa726] to-[#003366]" />

          <div className="px-6 pt-6 pb-4 text-center border-b border-gray-100">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff8c00] to-[#ffa726] mb-2 shadow-md">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Supervisor Registration</h1>
            <p className="text-xs text-gray-500 mt-0.5">Step {step} of 2: {step === 1 ? "Personal Basics" : "Company & Role"}</p>

            <div className="flex items-center justify-center gap-2 mt-3">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step === 1 ? "w-12 bg-[#ff8c00]" : "w-6 bg-green-600"
                }`}
              />
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step === 2 ? "w-12 bg-[#003366]" : "w-6 bg-gray-200"
                }`}
              />
            </div>
          </div>

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
                      placeholder="e.g. Eng. Peter Chitando"
                      value={formData.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      className="mt-1 h-10 text-sm"
                      autoFocus
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-gray-700">Work Email Address</Label>
                    <Input
                      type="email"
                      placeholder="peter.chitando@company.co.zw"
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
                    className="w-full h-11 mt-2 bg-gradient-to-r from-[#ff8c00] to-[#ffa726] hover:from-[#e67e00] hover:to-[#ff8c00] text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    Continue to Company Details
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
                    <Label className="text-xs font-semibold text-gray-700">Company / Organization Name</Label>
                    <Input
                      placeholder="e.g. Econet Wireless Zimbabwe"
                      value={formData.company}
                      onChange={(e) => handleChange("company", e.target.value)}
                      className="mt-1 h-10 text-sm"
                      autoFocus
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-gray-700">Job Title / Designation</Label>
                    <Input
                      placeholder="e.g. Lead Solutions Architect"
                      value={formData.jobTitle}
                      onChange={(e) => handleChange("jobTitle", e.target.value)}
                      className="mt-1 h-10 text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-gray-700">
                      Work Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
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
                      className="flex-1 h-11 bg-gradient-to-r from-[#003366] to-[#002147] hover:from-[#002147] hover:to-[#001a33] text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Registering...
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
        </motion.div>

        <p className="text-center text-[11px] text-white/70 mt-4">
          Already registered?{" "}
          <Link href="/login" className="text-[#ffa726] font-semibold hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}
