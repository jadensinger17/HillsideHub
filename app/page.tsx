import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900">Hillside Hub</h1>
        <p className="text-gray-500 mt-2 text-lg">Internal platform for Hillside Ventures</p>
      </div>

      {user ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
          <Link
            href="/recruitment"
            className="group bg-white rounded-2xl border border-gray-200 p-8 hover:border-brand-500 hover:shadow-md transition-all"
          >
            <div className="text-3xl mb-4">📋</div>
            <h2 className="text-xl font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
              Recruitment
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              Review applicants, manage interviews, and make final decisions.
            </p>
          </Link>

          <Link
            href="/mid-semester"
            className="group bg-white rounded-2xl border border-gray-200 p-8 hover:border-brand-500 hover:shadow-md transition-all"
          >
            <div className="text-3xl mb-4">📊</div>
            <h2 className="text-xl font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
              Mid-Semester Report
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              Submit your mid-semester form or review all analyst reports.
            </p>
          </Link>
        </div>
      ) : (
        <Link
          href="/login"
          className="bg-brand-500 hover:bg-brand-600 text-white font-medium px-6 py-3 rounded-lg text-sm transition-colors"
        >
          Sign in to continue
        </Link>
      )}
    </div>
  );
}
