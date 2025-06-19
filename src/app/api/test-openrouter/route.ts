import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "OPENROUTER_API_KEY not set in environment" }, { status: 500 });
  }

  try {
    // Example: Ping OpenRouter API (replace with a real endpoint if needed)
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
    });
    const data = await res.json();
    if (!res.ok) {
      return Response.json({ error: data.error || "Invalid API key or request failed" }, { status: res.status });
    }
    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
