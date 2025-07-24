import express from "express";
import { callMixtral } from "../openrouterService";
import { Request, Response } from "express";
import { supabase } from "../supabaseClient";

const router = express.Router();

// POST /analyze
router.post("/", async (req: Request, res: Response) => {
  const { jobDescription, resume } = req.body;
  console.log(resume);

  if (!jobDescription || !resume) {
    return res
      .status(400)
      .json({ error: "jobDescription and resume are required." });
  }

  const prompt = `Job Description:\n${jobDescription}\n\nResume:\n${resume}\n\nPlease:\n1. Identify matched skills.\n2. List missing skills.\n3. Suggest resume improvements.`;

  try {
    const result = await callMixtral(prompt);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: "Failed to analyze resume." });
  }
});

router.post("/save-user", async (req, res) => {
  const { id, email, name, avatar_url } = req.body;

  if (!id || !email) return res.status(400).json({ error: "Missing fields" });

  // Upsert user into Supabase
  const { error } = await supabase
    .from("users")
    .upsert([{ id, email, name, avatar_url }], { onConflict: "id" });

  if (error) {
    console.error("Supabase upsert error:", error); // <-- Add this line
    return res.status(500).json({ error: error.message });
  }
  return res.json({ success: true });
});

router.get("/get-user/:id", async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return res.status(404).json({ error: "User not found" });
  return res.json(data);
});
export default router;
