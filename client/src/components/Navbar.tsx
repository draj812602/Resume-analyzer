import React from "react";
import {
  Navbar as BootstrapNavbar,
  Nav,
  Container,
  Dropdown,
} from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface NavbarProps {
  session: Session;
}

const Navbar: React.FC<NavbarProps> = ({ session }) => {
  const [imageLoadError, setImageLoadError] = React.useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const user = session.user;
  const avatarUrl =
    user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const userName =
    user.user_metadata?.name || user.user_metadata?.full_name || user.email;

  return (
    <BootstrapNavbar bg="white" expand="lg" className="border-bottom shadow-sm">
      <Container>
        <LinkContainer to="/">
          <BootstrapNavbar.Brand className="fw-bold">
            <i className="bi bi-diamond-fill me-2"></i>
            Resume Analyzer
          </BootstrapNavbar.Brand>
        </LinkContainer>

        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/">
              <Nav.Link>Home</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/analyze">
              <Nav.Link>Analyze</Nav.Link>
            </LinkContainer>
            <Nav.Link href="#contact">Contact</Nav.Link>
          </Nav>

          <Nav>
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="link"
                id="user-dropdown"
                className="text-decoration-none d-flex align-items-center"
              >
                {avatarUrl && !imageLoadError ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="rounded-circle me-2"
                    width="32"
                    height="32"
                    onError={() => {
                      console.log(
                        "Failed to load navbar avatar image:",
                        avatarUrl
                      );
                      setImageLoadError(true);
                    }}
                  />
                ) : (
                  <div
                    className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2"
                    style={{ width: "32px", height: "32px" }}
                  >
                    <span className="text-white fw-bold">
                      {userName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-dark">{userName}</span>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item href="#profile">Profile</Dropdown.Item>
                <Dropdown.Item href="#settings">Settings</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleSignOut}>Sign Out</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
