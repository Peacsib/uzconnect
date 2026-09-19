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
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

// Static assets
const UZ_CREST = "/uz-crest.png";
const BG_IMAGE = "/homepage-background.webp";

const features = [
  {
    icon: BookOpen,
    title: "Digital Logbooks",
    desc: "Offline-ready weekly entries & encrypted sign-offs",
    tag: "Paperless",
  },
  {
    icon: Users,
    title: "Tripartite Nexus",
    desc: "Students, industry mentors & academic assessors",
    tag: "Synchronized",
  },
  {
    icon: Scale,
    title: "Verified Rubrics",
    desc: "Standardized 40% mentor & 60% faculty weighting",
    tag: "Institutional",
  },
  {
    icon: ShieldCheck,
    title: "Secure Compliance",
    desc: "Centralized coordinator governance & audit trails",
    tag: "Accredited",
  },
];

const focalPhrases = [
  { text: "Industry Placements", highlight: "Accredited & Verified" },
  { text: "Digital Logbooks", highlight: "Paperless & Offline" },
  { text: "Tripartite Mentorship", highlight: "Student • Mentor • Assessor" },
  { text: "Standardized Scoring", highlight: "Institutional Rubrics" },
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
  // Focal cycler state for kinetic hero typography
  const [focalIndex, setFocalIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFocalIndex((prev) => (prev + 1) % focalPhrases.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);
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
        className="lg:hidden min-h-screen relative overflow-hidden flex flex-col"
        style={{
          backgroundImage: `url(${BG_IMAGE})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#001a33]/90 via-[#002147]/85 to-[#003d66]/85" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-[#ff8c00]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between p-6 text-white flex-1">
          {/* Top Institutional Header */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-between pt-2"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-md">
                <img src={UZ_CREST} alt="UZ Crest" className="w-7 h-7 object-contain drop-shadow" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-white">WRL Connect</h1>
                <p className="text-[11px] text-white/70">University of Zimbabwe</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-[10px] font-medium text-white/90">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff8c00] animate-pulse" />
              2026/2027
            </div>
          </motion.div>

          {/* Hero Typography */}
          <div className="space-y-4 my-auto py-6">
            <div className="space-y-1">
              <div className="overflow-hidden">
                <motion.h2
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                  className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight"
                >
                  Work-Related Learning,
                </motion.h2>
              </div>
              <div className="overflow-hidden">
                <motion.h2
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
                  className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white/90 leading-tight"
                >
                  Architected for
                </motion.h2>
              </div>
              <div className="h-10 relative overflow-hidden flex items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={focalIndex}
                    initial={{ y: 20, opacity: 0, filter: "blur(4px)" }}
                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                    exit={{ y: -20, opacity: 0, filter: "blur(4px)" }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute left-0 flex items-center gap-2"
                  >
                    <span className="text-2xl sm:text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#ffb74d] via-[#ff8c00] to-[#ffa000]">
                      {focalPhrases[focalIndex].text}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              className="text-xs sm:text-sm text-white/80 max-w-md leading-relaxed font-normal"
            >
              The university's digital nexus connecting students, workplace mentors, and academic assessors with verified weekly logbooks and objective grading.
            </motion.p>
          </div>

          {/* Feature Badges */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 gap-2.5 pb-2"
          >
            {features.map((f, idx) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.45 + idx * 0.08 }}
                className="p-2.5 rounded-xl bg-white/[0.06] backdrop-blur-md border border-white/15"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                    <f.icon className="w-3.5 h-3.5 text-[#ff8c00]" />
                  </div>
                  <span className="text-[9px] font-mono text-[#ffa726] bg-[#ff8c00]/15 px-1.5 py-0.2 rounded font-medium">
                    {f.tag}
                  </span>
                </div>
                <h3 className="font-semibold text-xs text-white/95">{f.title}</h3>
                <p className="text-[10px] text-white/60 leading-tight mt-0.5 line-clamp-1">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center py-2"
          >
            <p className="text-xs text-white/70 mb-1.5 font-medium">Swipe or scroll to sign in</p>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="inline-block"
            >
              <svg className="w-5 h-5 text-white/70 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        {/* Layered cinematic gradients for enterprise atmospheric depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#001a33]/90 via-[#002147]/80 to-[#003d66]/85" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
        
        {/* Atmospheric ambient glows */}
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] bg-[#ff8c00]/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-[480px] h-[480px] bg-[#003366]/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between p-12 lg:p-14 text-white w-full h-full">
          {/* Top Institutional Header */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-500/20 to-blue-500/20 blur-sm opacity-70 group-hover:opacity-100 transition duration-500" />
                <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
                  <img src={UZ_CREST} alt="UZ Crest" className="w-8 h-8 object-contain drop-shadow-md" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold tracking-tight text-white">WRL Connect</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#ff8c00]/20 text-[#ffa726] border border-[#ff8c00]/30">
                    v2.6
                  </span>
                </div>
                <p className="text-xs text-white/70 font-medium">University of Zimbabwe</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/15 backdrop-blur-md text-[11px] font-medium text-white/90 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff8c00] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff8c00]" />
              </span>
              <span>2026/2027 Academic Year</span>
            </div>
          </motion.div>

          {/* Masked Kinetic Headline */}
          <div className="space-y-4 my-auto py-8">
            <div className="space-y-1">
              <div className="overflow-hidden">
                <motion.h2
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                  className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.12]"
                >
                  Work-Related Learning,
                </motion.h2>
              </div>

              <div className="overflow-hidden">
                <motion.h2
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.23 }}
                  className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white/90 leading-[1.12]"
                >
                  Architected for
                </motion.h2>
              </div>

              {/* Dynamic Focal Cycler with Directional Blur */}
              <div className="h-14 sm:h-16 relative overflow-hidden flex items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={focalIndex}
                    initial={{ y: 32, opacity: 0, filter: "blur(6px)" }}
                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                    exit={{ y: -32, opacity: 0, filter: "blur(6px)" }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute left-0 flex items-center gap-3"
                  >
                    <span className="text-3xl sm:text-4xl lg:text-[44px] font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#ffb74d] via-[#ff8c00] to-[#ffa000] drop-shadow-sm font-sans">
                      {focalPhrases[focalIndex].text}
                    </span>
                    <span className="hidden xl:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider font-semibold bg-white/10 text-white/80 border border-white/15 backdrop-blur-sm">
                      {focalPhrases[focalIndex].highlight}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
              className="text-base text-white/80 max-w-lg leading-relaxed font-normal pt-1"
            >
              The centralized digital nexus uniting <span className="text-white font-medium">students</span>, <span className="text-white font-medium">workplace mentors</span>, and <span className="text-white font-medium">academic assessors</span> with automated compliance, verified weekly logbooks, and objective grading.
            </motion.p>
          </div>

          {/* Refined Telemetry Feature Tiles (Bottom 2x2) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="grid grid-cols-2 gap-3.5 pt-4"
          >
            {features.map((f, idx) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + idx * 0.08 }}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-md border border-white/10 hover:border-amber-400/40 transition-all duration-300 group cursor-default shadow-sm hover:shadow-md"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/15 to-white/5 border border-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-[#ff8c00]/50 transition-all duration-300 shadow-sm">
                  <f.icon className="w-4 h-4 text-[#ff8c00]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h3 className="font-semibold text-xs text-white/95 group-hover:text-white transition-colors truncate">
                      {f.title}
                    </h3>
                    <span className="text-[9px] font-mono text-[#ffa726] bg-[#ff8c00]/15 px-1.5 py-0.2 rounded font-medium shrink-0">
                      {f.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/65 leading-snug line-clamp-2">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
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
