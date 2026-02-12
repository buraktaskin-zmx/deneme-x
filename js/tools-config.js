/**
 * Tool konfigurasyonlari
 * Her tool icin URL ve izin verilen domainler tanimlanir
 */
 const TOOLS_CONFIG = {
  chatgpt: {
    name: "ChatGPT",
    icon: "🤖",
    url: "https://chatgpt.com",
    allowedDomains: [
      "chatgpt.com",
      "openai.com",
      "auth0.openai.com",
      "auth.openai.com",
      // Google SSO için gerekli tüm domainler
      "accounts.google.com",
      "accounts.youtube.com",
      "www.google.com",
      "google.com",
      "googleapis.com",
      "gstatic.com",
      "googleusercontent.com",
      "youtube.com",
      // Microsoft SSO
      "login.live.com",
      "login.microsoftonline.com",
      "microsoftonline.com",
      // Apple SSO
      "appleid.apple.com",
      "apple.com"
    ]
  },
  figma: {
    name: "Figma",
    icon: "🎨",
    url: "https://www.figma.com",
    allowedDomains: ["figma.com", "accounts.google.com", "google.com", "gstatic.com"]
  },
  canva: {
    name: "Canva",
    icon: "🖼️",
    url: "https://www.canva.com",
    allowedDomains: ["canva.com", "accounts.google.com", "google.com", "gstatic.com"]
  },
  gemini: {
    name: "Gemini",
    icon: "💎",
    url: "https://gemini.google.com",
    allowedDomains: ["google.com", "accounts.google.com", "gstatic.com", "googleapis.com", "googleusercontent.com"]
  },
  claude: {
    name: "Claude",
    icon: "🧠",
    url: "https://claude.ai",
    allowedDomains: ["claude.ai", "anthropic.com", "accounts.google.com", "google.com", "gstatic.com"]
  },
  midjourney: {
    name: "Midjourney",
    icon: "🎭",
    url: "https://www.midjourney.com",
    allowedDomains: ["midjourney.com", "discord.com", "discordapp.com"]
  }
};