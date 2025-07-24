import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import AuthCallback from "./pages/AuthCallback";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          path="/"
          element={
            <div style={{ padding: 32, textAlign: "center" }}>
              <h1>Resume Analyzer Web App</h1>
              <p>Welcome! This is the web version of your Resume Analyzer.</p>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
