import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Modal } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";

interface AnalysisResult {
  skillsMatchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  improvementSuggestions: string[];
  overallFeedback: string;
  strengths: string[];
  weaknesses: string[];
}

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showResumeModal, setShowResumeModal] = useState(false);

  // Get analysis data from navigation state
  const { analysisResult } = location.state || {};

  if (!analysisResult) {
    navigate("/");
    return null;
  }

  const result: AnalysisResult = analysisResult;

  const handleGenerateResume = () => {
    setShowResumeModal(true);
  };

  const handleDownloadPDF = () => {
    // Implement PDF download functionality
    console.log("Downloading PDF...");
  };

  const handleNewAnalysis = () => {
    navigate("/analyze");
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} lg={10}>
          <div className="mb-4">
            <h1 className="fw-bold mb-3">Resume Analysis Results</h1>
          </div>

          {/* Skills Match Percentage */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-4 bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="fw-bold mb-0">Skills Match Percentage</h5>
                <h2
                  className={`fw-bold mb-0 ${
                    result.skillsMatchPercentage >= 80
                      ? "text-success"
                      : result.skillsMatchPercentage >= 60
                      ? "text-warning"
                      : "text-danger"
                  }`}
                >
                  {result.skillsMatchPercentage}%
                </h2>
              </div>
              <div className="progress mt-3" style={{ height: "8px" }}>
                <div
                  className={`progress-bar ${
                    result.skillsMatchPercentage >= 80
                      ? "bg-success"
                      : result.skillsMatchPercentage >= 60
                      ? "bg-warning"
                      : "bg-danger"
                  }`}
                  style={{ width: `${result.skillsMatchPercentage}%` }}
                ></div>
              </div>
            </Card.Body>
          </Card>

          {/* Feedback and Suggestions */}
          <div className="mb-4">
            <h3 className="fw-bold mb-4">Feedback and Suggestions</h3>

            <Row className="g-4">
              {/* Missing Keywords */}
              <Col md={6}>
                <Card
                  className="h-100 border-0 shadow-sm position-relative overflow-hidden"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    minHeight: "200px",
                  }}
                >
                  <Card.Body className="p-4 text-white position-relative">
                    <h5 className="fw-bold mb-3">Missing Keywords</h5>
                    <p className="mb-3 opacity-75">
                      The following keywords from the job description are not
                      present in your resume. Consider adding them to improve
                      relevance.
                    </p>
                    <Button
                      variant="light"
                      size="sm"
                      onClick={() => console.log("View Keywords")}
                    >
                      View Keywords
                    </Button>

                    {/* Decorative elements */}
                    <div
                      className="position-absolute opacity-25"
                      style={{
                        top: "-20px",
                        right: "-20px",
                        fontSize: "4rem",
                      }}
                    >
                      <i className="bi bi-search"></i>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Areas for Improvement */}
              <Col md={6}>
                <Card
                  className="h-100 border-0 shadow-sm position-relative overflow-hidden"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    minHeight: "200px",
                  }}
                >
                  <Card.Body className="p-4 text-white position-relative">
                    <h5 className="fw-bold mb-3">Areas for Improvement</h5>
                    <p className="mb-3 opacity-75">
                      The following sections of your resume could be
                      strengthened or reworded to better match the job
                      requirements.
                    </p>
                    <Button
                      variant="light"
                      size="sm"
                      onClick={() => console.log("View Suggestions")}
                    >
                      View Suggestions
                    </Button>

                    {/* Decorative elements */}
                    <div
                      className="position-absolute opacity-25"
                      style={{
                        top: "-20px",
                        right: "-20px",
                        fontSize: "4rem",
                      }}
                    >
                      <i className="bi bi-arrow-up-circle"></i>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Additional Skills */}
              <Col md={12}>
                <Card
                  className="h-100 border-0 shadow-sm position-relative overflow-hidden"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                    minHeight: "200px",
                  }}
                >
                  <Card.Body className="p-4 text-white position-relative">
                    <h5 className="fw-bold mb-3">Additional Skills/Keywords</h5>
                    <p className="mb-3 opacity-75">
                      Adding these skills or keywords could improve your
                      resume's relevance to the job description.
                    </p>
                    <Button
                      variant="light"
                      size="sm"
                      onClick={() => console.log("View Skills")}
                    >
                      View Skills
                    </Button>

                    {/* Decorative elements */}
                    <div
                      className="position-absolute opacity-25"
                      style={{
                        top: "-20px",
                        right: "-20px",
                        fontSize: "4rem",
                      }}
                    >
                      <i className="bi bi-plus-circle"></i>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>

          {/* Action Buttons */}
          <div className="text-center">
            <Button
              variant="primary"
              size="lg"
              className="me-3"
              onClick={handleGenerateResume}
            >
              Generate Resume
            </Button>
            <Button
              variant="outline-primary"
              size="lg"
              onClick={handleNewAnalysis}
            >
              New Analysis
            </Button>
          </div>
        </Col>
      </Row>

      {/* Resume Preview Modal */}
      <Modal
        show={showResumeModal}
        onHide={() => setShowResumeModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-file-earmark-text me-2"></i>
            Resume Revamp
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <h5>Review Your Updated Resume</h5>
            <p className="text-muted">
              Here's a preview of your resume with the suggested improvements.
              Take a moment to review the changes before downloading.
            </p>
          </div>

          {/* Resume Preview */}
          <div
            className="border rounded p-4 mb-4"
            style={{
              height: "400px",
              overflowY: "auto",
              backgroundColor: "#f8f9fa",
            }}
          >
            <div className="bg-white p-4 shadow-sm">
              <h3 className="text-center fw-bold">Resume</h3>
              <hr />
              <div className="mb-3">
                <h5 className="fw-bold">PERSONAL INFORMATION</h5>
                <p>
                  <strong>Name:</strong> [Your Name]
                </p>
                <p>
                  <strong>Email:</strong> [Your Email]
                </p>
                <p>
                  <strong>Phone:</strong> [Your Phone]
                </p>
              </div>

              <div className="mb-3">
                <h5 className="fw-bold">PROFESSIONAL SUMMARY</h5>
                <p>
                  Enhanced professional summary with relevant keywords and
                  improved alignment with job requirements...
                </p>
              </div>

              <div className="mb-3">
                <h5 className="fw-bold">SKILLS</h5>
                <p>
                  Updated skills section with added keywords and technologies
                  relevant to the target position...
                </p>
              </div>

              <div className="mb-3">
                <h5 className="fw-bold">EXPERIENCE</h5>
                <p>
                  Improved experience descriptions with quantified achievements
                  and better keyword optimization...
                </p>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="mb-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="incorporateAll"
                defaultChecked
              />
              <label className="form-check-label" htmlFor="incorporateAll">
                Incorporate all suggestions
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="excludeFormatting"
              />
              <label className="form-check-label" htmlFor="excludeFormatting">
                Exclude formatting changes
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="highlightSkills"
              />
              <label className="form-check-label" htmlFor="highlightSkills">
                Highlight key skills
              </label>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResumeModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleDownloadPDF}>
            <i className="bi bi-download me-2"></i>
            Download PDF
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ResultsPage;
