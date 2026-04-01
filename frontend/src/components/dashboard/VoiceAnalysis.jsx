import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";

function Gauge({ value, max = 100, label, color }) {
  const pct = Math.min((value / max) * 100, 100);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="gauge-wrapper">
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={radius} fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="12" />
        <circle
          cx="65" cy="65" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 65 65)"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        <text x="65" y="62" textAnchor="middle" fill="#f1f5f9" fontSize="22" fontWeight="700">
          {value}
        </text>
        <text x="65" y="82" textAnchor="middle" fill="#94a3b8" fontSize="11">
          {label}
        </text>
      </svg>
    </div>
  );
}

function FillerWordChart({ fillers }) {
  const entries = Object.entries(fillers).sort((a, b) => b[1] - a[1]).slice(0, 8);
  if (entries.length === 0) return <p className="ac-empty">No filler words detected 🎉</p>;

  const max = entries[0][1];
  return (
    <div className="filler-chart">
      {entries.map(([word, count]) => (
        <div key={word} className="filler-row">
          <span className="filler-word">"{word}"</span>
          <div className="filler-track">
            <div
              className="filler-fill"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
          <span className="filler-count">×{count}</span>
        </div>
      ))}
    </div>
  );
}

function PauseIndicator({ frequency }) {
  const map = {
    low: { label: "Low", color: "#ef4444", desc: "Very few pauses. Consider adding structured pauses." },
    moderate: { label: "Moderate", color: "#10b981", desc: "Good pause frequency. Keeps the listener engaged." },
    high: { label: "High", color: "#f59e0b", desc: "Frequent pauses. Work on smoother delivery." },
    unknown: { label: "Unknown", color: "#475569", desc: "Not enough data." }
  };
  const info = map[frequency] || map.unknown;
  return (
    <div className="pause-indicator" style={{ borderColor: info.color }}>
      <span className="pause-dot" style={{ background: info.color }} />
      <div>
        <div className="pause-label" style={{ color: info.color }}>{info.label} Pause Frequency</div>
        <div className="pause-desc">{info.desc}</div>
      </div>
    </div>
  );
}

export default function VoiceAnalysis({ data }) {
  if (!data) return null;

  const {
    avg_wpm = 0,
    avg_confidence = 0,
    total_filler_words = 0,
    filler_breakdown = {},
    avg_pause_frequency = "unknown",
    communication_tips = [],
    trend = []
  } = data;

  const wpmStatus = avg_wpm < 100 ? "Too slow" : avg_wpm > 170 ? "Too fast" : "Ideal pace";
  const wpmColor = avg_wpm < 100 ? "#f59e0b" : avg_wpm > 170 ? "#ef4444" : "#10b981";

  return (
    <div className="voice-wrapper">
      <h3 className="chart-section-title">🎤 Voice & Communication Analysis</h3>

      {/* Gauges */}
      <div className="voice-gauges">
        <div className="gauge-card">
          <Gauge value={avg_wpm} max={200} label="WPM" color={wpmColor} />
          <div className="gauge-status" style={{ color: wpmColor }}>{wpmStatus}</div>
          <div className="gauge-hint">Ideal: 120–160 WPM</div>
        </div>
        <div className="gauge-card">
          <Gauge value={avg_confidence} max={100} label="Conf%" color="#6366f1" />
          <div className="gauge-status">Confidence Score</div>
          <div className="gauge-hint">Based on language patterns</div>
        </div>
        <div className="gauge-card">
          <Gauge value={total_filler_words} max={Math.max(total_filler_words * 1.5, 20)} label="Fillers" color="#f59e0b" />
          <div className="gauge-status">Total Filler Words</div>
          <div className="gauge-hint">Lower is better</div>
        </div>
      </div>

      {/* Pause Frequency */}
      <PauseIndicator frequency={avg_pause_frequency} />

      {/* Filler Breakdown */}
      <div className="voice-section">
        <div className="vs-title">Filler Word Breakdown</div>
        <FillerWordChart fillers={filler_breakdown} />
      </div>

      {/* Trend Chart */}
      {trend.length > 1 && (
        <div className="voice-section">
          <div className="vs-title">WPM & Confidence Trend</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9" }}
              />
              <Legend />
              <Line type="monotone" dataKey="wpm" stroke="#0ea5e9" strokeWidth={2} dot={false} name="WPM" />
              <Line type="monotone" dataKey="confidence" stroke="#6366f1" strokeWidth={2} dot={false} name="Confidence" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Communication Tips */}
      {communication_tips.length > 0 && (
        <div className="voice-section">
          <div className="vs-title">💬 AI Communication Tips</div>
          <ul className="comm-tips">
            {communication_tips.map((tip, i) => (
              <li key={i}>
                <span className="tip-num">{i + 1}</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
