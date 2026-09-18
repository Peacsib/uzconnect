"use client";

import { useState } from "react";
import { Header } from "@/components/common/Header";
import { AppSidebar } from "@/components/common/Sidebar";
import { BottomNav } from "@/components/common/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="lg:ml-60 pb-20 lg:pb-6 pt-4 px-4 md:px-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
