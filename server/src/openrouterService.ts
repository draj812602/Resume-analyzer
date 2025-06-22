// server/src/openrouterService.ts
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

export async function callMixtral(prompt: string): Promise<string> {
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

  const data = (await response.json()) as any;
  return data.choices?.[0]?.message?.content ?? "No response from Mixtral.";
}
