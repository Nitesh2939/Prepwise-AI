import ScoreRing from "../components/ScoreRing"

export default function ReportPage({
  isLoggedIn,
  userName,
  handleLogout,
  setPage,
  evaluations,
  selectedRole,
  ROLES,
  startInterview,
  globalStyles,
}) {
  // Calculate statistics
  const total = evaluations.length;
  const avg = total ? evaluations.reduce((a, e) => a + e.eval.score, 0) / total : 0;
  const grade = avg >= 9 ? "A+" : avg >= 8 ? "A" : avg >= 7 ? "B+" : avg >= 6 ? "B" : avg >= 5 ? "C" : "D";
  const scoreColor = avg >= 8 ? "#10B981" : avg >= 6 ? "#F59E0B" : "#EF4444";
  const roleData = ROLES?.find(r => r.id === selectedRole);

  return (
    <>
      <style>{globalStyles}</style>
      <div className="grid-bg" style={{ minHeight: "100vh", background: "#050510" }}>
        
        <div style={{ padding: "40px 48px" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            {/* Summary Header */}
            <div className="animate-up" style={{ background: "linear-gradient(135deg,rgba(0,212,255,0.08),rgba(168,85,247,0.05))", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 24, padding: 40, marginBottom: 32, display: "flex", gap: 32, alignItems: "center" }}>
              <div style={{ textAlign: "center" }}>
                <ScoreRing score={avg} size={140} />
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 32, color: scoreColor, fontWeight: 700, marginTop: 8 }}>{grade}</div>
                <div style={{ color: "#555", fontSize: 12 }}>Final Grade</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#00D4FF", letterSpacing: 3, marginBottom: 12 }}>INTERVIEW COMPLETE</div>
                <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>Performance Report</h2>
                <div style={{ color: "#666", fontSize: 13, marginBottom: 20 }}>
                  Candidate: <span style={{ color: "#00D4FF" }}>{userName}</span> &nbsp;•&nbsp; Role: <span style={{ color: roleData?.color }}>{roleData?.label}</span> &nbsp;•&nbsp; {total} questions
                </div>
                <div style={{ display: "flex", gap: 24 }}>
                  <div><div style={{ fontFamily: "'Space Mono',monospace", fontSize: 24, color: "#fff" }}>{avg.toFixed(1)}<span style={{ fontSize: 14, color: "#555" }}>/10</span></div><div style={{ color: "#555", fontSize: 12 }}>Avg Score</div></div>
                  <div><div style={{ fontFamily: "'Space Mono',monospace", fontSize: 24, color: "#fff" }}>{evaluations.filter(e => e.eval.score >= 7).length}<span style={{ fontSize: 14, color: "#555" }}>/{total}</span></div><div style={{ color: "#555", fontSize: 12 }}>Strong Answers</div></div>
                  <div><div style={{ fontFamily: "'Space Mono',monospace", fontSize: 24, color: "#fff" }}>{Math.round(avg * 10)}%</div><div style={{ color: "#555", fontSize: 12 }}>Readiness</div></div>
                </div>
              </div>
            </div>

            {/* Question-by-Question Breakdown */}
            <div className="animate-up" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24, marginBottom: 24 }}>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 20 }}>QUESTION-BY-QUESTION BREAKDOWN</div>
              {evaluations.map((e, i) => {
                const color = e.eval.score >= 8 ? "#10B981" : e.eval.score >= 6 ? "#F59E0B" : "#EF4444";
                return (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: "#aaa", maxWidth: "80%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Q{i + 1}: {e.question}</span>
                      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, color }}>{e.eval.score.toFixed(1)}</span>
                    </div>
                    <div style={{ height: 6, background: "#111", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${e.eval.score * 10}%`, background: `linear-gradient(90deg,${color}88,${color})`, borderRadius: 3, transition: "width 1s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detailed Review */}
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 16 }}>DETAILED REVIEW</div>
            {evaluations.map((e, i) => (
              <div key={i} className="animate-up" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: "#555", fontFamily: "'Space Mono',monospace", marginBottom: 6 }}>Q{i + 1}</div>
                    <div style={{ fontSize: 15, fontWeight: 500, color: "#ddd" }}>{e.question}</div>
                  </div>
                  <ScoreRing score={e.eval.score} size={64} />
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: "#555", marginBottom: 6 }}>YOUR ANSWER</div>
                  <div style={{ fontSize: 13, color: "#888", lineHeight: 1.6 }}>{e.answer}</div>
                </div>
                <div style={{ fontSize: 13, color: "#aaa", lineHeight: 1.6 }}>{e.eval.summary}</div>
              </div>
            ))}

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 16, marginTop: 32 }}>
              <button onClick={() => startInterview(selectedRole)} style={{ background: "linear-gradient(135deg,#00D4FF,#0099bb)", border: "none", color: "#050510", padding: "14px 32px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 15 }}>Practice Again →</button>
              <button onClick={() => setPage("roles")} style={{ background: "transparent", border: "1px solid rgba(0,212,255,0.3)", color: "#00D4FF", padding: "14px 32px", borderRadius: 10, cursor: "pointer", fontSize: 15 }}>Try Another Role</button>
              <button onClick={() => window.print()} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "#aaa", padding: "14px 32px", borderRadius: 10, cursor: "pointer", fontSize: 15 }}>Save Report</button>
              <button onClick={() => setPage("landing")} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "#555", padding: "14px 32px", borderRadius: 10, cursor: "pointer", fontSize: 15 }}>Home</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
