import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Modal,
  Form,
  Dropdown,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Resume } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";
import ResumeUpload from "../components/ResumeUpload";

interface Analysis {
  id: string;
  created_at: string;
  matched_skills?: {
    skillsMatchPercentage?: number;
    matchedSkills?: string[];
    missingSkills?: string[];
  };
  feedback_notes?: string;
  tailored_resume?: string;
  job_descriptions?: {
    id: string;
    title: string;
    content_raw: string;
  };
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>([]);
  const [loadingAnalyses, setLoadingAnalyses] = useState(false);
  const navigate = useNavigate();

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      setUser(user);
      setImageLoadError(false); // Reset image error state when user data loads
      console.log("User data:", user);
      console.log("Avatar URL:", user?.user_metadata?.avatar_url);
      console.log("Picture URL:", user?.user_metadata?.picture);

      // Check if user has a resume
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

        setResume(resumeData);

        // Load recent analyses
        await loadRecentAnalyses(user.id);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load user data"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const loadRecentAnalyses = async (userId: string) => {
    try {
      setLoadingAnalyses(true);

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:8000"
        }/api/analyze/recent-analyses/${userId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch analyses");
      }

      const data = await response.json();

      if (data.success) {
        setRecentAnalyses(data.analyses || []);
      }
    } catch (error) {
      console.error("Error loading recent analyses:", error);
      // Don't show error for analyses - it's not critical
    } finally {
      setLoadingAnalyses(false);
    }
  };

  const handleResumeUploaded = (newResume: Resume) => {
    setResume(newResume);
  };

  const handleAnalyzeClick = () => {
    navigate("/analyze");
  };

  const handleEditClick = () => {
    if (resume) {
      setEditTitle(resume.title);
      setEditContent(resume.content_raw);
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!resume) return;

    try {
      setSaving(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from("resumes")
        .update({
          title: editTitle.trim(),
          content_raw: editContent.trim(),
        })
        .eq("id", resume.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setResume(data);
      setShowEditModal(false);
      setError(null);
    } catch (error) {
      console.error("Error updating resume:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update resume"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!resume) return;

    try {
      setDeleting(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from("resumes")
        .delete()
        .eq("id", resume.id);

      if (deleteError) throw deleteError;

      setResume(null);
      setShowDeleteConfirm(false);
      setError(null);
    } catch (error) {
      console.error("Error deleting resume:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete resume"
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleViewAnalysis = (analysis: Analysis) => {
    // Parse the stored analysis result
    let analysisResult;
    try {
      analysisResult = JSON.parse(analysis.feedback_notes || "{}");
    } catch {
      // Fallback if parsing fails
      analysisResult = {
        skillsMatchPercentage:
          analysis.matched_skills?.skillsMatchPercentage || 0,
        matchedSkills: analysis.matched_skills?.matchedSkills || [],
        missingSkills: analysis.matched_skills?.missingSkills || [],
        improvementSuggestions: [],
        overallFeedback: analysis.tailored_resume || "No feedback available",
        strengths: [],
        weaknesses: [],
      };
    }

    // Navigate to results page with the stored analysis
    navigate("/results", {
      state: {
        analysisResult,
        jobDescription: analysis.job_descriptions,
        resume,
      },
    });
  };

  const handleAnalyzeAgain = (jobDescription: { content_raw: string }) => {
    // Navigate to analyze page with job description pre-filled
    navigate("/analyze", {
      state: {
        prefilledJobDescription: jobDescription.content_raw,
      },
    });
  };

  const handleDeleteAnalysis = async (analysisId: string) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:8000"
        }/api/analyze/analysis/${analysisId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete analysis");
      }

      // Refresh the analyses list
      if (user) {
        await loadRecentAnalyses(user.id);
      }
    } catch (error) {
      console.error("Error deleting analysis:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete analysis"
      );
    }
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return "success";
    if (percentage >= 60) return "warning";
    return "danger";
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

  const avatarUrl =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const userName =
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.email ||
    "User";

  return (
    <div className="dashboard-container">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} lg={10}>
            {error && (
              <Alert variant="danger" className="fade-in mb-4">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </Alert>
            )}

            {/* Professional User Welcome Section */}
            <div className="dashboard-header fade-in-up">
              <div className="text-center">
                <div className="user-avatar-container mb-4">
                  {avatarUrl && !imageLoadError ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="rounded-circle user-avatar"
                      width="100"
                      height="100"
                      onError={() => {
                        console.log("Failed to load avatar image:", avatarUrl);
                        setImageLoadError(true);
                      }}
                    />
                  ) : (
                    <div
                      className="rounded-circle user-initials mx-auto"
                      style={{ width: "100px", height: "100px" }}
                    >
                      <span className="fs-1">
                        {userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <h1 className="page-title mb-2">{userName}</h1>
                <p className="page-subtitle">
                  Welcome back to your resume analyzer dashboard
                </p>
              </div>
            </div>

            {/* Professional Resume Section */}
            <div className="content-section fade-in">
              <h3 className="form-section-title">Your Resume</h3>

              {resume ? (
                <div className="resume-card">
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="fw-bold mb-1 text-success">
                          <i className="bi bi-check-circle-fill me-2"></i>
                          {resume.title}
                        </h5>
                        <small className="text-muted">
                          <i className="bi bi-calendar me-1"></i>
                          Uploaded on{" "}
                          {new Date(resume.created_at).toLocaleDateString()}
                        </small>
                      </div>
                      <Dropdown>
                        <Dropdown.Toggle
                          variant="outline-secondary"
                          size="sm"
                          className="border-0 shadow-sm"
                        >
                          <i className="bi bi-three-dots"></i>
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="shadow-lg">
                          <Dropdown.Item onClick={handleEditClick}>
                            <i className="bi bi-pencil me-2"></i>
                            Edit Resume
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item
                            onClick={handleDeleteClick}
                            className="text-danger"
                          >
                            <i className="bi bi-trash me-2"></i>
                            Delete Resume
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>

                    <div className="mb-4">
                      <small className="text-muted fw-medium">Preview:</small>
                      <div className="resume-preview mt-2">
                        {resume.content_raw.substring(0, 300)}...
                      </div>
                    </div>

                    <div className="d-grid">
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={handleAnalyzeClick}
                        className="action-button action-button-primary"
                      >
                        <i className="bi bi-play-fill me-2"></i>
                        Start Analysis
                      </Button>
                    </div>
                  </Card.Body>
                </div>
              ) : (
                <div className="empty-state">
                  <i className="bi bi-file-earmark-text empty-state-icon"></i>
                  <h5 className="empty-state-title">No Resume Found</h5>
                  <p className="empty-state-description">
                    Upload your resume to start analyzing it against job
                    descriptions and get professional insights.
                  </p>
                  <div className="d-flex justify-content-center">
                    <ResumeUpload onUploadSuccess={handleResumeUploaded} />
                  </div>
                  <div className="mt-3">
                    <small className="text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      Supported formats: PDF, DOCX, TXT
                    </small>
                  </div>
                </div>
              )}
            </div>

            {/* Professional Recent Analyses Section */}
            {resume && (
              <div className="content-section fade-in">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="form-section-title mb-0">
                    <i className="bi bi-graph-up me-2 text-primary"></i>
                    Recent Analyses
                  </h3>
                  {recentAnalyses.length > 0 && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleAnalyzeClick}
                      className="action-button-secondary"
                    >
                      <i className="bi bi-plus me-1"></i>
                      New Analysis
                    </Button>
                  )}
                </div>

                {loadingAnalyses ? (
                  <div className="loading-content text-center py-5">
                    <div className="loading-spinner-enhanced mx-auto"></div>
                    <p className="text-muted mb-0">
                      Loading recent analyses...
                    </p>
                  </div>
                ) : recentAnalyses.length > 0 ? (
                  <div className="row g-3">
                    {recentAnalyses.map((analysis, index) => {
                      const matchPercentage =
                        analysis.matched_skills?.skillsMatchPercentage || 0;
                      const jobTitle =
                        analysis.job_descriptions?.title ||
                        `Analysis ${index + 1}`;
                      const analysisDate = new Date(
                        analysis.created_at
                      ).toLocaleDateString();

                      return (
                        <div key={analysis.id} className="col-12">
                          <Card className="border-0 shadow-sm h-100">
                            <Card.Body className="p-3">
                              <div className="d-flex justify-content-between align-items-start">
                                <div className="flex-grow-1">
                                  <div className="d-flex align-items-center mb-2">
                                    <h6 className="fw-bold mb-0 me-3">
                                      {jobTitle}
                                    </h6>
                                    <span
                                      className={`badge bg-${getMatchColor(
                                        matchPercentage
                                      )}`}
                                    >
                                      {matchPercentage}% Match
                                    </span>
                                  </div>
                                  <small className="text-muted">
                                    <i className="bi bi-calendar me-1"></i>
                                    {analysisDate}
                                  </small>
                                </div>
                                <Dropdown>
                                  <Dropdown.Toggle
                                    variant="outline-secondary"
                                    size="sm"
                                  >
                                    <i className="bi bi-three-dots"></i>
                                  </Dropdown.Toggle>
                                  <Dropdown.Menu>
                                    <Dropdown.Item
                                      onClick={() =>
                                        handleViewAnalysis(analysis)
                                      }
                                    >
                                      <i className="bi bi-eye me-2"></i>
                                      View Details
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                      onClick={() =>
                                        analysis.job_descriptions &&
                                        handleAnalyzeAgain(
                                          analysis.job_descriptions
                                        )
                                      }
                                    >
                                      <i className="bi bi-arrow-clockwise me-2"></i>
                                      Analyze Again
                                    </Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item
                                      onClick={() =>
                                        handleDeleteAnalysis(analysis.id)
                                      }
                                      className="text-danger"
                                    >
                                      <i className="bi bi-trash me-2"></i>
                                      Delete Analysis
                                    </Dropdown.Item>
                                  </Dropdown.Menu>
                                </Dropdown>
                              </div>
                            </Card.Body>
                          </Card>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <Card className="border-2 border-dashed text-center">
                    <Card.Body className="p-4">
                      <div className="mb-3">
                        <i
                          className="bi bi-graph-up text-muted"
                          style={{ fontSize: "2rem" }}
                        ></i>
                      </div>
                      <h6 className="fw-bold mb-2">No Analyses Yet</h6>
                      <p className="text-muted mb-3">
                        Start your first resume analysis to see results here.
                      </p>
                      <Button variant="primary" onClick={handleAnalyzeClick}>
                        <i className="bi bi-play-fill me-1"></i>
                        Start Analysis
                      </Button>
                    </Card.Body>
                  </Card>
                )}
              </div>
            )}
          </Col>
        </Row>

        {/* Edit Resume Modal */}
        <Modal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Edit Resume</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Resume Title</Form.Label>
                <Form.Control
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Enter resume title"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Resume Content</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={15}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Paste your resume content here"
                />
                <Form.Text className="text-muted">
                  You can edit the text content of your resume here.
                </Form.Text>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveEdit}
              disabled={saving || !editTitle.trim() || !editContent.trim()}
            >
              {saving ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          show={showDeleteConfirm}
          onHide={() => setShowDeleteConfirm(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title className="text-danger">Delete Resume</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="text-center">
              <i className="bi bi-exclamation-triangle-fill text-danger fs-1 mb-3"></i>
              <h5>Are you sure you want to delete this resume?</h5>
              <p className="text-muted">
                This action cannot be undone. All associated analyses will also
                be deleted.
              </p>
              {resume && (
                <div className="bg-light p-3 rounded mt-3">
                  <strong>{resume.title}</strong>
                  <br />
                  <small className="text-muted">
                    Uploaded on{" "}
                    {new Date(resume.created_at).toLocaleDateString()}
                  </small>
                </div>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Deleting...
                </>
              ) : (
                "Delete Resume"
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default Dashboard;
