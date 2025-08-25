import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Container } from "react-bootstrap";
import {
  supabase,
  saveUserToDatabase,
  validateUserExists,
  logoutUser,
} from "./lib/supabase";
import type { Session } from "@supabase/supabase-js";

// Components
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import AnalyzePage from "./pages/AnalyzePage";
import ResultsPage from "./pages/ResultsPage";
import FeedbackPage from "./pages/FeedbackPage";
import AdminFeedbackPage from "./pages/AdminFeedbackPage";
import Navbar from "./components/Navbar";
import LoadingSpinner from "./components/LoadingSpinner";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingAuth, setProcessingAuth] = useState(false);

  // Complete authentication flow: authenticate -> save to backend -> validate
  const processAuthSession = async (session: Session | null) => {
    if (session?.user) {
      setProcessingAuth(true);

      try {
        console.log("Processing authentication for user:", session.user.email);

        // Step 1: Save user to backend database via API
        const userSaved = await saveUserToDatabase(session.user);

        if (!userSaved) {
          console.error("Failed to save user to backend database");
          await logoutUser("Failed to set up your account. Please try again.");
          setSession(null);
          setProcessingAuth(false);
          setLoading(false);
          return;
        }

        // Step 2: Validate user exists in backend database
        const userExists = await validateUserExists(session.user.id);

        if (!userExists) {
          console.error("User validation failed after saving");
          await logoutUser(
            "Your account setup failed. Please contact support if you believe this is an error."
          );
          setSession(null);
          setProcessingAuth(false);
          setLoading(false);
          return;
        }

        // Step 3: Set session if everything is successful
        console.log("User authentication and setup complete");
        setSession(session);
      } catch (error) {
        console.error("Authentication processing error:", error);
        await logoutUser(
          "An error occurred during authentication. Please try again."
        );
        setSession(null);
      }

      setProcessingAuth(false);
    } else {
      // No session, just set null
      setSession(session);
    }

    setLoading(false);
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      processAuthSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      processAuthSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading || processingAuth) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <div className="min-vh-100">
        {session && <Navbar session={session} />}
        <Container fluid className={session ? "p-0" : ""}>
          <Routes>
            {!session ? (
              <>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="*" element={<Navigate to="/auth" replace />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Dashboard />} />
                <Route path="/analyze" element={<AnalyzePage />} />
                <Route path="/results" element={<ResultsPage />} />
                <Route path="/feedback" element={<FeedbackPage />} />
                <Route path="/admin-feedback" element={<AdminFeedbackPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;
