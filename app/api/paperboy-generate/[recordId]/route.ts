import { type NextRequest } from "next/server";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

const SCRIPTS_DIR = path.join(
  process.cwd(),
  "paperboy-ventures-one-pager",
  "scripts"
);
const TMP_DIR = path.join(process.cwd(), ".tmp");

function runScript(
  cmd: string[],
  onLine: (line: string) => void
): Promise<number> {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd[0], cmd.slice(1), {
      cwd: process.cwd(),
      env: { ...process.env, PYTHONUNBUFFERED: "1" },
    });

    const handleChunk = (chunk: Buffer) =>
      chunk
        .toString()
        .split("\n")
        .filter(Boolean)
        .forEach(onLine);

    proc.stdout.on("data", handleChunk);
    proc.stderr.on("data", handleChunk);
    proc.on("close", resolve);
    proc.on("error", reject);
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ recordId: string }> }
) {
  const { recordId } = await params;

  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID ?? "app5JTdvWR13ph7wj";
  const tableId = process.env.AIRTABLE_TABLE_NAME ?? "tblsDcdxyIorghMEx";

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(msg: string) {
        controller.enqueue(encoder.encode(`data: ${msg}\n\n`));
      }

      try {
        // Fetch the record from Airtable
        send(`Fetching record ${recordId} from Airtable...`);
        const res = await fetch(
          `https://api.airtable.com/v0/${baseId}/${tableId}/${recordId}`,
          { headers: { Authorization: `Bearer ${apiKey}` } }
        );
        if (!res.ok) throw new Error(`Airtable fetch failed: ${res.status}`);

        const raw = (await res.json()) as { fields: Record<string, string> };
        const fields = raw.fields;
        const nameParts = (fields["Contact Name"] ?? "").split(" ");

        const record = {
          id: recordId,
          company: fields["Company"] ?? "",
          first_name: nameParts[0] ?? "",
          last_name: nameParts.slice(1).join(" "),
          email: fields["Contact Email"] ?? "",
          website: fields["Website"] ?? "",
          message: fields["message"] ?? "",
          linkedin: "",
        };

        const slug = record.company.toLowerCase().replace(/[\s/]+/g, "-");
        fs.mkdirSync(TMP_DIR, { recursive: true });

        const researchPath = path.join(TMP_DIR, `${slug}_research.json`);
        const pdfPath = path.join(TMP_DIR, `${record.company}_one_pager.pdf`);

        // Step 2: Research
        send(`[2/3] Researching ${record.company}...`);
        const researchCode = await runScript(
          [
            "python3",
            path.join(SCRIPTS_DIR, "research_company.py"),
            "--record",
            JSON.stringify(record),
            "--output",
            researchPath,
          ],
          send
        );
        if (researchCode !== 0) { send("DONE_ERROR"); controller.close(); return; }

        // Step 3: Generate PDF
        send("[3/3] Generating PDF...");
        const pdfCode = await runScript(
          [
            "python3",
            path.join(SCRIPTS_DIR, "generate_one_pager.py"),
            "--research",
            researchPath,
            "--output",
            pdfPath,
          ],
          send
        );
        if (pdfCode !== 0) { send("DONE_ERROR"); controller.close(); return; }

        // Step 4: Upload to Airtable
        send("[4/4] Uploading to Airtable...");
        const uploadCode = await runScript(
          [
            "python3",
            path.join(SCRIPTS_DIR, "upload_to_airtable.py"),
            "--pdf",
            pdfPath,
            "--record-id",
            recordId,
          ],
          send
        );
        if (uploadCode !== 0) { send("DONE_ERROR"); controller.close(); return; }

        send(`Done! One-pager generated for ${record.company}.`);
        send("DONE_SUCCESS");
      } catch (e) {
        send(`ERROR: ${e instanceof Error ? e.message : String(e)}`);
        send("DONE_ERROR");
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
