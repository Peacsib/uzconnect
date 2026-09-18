"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supervisorRegSchema, SupervisorRegFormData } from "@/utils/validators";
import { companies } from "@/utils/mockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

const UZ_BANNER = "https://www.emhare.uz.ac.zw/css/images/uzemharebanner.png";

export default function RegisterSupervisor() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SupervisorRegFormData>({
    resolver: zodResolver(supervisorRegSchema),
  });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Registration pending approval. You will be notified by email.");
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ '--background': '150 14% 96%', '--foreground': '220 25% 14%', '--card': '0 0% 100%', '--card-foreground': '220 25% 14%', '--primary': '210 100% 20%', '--primary-foreground': '0 0% 100%', '--muted': '150 10% 91%', '--muted-foreground': '220 12% 45%', '--accent': '30 95% 52%', '--accent-foreground': '0 0% 100%', '--border': '150 10% 87%', '--input': '150 10% 87%', '--ring': '210 100% 20%', '--destructive': '0 84% 60%', '--destructive-foreground': '0 0% 100%', backgroundColor: 'hsl(150 14% 96%)' } as React.CSSProperties}>
      <img src={UZ_BANNER} alt="University of Zimbabwe" className="w-full h-auto object-cover" />
      <div className="flex-1 flex items-start justify-center px-3 py-4 md:px-4 md:py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
          <Link href="/login" className="inline-flex items-center text-xs md:text-sm text-muted-foreground hover:text-foreground mb-3 md:mb-4">
            <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1" />Back to login
          </Link>
          <div className="bg-card rounded-xl border shadow-lg overflow-hidden">
            <div className="h-1 md:h-1.5 bg-gradient-to-r from-primary via-primary to-accent w-full" />
            <div className="p-5 md:p-8">
              <div className="flex items-center gap-2.5 md:gap-3 mb-4 md:mb-6">
                <img src="https://i.imgur.com/CKgshar.png" alt="UZ" className="w-8 h-8 md:w-10 md:h-10" />
                <div>
                  <h1 className="text-lg md:text-xl font-bold text-foreground">Supervisor Registration</h1>
                  <p className="text-xs md:text-sm text-muted-foreground">Join WRL Connect as an industry supervisor</p>
                </div>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 md:space-y-4">
                {([
                  { name: "fullName", label: "Full Name", placeholder: "John Doe" },
                  { name: "email", label: "Email", placeholder: "john@company.co.zw", type: "email" },
                  { name: "phone", label: "Phone", placeholder: "+263 77 123 4567" },
                  { name: "jobTitle", label: "Job Title", placeholder: "Senior Engineer" },
                ] as const).map((f) => (
                  <div key={f.name}>
                    <Label className="text-xs md:text-sm">{f.label}</Label>
                    <Input {...register(f.name)} placeholder={f.placeholder} type={"type" in f ? f.type : "text"} className="mt-1 h-9 md:h-11 text-sm" />
                    {errors[f.name] && <p className="text-destructive text-xs mt-0.5">{errors[f.name]?.message}</p>}
                  </div>
                ))}
                <div>
                  <Label className="text-xs md:text-sm">Company</Label>
                  <Input {...register("company")} list="companies" placeholder="Select or type company name" className="mt-1 h-9 md:h-11 text-sm" />
                  <datalist id="companies">{companies.map((c) => <option key={c.id} value={c.name} />)}</datalist>
                  {errors.company && <p className="text-destructive text-xs mt-0.5">{errors.company.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  <div>
                    <Label className="text-xs md:text-sm">Password</Label>
                    <Input {...register("password")} type="password" className="mt-1 h-9 md:h-11 text-sm" />
                    {errors.password && <p className="text-destructive text-xs mt-0.5">{errors.password.message}</p>}
                  </div>
                  <div>
                    <Label className="text-xs md:text-sm">Confirm Password</Label>
                    <Input {...register("confirmPassword")} type="password" className="mt-1 h-9 md:h-11 text-sm" />
                    {errors.confirmPassword && <p className="text-destructive text-xs mt-0.5">{errors.confirmPassword.message}</p>}
                  </div>
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full h-9 md:h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs md:text-sm">
                  {isSubmitting ? "Registering..." : "Register"}
                </Button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
