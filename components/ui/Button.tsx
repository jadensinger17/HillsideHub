import { cn } from "@/lib/utils/cn";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-lg",
        "transition-all duration-150 ease-out",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
        {
          // Primary — navy shadow tinted to brand
          "bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white shadow-[0_1px_3px_rgba(0,119,181,0.3)] hover:shadow-[0_2px_8px_rgba(0,119,181,0.35)] focus-visible:ring-brand-500":
            variant === "primary",
          // Secondary — clean bordered
          "bg-white hover:bg-surface-subtle active:bg-surface-muted text-gray-700 border border-surface-border shadow-card hover:shadow-card-hover focus-visible:ring-gray-400":
            variant === "secondary",
          // Danger
          "bg-red-500 hover:bg-red-600 active:bg-red-700 text-white shadow-[0_1px_3px_rgba(239,68,68,0.25)] focus-visible:ring-red-500":
            variant === "danger",
          // Ghost — no background until hover
          "hover:bg-surface-muted active:bg-surface-border text-gray-600 hover:text-gray-900 focus-visible:ring-gray-400":
            variant === "ghost",
        },
        {
          "px-3 py-1.5 text-xs gap-1.5": size === "sm",
          "px-4 py-2 text-sm gap-2":     size === "md",
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
