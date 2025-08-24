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

  const handleNewAnalysis = () => {
    navigate("/analyze");
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return "success";
    if (percentage >= 60) return "warning";
    return "danger";
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} lg={10}>
          <div className="mb-4 d-flex justify-content-between align-items-center">
            <h1 className="fw-bold mb-0">Resume Analysis Results</h1>
            <Button variant="outline-primary" onClick={handleNewAnalysis}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              New Analysis
            </Button>
          </div>

          {/* Skills Match Percentage */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-4">
              <div className="text-center">
                <h3 className="fw-bold mb-3">Overall Match Score</h3>
                <div
                  className={`display-1 fw-bold text-${getMatchColor(
                    result.skillsMatchPercentage
                  )} mb-3`}
                >
                  {result.skillsMatchPercentage}%
                </div>
                <div
                  className="progress mx-auto"
                  style={{ height: "12px", width: "300px" }}
                >
                  <div
                    className={`progress-bar bg-${getMatchColor(
                      result.skillsMatchPercentage
                    )}`}
                    style={{ width: `${result.skillsMatchPercentage}%` }}
                  ></div>
                </div>
                <p className="text-muted mt-3">
                  {result.skillsMatchPercentage >= 80
                    ? "Excellent match!"
                    : result.skillsMatchPercentage >= 60
                    ? "Good match with room for improvement"
                    : "Significant improvements needed"}
                </p>
              </div>
            </Card.Body>
          </Card>

          {/* Analysis Details */}
          <Row className="g-4 mb-4">
            {/* Matched Skills */}
            <Col md={6}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div
                      className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{ width: "50px", height: "50px" }}
                    >
                      <i className="bi bi-check-lg fs-4"></i>
                    </div>
                    <div>
                      <h5 className="fw-bold mb-0">Matched Skills</h5>
                      <small className="text-muted">
                        {result.matchedSkills.length} skills found
                      </small>
                    </div>
                  </div>
                  {result.matchedSkills.length > 0 ? (
                    <div className="d-flex flex-wrap gap-2">
                      {result.matchedSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="badge bg-success-subtle text-success border border-success px-3 py-2"
                        >
                          <i className="bi bi-check-circle-fill me-1"></i>
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <i className="bi bi-info-circle text-muted fs-1 mb-2"></i>
                      <p className="text-muted mb-0">
                        No specific matched skills identified
                      </p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Missing Skills */}
            <Col md={6}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div
                      className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{ width: "50px", height: "50px" }}
                    >
                      <i className="bi bi-exclamation-lg fs-4"></i>
                    </div>
                    <div>
                      <h5 className="fw-bold mb-0">Missing Skills</h5>
                      <small className="text-muted">
                        {result.missingSkills.length} skills to add
                      </small>
                    </div>
                  </div>
                  {result.missingSkills.length > 0 ? (
                    <div className="d-flex flex-wrap gap-2">
                      {result.missingSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="badge bg-warning-subtle text-warning border border-warning px-3 py-2"
                        >
                          <i className="bi bi-plus-circle me-1"></i>
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <i className="bi bi-check-circle text-success fs-1 mb-2"></i>
                      <p className="text-muted mb-0">
                        Great! No critical skills missing
                      </p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Strengths */}
            <Col md={6}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div
                      className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{ width: "50px", height: "50px" }}
                    >
                      <i className="bi bi-star-fill fs-4"></i>
                    </div>
                    <div>
                      <h5 className="fw-bold mb-0">Strengths</h5>
                      <small className="text-muted">
                        What makes you stand out
                      </small>
                    </div>
                  </div>
                  {result.strengths.length > 0 ? (
                    <div className="space-y-2">
                      {result.strengths.map((strength, index) => (
                        <div
                          key={index}
                          className="d-flex align-items-start mb-2"
                        >
                          <i className="bi bi-arrow-right-circle-fill text-primary me-2 mt-1"></i>
                          <span className="small">{strength}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <i className="bi bi-info-circle text-muted fs-1 mb-2"></i>
                      <p className="text-muted mb-0">
                        No specific strengths highlighted
                      </p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Areas for Improvement */}
            <Col md={6}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div
                      className="bg-info text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{ width: "50px", height: "50px" }}
                    >
                      <i className="bi bi-arrow-up-circle fs-4"></i>
                    </div>
                    <div>
                      <h5 className="fw-bold mb-0">Areas for Improvement</h5>
                      <small className="text-muted">
                        Opportunities to enhance
                      </small>
                    </div>
                  </div>
                  {result.weaknesses.length > 0 ? (
                    <div className="space-y-2">
                      {result.weaknesses.map((weakness, index) => (
                        <div
                          key={index}
                          className="d-flex align-items-start mb-2"
                        >
                          <i className="bi bi-arrow-right-circle text-info me-2 mt-1"></i>
                          <span className="small">{weakness}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <i className="bi bi-check-circle text-success fs-1 mb-2"></i>
                      <p className="text-muted mb-0">
                        No major weaknesses identified
                      </p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Improvement Suggestions */}
          {result.improvementSuggestions.length > 0 && (
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-3">
                  <i className="bi bi-lightbulb-fill text-warning me-2"></i>
                  Actionable Suggestions
                </h5>
                <Row className="g-3">
                  {result.improvementSuggestions.map((suggestion, index) => (
                    <Col key={index} md={6}>
                      <div className="bg-light border-start border-warning border-4 p-3 h-100">
                        <div className="d-flex align-items-start">
                          <span className="badge bg-warning text-dark me-2 mt-1 fw-bold">
                            {index + 1}
                          </span>
                          <span className="small">{suggestion}</span>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* Overall Feedback */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-3">
                <i className="bi bi-chat-square-text-fill text-info me-2"></i>
                Detailed Analysis
              </h5>
              <div className="bg-light border-start border-info border-4 p-4">
                <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                  {result.overallFeedback}
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Action Buttons */}
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4 text-center">
              <h5 className="fw-bold mb-3">Ready for the next step?</h5>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Button variant="primary" size="lg" onClick={handleNewAnalysis}>
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Analyze Another Resume
                </Button>
                <Button
                  variant="outline-primary"
                  size="lg"
                  onClick={() => navigate("/")}
                >
                  <i className="bi bi-house me-2"></i>
                  Back to Dashboard
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ResultsPage;
