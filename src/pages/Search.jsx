
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Badge,
  Spinner,
  Alert
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import {
  searchNgos,
  setSearchFilters,
  clearSearchResults
} from '../redux/ngoSlice';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const { ngos, loading, error } = useSelector((state) => state.ngo);

  const cities = useMemo(() => {
    const uniqueCities = [...new Set(ngos.map(ngo => ngo.city).filter(Boolean))];
    return uniqueCities.sort();
  }, [ngos]);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(ngos.map(ngo => ngo.category).filter(Boolean))];
    return uniqueCategories.sort();
  }, [ngos]);

  const handleSearch = () => {
    const filters = {};

    if (selectedCity) filters.city = selectedCity;
    if (searchTerm.trim()) filters.name = searchTerm.trim();

    dispatch(setSearchFilters(filters));
    dispatch(searchNgos(filters));
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const handleClear = () => {
    setSearchTerm('');
    setSelectedCity('');
    setSelectedCategory('');
    dispatch(clearSearchResults());
    dispatch(setSearchFilters({}));
    dispatch(searchNgos({}));
  };

  const handleCityChange = (city) => {
    setSelectedCity(city);

    const filters = {};
    if (city) filters.city = city;
    if (searchTerm.trim()) filters.name = searchTerm.trim();

    dispatch(setSearchFilters(filters));
    dispatch(searchNgos(filters));
  };

  // Open the selected NGO's conversation
  const handleContact = (ngo) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!ngo.email) {
      alert('NGO email is unavailable. Please contact this NGO using its displayed phone number.');
      return;
    }

    const params = new URLSearchParams({
      with: ngo.email,
      name: ngo.name || 'NGO'
    });

    navigate(`/messages?${params.toString()}`);
  };

  const filteredNgos = useMemo(() => {
    let filtered = ngos;

    if (selectedCategory) {
      filtered = filtered.filter(
        ngo => ngo.category === selectedCategory
      );
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(ngo =>
        ngo.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ngo.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [ngos, selectedCategory, searchTerm]);

  return (
    <Container className="mt-5 mb-5">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">Search NGOs</h2>
          <p className="text-muted">
            Find NGOs in your area or by category
          </p>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Search by Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter NGO name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>City</Form.Label>
                <Form.Select
                  value={selectedCity}
                  onChange={(e) => handleCityChange(e.target.value)}
                >
                  <option value="">All Cities</option>
                  {cities.map((city, index) => (
                    <option key={index} value={city}>
                      {city}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={2} className="d-flex align-items-end">
              <div className="d-flex gap-2 w-100">
                <Button
                  variant="primary"
                  onClick={handleSearch}
                  className="flex-fill"
                >
                  Search
                </Button>

                <Button
                  variant="outline-secondary"
                  onClick={handleClear}
                  className="flex-fill"
                >
                  Clear
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Searching NGOs...</p>
        </div>
      )}

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <>
          <Row className="mb-3">
            <Col>
              <h5>
                Results: {filteredNgos.length} NGO
                {filteredNgos.length !== 1 ? 's' : ''} found
              </h5>
            </Col>
          </Row>

          {filteredNgos.length === 0 ? (
            <Card className="text-center py-5">
              <Card.Body>
                <h5 className="text-muted">No NGOs found</h5>
                <p className="text-muted">
                  Try adjusting your search criteria
                </p>
              </Card.Body>
            </Card>
          ) : (
            <Row>
              {filteredNgos.map((ngo) => (
                <Col
                  key={ngo.id || ngo._id}
                  lg={6}
                  xl={4}
                  className="mb-4"
                >
                  <Card className="h-100 shadow-sm">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title mb-1">
                          {ngo.name}
                        </h5>
                        <Badge bg="success">Approved</Badge>
                      </div>

                      <p className="text-muted small mb-2">
                        📍 {ngo.city}
                      </p>

                      <Badge bg="primary" className="mb-3">
                        {ngo.category}
                      </Badge>

                      <p className="card-text small mb-3">
                        {ngo.fullAddress}
                      </p>

                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          📞 {ngo.contact}
                        </small>

                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleContact(ngo)}
                        >
                          Contact
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </>
      )}
    </Container>
  );
};

export default Search;
