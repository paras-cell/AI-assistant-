import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ChatDetail = () => {
  const { id } = useParams();
  const [chat, setChat] = useState(null);

  const baseURL =
  window.location.hostname === "localhost"
    ? import.meta.env.VITE_API_BASE_URL
    : "https://ai-assistant-pyhc.onrender.com";

  const fetchChat = async () => {
    try {
      const res = await fetch(`${baseURL}/api/history/${id}`);
      const data = await res.json();
      setChat(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchChat();
  }, [id]);

  if (!chat) return <p>Loading...</p>;

  return (
    <div className="selected-chat-page">
      <h2>Chat Detail</h2>
      <div className="selected-chat">
        <h4>📝 Prompt:</h4>
        <p>{chat.prompt}</p>
        <h4>🤖 Response:</h4>
        <p>{chat.response}</p>
      </div>
    </div>
  );
};

export default ChatDetail;
