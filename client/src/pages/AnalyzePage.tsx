import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Card,
} from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Resume } from "../lib/supabase";

const AnalyzePage: React.FC = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const checkUserResume = useCallback(async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (user) {
        const { data: resumeData, error: resumeError } = await supabase
          .from("resumes")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (resumeError && resumeError.code !== "PGRST116") {
          throw resumeError;
        }

        if (!resumeData) {
          setError("No resume found. Please upload a resume first.");
          setTimeout(() => navigate("/"), 3000);
          return;
        }

        setResume(resumeData);
      }
    } catch (error) {
      console.error("Error checking resume:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load resume"
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    checkUserResume();

    // Check if there's a pre-filled job description from navigation state
    const prefilledJobDescription = location.state?.prefilledJobDescription;
    if (prefilledJobDescription) {
      setJobDescription(prefilledJobDescription);
    }
  }, [location, checkUserResume]);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError("Please paste a job description");
      return;
    }

    if (!resume) {
      setError("No resume found. Please upload a resume first.");
      return;
    }

    try {
      setAnalyzing(true);
      setError(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (!user) {
        throw new Error("No authenticated user");
      }

      // Save job description
      const { data: jobData, error: jobError } = await supabase
        .from("job_descriptions")
        .insert([
          {
            user_id: user.id,
            title: "Job Analysis",
            content_raw: jobDescription.trim(),
            source: "manual_paste",
          },
        ])
        .select()
        .single();

      if (jobError) throw jobError;

      // Call backend analysis API
      const response = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription: jobDescription.trim(),
          resume: resume.content_raw,
          resumeId: resume.id,
          jobDescriptionId: jobData.id,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const responseData = await response.json();

      if (!responseData.success) {
        throw new Error(responseData.error || "Analysis failed");
      }

      // Navigate to results page with analysis data
      navigate("/results", {
        state: {
          analysisResult: responseData.analysis,
          jobDescription: jobData,
          resume,
        },
      });
    } catch (error) {
      console.error("Analysis error:", error);
      setError(error instanceof Error ? error.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} lg={8}>
          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          <div className="text-center mb-5">
            <h1 className="fw-bold mb-3">Paste Job Description</h1>
          </div>

          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAnalyze();
                }}
              >
                <Form.Group className="mb-4">
                  <Form.Control
                    as="textarea"
                    rows={12}
                    placeholder="Paste the job description here"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="border-0 bg-light"
                    style={{
                      fontSize: "1rem",
                      resize: "none",
                    }}
                  />
                </Form.Group>

                <div className="text-center">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={analyzing || !jobDescription.trim()}
                    className="px-5"
                  >
                    {analyzing ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        />
                        Analyzing...
                      </>
                    ) : (
                      "Analyze"
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          {resume && (
            <div className="mt-4">
              <Card className="border-0 bg-light">
                <Card.Body className="p-3">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-file-earmark-text text-primary me-2"></i>
                    <small className="text-muted">
                      Using resume: <strong>{resume.title}</strong>
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default AnalyzePage;
