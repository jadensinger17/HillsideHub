import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// POST /api/upload-resume
// Body: { applicantId: string, fileName: string }
// Returns: { uploadUrl: string, path: string }
export async function POST(request: Request) {
  // Verify the requester is an authenticated admin
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { applicantId, fileName } = await request.json();
  if (!applicantId || !fileName) {
    return NextResponse.json({ error: "Missing applicantId or fileName" }, { status: 400 });
  }

  const path = `resumes/${applicantId}/${fileName}`;
  const admin = createAdminClient();

  const { data, error } = await admin.storage
    .from("resumes")
    .createSignedUploadUrl(path);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ uploadUrl: data.signedUrl, path });
}
