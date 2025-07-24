import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

//const EXTENSION_ID = "kgbdjilalmchhhedckmmdbdbfohgdjlc"; // Replace with your extension ID

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string; // Change to your server URL

const AuthCallback: React.FC = () => {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    async function handleAuth() {
      // Get the current user from Supabase
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Save user to your backend DB
        await fetch(`${BACKEND_URL}/api/analyze/save-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || "",
            avatar_url: user.user_metadata?.avatar_url || "",
          }),
        });
        // Set flag for extension
        localStorage.setItem("resume-analyzer-auth-success", "true");
        localStorage.setItem(
          "resume-analyzer-user-name",
          user.user_metadata?.name || user.email
        );
        setSignedIn(true);
        window.postMessage(
          {
            type: "RESUME_ANALYZER_USER",
            id: user.id,
            name: user.user_metadata?.name || user.email,
          },
          window.location.origin
        );
      }
    }
    handleAuth();
  }, []);

  return (
    <div>
      {signedIn ? (
        <div>You are signed in! You can return to the extension.</div>
      ) : (
        <div>Signing you in...</div>
      )}
    </div>
  );
};

export default AuthCallback;
