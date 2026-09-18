"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { loginSchema, LoginFormData } from "@/utils/validators";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  LogIn,
  Building2,
  GraduationCap,
  BookOpen,
  Users,
  CheckCircle,
  Wifi,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";

// Optimized static assets
const UZ_CREST = "/uz-crest.png";
const BG_IMAGE = "/homepage-background.webp";

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
];

// WhatsApp Status / Stories 3D Cube Rotation Variants
const cubeVariants = {
  enter: (direction: number) => ({
    rotateY: direction > 0 ? 82 : -82,
    transformOrigin: direction > 0 ? "right center" : "left center",
    scale: 0.93,
    opacity: 0.82,
  }),
  center: {
    rotateY: 0,
    transformOrigin: "center center",
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.65,
      ease: [0.32, 0.72, 0, 1] as [number, number, number, number], // iOS / WhatsApp spring physics bezier
    },
  },
  exit: (direction: number) => ({
    rotateY: direction > 0 ? -82 : 82,
    transformOrigin: direction > 0 ? "left center" : "right center",
    scale: 0.93,
    opacity: 0.82,
    transition: {
      duration: 0.65,
      ease: [0.32, 0.72, 0, 1] as [number, number, number, number],
    },
  }),
};

// 3D dynamic lighting shadow overlay that darkens the receding face
const shadowVariants = {
  enter: {
    opacity: 0.45,
    transition: { duration: 0.65, ease: "easeInOut" as const },
  },
  center: {
    opacity: 0,
    transition: { duration: 0.65, ease: "easeInOut" as const },
  },
  exit: {
    opacity: 0.45,
    transition: { duration: 0.65, ease: "easeInOut" as const },
  },
};

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading } = useAuth();

  const isFromCube = searchParams.get("cube") === "1";
  const registeredParam = searchParams.get("registered");
  const emailParam = searchParams.get("email");
  const initialEmail = emailParam || (registeredParam && registeredParam !== "true" ? registeredParam : "");

  const [tab, setTab] = useState<"signin" | "register">("signin");
  const [direction, setDirection] = useState<number>(isFromCube ? -1 : 1);
  const [showPassword, setShowPassword] = useState(false);
  const toastFiredRef = useRef(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: initialEmail || "",
      password: "",
    },
  });

  // Autofill email and auto-focus password when redirected from registration
  useEffect(() => {
    if (initialEmail) {
      setValue("email", initialEmail);
      setTab("signin");

      if (!toastFiredRef.current && (registeredParam || isFromCube)) {
        toastFiredRef.current = true;
        toast.success("Account created successfully! Please enter your password to sign in.", {
          duration: 5000,
        });
      }

      // Auto-focus password input after 3D cube rotation completes smoothly
      const timer = setTimeout(() => {
        const pwInput = document.getElementById("login-password-input");
        if (pwInput) {
          pwInput.focus();
        }
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [initialEmail, setValue, registeredParam, isFromCube]);

  // Force light mode on homepage
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    return () => {
      const theme = localStorage.getItem("theme");
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      }
    };
  }, []);

  const handleTabChange = (newTab: "signin" | "register") => {
    if (newTab === tab) return;
    setDirection(newTab === "register" ? 1 : -1);
    setTab(newTab);
  };

  const onLogin = async (data: LoginFormData) => {
    const success = await login(data.email, data.password);
    if (success) {
      toast.success("Welcome back!");
      const stored = localStorage.getItem("wrl_user");
      if (stored) {
        const u = JSON.parse(stored);
        router.push(`/${u.role}`);
      }
    } else {
      toast.error("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Mobile Hero Panel - Shows First on Mobile */}
      <div
        className="lg:hidden min-h-screen relative overflow-hidden flex flex-col"
        style={{
          backgroundImage: `url(${BG_IMAGE})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#001a33]/85 via-[#002147]/75 to-[#003d66]/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-6 text-white flex-1">
          {/* Top branding */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2.5 pt-4"
          >
            <img src={UZ_CREST} alt="UZ Crest" className="w-10 h-10 drop-shadow-lg" />
            <div>
              <h1 className="text-base font-semibold tracking-tight">WRL Connect</h1>
              <p className="text-xs text-white/75">University of Zimbabwe</p>
            </div>
          </motion.div>

          {/* Center tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4 flex-1 flex flex-col justify-center"
          >
            <h2
              className="text-3xl font-bold leading-tight tracking-tight"
              style={{ textShadow: "0 2px 16px rgba(0,0,0,0.5)" }}
            >
              <span
                className="inline-block relative"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontStyle: "italic",
                  fontSize: "1.15em",
                  fontWeight: 600,
                  color: "#ffa726",
                  textShadow:
                    "0 2px 20px rgba(255, 140, 0, 0.4), 0 0 30px rgba(255, 140, 0, 0.2)",
                }}
              >
                Your
                <svg
                  className="absolute -bottom-1 left-0 w-full h-2"
                  viewBox="0 0 100 8"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,7 Q25,0 50,5 T100,4"
                    stroke="#ff8c00"
                    strokeWidth="1.5"
                    fill="none"
                    opacity="0.6"
                  />
                </svg>
              </span>{" "}
              Work-Related
              <br />
              Learning Journey,
              <br />
              <span className="text-[#ff8c00]">Simplified.</span>
            </h2>
            <p className="text-sm text-white/90 max-w-md leading-relaxed font-normal">
              Manage placements, submit logbooks, and stay connected with your supervisors and
              lecturers — all in one platform.
            </p>
          </motion.div>

          {/* Bottom features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 gap-3 pb-4"
          >
            {features.map((f, idx) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + idx * 0.1 }}
                className="flex items-start gap-2 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/20">
                  <f.icon className="w-4 h-4 text-white/90" />
                </div>
                <div>
                  <h3 className="font-semibold text-xs mb-0.5 text-white/95">{f.title}</h3>
                  <p className="text-[10px] text-white/60 leading-snug">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center pb-6"
          >
            <p className="text-xs text-white/70 mb-2">Swipe up to sign in</p>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="inline-block"
            >
              <svg
                className="w-6 h-6 text-white/70 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Desktop Left Hero Panel */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{
          backgroundImage: `url(${BG_IMAGE})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#001a33]/80 via-[#002147]/70 to-[#003d66]/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Top branding */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2.5"
          >
            <img src={UZ_CREST} alt="UZ Crest" className="w-10 h-10 drop-shadow-lg" />
            <div>
              <h1 className="text-base font-semibold tracking-tight">WRL Connect</h1>
              <p className="text-xs text-white/75">University of Zimbabwe</p>
            </div>
          </motion.div>

          {/* Center tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            <h2
              className="text-4xl font-bold leading-tight tracking-tight"
              style={{ textShadow: "0 2px 16px rgba(0,0,0,0.5)" }}
            >
              <span
                className="inline-block relative"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontStyle: "italic",
                  fontSize: "1.15em",
                  fontWeight: 600,
                  color: "#ffa726",
                  textShadow:
                    "0 2px 20px rgba(255, 140, 0, 0.4), 0 0 30px rgba(255, 140, 0, 0.2)",
                }}
              >
                Your
                <svg
                  className="absolute -bottom-1 left-0 w-full h-2"
                  viewBox="0 0 100 8"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,7 Q25,0 50,5 T100,4"
                    stroke="#ff8c00"
                    strokeWidth="1.5"
                    fill="none"
                    opacity="0.6"
                  />
                </svg>
              </span>{" "}
              Work-Related
              <br />
              Learning Journey,
              <br />
              <span className="text-[#ff8c00]">Simplified.</span>
            </h2>
            <p className="text-base text-white/90 max-w-md leading-relaxed font-normal">
              Manage placements, submit logbooks, and stay connected with your supervisors and
              lecturers — all in one platform.
            </p>
          </motion.div>

          {/* Bottom features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 gap-4"
          >
            {features.map((f, idx) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + idx * 0.1 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 hover:border-white/20 transition-all cursor-default"
              >
                <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/20">
                  <f.icon className="w-4 h-4 text-white/90" />
                </div>
                <div>
                  <h3 className="font-semibold text-xs mb-1 text-white/95">{f.title}</h3>
                  <p className="text-[11px] text-white/60 leading-snug">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Auth Panel - 3D Perspective Stage Container */}
      <div className="min-h-screen lg:min-h-0 flex-1 lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-[#0a0e14] via-[#0f1419] to-[#1a1f2e] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="hidden lg:block absolute top-10 right-10 w-32 h-32 bg-[#ff8c00]/5 rounded-full blur-3xl" />
        <div className="hidden lg:block absolute bottom-10 left-10 w-40 h-40 bg-[#003366]/10 rounded-full blur-3xl" />

        {/* 3D Cube Perspective Viewport */}
        <div
          className="w-full max-w-[420px] relative z-10 py-6"
          style={{
            perspective: "1400px",
            perspectiveOrigin: "center center",
          }}
        >
          <AnimatePresence mode="wait" initial={isFromCube} custom={direction}>
            {tab === "signin" ? (
              <motion.div
                key="signin-cube-face"
                custom={direction}
                variants={cubeVariants}
                initial="enter"
                animate="center"
                exit="exit"
                style={{
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                }}
                className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/20 relative"
              >
                {/* 3D Dynamic Ambient Shadow Overlay */}
                <motion.div
                  variants={shadowVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0 bg-black pointer-events-none rounded-2xl z-40"
                />

                {/* Accent bar with gradient */}
                <div className="h-1.5 bg-gradient-to-r from-[#003366] via-[#ff8c00] to-[#ffa726]" />

                {/* Card header */}
                <div className="px-8 pt-6 pb-2 text-center border-b border-gray-100">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#003366] to-[#002147] mb-2 shadow-lg">
                    <img src={UZ_CREST} alt="UZ Crest" className="w-9 h-9" />
                  </div>
                  <h1 className="text-lg font-bold text-gray-900 tracking-tight mb-0.5">WRL Connect</h1>
                  <p className="text-[11px] text-gray-500 font-medium">Work-Related Learning Platform</p>
                </div>

                {/* Tabs */}
                <div className="px-6 lg:px-8 pt-4">
                  <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-200">
                    <button
                      type="button"
                      onClick={() => handleTabChange("signin")}
                      className="flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 bg-white text-gray-900 shadow-sm"
                    >
                      SIGN IN
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTabChange("register")}
                      className="flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 text-gray-500 hover:text-gray-700"
                    >
                      REGISTER
                    </button>
                  </div>
                </div>

                {/* Form content */}
                <div className="px-6 lg:px-8 py-5">
                  <form onSubmit={handleSubmit(onLogin)} className="space-y-3.5">
                    <div>
                      <Label className="text-gray-700 text-xs font-bold uppercase tracking-wide mb-1.5 block">
                        Email
                      </Label>
                      <Input
                        {...register("email")}
                        type="text"
                        autoComplete="username"
                        placeholder="Enter your email or registration number"
                        className="h-10 text-sm border-gray-300 focus:border-[#ff8c00] focus:ring-[#ff8c00] rounded-lg"
                      />
                      {errors.email && (
                        <p className="text-red-600 text-xs mt-1 font-medium">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-gray-700 text-xs font-bold uppercase tracking-wide mb-1.5 block">
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="login-password-input"
                          {...register("password")}
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder="Enter your password"
                          className="h-10 pr-11 text-sm border-gray-300 focus:border-[#ff8c00] focus:ring-[#ff8c00] rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-red-600 text-xs mt-1 font-medium">{errors.password.message}</p>
                      )}
                    </div>

                    <div className="text-right">
                      <Link
                        href="/forgot-password"
                        className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 bg-gradient-to-r from-[#003366] to-[#002147] text-white hover:from-[#002147] hover:to-[#001a33] font-bold text-sm tracking-wide rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <LogIn className="w-4 h-4 mr-2" />
                          SIGN IN
                        </>
                      )}
                    </Button>

                    {/* Secure badge */}
                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 pt-1">
                      <Lock className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-medium">Secure, encrypted connection</span>
                    </div>
                  </form>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="register-cube-face"
                custom={direction}
                variants={cubeVariants}
                initial="enter"
                animate="center"
                exit="exit"
                style={{
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                }}
                className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/20 relative"
              >
                {/* 3D Dynamic Ambient Shadow Overlay */}
                <motion.div
                  variants={shadowVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0 bg-black pointer-events-none rounded-2xl z-40"
                />

                {/* Accent bar with gradient */}
                <div className="h-1.5 bg-gradient-to-r from-[#ff8c00] via-[#ffa726] to-[#003366]" />

                {/* Card header */}
                <div className="px-8 pt-6 pb-2 text-center border-b border-gray-100">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ff8c00] to-[#e65100] mb-2 shadow-lg">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-lg font-bold text-gray-900 tracking-tight mb-0.5">Create Account</h1>
                  <p className="text-[11px] text-gray-500 font-medium">Select your portal role to register</p>
                </div>

                {/* Tabs */}
                <div className="px-6 lg:px-8 pt-4">
                  <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-200">
                    <button
                      type="button"
                      onClick={() => handleTabChange("signin")}
                      className="flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 text-gray-500 hover:text-gray-700"
                    >
                      SIGN IN
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTabChange("register")}
                      className="flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 bg-white text-gray-900 shadow-sm"
                    >
                      REGISTER
                    </button>
                  </div>
                </div>

                {/* Registration options */}
                <div className="px-6 lg:px-8 py-5 space-y-3">
                  <Link href="/register/student" className="block">
                    <Button
                      variant="outline"
                      className="w-full h-auto py-3 justify-start gap-3 hover:border-[#003366] hover:bg-[#003366]/5 transition-all border-2 border-gray-200 rounded-xl group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#003366] to-[#002147] flex items-center justify-center shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
                        <GraduationCap className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                          Register as Student
                          <span className="text-[10px] bg-blue-100 text-[#003366] px-1.5 py-0.5 rounded font-semibold">
                            Self-Service
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-500">For UZ students preparing for or on attachment</div>
                      </div>
                    </Button>
                  </Link>

                  <Link href="/register/supervisor" className="block">
                    <Button
                      variant="outline"
                      className="w-full h-auto py-3 justify-start gap-3 hover:border-[#ff8c00] hover:bg-[#ff8c00]/5 transition-all border-2 border-gray-200 rounded-xl group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff8c00] to-[#ffa726] flex items-center justify-center shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-gray-900 text-sm">Register as Supervisor</div>
                        <div className="text-[11px] text-gray-500">Industry company mentors supervising interns</div>
                      </div>
                    </Button>
                  </Link>

                  <Link href="/register/lecturer" className="block">
                    <Button
                      variant="outline"
                      className="w-full h-auto py-3 justify-start gap-3 hover:border-[#1e3a8a] hover:bg-[#1e3a8a]/5 transition-all border-2 border-gray-200 rounded-xl group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] flex items-center justify-center shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-gray-900 text-sm">Register as Lecturer</div>
                        <div className="text-[11px] text-gray-500">University academic staff & placement assessors</div>
                      </div>
                    </Button>
                  </Link>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleTabChange("signin")}
                      className="text-xs text-[#003366] font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      Already have an account? Sign in here
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-[11px] text-white/60 lg:text-gray-500 mt-5">
            © {new Date().getFullYear()} University of Zimbabwe · WRL Connect
          </p>
        </div>
      </div>
    </div>
  );
}
