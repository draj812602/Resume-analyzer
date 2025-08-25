import express from "express";
import { callMixtral } from "../openrouterService";
import { Request, Response } from "express";
import { getSupabase } from "../supabaseClient";

const router = express.Router();

// POST /analyze
router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { jobDescription, resume } = req.body;
  console.log(resume);

  if (!jobDescription || !resume) {
    res.status(400).json({ error: "jobDescription and resume are required." });
    return;
  }

  const prompt = `You are a professional resume analyzer. Analyze the following resume against the job description and provide a detailed analysis.

Job Description:
${jobDescription}

Resume:
${resume}

Please provide your analysis in the following JSON format:
{
  "skillsMatchPercentage": <number between 0-100>,
  "matchedSkills": ["skill1", "skill2", ...],
  "missingSkills": ["skill1", "skill2", ...],
  "improvementSuggestions": ["suggestion1", "suggestion2", ...],
  "overallFeedback": "detailed feedback about the resume quality and fit",
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...]
}

Ensure the response is valid JSON only, no additional text.`;

  try {
    console.log("Calling AI for resume analysis...");
    const result = await callMixtral(prompt);

    // Try to parse the AI response as JSON
    let analysisResult;
    try {
      analysisResult = JSON.parse(result);
    } catch (parseError) {
      console.warn("AI response is not valid JSON, using raw text");
      // Fallback to structured response with raw text
      analysisResult = {
        skillsMatchPercentage: 75,
        matchedSkills: [],
        missingSkills: [],
        improvementSuggestions: [],
        overallFeedback: result,
        strengths: [],
        weaknesses: [],
      };
    }

    console.log("Analysis complete:", analysisResult);

    // Save analysis result to TailoringSession table
    try {
      const { resumeId, jobDescriptionId, userId } = req.body;

      if (resumeId && jobDescriptionId && userId) {
        console.log("Saving analysis to TailoringSession...");

        const supabase = getSupabase();
        const { data: sessionData, error: sessionError } = await supabase
          .from("tailoring_sessions")
          .insert([
            {
              user_id: userId,
              resume_id: resumeId,
              job_id: jobDescriptionId,
              matched_skills: {
                matchedSkills: analysisResult.matchedSkills,
                missingSkills: analysisResult.missingSkills,
                skillsMatchPercentage: analysisResult.skillsMatchPercentage,
              },
              feedback_notes: JSON.stringify(analysisResult),
              tailored_resume: analysisResult.overallFeedback,
            },
          ])
          .select()
          .single();

        if (sessionError) {
          console.warn("Failed to save analysis session:", sessionError);
        } else {
          console.log("Analysis session saved:", sessionData.id);
        }
      }
    } catch (saveError) {
      console.warn("Error saving analysis session:", saveError);
      // Don't fail the main request if saving fails
    }

    res.json({ success: true, analysis: analysisResult });
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({ error: "Failed to analyze resume." });
  }
});

router.post(
  "/save-user",
  async (req: Request, res: Response): Promise<void> => {
    const { id, email, name, avatar_url } = req.body;

    console.log("Received save-user request:", { id, email, name, avatar_url });

    if (!id || !email) {
      console.error("Missing required fields:", { id: !!id, email: !!email });
      res.status(400).json({ error: "Missing required fields: id and email" });
      return;
    }

    try {
      const supabase = getSupabase();
      console.log("Attempting to upsert user to database...");

      const { data, error } = await supabase
        .from("users")
        .upsert([{ id, email, name, avatar_url }], { onConflict: "id" })
        .select();

      if (error) {
        console.error("Supabase upsert error:", error);
        res.status(500).json({ error: error.message });
        return;
      }

      console.log("User upsert successful:", data);
      res.json({ success: true, user: data[0] });
    } catch (e: any) {
      console.error("Server error in save-user:", e);
      res.status(500).json({ error: e?.message ?? "Internal server error" });
    }
  }
);

router.get(
  "/get-user/:id",
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    console.log("Received get-user request for ID:", id);

    if (!id) {
      res.status(400).json({ error: "User ID is required" });
      return;
    }

    try {
      const supabase = getSupabase();
      console.log("Querying database for user...");

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      if (error && error.code === "PGRST116") {
        console.log("User not found in database");
        res.status(404).json({ error: "User not found" });
        return;
      }

      if (error) {
        console.error("Database query error:", error);
        res.status(500).json({ error: error.message });
        return;
      }

      console.log("User found:", data);
      res.json(data);
    } catch (e: any) {
      console.error("Server error in get-user:", e);
      res.status(500).json({ error: e?.message ?? "Internal server error" });
    }
  }
);

router.get("/health", (req: Request, res: Response) => {
  console.log("Health check endpoint called");
  res.json({
    status: "Server is running",
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 8000,
  });
});

// Get recent analyses for a user
router.get(
  "/recent-analyses/:userId",
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;

    console.log("Fetching recent analyses for user:", userId);

    if (!userId) {
      res.status(400).json({ error: "User ID is required" });
      return;
    }

    try {
      const supabase = getSupabase();

      const { data: analyses, error } = await supabase
        .from("tailoring_sessions")
        .select(
          `
          id,
          created_at,
          matched_skills,
          feedback_notes,
          job_descriptions!inner(
            id,
            title,
            content_raw
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) {
        console.error("Error fetching analyses:", error);
        res.status(500).json({ error: error.message });
        return;
      }

      console.log("Recent analyses fetched:", analyses?.length || 0);
      res.json({ success: true, analyses: analyses || [] });
    } catch (error) {
      console.error("Server error fetching analyses:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Delete analysis
router.delete(
  "/analysis/:analysisId",
  async (req: Request, res: Response): Promise<void> => {
    const { analysisId } = req.params;

    console.log("Deleting analysis:", analysisId);

    if (!analysisId) {
      res.status(400).json({ error: "Analysis ID is required" });
      return;
    }

    try {
      const supabase = getSupabase();

      const { error } = await supabase
        .from("tailoring_sessions")
        .delete()
        .eq("id", analysisId);

      if (error) {
        console.error("Error deleting analysis:", error);
        res.status(500).json({ error: error.message });
        return;
      }

      console.log("Analysis deleted successfully:", analysisId);
      res.json({ success: true });
    } catch (error) {
      console.error("Server error deleting analysis:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Admin check endpoint
router.get(
  "/check-admin/:userId",
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;

    try {
      const supabase = getSupabase();
      const { data: user, error } = await supabase
        .from("users")
        .select("isAdmin")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error checking admin status:", error);
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json({
        success: true,
        isAdmin: user.isAdmin === true,
      });
    } catch (error) {
      console.error("Error checking admin status:", error);
      res.status(500).json({ error: "Failed to check admin status" });
    }
  }
);

// Submit feedback endpoint
router.post("/feedback", async (req: Request, res: Response): Promise<void> => {
  const { userId, message } = req.body;

  if (!userId || !message) {
    res.status(400).json({ error: "userId and message are required" });
    return;
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("feedback")
      .insert([
        {
          user_id: userId,
          message: message.trim(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, feedback: data });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
});

// Get all feedback (admin only)
router.get(
  "/feedback/:adminUserId",
  async (req: Request, res: Response): Promise<void> => {
    const { adminUserId } = req.params;

    try {
      const supabase = getSupabase();

      // First check if user is admin
      const { data: adminUser, error: adminError } = await supabase
        .from("users")
        .select("isAdmin")
        .eq("id", adminUserId)
        .single();

      if (adminError || !adminUser?.isAdmin) {
        res.status(403).json({ error: "Unauthorized. Admin access required." });
        return;
      }

      // Get all feedback with user information
      const { data: feedback, error } = await supabase
        .from("feedback")
        .select(
          `
        id,
        message,
        created_at,
        users!inner(id, email, name)
      `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      res.json({ success: true, feedback: feedback || [] });
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  }
);

export default router;
