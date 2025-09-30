import React, { useState, useEffect } from "react";
import VoiceAssistant from "./VoiceAssistant";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./styles/AIpage.css";

const AIpage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const navigate = useNavigate();
  const { user, token, login, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const baseURL = import.meta.env.VITE_API_BASE_URL;


  useEffect(() => {
    const fetchUser = async () => {
      if (!token || user) return;

      try {
        const res = await fetch(`${baseURL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          login(token, { name: data.name, email: data.email, type: data.user });
          console.log(data.name, data.email, data.user);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    fetchUser();
  }, [token, user, login]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="ai-page-container">
      <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "X" : "☰"}
      </button>

      <div className={`sidebar-container ${isOpen ? "open" : ""}`}>
        <Sidebar selectChat={setSelectedChat} />
      </div>

      <div className={`ai-main ${isOpen ? "shifted" : ""}`}>
        <div className="ai-header">
          <div className="ai-logo">
            <img src="/logo.png" alt="Sky Logo" />
            <span>Sky Assistant</span>
          </div>

          <div className="ai-user-info">
            <div className="user-details">
              <strong>{user?.name || "Guest"}</strong>
              <span>{user?.email || "No email"}</span>
            </div>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <VoiceAssistant />

        {selectedChat && (
          <div className="selected-chat">
            <h4>📝 Prompt:</h4>
            <p>{selectedChat.prompt}</p>
            <h4>🤖 Response:</h4>
            <p>{selectedChat.response}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIpage;