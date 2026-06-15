
// ── Constants ─────────────────────────────────────────────────────────────
export const CATEGORIES = [
  "Maintenance",
  "Cleanliness",
  "Electrical",
  "Water Supply",
  "Internet / WiFi",
  "Furniture",
  "Security",
  "Food & Mess",
  "Other",
];
export const STATUSES = ["Pending", "In Progress", "Resolved"];
export const PRIORITIES = ["Low", "Medium", "High"];
export const STATUS_META = {
  Pending: { bg: "#FFF3E0", text: "#E65100", dot: "#FF9800" },
  "In Progress": { bg: "#E3F2FD", text: "#1565C0", dot: "#2196F3" },
  Resolved: { bg: "#E8F5E9", text: "#2E7D32", dot: "#4CAF50" },
};
export const PRIORITY_COLOR = { Low: "#4CAF50", Medium: "#FF9800", High: "#F44336" };

export function genId() {
  return "CMP-" + Math.floor(100 + Math.random() * 900);
}

export function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── AI helper ─────────────────────────────────────────────────────────────
export async function callClaude(systemPrompt, userMessage) {
  try {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.warn("Anthropic API key not found in .env");
      return "AI feature unavailable: Missing API Key.";
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text ?? "";
  } catch (error) {
    console.error("AI Error:", error);
    return "";
  }
}

  // ── Storage helpers ───────────────────────────────────────────────────────
  const STORAGE_KEY = "hosteldesk-v3";

  export async function loadComplaints() {
    try {
      if (!window.storage) {
        const local = localStorage.getItem(STORAGE_KEY);
        return local ? JSON.parse(local) : [];
      }
      const result = await window.storage.get(STORAGE_KEY, true);
      return result ? JSON.parse(result.value) : [];
    } catch (err) {
      console.error("Load error:", err);
      return [];
    }
  }

export async function saveComplaints(list) {
  try {
    if (!window.storage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return;
    }
    await window.storage.set(STORAGE_KEY, JSON.stringify(list), true);
  } catch (e) {
    console.error("Storage error:", e);
  }
}
