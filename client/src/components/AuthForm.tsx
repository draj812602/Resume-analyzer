import React from "react";
import { SocialButton } from "./SocialButton";

export const AuthForm: React.FC = () => (
  <div className="auth-form">
    {/* Sign in buttons */}

    {/* <SocialButton
      provider="linkedin"
      label="Sign in with LinkedIn"
      variant="primary"
      type="signin"
      onClick={() => {
        // Placeholder: LinkedIn sign-in not implemented yet
        alert("LinkedIn sign-in coming soon!");
      }}
    /> */}

    {/* Separator */}

    {/* Sign up buttons */}
    <SocialButton
      provider="google"
      label="Continue with Google"
      variant="primary"
      type="signup"
    />
    {/* <SocialButton
      provider="linkedin"
      label="Sign up with LinkedIn"
      variant="secondary"
      type="signup"
      onClick={() => {
        // Placeholder: LinkedIn sign-up not implemented yet
        alert("LinkedIn sign-up coming soon!");
      }} */}
    {/* /> */}
  </div>
);
