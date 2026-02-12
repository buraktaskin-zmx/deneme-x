/**
 * Tool konfigurasyonlari
 * Her tool icin URL ve izin verilen domainler tanimlanir
 */
const TOOLS_CONFIG = {
chatgpt: {
    name: "ChatGPT",
    icon: "🤖",
    url: "https://chatgpt.com",
    allowedDomains: ["chatgpt.com", "openai.com", "auth0.openai.com", "auth.openai.com", "accounts.google.com", "login.live.com"]
  },
  figma: {
    name: "Figma",
    icon: "🎨",
    url: "https://www.figma.com",
    allowedDomains: ["figma.com"]
  },
  canva: {
    name: "Canva",
    icon: "🖼️",
    url: "https://www.canva.com",
    allowedDomains: ["canva.com"]
  },
  gemini: {
    name: "Gemini",
    icon: "💎",
    url: "https://gemini.google.com",
    allowedDomains: ["google.com"]
  },
  claude: {
    name: "Claude",
    icon: "🧠",
    url: "https://claude.ai",
    allowedDomains: ["claude.ai", "anthropic.com"]
  },
  midjourney: {
    name: "Midjourney",
    icon: "🎭",
    url: "https://www.midjourney.com",
    allowedDomains: ["midjourney.com", "discord.com"]
  }
};