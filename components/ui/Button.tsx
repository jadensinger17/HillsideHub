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
        "inline-flex items-center justify-center font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        {
          "bg-brand-500 hover:bg-brand-600 text-white": variant === "primary",
          "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300": variant === "secondary",
          "bg-red-600 hover:bg-red-700 text-white": variant === "danger",
          "hover:bg-gray-100 text-gray-700": variant === "ghost",
        },
        {
          "px-3 py-1.5 text-xs": size === "sm",
          "px-4 py-2 text-sm": size === "md",
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
