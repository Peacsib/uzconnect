import { Suspense } from "react";
import HomePageContent from "@/components/auth/HomePageContent";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#001a33]" />}>
      <HomePageContent />
    </Suspense>
  );
}
