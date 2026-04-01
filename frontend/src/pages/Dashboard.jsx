import { useState, useEffect, useCallback } from "react";
import { dashboardAPI } from "../api/api";
import OverviewCards from "../components/dashboard/OverviewCards";
import PerformanceCharts from "../components/dashboard/PerformanceCharts";
import InterviewHistory from "../components/dashboard/InterviewHistory";
import AnswerAnalysis from "../components/dashboard/AnswerAnalysis";
import VoiceAnalysis from "../components/dashboard/VoiceAnalysis";
import "../styles/dashboard.css";

const TABS = [
  { id: "overview", label: "Overview", icon: "🏠" },
  { id: "performance", label: "Performance", icon: "📈" },
  { id: "history", label: "History", icon: "📜" },
  { id: "analysis", label: "Analysis", icon: "🧠" },
  { id: "voice", label: "Voice", icon: "🎤" },
];

function Skeleton({ height = 120, radius = 12 }) {
  return (
    <div
      className="skeleton"
      style={{ height, borderRadius: radius }}
    />
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div className="error-banner">
      <span>⚠️ {message}</span>
      {onRetry && (
        <button className="retry-btn" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [theme, setTheme] = useState("dark");

  const [overview, setOverview] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [history, setHistory] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [voice, setVoice] = useState(null);
  const [historyPage, setHistoryPage] = useState(1);

  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});

  const setLoad = (key, val) => setLoading((p) => ({ ...p, [key]: val }));
  const setErr = (key, val) => setErrors((p) => ({ ...p, [key]: val }));

  const fetchOverview = useCallback(async () => {
    setLoad("overview", true);
    setErr("overview", null);
    try {
      const data = await dashboardAPI.getOverview();
      setOverview(data);
    } catch (e) {
      setErr("overview", e.message);
    } finally {
      setLoad("overview", false);
    }
  }, []);

  const fetchPerformance = useCallback(async () => {
    setLoad("performance", true);
    setErr("performance", null);
    try {
      const data = await dashboardAPI.getPerformance();
      setPerformance(data);
    } catch (e) {
      setErr("performance", e.message);
    } finally {
      setLoad("performance", false);
    }
  }, []);

  const fetchHistory = useCallback(async (page = 1) => {
    setLoad("history", true);
    setErr("history", null);
    try {
      const data = await dashboardAPI.getHistory(page);
      setHistory(data);
    } catch (e) {
      setErr("history", e.message);
    } finally {
      setLoad("history", false);
    }
  }, []);

  const fetchAnalysis = useCallback(async () => {
    setLoad("analysis", true);
    setErr("analysis", null);
    try {
      const data = await dashboardAPI.getAnalysis();
      setAnalysis(data);
    } catch (e) {
      setErr("analysis", e.message);
    } finally {
      setLoad("analysis", false);
    }
  }, []);

  const fetchVoice = useCallback(async () => {
    setLoad("voice", true);
    setErr("voice", null);
    try {
      const data = await dashboardAPI.getVoiceAnalysis();
      setVoice(data);
    } catch (e) {
      setErr("voice", e.message);
    } finally {
      setLoad("voice", false);
    }
  }, []);

  // Load overview on mount
  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  // Load tab data on tab switch (lazy)
  useEffect(() => {
    if (activeTab === "performance" && !performance) fetchPerformance();
    if (activeTab === "history" && !history) fetchHistory(historyPage);
    if (activeTab === "analysis" && !analysis) fetchAnalysis();
    if (activeTab === "voice" && !voice) fetchVoice();
  }, [activeTab]);

  const handlePageChange = (page) => {
    setHistoryPage(page);
    fetchHistory(page);
  };

  return (
    <div className={`dashboard-root ${theme}`}>
      {/* Background mesh */}
      <div className="bg-mesh" />

      {/* Dashboard sub-header: title + theme toggle only (global Navbar handles logo/auth) */}
      <header className="dash-header">
        <div className="dash-header-left">
          <span className="dash-subtitle">Interview Analytics</span>
        </div>
        <div className="dash-header-right">
          <button
            className="theme-toggle"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            title="Toggle theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      {/* Tab Nav */}
      <nav className="tab-nav">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="dash-main">
        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <section className="dash-section fade-in">
            <div className="section-heading">
              <h2>Dashboard Overview</h2>
              <button className="refresh-btn" onClick={fetchOverview}>↺ Refresh</button>
            </div>
            {errors.overview && (
              <ErrorBanner message={errors.overview} onRetry={fetchOverview} />
            )}
            {loading.overview ? (
              <div className="skeleton-grid">
                {[...Array(6)].map((_, i) => <Skeleton key={i} height={110} />)}
              </div>
            ) : (
              <OverviewCards data={overview} />
            )}
          </section>
        )}

        {/* PERFORMANCE */}
        {activeTab === "performance" && (
          <section className="dash-section fade-in">
            <div className="section-heading">
              <h2>Performance Charts</h2>
              <button className="refresh-btn" onClick={fetchPerformance}>↺ Refresh</button>
            </div>
            {errors.performance && (
              <ErrorBanner message={errors.performance} onRetry={fetchPerformance} />
            )}
            {loading.performance ? (
              <div className="skeleton-grid">
                <Skeleton height={300} />
                <Skeleton height={260} />
                <Skeleton height={260} />
              </div>
            ) : (
              <PerformanceCharts data={performance} />
            )}
          </section>
        )}

        {/* HISTORY */}
        {activeTab === "history" && (
          <section className="dash-section fade-in">
            <div className="section-heading">
              <h2>Interview History</h2>
              <button className="refresh-btn" onClick={() => fetchHistory(historyPage)}>↺ Refresh</button>
            </div>
            {errors.history && (
              <ErrorBanner message={errors.history} onRetry={() => fetchHistory(historyPage)} />
            )}
            {loading.history ? (
              <div className="skeleton-list">
                {[...Array(5)].map((_, i) => <Skeleton key={i} height={70} />)}
              </div>
            ) : (
              <InterviewHistory
                data={history}
                onPageChange={handlePageChange}
                currentPage={historyPage}
              />
            )}
          </section>
        )}

        {/* ANALYSIS */}
        {activeTab === "analysis" && (
          <section className="dash-section fade-in">
            <div className="section-heading">
              <h2>Deep Answer Analysis</h2>
              <button className="refresh-btn" onClick={fetchAnalysis}>↺ Refresh</button>
            </div>
            {errors.analysis && (
              <ErrorBanner message={errors.analysis} onRetry={fetchAnalysis} />
            )}
            {loading.analysis ? (
              <div className="skeleton-grid">
                <Skeleton height={140} />
                <Skeleton height={200} />
                <Skeleton height={200} />
              </div>
            ) : (
              <AnswerAnalysis data={analysis} />
            )}
          </section>
        )}

        {/* VOICE */}
        {activeTab === "voice" && (
          <section className="dash-section fade-in">
            <div className="section-heading">
              <h2>Voice & Communication</h2>
              <button className="refresh-btn" onClick={fetchVoice}>↺ Refresh</button>
            </div>
            {errors.voice && (
              <ErrorBanner message={errors.voice} onRetry={fetchVoice} />
            )}
            {loading.voice ? (
              <div className="skeleton-grid">
                <Skeleton height={200} />
                <Skeleton height={150} />
                <Skeleton height={220} />
              </div>
            ) : (
              <VoiceAnalysis data={voice} />
            )}
          </section>
        )}
      </main>
    </div>
  );
}
