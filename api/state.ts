import type { VercelRequest, VercelResponse } from "@vercel/node";

function setCors(res: VercelResponse): void {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, apikey, MCP-Protocol-Version",
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return res
      .status(500)
      .json({ success: false, error: "Missing SUPABASE_URL or SUPABASE_ANON_KEY" });
  }

  try {
    const endpoint = `${supabaseUrl}/functions/v1/make-server-ae24ed01/state`;
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${supabaseAnonKey}`,
        apikey: supabaseAnonKey,
      },
    });

    const text = await response.text();
    let payload: unknown = null;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = { success: false, error: text };
    }

    if (!response.ok) {
      const reason =
        (payload as { error?: string })?.error ??
        `Supabase state request failed (${response.status})`;
      return res.status(502).json({ success: false, error: reason });
    }

    return res.status(200).json(payload);
  } catch (error) {
    return res.status(502).json({
      success: false,
      error: `State proxy failed: ${String(error)}`,
    });
  }
}
