"use client";

import React from "react";

export function CloudinaryImage({ src, alt, className }: { src: string; alt?: string; className?: string }) {
  return <img src={src} alt={alt || ""} className={className} />;
}
