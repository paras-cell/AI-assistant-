import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import SplashScreen from "./SplashScreen";
import AIpage from "./components/AIpage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChatDetail from "./components/ChatDetail";
import HistoryPage from "./components/HistoryPage";

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <SplashScreen />;

  return (
    <Routes>
      <Route path="/login" element={!token ? <Login /> : <Navigate to="/home" />} />
      <Route path="/register" element={!token ? <Register /> : <Navigate to="/home" />} />
      <Route path="/home" element={token ? <AIpage /> : <Navigate to="/login" />} />
      <Route path="/chat/:id" element={token ? <ChatDetail /> : <Navigate to="/login" />} />
      <Route path="/history/:id" element={token ? <HistoryPage /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to={token ? "/home" : "/login"} />} />
    </Routes>
  );
}

export default App;