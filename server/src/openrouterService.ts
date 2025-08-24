// server/src/openrouterService.ts
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

export async function callMixtral(prompt: string): Promise<string> {
  console.log(
    "🔑 OpenRouter API Key status:",
    process.env.OPENROUTER_API_KEY ? "Set" : "Missing"
  );
  console.log("📝 Prompt length:", prompt.length);

  if (!process.env.OPENROUTER_API_KEY) {
    console.error("❌ OPENROUTER_API_KEY is not set in environment variables");
    return "OpenRouter API key is not configured. Please set OPENROUTER_API_KEY in your .env file.";
  }

  try {
    console.log("🚀 Making request to OpenRouter...");
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistralai/mixtral-8x7b-instruct",
          messages: [
            {
              role: "system",
              content:
                "You are a resume tailoring assistant that compares resumes to job descriptions and provides skill matches, gaps, and improvement suggestions.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    console.log("📡 OpenRouter response status:", response.status);
    console.log("📡 OpenRouter response headers:", response.headers.raw());

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ OpenRouter API error:", response.status, errorText);
      return `OpenRouter API error (${response.status}): ${errorText}`;
    }

    const data = (await response.json()) as any;
    console.log("✅ OpenRouter response data:", JSON.stringify(data, null, 2));

    return data.choices?.[0]?.message?.content ?? "No response from Mixtral.";
  } catch (error) {
    console.error("❌ Error calling OpenRouter:", error);
    return `Error calling OpenRouter: ${
      error instanceof Error ? error.message : "Unknown error"
    }`;
  }
}
