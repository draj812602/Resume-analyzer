import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Alert,
  Spinner,
  Badge,
} from "react-bootstrap";
import { supabase, getAllFeedback, checkUserAdmin } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

interface FeedbackItem {
  id: string;
  message: string;
  created_at: string;
  users: {
    id: string;
    email: string;
    name?: string;
  };
}

const AdminFeedbackPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAdmin = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          const adminStatus = await checkUserAdmin(user.id);
          setIsAdmin(adminStatus);

          if (adminStatus) {
            const feedbackData = await getAllFeedback(user.id);
            setFeedback(feedbackData);
          } else {
            setError("Access denied. Admin privileges required.");
          }
        } else {
          setError("Please log in to access this page.");
        }
      } catch (error) {
        console.error("Error initializing admin page:", error);
        setError("Failed to load feedback data.");
      } finally {
        setLoading(false);
      }
    };

    initializeAdmin();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={8} className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading feedback data...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!user || !isAdmin) {
    return (
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert variant="danger">
              <i className="bi bi-shield-exclamation me-2"></i>
              {error}
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <div className="dashboard-container">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} lg={10}>
            <div className="content-section fade-in">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="form-section-title mb-0">
                  <i className="bi bi-chat-square-text me-2 text-primary"></i>
                  User Feedback
                </h2>
                <Badge bg="primary" className="fs-6">
                  {feedback.length} Total
                </Badge>
              </div>

              {feedback.length === 0 ? (
                <Card className="border-2 border-dashed text-center">
                  <Card.Body className="p-5">
                    <i
                      className="bi bi-chat-square-text text-muted"
                      style={{ fontSize: "3rem" }}
                    ></i>
                    <h5 className="mt-3 fw-bold">No Feedback Yet</h5>
                    <p className="text-muted">
                      When users submit feedback, it will appear here.
                    </p>
                  </Card.Body>
                </Card>
              ) : (
                <Row className="g-4">
                  {feedback.map((item) => (
                    <Col key={item.id} xs={12}>
                      <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="p-4">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <h6 className="fw-bold mb-1">
                                {item.users.name || item.users.email}
                              </h6>
                              <small className="text-muted">
                                <i className="bi bi-calendar me-1"></i>
                                {formatDate(item.created_at)}
                              </small>
                            </div>
                            <div className="text-end">
                              <Badge bg="info" className="px-3 py-2">
                                <i className="bi bi-chat-text me-1"></i>
                                Feedback
                              </Badge>
                            </div>
                          </div>

                          <div className="feedback-message">
                            <p className="mb-0" style={{ lineHeight: "1.6" }}>
                              {item.message}
                            </p>
                          </div>

                          <hr className="my-3" />

                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                              <i className="bi bi-person me-1"></i>
                              User ID: {item.users.id.substring(0, 8)}...
                            </small>
                            <small className="text-muted">
                              <i className="bi bi-envelope me-1"></i>
                              {item.users.email}
                            </small>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminFeedbackPage;
