const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...getAuthHeaders(), ...(options.headers || {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  signup: (data) =>
    apiFetch("/auth/signup", { method: "POST", body: JSON.stringify(data) }),
  login: (data) =>
    apiFetch("/auth/login", { method: "POST", body: JSON.stringify(data) }),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  getOverview: () => apiFetch("/dashboard/overview"),
  getPerformance: () => apiFetch("/dashboard/performance"),
  getHistory: (page = 1, limit = 10) =>
    apiFetch(`/dashboard/history?page=${page}&limit=${limit}`),
  getAnalysis: () => apiFetch("/dashboard/analysis"),
  getVoiceAnalysis: () => apiFetch("/dashboard/voice-analysis"),
};

// ── Interviews ────────────────────────────────────────────────────────────────
export const interviewAPI = {
  getAll: () => apiFetch("/interviews"),
  submit: (data) =>
    apiFetch("/interviews", { method: "POST", body: JSON.stringify(data) }),
};

// ── Resume ────────────────────────────────────────────────────────────────────
export const resumeAPI = {
  uploadResume: async (file) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${BASE_URL}/resume/upload-resume`, {
      method: "POST",
      body: formData,
      ...(token && { headers: { Authorization: `Bearer ${token}` } }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Upload failed" }));
      throw new Error(err.detail || `HTTP ${res.status}`);
    }

    const data = await res.json();
    
    // Validate response contains questions array
    if (!data.questions || !Array.isArray(data.questions)) {
      throw new Error("Invalid response format from server");
    }

    return data.questions;
  },
};
