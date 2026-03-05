"use client";

import { useState } from "react";
import { updateResumePathAction } from "@/app/(protected)/recruitment/actions";

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);

  async function upload(
    applicantId: string,
    file: File
  ): Promise<{ success: boolean; path?: string; error?: string }> {
    setUploading(true);
    try {
      // Step 1: Get a signed upload URL from the server
      const res = await fetch("/api/upload-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicantId, fileName: file.name }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        return { success: false, error };
      }

      const { uploadUrl, path } = await res.json();

      // Step 2: Upload directly to Supabase Storage using the signed URL
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        return { success: false, error: "Upload to storage failed" };
      }

      // Step 3: Save the storage path to the applicant record
      await updateResumePathAction(applicantId, path);

      return { success: true, path };
    } catch (err) {
      return { success: false, error: String(err) };
    } finally {
      setUploading(false);
    }
  }

  return { upload, uploading };
}
