"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/utils/validators";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Mail } from "lucide-react";

const UZ_BANNER = "https://www.emhare.uz.ac.zw/css/images/uzemharebanner.png";

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("If an account exists with that email, a reset link has been sent.");
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ '--background': '150 14% 96%', '--foreground': '220 25% 14%', '--card': '0 0% 100%', '--card-foreground': '220 25% 14%', '--primary': '210 100% 20%', '--primary-foreground': '0 0% 100%', '--muted': '150 10% 91%', '--muted-foreground': '220 12% 45%', '--accent': '30 95% 52%', '--accent-foreground': '0 0% 100%', '--border': '150 10% 87%', '--input': '150 10% 87%', '--ring': '210 100% 20%', '--destructive': '0 84% 60%', '--destructive-foreground': '0 0% 100%', backgroundColor: 'hsl(150 14% 96%)' } as React.CSSProperties}>
      <img src={UZ_BANNER} alt="University of Zimbabwe" className="w-full h-auto object-cover" />
      <div className="flex-1 flex items-start justify-center px-3 py-4 md:px-4 md:py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link href="/login" className="inline-flex items-center text-xs md:text-sm text-muted-foreground hover:text-foreground mb-3 md:mb-4">
            <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1" />Back to login
          </Link>
          <div className="bg-card rounded-xl border shadow-lg overflow-hidden">
            <div className="h-1 md:h-1.5 bg-gradient-to-r from-primary via-primary to-accent w-full" />
            <div className="p-5 md:p-8">
              <div className="flex items-center gap-2.5 md:gap-3 mb-4 md:mb-6">
                <Mail className="w-6 h-6 md:w-8 md:h-8 text-accent" />
                <div>
                  <h1 className="text-lg md:text-xl font-bold text-foreground">Forgot Password</h1>
                  <p className="text-xs md:text-sm text-muted-foreground">Enter your email to reset your password</p>
                </div>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 md:space-y-4">
                <div>
                  <Label className="text-xs md:text-sm">Email Address</Label>
                  <Input {...register("email")} placeholder="your.email@example.com" className="mt-1 h-9 md:h-11 text-sm" />
                  {errors.email && <p className="text-destructive text-xs mt-0.5">{String(errors.email.message)}</p>}
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full h-9 md:h-11 bg-primary text-primary-foreground font-semibold text-xs md:text-sm">
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
