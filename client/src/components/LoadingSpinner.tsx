import React from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";

const LoadingSpinner: React.FC = () => {
  return (
    <Container
      fluid
      className="d-flex align-items-center justify-content-center min-vh-100"
    >
      <Row>
        <Col className="text-center">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <div className="mt-3">
            <p className="text-muted">Loading Resume Analyzer...</p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default LoadingSpinner;
