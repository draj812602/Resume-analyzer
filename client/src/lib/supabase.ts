import { createClient } from "@supabase/supabase-js";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// User management functions - using backend API
export const saveUserToDatabase = async (
  user: SupabaseUser
): Promise<boolean> => {
  try {
    const userData = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.user_metadata?.name,
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
    };

    console.log("Saving user to backend:", userData);

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const response = await fetch(`${apiUrl}/api/analyze/save-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save user: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log("User save result:", result);
    return result.success;
  } catch (error) {
    console.error("Error saving user to database:", error);
    return false;
  }
};

export const validateUserExists = async (userId: string): Promise<boolean> => {
  try {
    console.log("Validating user exists:", userId);

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const response = await fetch(`${apiUrl}/api/analyze/get-user/${userId}`);

    if (response.status === 404) {
      console.log("User not found in database");
      return false;
    }

    if (!response.ok) {
      throw new Error(`Failed to validate user: ${response.status}`);
    }

    const userData = await response.json();
    console.log("User validation result:", userData);
    return true;
  } catch (error) {
    console.error("Error validating user:", error);
    return false;
  }
};

// Authentication helper
export const logoutUser = async (message?: string) => {
  try {
    await supabase.auth.signOut();
    if (message) {
      // Store message in localStorage to display after logout
      localStorage.setItem("logout_message", message);
    }
  } catch (error) {
    console.error("Error during logout:", error);
  }
};

// Database types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  content_raw: string;
  content_json?: Record<string, unknown>;
  created_at: string;
}

export interface JobDescription {
  id: string;
  user_id: string;
  source?: string;
  title?: string;
  content_raw: string;
  parsed_data?: Record<string, unknown>;
  created_at: string;
}

export interface TailoringSession {
  id: string;
  user_id: string;
  resume_id: string;
  job_id: string;
  matched_skills?: Record<string, unknown>;
  tailored_resume?: string;
  feedback_notes?: string;
  created_at: string;
}

// Check if user is admin
export const checkUserAdmin = async (userId: string): Promise<boolean> => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const response = await fetch(`${apiUrl}/api/analyze/check-admin/${userId}`);

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    return result.success && result.isAdmin;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

// Submit feedback
export const submitFeedback = async (
  userId: string,
  message: string
): Promise<boolean> => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const response = await fetch(`${apiUrl}/api/analyze/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        message,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to submit feedback");
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return false;
  }
};

// Get all feedback (admin only)
export const getAllFeedback = async (adminUserId: string): Promise<any[]> => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const response = await fetch(
      `${apiUrl}/api/analyze/feedback/${adminUserId}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch feedback");
    }

    const result = await response.json();
    return result.success ? result.feedback : [];
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return [];
  }
};
