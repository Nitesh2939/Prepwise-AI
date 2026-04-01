import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, ReferenceLine
} from "recharts";

const PALETTE = {
  primary: "#6366f1",
  secondary: "#0ea5e9",
  accent: "#f59e0b",
  success: "#10b981",
  danger: "#ef4444",
  muted: "#475569",
};

function SectionTitle({ children }) {
  return <h3 className="chart-section-title">{children}</h3>;
}

function ImprovementBanner({ data }) {
  const { recent_avg, previous_avg, change_pct } = data;
  const improved = change_pct >= 0;
  return (
    <div className={`improvement-banner ${improved ? "improved" : "declined"}`}>
      <div className="imp-label">Last 5 vs Previous 5</div>
      <div className="imp-scores">
        <span>Prev: <strong>{previous_avg}/10</strong></span>
        <span className="imp-arrow">{improved ? "→" : "→"}</span>
        <span>Recent: <strong>{recent_avg}/10</strong></span>
      </div>
      <div className={`imp-change ${improved ? "green" : "red"}`}>
        {improved ? "▲" : "▼"} {Math.abs(change_pct)}% {improved ? "improvement" : "decline"}
      </div>
    </div>
  );
}

export default function PerformanceCharts({ data }) {
  if (!data) return null;

  const {
    score_over_time = [],
    category_performance = [],
    radar_data = [],
    improvement_comparison
  } = data;

  return (
    <div className="charts-wrapper">
      {/* Score Progression */}
      <div className="chart-card wide">
        <SectionTitle>📈 Score Progression</SectionTitle>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={score_over_time} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
            <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <YAxis domain={[0, 10]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9" }}
              labelStyle={{ color: "#94a3b8" }}
            />
            <ReferenceLine y={5} stroke="#475569" strokeDasharray="4 4" label={{ value: "Avg", fill: "#475569", fontSize: 10 }} />
            <Line
              type="monotone"
              dataKey="score"
              stroke={PALETTE.primary}
              strokeWidth={2.5}
              dot={{ fill: PALETTE.primary, r: 4 }}
              activeDot={{ r: 6, fill: "#fff", stroke: PALETTE.primary }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category Bar Chart */}
      <div className="chart-card">
        <SectionTitle>📊 Performance by Role</SectionTitle>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={category_performance} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
            <XAxis dataKey="category" tick={{ fill: "#94a3b8", fontSize: 10 }} angle={-20} textAnchor="end" />
            <YAxis domain={[0, 10]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9" }}
            />
            <Bar dataKey="avg_score" fill={PALETTE.secondary} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Radar Chart */}
      <div className="chart-card">
        <SectionTitle>🕸️ Skill Radar</SectionTitle>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={radar_data}>
            <PolarGrid stroke="rgba(148,163,184,0.15)" />
            <PolarAngleAxis dataKey="skill" tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: "#475569", fontSize: 9 }} />
            <Radar
              name="Score"
              dataKey="score"
              stroke={PALETTE.accent}
              fill={PALETTE.accent}
              fillOpacity={0.25}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Improvement Banner */}
      {improvement_comparison && (
        <div className="chart-card wide">
          <SectionTitle>📉 Improvement Tracking</SectionTitle>
          <ImprovementBanner data={improvement_comparison} />
        </div>
      )}
    </div>
  );
}
