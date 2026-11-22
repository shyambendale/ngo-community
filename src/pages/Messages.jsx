import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Badge
} from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import messagesAPI from '../api/messages';

const Messages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialEmail = searchParams.get('with');
  const initialName = searchParams.get('name');

  const { user, isAuthenticated } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(initialEmail || '');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const [inboxLoading, setInboxLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef(null);

  // Redirect users who are not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Load inbox conversations
  useEffect(() => {
    if (!isAuthenticated || !user?.email) return;

    let active = true;

    const loadConversations = async () => {
      try {
        const data = await messagesAPI.getConversations();

        if (!active) return;

        const inbox = Array.isArray(data) ? data : [];
        setConversations(inbox);

        // Keep a conversation opened from the Contact button
        if (initialEmail) {
          setSelectedEmail(initialEmail);
        } else {
          setSelectedEmail((current) => {
            if (current) return current;
            return inbox[0]?.email || '';
          });
        }

        setError('');
      } catch (err) {
        if (active) {
          setError(err.error || 'Failed to load inbox.');
        }
      } finally {
        if (active) setInboxLoading(false);
      }
    };

    loadConversations();

    // Refresh inbox every 10 seconds
    const interval = setInterval(loadConversations, 10000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isAuthenticated, user?.email, initialEmail]);

  // Load selected conversation messages
  useEffect(() => {
    if (!isAuthenticated || !user?.email || !selectedEmail) {
      setMessages([]);
      return;
    }

    let active = true;

    const loadMessages = async () => {
      try {
        const data = await messagesAPI.getMessages(
          user.email,
          selectedEmail
        );

        if (active) {
          setMessages(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (active) {
          setError(err.error || 'Failed to load messages.');
        }
      } finally {
        if (active) setMessagesLoading(false);
      }
    };

    setMessagesLoading(true);
    loadMessages();

    // Refresh open conversation every 5 seconds
    const interval = setInterval(loadMessages, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isAuthenticated, user?.email, selectedEmail]);

  // Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);

  const openConversation = (email) => {
    setSelectedEmail(email);
    setSearchParams({ with: email });
    setError('');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const messageText = newMessage.trim();

    if (!messageText || !selectedEmail || sending) return;

    setSending(true);
    setError('');

    try {
      const response = await messagesAPI.sendMessage({
        to: selectedEmail,
        message: messageText
      });

      setMessages((previous) => [...previous, response]);
      setNewMessage('');

      // Refresh inbox to update latest message
      const inbox = await messagesAPI.getConversations();
      setConversations(Array.isArray(inbox) ? inbox : []);
    } catch (err) {
      setError(err.error || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';

    return new Date(timestamp).toLocaleString();
  };

  const selectedConversation = conversations.find(
    (conversation) =>
      conversation.email?.toLowerCase() === selectedEmail.toLowerCase()
  );

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Container className="mt-4 mb-5">
      <h2 className="fw-bold mb-2">Messages</h2>
      <p className="text-muted mb-4">
        Connect with NGOs and your community.
      </p>

      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      <Card className="shadow-sm">
        <Row className="g-0">

          {/* Inbox sidebar */}
          <Col md={4} lg={3} className="border-end">
            <div className="p-3 border-bottom">
              <h5 className="mb-0">Inbox</h5>
            </div>

            <div style={{ minHeight: '450px', maxHeight: '600px', overflowY: 'auto' }}>
              {inboxLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" />
                  <p className="mt-2">Loading inbox...</p>
                </div>
              ) : conversations.length === 0 && !initialEmail ? (
                <div className="text-center text-muted p-4">
                  <div className="fs-2 mb-2">💬</div>
                  <p>No conversations yet.</p>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => navigate('/search')}
                  >
                    Search NGOs
                  </Button>
                </div>
              ) : (
                <>
                  {initialEmail && !conversations.some(
                    (conversation) =>
                      conversation.email?.toLowerCase() === initialEmail.toLowerCase()
                  ) && (
                    <button
                      type="button"
                      className={`w-100 text-start border-0 border-bottom p-3 ${
                        selectedEmail === initialEmail ? 'bg-light' : 'bg-white'
                      }`}
                      onClick={() => openConversation(initialEmail)}
                    >
                      <strong>{initialName || initialEmail}</strong>
                      <div className="small text-muted">{initialEmail}</div>
                      <div className="small text-muted">Start a conversation</div>
                    </button>
                  )}

                  {conversations.map((conversation) => (
                    <button
                      type="button"
                      key={conversation.email}
                      className={`w-100 text-start border-0 border-bottom p-3 ${
                        selectedEmail === conversation.email
                          ? 'bg-light'
                          : 'bg-white'
                      }`}
                      onClick={() => openConversation(conversation.email)}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <strong className="text-break">
                          {conversation.email}
                        </strong>

                        {conversation.unreadCount > 0 && (
                          <Badge bg="primary">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>

                      <div className="small text-muted text-truncate mt-1">
                        {conversation.lastMessage}
                      </div>

                      <div className="small text-muted mt-1">
                        {formatTimestamp(conversation.lastMessageAt)}
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          </Col>

          {/* Chat window */}
          <Col md={8} lg={9}>
            {!selectedEmail ? (
              <div className="d-flex flex-column justify-content-center align-items-center text-center p-5" style={{ minHeight: '450px' }}>
                <div className="display-4 mb-3">💬</div>
                <h5>Select a conversation</h5>
                <p className="text-muted">
                  Choose a conversation from your inbox to view messages.
                </p>
              </div>
            ) : (
              <>
                <div className="p-3 border-bottom bg-light">
                  <h5 className="mb-1">
                    {initialEmail === selectedEmail && initialName
                      ? initialName
                      : selectedEmail}
                  </h5>
                  <small className="text-muted">{selectedEmail}</small>
                </div>

                <div
                  className="d-flex flex-column p-3"
                  style={{ height: '450px' }}
                >
                  <div className="flex-grow-1 overflow-auto mb-3">
                    {messagesLoading && messages.length === 0 ? (
                      <div className="text-center py-5">
                        <Spinner animation="border" />
                        <p className="mt-2">Loading messages...</p>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-muted py-5">
                        <h5>No messages yet</h5>
                        <p>Send a message to start this conversation.</p>
                      </div>
                    ) : (
                      messages.map((message, index) => {
                        const isMine =
                          message.from?.toLowerCase() ===
                          user?.email?.toLowerCase();

                        return (
                          <div
                            key={message._id || index}
                            className={`d-flex mb-3 ${
                              isMine
                                ? 'justify-content-end'
                                : 'justify-content-start'
                            }`}
                          >
                            <div
                              className={`px-3 py-2 rounded-3 ${
                                isMine
                                  ? 'bg-primary text-white'
                                  : 'bg-light'
                              }`}
                              style={{ maxWidth: '75%' }}
                            >
                              <p className="mb-1">{message.message}</p>
                              <small
                                className={
                                  isMine ? 'text-white-50' : 'text-muted'
                                }
                              >
                                {formatTimestamp(message.createdAt)}
                              </small>
                            </div>
                          </div>
                        );
                      })
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  <Form onSubmit={handleSendMessage}>
                    <div className="d-flex gap-2">
                      <Form.Control
                        type="text"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={sending}
                      />

                      <Button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                      >
                        {sending ? 'Sending...' : 'Send'}
                      </Button>
                    </div>
                  </Form>
                </div>
              </>
            )}
          </Col>
        </Row>
      </Card>
    </Container>
  );
};

export default Messages;