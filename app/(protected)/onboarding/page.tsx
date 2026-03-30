import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("semester")
    .eq("id", user.id)
    .single();

  // Already completed onboarding — send them to the hub
  if (profile?.semester != null) redirect("/");

  return (
    <div className="max-w-lg mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome to Hillside Hub</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Tell us a bit about yourself to get started.
        </p>
      </div>
      <OnboardingForm />
    </div>
  );
}
