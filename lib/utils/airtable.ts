// Server-only — never import this in client components.
// Fetches all records from the Paperboy Ventures Airtable base.

const BASE_ID = "app5JTdvWR13ph7wj";
const TABLE_ID = "tblsDcdxyIorghMEx";

export interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
}

// Simple in-memory cache to avoid hammering Airtable on every request
let cachedRecords: AirtableRecord[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function fetchPaperboyCompanies(): Promise<AirtableRecord[]> {
  // Return cached data if fresh
  if (cachedRecords && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedRecords;
  }

  const apiKey = process.env.AIRTABLE_API_KEY;
  if (!apiKey) {
    console.error("AIRTABLE_API_KEY is not set");
    return cachedRecords ?? [];
  }

  const records: AirtableRecord[] = [];
  let offset: string | undefined;

  try {
    do {
      const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`);
      if (offset) url.searchParams.set("offset", offset);

      let res: Response | undefined;
      for (let attempt = 0; attempt < 5; attempt++) {
        res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${apiKey}` },
          cache: "no-store",
        });
        if (res.status !== 429) break;
        // Exponential backoff: 2s, 4s, 8s, 16s, 32s
        await new Promise((r) => setTimeout(r, 2000 * Math.pow(2, attempt)));
      }

      if (!res || !res.ok) {
        console.error(`Airtable API error: ${res?.status} ${res?.statusText}`);
        return cachedRecords ?? [];
      }

      const data = (await res.json()) as {
        records: AirtableRecord[];
        offset?: string;
      };

      records.push(...data.records);
      offset = data.offset;
    } while (offset);
  } catch (err) {
    console.error("Airtable fetch failed:", err);
    return cachedRecords ?? [];
  }

  // Update cache
  cachedRecords = records;
  cacheTimestamp = Date.now();

  return records;
}
