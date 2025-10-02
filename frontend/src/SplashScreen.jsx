import React, { useEffect } from "react";
import "./SplashScreen.css";

const SplashScreen = () => {
  return (
    <div className="splash-screen">
      <div className="back">
      <img className="logo" src="/logo.png" alt="" />
      <h1> Welcome to Sky</h1>
      <p>Initializing AI systems...</p>
      </div>
    </div>
  );
};

export default SplashScreen;
