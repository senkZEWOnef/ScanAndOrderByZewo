import { Container, Nav, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Navigation() {
  const [language, setLanguage] = useState('es'); // Default to Spanish
  
  const translations = {
    es: {
      home: "Inicio",
      signup: "Registro",
      login: "Iniciar Sesión", 
      dashboard: "Panel"
    },
    en: {
      home: "Home",
      signup: "Signup",
      login: "Login",
      dashboard: "Dashboard"
    }
  };

  const t = translations[language];
  return (
    <Navbar bg="dark" data-bs-theme="dark" expand="lg">
      <Container fluid className="px-5">
        <Navbar.Brand as={Link} to="/" style={{ marginLeft: '120px' }}>
          <span className="fw-bold text-white" style={{ 
            fontSize: '1.4rem',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: '0.5px'
          }}>
            Escanea <span className="text-warning">PR</span>
          </span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav style={{ marginLeft: 'auto', marginRight: '80px' }}>
            <Nav.Link as={Link} to="/">
              {t.home}
            </Nav.Link>
            <Nav.Link as={Link} to="/vendor-signup">
              {t.signup}
            </Nav.Link>
            <Nav.Link as={Link} to="/vendor-login">
              {t.login}
            </Nav.Link>
            <Nav.Link as={Link} to="/vendor-dashboard">
              {t.dashboard}
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
