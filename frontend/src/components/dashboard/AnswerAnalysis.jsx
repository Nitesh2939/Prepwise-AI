function InsightPill({ text, variant }) {
  return <span className={`insight-pill ${variant}`}>{text}</span>;
}

function DistributionBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="dist-row">
      <span className="dist-label">{label}</span>
      <div className="dist-track">
        <div className="dist-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="dist-count">{count}</span>
    </div>
  );
}

export default function AnswerAnalysis({ data }) {
  if (!data) return null;

  const {
    weak_topics = [],
    repeated_mistakes = [],
    suggestions = [],
    overall_insight = "",
    interviews_analyzed = 0,
    score_distribution = {}
  } = data;

  const totalDist = Object.values(score_distribution).reduce((a, b) => a + b, 0);

  return (
    <div className="analysis-wrapper">
      <div className="analysis-header">
        <h3 className="chart-section-title">🧠 Deep Answer Analysis</h3>
        <span className="analyzed-badge">{interviews_analyzed} interviews analyzed</span>
      </div>

      {overall_insight && (
        <div className="insight-banner">
          <span className="insight-icon">💡</span>
          <p>{overall_insight}</p>
        </div>
      )}

      <div className="analysis-grid">
        {/* Weak Topics */}
        <div className="analysis-card">
          <div className="ac-title">🔴 Weak Topics</div>
          {weak_topics.length === 0 ? (
            <p className="ac-empty">No weak topics detected yet.</p>
          ) : (
            <div className="pill-group">
              {weak_topics.map((t, i) => (
                <InsightPill key={i} text={t} variant="danger" />
              ))}
            </div>
          )}
        </div>

        {/* Repeated Mistakes */}
        <div className="analysis-card">
          <div className="ac-title">⚠️ Repeated Mistakes</div>
          {repeated_mistakes.length === 0 ? (
            <p className="ac-empty">No repeated mistakes found.</p>
          ) : (
            <ul className="mistake-list">
              {repeated_mistakes.map((m, i) => (
                <li key={i}>
                  <span className="mistake-dot" />
                  {m}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Suggestions */}
        <div className="analysis-card suggestions">
          <div className="ac-title">✨ AI Suggestions</div>
          {suggestions.length === 0 ? (
            <p className="ac-empty">Keep practicing to get suggestions.</p>
          ) : (
            <ul className="suggestion-list">
              {suggestions.map((s, i) => (
                <li key={i}>
                  <span className="suggestion-num">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Score Distribution */}
        {totalDist > 0 && (
          <div className="analysis-card">
            <div className="ac-title">📊 Score Distribution</div>
            <div className="dist-chart">
              <DistributionBar label="Excellent (8-10)" count={score_distribution.excellent || 0} total={totalDist} color="#10b981" />
              <DistributionBar label="Good (6-7)" count={score_distribution.good || 0} total={totalDist} color="#0ea5e9" />
              <DistributionBar label="Average (4-5)" count={score_distribution.average || 0} total={totalDist} color="#f59e0b" />
              <DistributionBar label="Poor (0-3)" count={score_distribution.poor || 0} total={totalDist} color="#ef4444" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
