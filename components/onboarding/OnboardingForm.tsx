"use client";

import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { submitOnboarding, type OnboardingInput } from "@/app/(protected)/onboarding/actions";

const schema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  semester: z.enum(["1st", "2nd", "3rd"], { required_error: "Select your semester" }),
  vertical: z.enum(
    ["financial_technology", "consumer_products", "sustainability", "sports_wellness"],
    { required_error: "Select your vertical" }
  ),
  fund_role: z.enum(
    ["recruitment_team", "portfolio_team", "modeling_team", "relations_team", "operations_team", "chief_of_staff"],
    { required_error: "Select your role" }
  ),
});

const SEMESTER_OPTIONS = [
  { value: "1st", label: "1st Semester Analyst" },
  { value: "2nd", label: "2nd Semester" },
  { value: "3rd", label: "3rd Semester" },
] as const;

const VERTICAL_OPTIONS = [
  { value: "financial_technology", label: "Financial Technology" },
  { value: "consumer_products", label: "Consumer Products" },
  { value: "sustainability", label: "Sustainability" },
  { value: "sports_wellness", label: "Sports and Wellness" },
] as const;

const FUND_ROLE_OPTIONS = [
  { value: "recruitment_team", label: "Recruitment Team" },
  { value: "portfolio_team", label: "Portfolio Team" },
  { value: "modeling_team", label: "Modeling Team" },
  { value: "relations_team", label: "Relations Team" },
  { value: "operations_team", label: "Operations Team" },
  { value: "chief_of_staff", label: "Chief of Staff" },
] as const;

function RadioCardGroup({
  options,
  value,
  onChange,
  error,
  cols = 2,
}: {
  options: readonly { value: string; label: string }[];
  value: string | undefined;
  onChange: (v: string) => void;
  error?: string;
  cols?: 2 | 3;
}) {
  return (
    <div>
      <div className={cn("grid gap-2", cols === 3 ? "grid-cols-3" : "grid-cols-2")}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "px-4 py-3 rounded-lg border text-sm font-medium text-left transition-colors",
              value === opt.value
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function OnboardingForm() {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(schema),
  });

  function onSubmit(data: OnboardingInput) {
    startTransition(async () => {
      try {
        await submitOnboarding(data);
      } catch (err: unknown) {
        // Re-throw Next.js redirect errors so the router can handle navigation
        if (err && typeof err === "object" && "digest" in err) throw err;
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 bg-white rounded-xl border border-gray-200 p-8"
    >
      {/* Full Name */}
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1.5">
          Full Name
        </label>
        <input
          id="full_name"
          type="text"
          {...register("full_name")}
          placeholder="Jane Smith"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
        {errors.full_name && (
          <p className="mt-1.5 text-xs text-red-600">{errors.full_name.message}</p>
        )}
      </div>

      {/* Semester */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          What semester in the fund are you?
        </label>
        <Controller
          name="semester"
          control={control}
          render={({ field }) => (
            <RadioCardGroup
              options={SEMESTER_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={errors.semester?.message}
              cols={3}
            />
          )}
        />
      </div>

      {/* Vertical */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          What vertical are you a part of?
        </label>
        <Controller
          name="vertical"
          control={control}
          render={({ field }) => (
            <RadioCardGroup
              options={VERTICAL_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={errors.vertical?.message}
            />
          )}
        />
      </div>

      {/* Fund Role */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          What is your role?
        </label>
        <Controller
          name="fund_role"
          control={control}
          render={({ field }) => (
            <RadioCardGroup
              options={FUND_ROLE_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={errors.fund_role?.message}
            />
          )}
        />
      </div>

      <div className="pt-2 border-t border-gray-100">
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
        >
          {isPending && (
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          )}
          {isPending ? "Saving…" : "Continue to Hillside Hub"}
        </button>
      </div>
    </form>
  );
}
