import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import "./styles/Sidebar.css";

const baseURL = import.meta.env.VITE_API_BASE_URL;
const socket = io(`${baseURL}`);

const Sidebar = ({ selectChat }) => {
  const [localHistory, setLocalHistory] = useState({});
  const navigate = useNavigate();

  const loadHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseURL}/api/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      const grouped = {};
      data.forEach((chat) => {
        const chatDate = new Date(chat.createdAt);
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        const label =
          chatDate.toDateString() === today.toDateString()
            ? "Today"
            : chatDate.toDateString() === tomorrow.toDateString()
            ? "Tomorrow"
            : chatDate.toLocaleDateString();

        if (!grouped[label]) grouped[label] = [];
        grouped[label].push(chat);
      });

      setLocalHistory(grouped);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  useEffect(() => {
    loadHistory();

    socket.on("historyUpdated", () => {
      console.log("📡 Sidebar received historyUpdated");
      loadHistory();
    });

    return () => {
      socket.off("historyUpdated");
    };
  }, []);

  const deleteChat = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${baseURL}/api/history/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      loadHistory();
    } catch (err) {
      console.error(err);
    }
  };

  const clearAll = async () => {
    if (!window.confirm("Delete all chats?")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`${baseURL}/api/history`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      loadHistory();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="sidebar">
      <h3>
        💬 History
        {Object.keys(localHistory).length > 0 && (
          <button className="clear-btn" onClick={clearAll}>
            🗑️ Clear All
          </button>
        )}
      </h3>

      {Object.keys(localHistory).length === 0 && <p>No chats yet</p>}

      {Object.keys(localHistory).map((dateLabel) => (
        <div key={dateLabel} className="date-group">
          <h4>{dateLabel}</h4>
          {localHistory[dateLabel].map((chat) => (
            <div key={chat._id} className="history-item-wrapper">
              <div
                className="history-item"
                onClick={() => {
                  selectChat(chat);
                  navigate(`/history/${chat._id}`, { state: { chat } });
                }}
              >
                {chat.prompt.length > 25
                  ? chat.prompt.substring(0, 25) + "..."
                  : chat.prompt}
              </div>
              <button
                className="delete-btn"
                onClick={() => deleteChat(chat._id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Sidebar;