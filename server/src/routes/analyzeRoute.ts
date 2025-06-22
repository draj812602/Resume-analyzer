import express from "express";
import { callMixtral } from "../openrouterService";
import { Request, Response } from "express";
import { log } from "console";

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

export default router;
