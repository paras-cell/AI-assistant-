import React, { useState, useRef, useEffect } from "react";
import "./styles/VoiceAssistant.css";
import { handleCommand } from "./utils/commandHandler";

const normalizeCommand = (text) => {
  let cmd = text.toLowerCase().trim();
  cmd = cmd.replace("youtube par gana chalao", "play song on youtube");
  cmd = cmd.replace("facebook kholo", "open facebook");
  cmd = cmd.replace("whatsapp kholo", "open whatsapp");
  cmd = cmd.replace("google kholo", "open google");
  return cmd;
};

const VoiceAssistant = () => {
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState("Idle");
  const [latestPrompt, setLatestPrompt] = useState("");
  const [latestResponse, setLatestResponse] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemma:2b");
  const [voices, setVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState("");
  const recognitionRef = useRef(null);
  const controllerRef = useRef(null);

  const baseURL =
    window.location.hostname === "localhost"
      ? import.meta.env.VITE_API_BASE_URL
      : "https://ai-assistant-backend-xz01.onrender.com";

  // --- Response formatting helpers ---
  const isCodeResponse =
    latestResponse?.includes("def ") ||
    latestResponse?.includes(";") ||
    latestResponse?.includes("```");

  const formatTextResponse = (text) => {
    const cleaned = text.replace(/\*\*|\*/g, ""); // remove markdown bold
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

  // --- Load voices ---
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoiceName) {
        setSelectedVoiceName(availableVoices[0].name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // --- Wake word setup ---
  useEffect(() => {
    speak("Hi, I’m Sky. What can I do for you today?");
    setStatus("Speaking");

    const waitForSpeechEnd = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        clearInterval(waitForSpeechEnd);
        startListening();
      }
    }, 500);

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const wakeRecognizer = new SpeechRecognition();
    wakeRecognizer.lang = "en-IN";
    wakeRecognizer.interimResults = false;
    wakeRecognizer.continuous = true;

    wakeRecognizer.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript
        .trim()
        .toLowerCase();

      if (transcript.includes("hey sky") || transcript.includes("sky suno")) {
        wakeRecognizer.stop();
        speak("Yes? I'm listening.");
        setStatus("Speaking");

        const waitForReply = setInterval(() => {
          if (!window.speechSynthesis.speaking) {
            clearInterval(waitForReply);
            startListening();
          }
        }, 500);
      }
    };

    wakeRecognizer.onend = () => {
      if (status === "Listening") {
        setStatus("Idle");
      }
    };

    wakeRecognizer.start();

    const silenceTimeout = setTimeout(() => {
      if (status === "Listening" && !window.speechSynthesis.speaking) {
        setStatus("Idle");
      }
    }, 10000);

    return () => {
      wakeRecognizer.stop();
      clearInterval(waitForSpeechEnd);
      clearTimeout(silenceTimeout);
    };
  }, []);

  // --- Listening setup ---
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition)
      return alert("❌ Browser does not support Speech Recognition");

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = async (event) => {
      const rawText = event.results[0][0].transcript.trim();
      const userText = normalizeCommand(rawText);
      setLatestPrompt(rawText);
      setListening(false);
      setStatus("Thinking");

      const commandResponse = handleCommand(userText);
      if (commandResponse) {
        speak(commandResponse);
        setLatestResponse(commandResponse);
        await saveHistory(rawText, commandResponse);
        setStatus("Idle");
        return;
      }

      await sendToAI(userText, rawText);
    };

    recognition.onend = () => {
      setListening(false);
      if (status === "Listening") setStatus("Idle");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
    setStatus("Listening");

    setTimeout(() => {
      if (listening && status === "Listening") {
        recognition.stop();
        setStatus("Idle");
      }
    }, 10000);
  };

  // --- Send prompt to AI backend ---
  const sendToAI = async (prompt, originalText) => {
    if (!prompt.trim()) return;
    if (controllerRef.current) controllerRef.current.abort();
    controllerRef.current = new AbortController();

    const modifiedPrompt = prompt.includes("explain")
      ? prompt + " Provide a detailed explanation in 150 words."
      : prompt + " Keep it concise, max 200 words.";

    try {
      const res = await fetch(`${baseURL}/api/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: modifiedPrompt, model: selectedModel }),
        signal: controllerRef.current.signal,
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n");
        for (const line of lines) {
          if (line.startsWith("data:")) aiResponse += line.replace("data: ", "");
        }
      }

      speak(aiResponse);
      setLatestResponse(aiResponse);
      await saveHistory(originalText, aiResponse);
    } catch (err) {
      if (err.name === "AbortError") console.log("❌ Request aborted");
      else {
        console.error(err);
        speak("Sorry, I could not process your request.");
        setLatestResponse("Sorry, I could not process your request.");
      }
    } finally {
      setStatus("Idle");
    }
  };

  // --- Save history ---
  const saveHistory = async (prompt, response) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await fetch(`${baseURL}/api/history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt, response }),
      });
    } catch (err) {
      console.error("Error saving history:", err);
    }
  };

  // --- Speech synthesis ---
  const speak = (text) => {
    if (!window.speechSynthesis || !text) return;
    if (window.speechSynthesis.speaking) return;

    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";

    const selectedVoice = voices.find((v) => v.name === selectedVoiceName);
    if (selectedVoice) {
      utter.voice = selectedVoice;
    }

    window.speechSynthesis.speak(utter);
  };

  const interrupt = () => {
    if (controllerRef.current) controllerRef.current.abort();
    window.speechSynthesis.cancel();
    setStatus("Idle");
  };

  return (
    <div className="assistant-container">
      <div className="prompt-list">
        {latestPrompt && <div className="user-bubble">{latestPrompt}</div>}
      </div>
      <div className="prompt-list">
        {latestResponse && (
          <div className="assistant-bubble">
            {isCodeResponse
              ? formatCodeResponse(latestResponse)
              : formatTextResponse(latestResponse)}
          </div>
        )}

      </div>

      <div className="status-bar">
        {status === "Thinking" ? (
          <span>
            <img
              style={{ width: "768px", height: "560px",  top: "45px" }}
              src="/thinking3.gif"
              alt=""
            />
          </span>
        ) : status === "Listening" ? (
          <span><img src="/default.gif" alt="" /></span>
        ) : window.speechSynthesis.speaking ? (
          <span>
            <img
              style={{ width: "582px", height: "412px", top: "130px"  }}
              src="/speking.gif"
              alt=""
            />
          </span>
        ) : (
          <span><img src="/default.gif" alt="" /></span>
        )}
      </div>


      <div className="controls">
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
        >
          <option value="gemma:2b">Gemma 2B</option>
          <option value="mistral">Mistral</option>
          <option value="llama3">LLaMA 3</option>
        </select>

        <select
          value={selectedVoiceName}
          onChange={(e) => setSelectedVoiceName(e.target.value)}
        >
          {voices.map((voice, i) => (
            <option key={i} value={voice.name}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>

        <button onClick={interrupt}>◉</button>


        <button
          onClick={startListening}
          disabled={listening || status === "Thinking"}
          className="mic-button"
        >
          <img src="/mic.png" alt="" />
        </button>

      </div>
    </div>
  );
};

export default VoiceAssistant;