export const API_BASE = (() => {
  const raw = (import.meta.env.VITE_API_BASE || "").trim();
  if (!raw) {
    if (import.meta.env.DEV) return "/api";
    console.error("Missing VITE_API_BASE env var. Set it in Vercel to your Render backend URL.");
    return "";
  }
  return raw.replace(/\/+$/, "");
})();
