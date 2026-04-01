import { useEffect, useRef } from "react";

const GRADE_COLORS = {
  trend_up: "#00e5a0",
  trend_down: "#ff4d6d",
  neutral: "#94a3b8",
};

function CountUp({ target, duration = 1200, decimals = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      if (ref.current) {
        ref.current.textContent = decimals
          ? start.toFixed(decimals)
          : Math.floor(start).toString();
      }
      if (start >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, decimals]);
  return <span ref={ref}>0</span>;
}

function TrendBadge({ value }) {
  if (value === null || value === undefined || value === 0)
    return <span className="trend-badge neutral">→ No change</span>;
  const up = value > 0;
  return (
    <span className={`trend-badge ${up ? "up" : "down"}`}>
      {up ? "↑" : "↓"} {Math.abs(value).toFixed(1)} pts
    </span>
  );
}

export default function OverviewCards({ data }) {
  if (!data) return null;

  const cards = [
    {
      id: "total",
      label: "Total Interviews",
      value: data.total_interviews,
      decimals: 0,
      suffix: "",
      icon: "🎯",
      accent: "#6366f1",
      sub: null,
    },
    {
      id: "avg",
      label: "Average Score",
      value: data.avg_score,
      decimals: 1,
      suffix: "/10",
      icon: "📊",
      accent: "#0ea5e9",
      sub: null,
    },
    {
      id: "best",
      label: "Best Score",
      value: data.best_score,
      decimals: 1,
      suffix: "/10",
      icon: "🏆",
      accent: "#f59e0b",
      sub: null,
    },
    {
      id: "weak",
      label: "Weakest Area",
      value: null,
      text: data.weakest_area,
      icon: "🔍",
      accent: "#ef4444",
      sub: "Focus here",
    },
    {
      id: "trend7",
      label: "7-Day Trend",
      value: null,
      trend: data.trend_7_days,
      icon: "📅",
      accent: "#10b981",
      sub: "vs prev 7 days",
    },
    {
      id: "trend30",
      label: "30-Day Trend",
      value: null,
      trend: data.trend_30_days,
      icon: "📆",
      accent: "#8b5cf6",
      sub: "vs prev 30 days",
    },
  ];

  return (
    <div className="overview-grid">
      {cards.map((card, i) => (
        <div
          key={card.id}
          className="overview-card"
          style={{ "--accent": card.accent, animationDelay: `${i * 80}ms` }}
        >
          <div className="card-header">
            <span className="card-icon">{card.icon}</span>
            <span className="card-label">{card.label}</span>
          </div>
          <div className="card-value">
            {card.value !== null && card.value !== undefined ? (
              <>
                <CountUp target={card.value} decimals={card.decimals} />
                <span className="card-suffix">{card.suffix}</span>
              </>
            ) : card.text ? (
              <span className="card-text">{card.text}</span>
            ) : (
              <TrendBadge value={card.trend} />
            )}
          </div>
          {card.sub && <div className="card-sub">{card.sub}</div>}
        </div>
      ))}
    </div>
  );
}
