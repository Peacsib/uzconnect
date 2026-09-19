"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
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
  ShieldCheck,
  Award,
  TrendingUp,
  Compass,
} from "lucide-react";

// Static assets
const UZ_CREST = "/uz-crest.png";
const BG_IMAGE = "/homepage-background.webp";

const features = [
  {
    icon: BookOpen,
    title: "Digital WRL Logbook",
    desc: "Daily work logs, supervisor sign-offs & milestone tracking",
    badge: "Daily Logs",
    accent: "from-blue-500/20 to-indigo-500/10",
    border: "group-hover:border-blue-400/40",
    iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
  },
  {
    icon: Users,
    title: "Tri-Party Portal",
    desc: "Direct coordination: Student, Workplace Mentor & UZ Lecturer",
    badge: "Synchronized",
    accent: "from-amber-500/20 to-orange-500/10",
    border: "group-hover:border-amber-400/40",
    iconBg: "bg-gradient-to-br from-amber-500 to-[#e65100]",
  },
  {
    icon: CheckCircle,
    title: "Verified Grading",
    desc: "Standardized 40% supervisor & 60% academic visit rubrics",
    badge: "40/60 Scheme",
    accent: "from-emerald-500/20 to-teal-500/10",
    border: "group-hover:border-emerald-400/40",
    iconBg: "bg-gradient-to-br from-emerald-500 to-teal-700",
  },
  {
    icon: Wifi,
    title: "Offline Capability",
    desc: "Complete daily entries offline with automatic cloud sync",
    badge: "Auto-Sync",
    accent: "from-purple-500/20 to-pink-500/10",
    border: "group-hover:border-purple-400/40",
    iconBg: "bg-gradient-to-br from-purple-500 to-indigo-700",
  },
];

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading } = useAuth();

  const isFromReg = searchParams.get("from") === "reg" || searchParams.get("cube") === "1";
  const registeredParam = searchParams.get("registered");
  const emailParam = searchParams.get("email");
  const initialEmail = emailParam || (registeredParam && registeredParam !== "true" ? registeredParam : "");

  // If redirected from registration, start at register face and animate to signin
  const [tab, setTab] = useState<"signin" | "register">(isFromReg ? "register" : "signin");
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const toastFiredRef = useRef(false);

  // Dynamic 3D Cube depth (half-width) measurement
  const cubeRef = useRef<HTMLDivElement>(null);
  const [cubeDepth, setCubeDepth] = useState(200);

  useEffect(() => {
    const updateDepth = () => {
      if (cubeRef.current) {
        setCubeDepth(Math.round(cubeRef.current.offsetWidth / 2));
      }
    };
    updateDepth();
    window.addEventListener("resize", updateDepth);
    return () => window.removeEventListener("resize", updateDepth);
  }, []);

  const handleTabChange = (newTab: "signin" | "register") => {
    if (newTab === tab) return;
    setIsAnimating(true);
    setTab(newTab);
    setTimeout(() => {
      setIsAnimating(false);
    }, 720);
  };

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

      if (!toastFiredRef.current && (registeredParam || isFromReg)) {
        toastFiredRef.current = true;
        toast.success("Account created successfully! Please enter your password to sign in.", {
          duration: 5000,
        });
      }

      if (isFromReg) {
        const turnTimer = setTimeout(() => {
          handleTabChange("signin");
        }, 200);
        return () => clearTimeout(turnTimer);
      }
    }
  }, [initialEmail, setValue, registeredParam, isFromReg]);

  // Focus password input once on the signin face
  useEffect(() => {
    if (tab === "signin" && initialEmail) {
      const focusTimer = setTimeout(() => {
        const pwInput = document.getElementById("login-password-input");
        if (pwInput) {
          pwInput.focus();
        }
      }, 750);
      return () => clearTimeout(focusTimer);
    }
  }, [tab, initialEmail]);

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
      {/* Mobile Hero Panel */}
      <div
        className="lg:hidden min-h-screen relative overflow-hidden flex flex-col justify-between"
        style={{
          backgroundImage: `url(${BG_IMAGE})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#001428]/95 via-[#002147]/90 to-[#003366]/85" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

        <div className="relative z-10 flex flex-col justify-between p-6 text-white flex-1">
          {/* Top Brand Pill */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between pt-2"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
                <img src={UZ_CREST} alt="UZ Crest" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                  WRL Connect
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </h1>
                <p className="text-[10px] text-white/70 font-medium">University of Zimbabwe</p>
              </div>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[10px] text-amber-300 font-semibold">
              Education 5.0
            </div>
          </motion.div>

          {/* Hero Copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="my-auto py-8 space-y-4"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-[11px] font-semibold text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              Work-Related Learning Portal
            </div>

            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white">
              Shaping Careers.
              <br />
              <span className="relative inline-block mt-0.5">
                <span className="bg-gradient-to-r from-[#ffa726] via-[#ffb74d] to-[#ff9800] bg-clip-text text-transparent font-serif italic">
                  Connecting
                </span>
                {" "}the Future.
              </span>
            </h2>
            <p className="text-xs text-white/80 leading-relaxed max-w-sm">
              The unified digital platform coordinating UZ students, industry supervisors, and academic lecturers for seamless attachment oversight.
            </p>

            {/* Mobile Feature Highlights */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="p-2.5 rounded-xl bg-white/[0.06] backdrop-blur-md border border-white/10"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${f.iconBg} shadow`}>
                      <f.icon className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-white truncate">{f.badge}</span>
                  </div>
                  <p className="text-[10px] text-white/70 line-clamp-2 leading-tight">{f.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Swipe down indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center pb-2"
          >
            <p className="text-[11px] text-white/70 font-medium mb-1">Scroll down to sign in</p>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="inline-block"
            >
              <svg className="w-5 h-5 text-amber-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Desktop Left Hero Panel - Uber-Grade Enterprise Showcase */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{
          backgroundImage: `url(${BG_IMAGE})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Layered cinematic overlays & glowing radial spotlights */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#001224]/95 via-[#002147]/90 to-[#00386b]/85" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ff8c00]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Subtle grid pattern overlay for high-tech engineering aesthetic */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 text-white w-full h-full min-h-screen">
          {/* Top Header Brand Bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="relative group cursor-default">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#ff8c00] to-[#ffa726] rounded-2xl blur opacity-25 group-hover:opacity-60 transition duration-500" />
                <div className="relative p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
                  <img src={UZ_CREST} alt="UZ Crest" className="w-10 h-10 object-contain drop-shadow-md" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold tracking-tight text-white">WRL Connect</h1>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE PORTAL
                  </span>
                </div>
                <p className="text-xs text-white/75 font-medium">University of Zimbabwe · Education 5.0</p>
              </div>
            </div>

            {/* Academic Year Pill */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/15 text-xs text-white/80 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold text-white/90">2025/2026 Academic Session</span>
            </div>
          </motion.div>

          {/* Central Hero Headline & Copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-5 my-auto py-6"
          >
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 to-orange-500/15 backdrop-blur-md border border-amber-400/30 text-xs font-semibold text-amber-300 shadow-lg shadow-amber-500/5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Official Work-Related Learning Ecosystem</span>
            </div>

            {/* Main Headline */}
            <h2
              className="text-4xl xl:text-5xl font-extrabold leading-[1.12] tracking-tight text-white max-w-xl"
              style={{ textShadow: "0 2px 20px rgba(0,0,0,0.6)" }}
            >
              Shaping Careers.
              <br />
              <span className="relative inline-block mt-1">
                <span className="bg-gradient-to-r from-[#ffa726] via-[#ffb74d] to-[#ff9800] bg-clip-text text-transparent font-serif italic pr-1">
                  Connecting
                </span>
                {" "}the Future.
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-[#ff8c00]"
                  viewBox="0 0 220 12"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 10C60 3 160 3 218 9"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity="0.85"
                  />
                </svg>
              </span>
            </h2>

            {/* Subtitle */}
            <p className="text-sm xl:text-base text-white/85 max-w-lg leading-relaxed font-normal">
              Manage industrial attachments, record verified daily logbooks, and stay seamlessly connected with workplace supervisors and university assessors — all in one centralized platform.
            </p>

            {/* Trust Micro-Metrics Strip */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.06] backdrop-blur-md border border-white/10 shadow-sm hover:bg-white/[0.1] transition-all">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs text-white/90 font-medium">Accredited WRL Framework</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.06] backdrop-blur-md border border-white/10 shadow-sm hover:bg-white/[0.1] transition-all">
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs text-white/90 font-medium">Standardized 40% / 60% Rubrics</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.06] backdrop-blur-md border border-white/10 shadow-sm hover:bg-white/[0.1] transition-all">
                <TrendingUp className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-xs text-white/90 font-medium">Real-Time Progress Sync</span>
              </div>
            </div>
          </motion.div>

          {/* 4 Feature Showcase Cards with Rich Glassmorphism */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 gap-3.5 xl:gap-4 pt-4"
          >
            {features.map((f, idx) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.45 + idx * 0.08 }}
                className={`group relative p-4 rounded-2xl bg-white/[0.06] backdrop-blur-xl border border-white/15 ${f.border} hover:bg-white/[0.11] hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl cursor-default overflow-hidden`}
              >
                {/* Subtle ambient gradient sheen */}
                <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full bg-gradient-to-br ${f.accent} blur-xl group-hover:scale-150 transition-transform duration-500`} />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${f.iconBg} shadow-md group-hover:scale-105 transition-transform`}>
                      <f.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-amber-300/90 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-xs text-white group-hover:text-amber-200 transition-colors mb-1">
                    {f.title}
                  </h3>
                  <p className="text-[11px] text-white/70 leading-snug">
                    {f.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Footer Directorate Stamp */}
          <div className="pt-6 mt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
            <div className="flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Faculty of Computer Engineering Informatics & Communications</span>
            </div>
            <span className="font-medium text-white/50 text-[11px]">UZ WRL Directorate</span>
          </div>
        </div>
      </div>

      {/* Right Auth Panel - True 3D Cube Perspective Viewport */}
      <div className="min-h-screen lg:min-h-0 flex-1 lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-[#0a0e14] via-[#0f1419] to-[#1a1f2e] relative overflow-hidden">
        {/* Decorative ambient glows */}
        <div className="hidden lg:block absolute top-10 right-10 w-32 h-32 bg-[#ff8c00]/5 rounded-full blur-3xl" />
        <div className="hidden lg:block absolute bottom-10 left-10 w-40 h-40 bg-[#003366]/10 rounded-full blur-3xl" />

        {/* 3D Perspective Stage */}
        <div
          ref={cubeRef}
          className="w-full max-w-[420px] relative z-10"
          style={{
            perspective: "1200px",
            perspectiveOrigin: "50% 50%",
          }}
        >
          {/* 3D Rotating Cube Container - Dual Synchronized Orthogonal Faces */}
          <div
            style={{
              transformStyle: "preserve-3d",
              position: "relative",
              width: "100%",
              height: "530px",
            }}
          >
            {/* FACE 1: SIGN IN (Front Face: rotates 0deg <-> -90deg) */}
            <motion.div
              animate={{
                rotateY: tab === "signin" ? 0 : -90,
              }}
              transition={{
                duration: 0.7,
                ease: [0.32, 0.72, 0, 1] as [number, number, number, number],
              }}
              onAnimationComplete={() => setIsAnimating(false)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                transformOrigin: `50% 50% -${cubeDepth}px`,
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                zIndex: tab === "signin" ? 20 : 1,
                pointerEvents: tab === "signin" ? "auto" : "none",
                visibility: tab === "signin" || isAnimating ? "visible" : "hidden",
              }}
              className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/20 flex flex-col justify-between"
            >
              {/* Dynamic ambient lighting shadow overlay */}
              <motion.div
                animate={{ opacity: tab === "signin" ? 0 : 0.6 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
                className="absolute inset-0 bg-black pointer-events-none rounded-2xl z-10"
              />

              {/* Accent bar */}
              <div className="h-1.5 bg-gradient-to-r from-[#003366] via-[#ff8c00] to-[#ffa726] shrink-0 relative z-20" />

              {/* Header with official UZ Crest */}
              <div className="px-8 pt-5 pb-2 text-center border-b border-gray-100 shrink-0 relative z-20">
                <div className="inline-flex items-center justify-center w-13 h-13 rounded-2xl bg-gradient-to-br from-[#003366] to-[#002147] mb-2 shadow-lg border border-white/20">
                  <img src={UZ_CREST} alt="UZ Crest" className="w-8 h-8" />
                </div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight mb-0.5">WRL Connect</h1>
                <p className="text-[11px] text-gray-500 font-medium">Work-Related Learning Platform</p>
              </div>

              {/* Tabs */}
              <div className="px-6 lg:px-8 pt-3 shrink-0 relative z-20">
                <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-200">
                  <button
                    type="button"
                    onClick={() => handleTabChange("signin")}
                    className="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 bg-white text-gray-900 shadow-sm cursor-pointer"
                  >
                    SIGN IN
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabChange("register")}
                    className="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 text-gray-500 hover:text-gray-700 cursor-pointer"
                  >
                    REGISTER
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="px-6 lg:px-8 py-4 flex-1 flex flex-col justify-center relative z-20">
                <form onSubmit={handleSubmit(onLogin)} className="space-y-3">
                  <div>
                    <Label className="text-gray-700 text-xs font-bold uppercase tracking-wide mb-1 block">
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
                    <Label className="text-gray-700 text-xs font-bold uppercase tracking-wide mb-1 block">
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
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
                    className="w-full h-10 bg-gradient-to-r from-[#003366] to-[#002147] text-white hover:from-[#002147] hover:to-[#001a33] font-bold text-sm tracking-wide rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
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

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 pt-0.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-medium">Secure, encrypted connection</span>
                  </div>
                </form>
              </div>
            </motion.div>

            {/* FACE 2: REGISTER (Right Face: rotates 90deg <-> 0deg) */}
            <motion.div
              animate={{
                rotateY: tab === "register" ? 0 : 90,
              }}
              transition={{
                duration: 0.7,
                ease: [0.32, 0.72, 0, 1] as [number, number, number, number],
              }}
              onAnimationComplete={() => setIsAnimating(false)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                transformOrigin: `50% 50% -${cubeDepth}px`,
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                zIndex: tab === "register" ? 20 : 1,
                pointerEvents: tab === "register" ? "auto" : "none",
                visibility: tab === "register" || isAnimating ? "visible" : "hidden",
              }}
              className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/20 flex flex-col justify-between"
            >
              {/* Dynamic ambient lighting shadow overlay */}
              <motion.div
                animate={{ opacity: tab === "register" ? 0 : 0.6 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
                className="absolute inset-0 bg-black pointer-events-none rounded-2xl z-10"
              />

              {/* Accent bar */}
              <div className="h-1.5 bg-gradient-to-r from-[#ff8c00] via-[#ffa726] to-[#003366] shrink-0 relative z-20" />

              {/* Header with official University of Zimbabwe Crest */}
              <div className="px-8 pt-5 pb-2 text-center border-b border-gray-100 shrink-0 relative z-20">
                <div className="inline-flex items-center justify-center w-13 h-13 rounded-2xl bg-gradient-to-br from-[#003366] to-[#002147] mb-2 shadow-lg border border-white/20">
                  <img src={UZ_CREST} alt="UZ Crest" className="w-8 h-8" />
                </div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight mb-0.5">Create Account</h1>
                <p className="text-[11px] text-gray-500 font-medium">Select your portal role to register</p>
              </div>

              {/* Tabs */}
              <div className="px-6 lg:px-8 pt-3 shrink-0 relative z-20">
                <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-200">
                  <button
                    type="button"
                    onClick={() => handleTabChange("signin")}
                    className="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 text-gray-500 hover:text-gray-700 hover:bg-gray-200/50 cursor-pointer"
                  >
                    SIGN IN
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabChange("register")}
                    className="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 bg-white text-gray-900 shadow-sm cursor-pointer"
                  >
                    REGISTER
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="px-6 lg:px-8 py-3.5 flex-1 flex flex-col justify-center space-y-2.5 relative z-20">
                <Link
                  href="/register/student"
                  className="w-full py-2.5 px-3.5 flex items-center justify-start gap-3 border-2 border-gray-200 rounded-xl hover:border-[#003366] hover:bg-[#003366]/5 transition-all group cursor-pointer bg-white"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#003366] to-[#002147] flex items-center justify-center shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                      Register as Student
                      <span className="text-[9px] bg-blue-100 text-[#003366] px-1.5 py-0.5 rounded font-semibold">
                        Self-Service
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-500">For UZ students preparing for attachment</div>
                  </div>
                </Link>

                <Link
                  href="/register/supervisor"
                  className="w-full py-2.5 px-3.5 flex items-center justify-start gap-3 border-2 border-gray-200 rounded-xl hover:border-[#ff8c00] hover:bg-[#ff8c00]/5 transition-all group cursor-pointer bg-white"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff8c00] to-[#ffa726] flex items-center justify-center shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-bold text-gray-900 text-xs">Register as Supervisor</div>
                    <div className="text-[10px] text-gray-500">Industry company mentors supervising interns</div>
                  </div>
                </Link>

                <Link
                  href="/register/lecturer"
                  className="w-full py-2.5 px-3.5 flex items-center justify-start gap-3 border-2 border-gray-200 rounded-xl hover:border-[#1e3a8a] hover:bg-[#1e3a8a]/5 transition-all group cursor-pointer bg-white"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] flex items-center justify-center shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-bold text-gray-900 text-xs">Register as Lecturer</div>
                    <div className="text-[10px] text-gray-500">University academic staff & placement assessors</div>
                  </div>
                </Link>

                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={() => handleTabChange("signin")}
                    className="text-xs text-[#003366] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer p-1"
                  >
                    Already have an account? Sign in here
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer copyright */}
          <p className="text-center text-[11px] text-white/60 lg:text-gray-500 mt-5">
            © {new Date().getFullYear()} University of Zimbabwe · WRL Connect
          </p>
        </div>
      </div>
    </div>
  );
}
