import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 ">
      <Container>
        <Row>
          <Col md={4}>
            <h5>NGO Community</h5>
            <p className="text-white">
              Connecting NGOs with communities and resources for a better world.
            </p>
          </Col>
          <Col md={4}>
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/" className="text-white text-decoration-none">Home</a></li>
              <li><a href="/search" className="text-white text-decoration-none">Search NGOs</a></li>
              <li><a href="/requirements" className="text-white text-decoration-none">Requirements</a></li>
              <li><a href="/about" className="text-white text-decoration-none">About Us</a></li>
            </ul>
          </Col>
          <Col md={4}>
            <h5>Contact</h5>
            <p className="text-white">
              Email: info@ngocommunity.com<br />
              Phone: +1 (555) 123-4567<br />
              Address: 123 Community St, City, State
            </p>
          </Col>
        </Row>
        <hr className="my-3" />
        <Row>
          <Col className="text-center">
            <p className="text-muted mb-0">
              © {new Date().getFullYear()} NGO Community. All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
