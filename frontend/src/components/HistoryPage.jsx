import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./styles/HistoryPage.css";

const HistoryPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const chat = location.state?.chat;

  if (!chat) {
    return (
      <div className="history-container">
        <h2>📜 Chat Not Found</h2>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="history-container">
      <h2 className="chat-title">📜 Chat History</h2>
      <div className="chat-window">
        <div className="chat-message">
          <div className="message user-msg">
            <span>{chat.prompt}</span>
          </div>
          <div className="message ai-msg">
            <span>{chat.response}</span>
          </div>
        </div>
      </div>
      <button onClick={() => navigate(-1)} className="back-btn">
        🔙 Back
      </button>
    </div>
  );
};

export default HistoryPage;
