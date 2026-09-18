"use client";
import React from "react";
export function ProtectedRoute({ children }: { children: React.ReactNode; allowedRoles?: string[] }) {
  return <>{children}</>;
}
