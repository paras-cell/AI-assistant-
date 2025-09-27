export function handleCommand(command) {
  let lowerCmd = command.toLowerCase().trim();

  // Normalize common variations
  lowerCmd = lowerCmd.replace("git hub", "github");

  // 🧠 AI Identity Questions
  const identityTriggers = [
    "who made you",
    "who created you",
    "who is your owner",
    "who trained you",
    "who developed you",
    "who built you",
    "who designed you",
    "who is your creator",
    "who is your master",
    "who is your boss",
    "who is behind you",
    "tell me about yourself",
  ];

  if (identityTriggers.some(trigger => lowerCmd.includes(trigger))) {
    return `I was created and trained by Paras . I'm your personal AI assistant—built to listen, learn, and respond in real time. I can speak, think, search, open apps, play music, and help you navigate your digital world. I'm here to make life smoother, smarter, and more fun.`;
  }

  // 🎵 YouTube Song Commands (English/Hindi)
  const youtubePlayMatch = lowerCmd.match(/(?:play|gana chalao|ganne chalao)\s(.+)|(.+)\s(?:chalao)/i);
  if (youtubePlayMatch) {
    const song = youtubePlayMatch[1] || youtubePlayMatch[2];
    if (song) {
      window.open(
        `https://www.youtube.com/results?search_query=${encodeURIComponent(song)}`,
        "_blank"
      );
      return `Playing "${song}" on YouTube 🎶`;
    }
  }

  // 🎬 YouTube Open Commands
  if (lowerCmd.includes("youtube chalo") || lowerCmd.includes("youtube kholo")) {
    window.open("https://www.youtube.com", "_blank");
    return "Opening YouTube... ";
  }

  // 🌐 Known apps
  const apps = {
    facebook: { protocol: "fb://", web: "https://www.facebook.com" },
    whatsapp: { protocol: "whatsapp://", web: "https://web.whatsapp.com" },
    instagram: { protocol: "instagram://", web: "https://www.instagram.com" },
    twitter: { protocol: "twitter://", web: "https://twitter.com" },
    linkedin: { protocol: "linkedin://", web: "https://www.linkedin.com" },
    github: { protocol: null, web: "https://github.com" },
    spotify: { protocol: "spotify://", web: "https://open.spotify.com" },
    reddit: { protocol: "reddit://", web: "https://www.reddit.com" },
    google: { protocol: null, web: "https://www.google.com" },
    youtube: { protocol: null, web: "https://www.youtube.com" }
  };

  for (let app in apps) {
    if (lowerCmd.includes(`open ${app}`) || lowerCmd.includes(`${app} kholo`)) {
      return tryOpenApp(apps[app].protocol, apps[app].web, app);
    }
  }

  // 🔍 Fallback → Google Search
  if (lowerCmd.startsWith("open ") || lowerCmd.endsWith("kholo")) {
    const query = lowerCmd.replace(/open |kholo/, "").trim();
    if (query) {
      window.open(
        `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        "_blank"
      );
      return `Couldn't find a direct app, opening "${query}" in browser`;
    }
  }

  return null; // ❌ Not a command → AI handles
}

// ✅ Try to open native app, fallback to web
function tryOpenApp(protocol, webUrl, appName) {
  if (!protocol) {
    window.open(webUrl, "_blank");
    return `Opening ${appName}...`;
  }

  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = protocol;
  document.body.appendChild(iframe);

  setTimeout(() => {
    document.body.removeChild(iframe);
    window.open(webUrl, "_blank");
  }, 1200);

  return `Opening ${appName}... `;
}