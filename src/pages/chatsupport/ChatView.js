import React, { useEffect, useRef, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useLanguage } from "../../components/LanguageContext";
import API_DOMAIN from "../../config/config";
import { IoCheckmark, IoCheckmarkDone, IoSend } from "react-icons/io5";
import "./ChatView.css";

const ChatView = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const isUserScrollingUp = useRef(false); 
  const previousMessagesLength = useRef(0);
  const POLLING_INTERVAL = 3000;
  const locationState = location.state || {};
  const { customerId, customerName: initialCustomerName } = locationState;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [customerName, setCustomerName] = useState(
    initialCustomerName || `ID: ${customerId}`
  );

  // Smooth scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Send seen confirmation
  const sendSeenConfirmation = async (customerId) => {
    if (!customerId || !navigator.onLine) return;

    try {
      await fetch(`${API_DOMAIN}/chat.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "seen",
          customer_id: customerId,
          sender: "customer",
        }),
      });
    } catch (error) {
      console.error("Error sending seen confirmation:", error.message);
    }
  };

  const sendDeliveryConfirmation = async (customerId) => {
    if (!customerId || !navigator.onLine) return;

    try {
      await fetch(`${API_DOMAIN}/chat.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deliver",
          customer_id: customerId,
          sender: "customer",
        }),
      });
    } catch (error) {
      console.error("Error sending delivery confirmation:", error.message);
    }
  };

  // Fetch messages
  const fetchMessages = async () => {
    if (!customerId) return;
    const initialLoad = messages.length === 0;
    if (initialLoad) setLoading(true);

    try {
      const response = await fetch(`${API_DOMAIN}/chat.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "list",
          customer_id: customerId,
        }),
      });

      const responseData = await response.json();
      if (initialLoad) setLoading(false);

      if (responseData.head.code === 200) {
        const newMsgs = responseData.body.messages || [];
        if (newMsgs.length !== messages.length) {
          setMessages(newMsgs);
        }
      } else {
        console.error("Failed to fetch chat messages:", responseData.head.msg);
        if (initialLoad) alert(t("Failed to load chat history."));
      }
    } catch (error) {
      if (initialLoad) setLoading(false);
      console.error("Network error fetching chat data:", error.message);
      if (initialLoad)
        alert(t("A network error occurred while fetching chat history."));
    }
  };

//Polling + initial load
  useEffect(() => {
    if (!customerId) return;
    fetchMessages();
    sendDeliveryConfirmation(customerId);
    sendSeenConfirmation(customerId);

    const interval = setInterval(() => {
      fetchMessages();
      sendDeliveryConfirmation(customerId);
      sendSeenConfirmation(customerId);
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [customerId]);


  // Smart auto-scroll logic
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const tolerance = 150; // pixels from bottom to consider "at bottom"
    const isNearBottom =
      container.scrollHeight - container.scrollTop <=
      container.clientHeight + tolerance;

    const newMessagesArrived = messages.length > previousMessagesLength.current;
    const lastMessageIsMine =
      messages[messages.length - 1]?.sender === "manager";

    previousMessagesLength.current = messages.length;
    if (
      newMessagesArrived &&
      (isNearBottom || lastMessageIsMine || !isUserScrollingUp.current)
    ) {
      scrollToBottom();
    }
  }, [messages]);

  // Detect manual scroll (user reading old messages)
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    let inactivityTimer;

    const handleScroll = () => {
      const tolerance = 150;
      const isNearBottom =
        container.scrollHeight - container.scrollTop <=
        container.clientHeight + tolerance;

      if (!isNearBottom) {
        isUserScrollingUp.current = true;
      } else {
        isUserScrollingUp.current = false;
      }
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        const stillNotAtBottom =
          container.scrollHeight - container.scrollTop >
          container.clientHeight + tolerance;
        if (!stillNotAtBottom) {
          isUserScrollingUp.current = false;
        }
      }, 8000);
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      clearTimeout(inactivityTimer);
    };
  }, []);

  const handleGoBack = () => navigate(-1);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp.replace(" ", "T"));
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return timestamp;
    }
  };

  const StatusIcon = ({ status }) => {
    const s = status?.toLowerCase() || "sent";
    const style = {
      marginLeft: "5px",
      fontSize: "0.9rem",
      verticalAlign: "middle",
    };

    if (s === "seen")
      return <IoCheckmarkDone style={{ ...style, color: "#4fc3f7" }} />;
    if (s === "delivered") return <IoCheckmarkDone style={style} />;
    return <IoCheckmark style={style} />;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed || !customerId) return;

    const tempId = `temp_${Date.now()}`;
    setIsSending(true);

    // Optimistically add message
    const optimisticMsg = {
      message_id: tempId,
      sender: "manager",
      message: trimmed,
      status: "sent",
      created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setNewMessage("");
    scrollToBottom();

    try {
      const response = await fetch(`${API_DOMAIN}/chat.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          customer_id: customerId,
          sender: "manager",
          message: trimmed,
          message_id: tempId,
        }),
      });

      const data = await response.json();
      setIsSending(false);

      if (data.head.code === 200) {
        // Replace temp message with real one
        setMessages((prev) =>
          prev.map((m) =>
            m.message_id === tempId
              ? {
                  ...m,
                  message_id: data.body.message_id || tempId,
                  status: "delivered",
                }
              : m
          )
        );
      } else {
        alert(t("Failed to send message: ") + data.head.msg);
        // Remove optimistic message on failure
        setMessages((prev) => prev.filter((m) => m.message_id !== tempId));
      }
    } catch (err) {
      setIsSending(false);
      alert(t("Network error. Message not sent."));
      setMessages((prev) => prev.filter((m) => m.message_id !== tempId));
    }
  };

  if (!customerId) {
    return (
      <Container fluid className="py-5 text-center">
        <h2>{t("No Chat Data Available")}</h2>
        <p>{t("Please select a customer chat from the previous page.")}</p>
        <button className="btn btn-primary" onClick={handleGoBack}>
          {t("Go Back")}
        </button>
      </Container>
    );
  }

  const ChatMessage = ({ msg }) => {
    const isCustomer = msg.sender?.toLowerCase() === "customer";
    const align = isCustomer ? "justify-content-start" : "justify-content-end";
    const bubble = isCustomer
      ? "chat-bubble customer-bubble"
      : "chat-bubble manager-bubble";
    const name = isCustomer ? customerName : t("You");

    return (
      <Row className={`mb-3 ${align}`}>
        <Col xs={10} sm={8} lg={6}>
          <div className={bubble}>
            <div className="sender-name">
              <strong>{name}</strong>
            </div>
            <div className="message-text">{msg.message}</div>
            <div className="message-details text-end">
              <span className="timestamp">{formatTime(msg.created_at)}</span>
              {!isCustomer && <StatusIcon status={msg.status} />}
            </div>
          </div>
        </Col>
      </Row>
    );
  };

  return (
    <Container
      fluid
      className="chat-view-container d-flex flex-column"
      style={{ height: "100vh" }}
    >
      {/* Header */}
      <Row className="chat-header-row p-3 border-bottom bg-white flex-shrink-0">
        <Col className="d-flex align-items-center">
          <FaArrowLeft
            onClick={handleGoBack}
            style={{
              cursor: "pointer",
              marginRight: "15px",
              fontSize: "1.2rem",
            }}
          />
          <h5 className="mb-0">
            {t("Chat with")} {customerName} ({customerId})
          </h5>
        </Col>
      </Row>

      {/* Messages Area */}
      <div ref={messagesContainerRef} className="chat-messages-area p-3 ">
        {loading && messages.length === 0 ? (
          <div className="text-center py-5 text-muted">
            {t("Loading chat history...")}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-5 text-muted">
            {t("No messages found for this customer.")}
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.message_id || msg.id || msg.created_at}
              msg={msg}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="chat-input-row py-2 mb-3 sticky-bottom"
      >
        {/* <Row className="g-2 align-items-center"> */}
        <Col>
          <input
            type="text"
            className="form-control"
            placeholder={t("Type a reply...")}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSending}
          />
        </Col>
        <Col xs="auto">
          <button
            type="submit"
            className="btn-primary"
            disabled={!newMessage.trim() || isSending}
            style={{ width: "48px", height: "48px" }}
          >
            {isSending ? (
              <span className="spinner-border spinner-border-sm" />
            ) : (
              <IoSend style={{ fontSize: "1.3rem" }} />
            )}
          </button>
        </Col>
        {/* </Row> */}
      </form>
    </Container>
  );
};

export default ChatView;
