import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ recordId: string }> }
) {
  const { recordId } = await params;
  const companyName = req.nextUrl.searchParams.get("name") ?? recordId;
  const supabase = createAdminClient();

  // Stream the PDF directly — avoids signed URL JWT clock-skew issues
  const { data, error } = await supabase.storage
    .from("one-pagers")
    .download(`${recordId}.pdf`);

  if (error || !data) {
    return NextResponse.json({ error: "PDF not found" }, { status: 404 });
  }

  const buffer = await data.arrayBuffer();
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="one-pager-${companyName}.pdf"`,
      "Cache-Control": "private, no-cache",
    },
  });
}
