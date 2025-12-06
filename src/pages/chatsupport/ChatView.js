import React, { useEffect, useRef, useState } from "react"; 
import { Container, Row, Col, Card } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useLanguage } from "../../components/LanguageContext";
import API_DOMAIN from "../../config/config"; 

import { 
    IoCheckmark,         
    IoCheckmarkDone,     
    IoSend,             
} from "react-icons/io5"; 

import './ChatView.css'; 

const ChatView = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  
  // 1. Ref for the scrollable container
  const chatMessagesAreaRef = useRef(null); 
  const messagesEndRef = useRef(null); // Ref for the bottom-most element

  const POLLING_INTERVAL = 3000; 
  const locationState = location.state || {};
  const { customerId, customerName: initialCustomerName } = locationState;

  const [messages, setMessages] = useState([]); 
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true); 
  const [isSending, setIsSending] = useState(false); 
  const [customerName, setCustomerName] = useState(initialCustomerName || `ID: ${customerId}`); 

  
  // 2. UPDATED: Conditional scroll function
  const scrollToBottom = (force = false) => {
    const chatArea = chatMessagesAreaRef.current;
    if (chatArea) {
      // Check if the user is currently scrolled near the bottom (within 50px)
      // This is the threshold to decide if new incoming messages should auto-scroll.
      const isAtBottom = 
        chatArea.scrollHeight - chatArea.scrollTop <= chatArea.clientHeight + 50;
      
      // Scroll if 'force' is true (e.g., manager sending a message, initial load) 
      // OR if the user is already near the bottom (new customer message arrived).
      if (force || isAtBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
        // Fallback for initial render before ref is set
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // 3. UPDATED: Fetch Messages function
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
        if (responseData.body.messages) {
          const newMessages = responseData.body.messages;
          
          if (newMessages.length !== messages.length) {
             setMessages(newMessages);
             
             // Conditionally scroll when new messages arrive.
             // Force scroll on initial load (first time setting messages).
             scrollToBottom(initialLoad); 
          } else if (initialLoad) {
             // If messages were retrieved but there were none initially (length === 0), ensure scroll happens once.
             scrollToBottom(true);
          }
        }
      } else {
        console.error("Failed to fetch chat messages:", responseData.head.msg);
        if (initialLoad) alert(t("Failed to load chat history."));
      }
    } catch (error) {
      if (initialLoad) setLoading(false);
      console.error("Network error fetching chat data:", error.message);
      if (initialLoad) alert(t("A network error occurred while fetching chat history."));
    }
  };

 
  useEffect(() => {
    // Initial fetch
    fetchMessages(); 

    // Set up polling interval
    const interval = setInterval(() => {
      fetchMessages();
    }, POLLING_INTERVAL);
    
    // Clean up
    return () => clearInterval(interval);
  }, [customerId, POLLING_INTERVAL]); 


  // This hook is now REMOVED: 
  // useEffect(() => { scrollToBottom(); }, [messages]);


  
  const handleGoBack = () => {
    navigate(-1);
  };

  
  // Time Formatter
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp.replace(' ', 'T'));
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      console.error("Error formatting time:", e);
      return timestamp;
    }
  };
  
  // Status Icon Component (Unchanged)
  const StatusIcon = ({ status }) => {
    const statusLower = status ? status.toLowerCase() : 'sent';
    
    const baseStyle = { 
        marginLeft: '5px', 
        fontSize: '0.9rem', 
        verticalAlign: 'middle' 
    };

    switch (statusLower) {
      case 'seen':
        return (
          <IoCheckmarkDone 
            style={{ ...baseStyle, color: '#4fc3f7' }} 
          />
        );
      case 'delivered':
        return (
          <IoCheckmarkDone 
            style={baseStyle} 
          />
        );
      case 'sent':
      default:
        return (
          <IoCheckmark 
            style={baseStyle} 
          />
        );
    }
  };

  // Handler for sending a message 
  const handleSendMessage = async (e) => {
    e.preventDefault(); 
    
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage || !customerId) return;

    const uniqueId = `MSGCUS__${Date.now()}`; 
    
    setIsSending(true); // Start sending process

    try {
      const response = await fetch(`${API_DOMAIN}/chat.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "send", 
          customer_id: customerId,
          sender: "manager", 
          message: trimmedMessage,
          message_id: uniqueId, 
        }),
      });

      const responseData = await response.json();
      setIsSending(false); // End sending process

      if (responseData.head.code === 200) {
        const sentMessage = {
          id: responseData.body.message_id || uniqueId, 
          message_id: responseData.body.message_id || uniqueId,
          customer_id: customerId,
          sender: "manager",
          message: trimmedMessage,
          status: "sent", 
          created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        };

        setMessages((prevMessages) => [...prevMessages, sentMessage]);
        setNewMessage(""); 
        
        // Force scroll to bottom when manager sends a message
        scrollToBottom(true); 
      } else {
        alert(t("Failed to send message: ") + responseData.head.msg);
      }
    } catch (error) {
      setIsSending(false);
      console.error("Error sending chat data:", error.message);
      alert(t("An error occurred while sending the message."));
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

  // Component to render a single chat message (Unchanged)
  const ChatMessage = ({ msg }) => {
    const isCustomer = msg.sender.toLowerCase() === "customer";
    const alignmentClass = isCustomer ? "d-flex justify-content-start" : "d-flex justify-content-end";
    const bubbleClass = isCustomer ? "chat-bubble customer-bubble" : "chat-bubble manager-bubble";
    const senderLabel = isCustomer ? customerName : t("You"); 

    return (
      <Row className={`mb-3 ${alignmentClass}`}>
        <Col xs={10} sm={8} lg={6}> 
          <div className={bubbleClass}>
            <div className="sender-name">
              <strong>{senderLabel}</strong>
            </div>
            <div className="message-text">
              {msg.message}
            </div>
            <div className="message-details text-end">
              <span className="timestamp">
                {formatTime(msg.created_at)}
              </span>
              {!isCustomer && <StatusIcon status={msg.status} />}
            </div>
          </div>
        </Col>
      </Row>
    );
  };

  return (
    <Container fluid className="chat-view-container">
      <Row className="chat-header-row p-3 border-bottom bg-white">
        <Col className="d-flex align-items-center">
          <FaArrowLeft 
            onClick={handleGoBack} 
            style={{ cursor: 'pointer', marginRight: '15px', fontSize: '1.2rem' }}
          />
          <h5 className="mb-0">{t("Chat with")} {customerName} ({customerId})</h5>
        </Col>
      </Row>
      
      {/* Chat Messages Area */}
      {/* 5. ADD the ref to the scrollable div */}
      <div className="chat-messages-area p-3" ref={chatMessagesAreaRef}>
        {loading && messages.length === 0 ? (
            <div className="text-center py-5 text-muted">
                {t("Loading chat history...")}
            </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-5 text-muted">
            {t("No messages found for this customer.")}
          </div>
        ) : (
          messages.map((msg, index) => (
            <ChatMessage key={msg.id || index} msg={msg} />
          ))
        )}
        <div ref={messagesEndRef} /> 
      </div>

      {/* Input Field with Send Icon */}
     <form onSubmit={handleSendMessage} className="chat-input-row mb-3 sticky-bottom">
        <Col>
          <input 
            type="text" 
            placeholder={t("Type a reply...")}
            className="form-control"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSending} 
          />
        </Col>
        <Col xs="auto">
          {/* Send Icon Button */}
          <button 
            type="submit" 
            className="btn-primary"
            disabled={!newMessage.trim() || isSending} 
            style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <IoSend style={{ fontSize: '1.2rem' }} />
          </button>
        </Col>
      </form>
    </Container>
  );
};

export default ChatView;