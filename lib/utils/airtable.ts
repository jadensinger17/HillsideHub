// Server-only — never import this in client components.
// Fetches all records from the Paperboy Ventures Airtable base.

const BASE_ID = "app5JTdvWR13ph7wj";
const TABLE_ID = "tblsDcdxyIorghMEx";

export interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
}

export async function fetchPaperboyCompanies(): Promise<AirtableRecord[]> {
  const apiKey = process.env.AIRTABLE_API_KEY;
  if (!apiKey) throw new Error("AIRTABLE_API_KEY is not set");

  const records: AirtableRecord[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`);
    if (offset) url.searchParams.set("offset", offset);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!res.ok) {
      throw new Error(`Airtable API error: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as {
      records: AirtableRecord[];
      offset?: string;
    };

    records.push(...data.records);
    offset = data.offset;
  } while (offset);

  return records;
}
