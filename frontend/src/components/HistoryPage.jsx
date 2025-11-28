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
        <h2 className="not-found-title">📜 Chat Not Found</h2>
        <button onClick={() => navigate(-1)} className="back-btn">🔙 Go Back</button>
      </div>
    );
  }

  const isCodeResponse = chat.response?.includes("def ") || chat.response?.includes(";") || chat.response?.includes("```");

  const formatTextResponse = (text) => {
    const cleaned = text.replace(/\*\*/g|| /\*/g|| /\-/g, ""); // remove markdown bold
    const points = cleaned.split(/(?<=[.?!])\s+/);
    return (
      <ul className="chat-response-list">
        {points.map((point, index) => (
          <li key={index}>{point.trim()}</li>
        ))}
      </ul>
    );
  };

  const formatCodeResponse = (code) => {
    const cleaned = code.replace(/```[a-z]*|```/g, "");
    const formatted = cleaned
      .replace(/;/g, ";\n") // Java/C-style line breaks
      .replace(/(?<=:)\s*/g, "\n") // Python-style line breaks
      .replace(/(?<=\))\s*/g, "\n") // after closing parentheses
      .replace(/\n\s*/g, "\n    "); // normalize indentation
    return (
      <pre className="chat-code-block">
        <code>{formatted}</code>
      </pre>
    );
  };

  return (
    <div className="history-container">
      <button onClick={() => navigate(-1)} className="back-btn">🔙 Back</button>

      <h2 className="chat-title">Chat History</h2>
      <div className="chat-window">
        <section className="chat-section">
          <h4>🗣️ User Prompt</h4>
          <p className="chat-prompt">{chat.prompt}</p>
        </section>
        <section className="chat-section">
          <h4>🤖 Assistant Response</h4>
          {isCodeResponse
            ? formatCodeResponse(chat.response)
            : formatTextResponse(chat.response)}
        </section>
      </div>
    </div>
  );
};

export default HistoryPage;