import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
} from "react-bootstrap";
import { supabase, submitFeedback } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

const FeedbackPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("Please log in to submit feedback");
      return;
    }

    if (!message.trim()) {
      setError("Please enter your feedback message");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const success = await submitFeedback(user.id, message.trim());

      if (success) {
        setSuccess(true);
        setMessage("");
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError("Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      setError("An error occurred while submitting feedback");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Card>
              <Card.Body className="text-center">
                <h3>Please Log In</h3>
                <p>You need to be logged in to submit feedback.</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <div className="dashboard-container">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} lg={8}>
            <div className="content-section fade-in">
              <h2 className="form-section-title mb-4">Share Your Feedback</h2>

              {success && (
                <Alert variant="success" className="fade-in">
                  <i className="bi bi-check-circle me-2"></i>
                  Thank you for your feedback! We appreciate your input.
                </Alert>
              )}

              {error && (
                <Alert variant="danger" className="fade-in">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              )}

              <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                      <Form.Control
                        as="textarea"
                        rows={8}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Share your feedback, suggestions, or report any issues..."
                        required
                        className="border-2"
                        style={{ fontSize: "16px" }}
                      />
                    </Form.Group>

                    <div className="d-grid">
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        disabled={submitting || !message.trim()}
                        className="action-button action-button-primary"
                      >
                        {submitting ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                            />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-send me-2"></i>
                            Submit Feedback
                          </>
                        )}
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>

              <div className="text-center mt-4">
                <small className="text-muted">
                  <i className="bi bi-shield-check me-1"></i>
                  Your feedback helps us improve the service
                </small>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default FeedbackPage;
