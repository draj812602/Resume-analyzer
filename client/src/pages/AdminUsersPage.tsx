import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Alert,
  Spinner,
  Badge,
  Table,
} from "react-bootstrap";
import { supabase, getAllUsers, checkUserAdmin } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

interface UserData {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  isAdmin: boolean;
  stats: {
    resumeCount: number;
    analysisCount: number;
  };
}

const AdminUsersPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
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
            const usersData = await getAllUsers(user.id);
            setUsers(usersData);
          } else {
            setError("Access denied. Admin privileges required.");
          }
        } else {
          setError("Please log in to access this page.");
        }
      } catch (error) {
        console.error("Error initializing admin page:", error);
        setError("Failed to load users data.");
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
    });
  };

  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email ? email[0].toUpperCase() : "U";
  };

  if (loading) {
    return (
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={8} className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading users data...</p>
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
          <Col xs={12}>
            <div className="content-section fade-in">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="form-section-title mb-0">
                  <i className="bi bi-people me-2 text-primary"></i>
                  User Management
                </h2>
                <Badge bg="primary" className="fs-6">
                  {users.length} Total Users
                </Badge>
              </div>

              {users.length === 0 ? (
                <Card className="border-2 border-dashed text-center">
                  <Card.Body className="p-5">
                    <i
                      className="bi bi-people text-muted"
                      style={{ fontSize: "3rem" }}
                    ></i>
                    <h5 className="mt-3 fw-bold">No Users Found</h5>
                    <p className="text-muted">No users have registered yet.</p>
                  </Card.Body>
                </Card>
              ) : (
                <Card className="border-0 shadow-sm">
                  <Card.Body className="p-0">
                    <div className="table-responsive">
                      <Table hover className="mb-0">
                        <thead className="bg-light">
                          <tr>
                            <th className="border-0 py-3 px-4">User</th>
                            <th className="border-0 py-3">Email</th>
                            <th className="border-0 py-3">Role</th>
                            <th className="border-0 py-3">Joined</th>
                            <th className="border-0 py-3">Resumes</th>
                            <th className="border-0 py-3">Analyses</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((userData) => (
                            <tr key={userData.id}>
                              <td className="py-3 px-4">
                                <div className="d-flex align-items-center">
                                  {userData.avatar_url ? (
                                    <img
                                      src={userData.avatar_url}
                                      alt="Avatar"
                                      className="rounded-circle me-3"
                                      style={{ width: "40px", height: "40px" }}
                                    />
                                  ) : (
                                    <div
                                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                                      style={{ width: "40px", height: "40px" }}
                                    >
                                      <small className="fw-bold">
                                        {getUserInitials(
                                          userData.name,
                                          userData.email
                                        )}
                                      </small>
                                    </div>
                                  )}
                                  <div>
                                    <div className="fw-semibold">
                                      {userData.name || "Anonymous"}
                                    </div>
                                    <small className="text-muted">
                                      ID: {userData.id.substring(0, 8)}...
                                    </small>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3">
                                <span className="text-break">
                                  {userData.email}
                                </span>
                              </td>
                              <td className="py-3">
                                {userData.isAdmin ? (
                                  <Badge bg="danger" className="px-2 py-1">
                                    <i className="bi bi-shield-check me-1"></i>
                                    Admin
                                  </Badge>
                                ) : (
                                  <Badge bg="secondary" className="px-2 py-1">
                                    <i className="bi bi-person me-1"></i>
                                    User
                                  </Badge>
                                )}
                              </td>
                              <td className="py-3">
                                <small className="text-muted">
                                  {formatDate(userData.created_at)}
                                </small>
                              </td>
                              <td className="py-3">
                                <Badge bg="info" className="px-2 py-1">
                                  {userData.stats.resumeCount}
                                </Badge>
                              </td>
                              <td className="py-3">
                                <Badge bg="success" className="px-2 py-1">
                                  {userData.stats.analysisCount}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminUsersPage;
