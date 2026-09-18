import { forwardRef } from "react";

// Cloudinary CDN URL for optimized UZ crest
const UZ_CREST = "https://res.cloudinary.com/dqbairwkx/image/upload/f_auto,q_auto,w_100/wrl-connect/static/uz-crest";

export const LoadingSpinner = forwardRef<HTMLDivElement, { size?: "sm" | "md" | "lg" }>(
  ({ size = "md" }, ref) => {
    const s = size === "sm" ? "w-6 h-6" : size === "lg" ? "w-14 h-14" : "w-10 h-10";
    return (
      <div ref={ref} className="flex items-center justify-center p-8">
        <img src={UZ_CREST} alt="Loading" className={`${s} animate-spin`} style={{ animationDuration: "2s" }} />
      </div>
    );
  }
);

LoadingSpinner.displayName = "LoadingSpinner";
