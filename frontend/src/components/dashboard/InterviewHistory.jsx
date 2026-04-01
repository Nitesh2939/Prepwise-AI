import { useState } from "react";

const GRADE_COLOR = {
  "A+": "#00e5a0", A: "#10b981", B: "#0ea5e9",
  C: "#f59e0b", D: "#f97316", F: "#ef4444"
};

function GradeBadge({ grade }) {
  return (
    <span className="grade-badge" style={{ background: GRADE_COLOR[grade] || "#475569" }}>
      {grade}
    </span>
  );
}

function ScoreBar({ score }) {
  const pct = (score / 10) * 100;
  const color = score >= 8 ? "#10b981" : score >= 6 ? "#0ea5e9" : score >= 4 ? "#f59e0b" : "#ef4444";
  return (
    <div className="score-bar-wrap">
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="score-bar-label">{score}/10</span>
    </div>
  );
}

function InterviewCard({ interview, index }) {
  const [expanded, setExpanded] = useState(false);
  const { date, role, score, grade, question, answer, ai_feedback } = interview;

  return (
    <div className={`history-card ${expanded ? "expanded" : ""}`} style={{ animationDelay: `${index * 60}ms` }}>
      <div className="history-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="history-meta">
          <span className="history-date">{date}</span>
          <span className="history-role">{role}</span>
        </div>
        <div className="history-score-row">
          <ScoreBar score={score} />
          <GradeBadge grade={grade} />
          <span className="expand-toggle">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {expanded && (
        <div className="history-card-body">
          <div className="history-section">
            <div className="history-section-label">Question</div>
            <p className="history-question">{question}</p>
          </div>

          <div className="history-section">
            <div className="history-section-label">Your Answer</div>
            <p className="history-answer">{answer}</p>
          </div>

          {ai_feedback && (
            <div className="history-section">
              <div className="history-section-label">AI Evaluation</div>
              <div className="ai-feedback-grid">
                <div className="feedback-summary">{ai_feedback.summary}</div>
                <div className="feedback-cols">
                  {ai_feedback.strengths?.length > 0 && (
                    <div className="feedback-col strengths">
                      <div className="fc-title">✅ Strengths</div>
                      <ul>
                        {ai_feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                  {ai_feedback.weaknesses?.length > 0 && (
                    <div className="feedback-col weaknesses">
                      <div className="fc-title">⚠️ Weaknesses</div>
                      <ul>
                        {ai_feedback.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
                {ai_feedback.improvement && (
                  <div className="feedback-improvement">
                    💡 <strong>Improvement:</strong> {ai_feedback.improvement}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function InterviewHistory({ data, onPageChange, currentPage }) {
  if (!data) return null;
  const { interviews = [], total, total_pages, page } = data;

  if (interviews.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">📭</span>
        <p>No interviews yet. Start practicing to see your history!</p>
      </div>
    );
  }

  return (
    <div className="history-wrapper">
      <div className="history-header-row">
        <h3 className="chart-section-title">📜 Interview History</h3>
        <span className="history-count">{total} total</span>
      </div>

      <div className="history-list">
        {interviews.map((iv, i) => (
          <InterviewCard key={`${iv.date}-${i}`} interview={iv} index={i} />
        ))}
      </div>

      {total_pages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            ← Prev
          </button>
          <span className="page-info">{page} / {total_pages}</span>
          <button
            className="page-btn"
            disabled={page >= total_pages}
            onClick={() => onPageChange(page + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
