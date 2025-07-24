import React from "react";
import { supabase } from "../supabaseClient";

const AuthPage: React.FC = () => {
  const handleGoogleSignUp = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }, // No redirectTo: let Supabase use its default callback
    });
  };

  // After successful sign up, in your Supabase callback handler (see below), redirect to the extension popup

  return (
    <div style={{ padding: 32, textAlign: "center" }}>
      <h2>Continue with Google</h2>
      <button
        style={{
          padding: "12px 32px",
          borderRadius: 20,
          background: "#cfe0f7",
          color: "#222",
          fontWeight: 600,
          fontSize: "1rem",
          border: "none",
          cursor: "pointer",
        }}
        onClick={handleGoogleSignUp}
      >
        Continue with Google
      </button>
    </div>
  );
};

export default AuthPage;
