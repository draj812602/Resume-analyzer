import React, { useEffect, useState } from "react";
import { AuthForm } from "./AuthForm";
import { supabase } from "../supabaseClient";
import "../auth.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string;

type UserDetails = {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
};

export const AuthLandingPage: React.FC = () => {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [localName, setLocalName] = useState<string | null>(null);

  // 1. Try to get userName from chrome.storage.local (extension context)
  useEffect(() => {
    if (
      typeof chrome !== "undefined" &&
      chrome.storage &&
      chrome.storage.local
    ) {
      chrome.storage.local.get(["userName"], (result) => {
        if (result.userName) {
          setLocalName(result.userName);
        }
      });
    }
  }, []);

  // 2. If not found, fall back to Supabase user check (web context)
  useEffect(() => {
    if (!localName) {
      supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (user) {
          const mappedUser: UserDetails = {
            id: user.id,
            email: user.email ?? "",
            name: user.user_metadata?.name,
            avatar_url: user.user_metadata?.avatar_url,
          };
          setUser(mappedUser);

          // Fetch user details from backend
          const res = await fetch(`${BACKEND_URL}/api/get-user/${user.id}`);
          if (res.ok) {
            const details: UserDetails = await res.json();
            setUserDetails(details);
          }
        }
      });
    }
  }, [localName]);

  return (
    <div className="auth-landing-container">
      <h1 className="auth-title">Resume Analyzer</h1>
      {localName ? (
        <div className="auth-success-message">Welcome, {localName}!</div>
      ) : user && userDetails ? (
        <div className="auth-success-message">
          Welcome, {userDetails.name || userDetails.email}!
        </div>
      ) : (
        <AuthForm />
      )}
    </div>
  );
};
