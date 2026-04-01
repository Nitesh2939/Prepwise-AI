import React, { useState } from "react"
import TypeWriter from "../components/TypeWriter"
import Waveform from "../components/Waveform"
import ScoreRing from "../components/ScoreRing"

export default function InterviewPage({
  isLoggedIn,
  userName,
  phase,
  timer,
  evaluations,
  currentEval,
  handleLogout,
  setPage,
  selectedRole,
  ROLES,
  questionIdx,
  questions,
  answer,
  setAnswer,
  recording,
  startRecording,
  stopRecording,
  evaluating,
  doneTyping,
  setDoneTyping,
  evaluateAnswer,
  nextQuestion,
  startAnswering,
  listening,
  continuousVoiceMode,
  globalStyles
}) {
  const currentQ = questions?.[questionIdx] || "";
  const totalQ = questions.length;
  const role = ROLES.find(r => r.id === selectedRole);

  const submitAnswer = () => {
    if (answer.trim()) {
      evaluateAnswer?.();
    }
  };

  return (
    <>
      <style>{globalStyles}</style>

      <div className="grid-bg" style={{ minHeight: "100vh", background: "#050510", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 14, color: "#00D4FF" }}>PREPWISE</div>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ display: "flex", gap: 8 }}>
              {questions.map((_, i) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i < questionIdx ? "#10B981" : i === questionIdx ? "#00D4FF" : "#1a1a3a", boxShadow: i === questionIdx ? "0 0 8px #00D4FF" : "none" }} />
              ))}
            </div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#555" }}>{questionIdx+1} / {totalQ}</div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, color: timer < 30 ? "#EF4444" : "#00D4FF" }}>
              {String(Math.floor(timer/60)).padStart(2,"0")}:{String(timer%60).padStart(2,"0")}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981", animation: "pulse 2s infinite" }} />
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#10B981" }}>LIVE</span>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", maxWidth: 1100, margin: "0 auto", width: "100%", padding: "32px", gap: 32 }}>
          {/* AI Panel */}
          <div style={{ width: 280, flexShrink: 0 }}>
            <div style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)", borderRadius: 20, padding: 24, textAlign: "center", marginBottom: 20 }}>
              <div style={{ width: 80, height: 80, margin: "0 auto 16px", borderRadius: "50%", background: "linear-gradient(135deg,#0a0a2e,#001a33)", border: "2px solid rgba(0,212,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, position: "relative" }}>
                🤖
                <div style={{ position: "absolute", bottom: 2, right: 2, width: 12, height: 12, borderRadius: "50%", background: "#10B981", border: "2px solid #050510" }} />
              </div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, color: "#00D4FF", marginBottom: 4 }}>ARIA</div>
              <div style={{ fontSize: 11, color: "#555" }}>AI Interviewer</div>
              <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}><Waveform active={phase === "question" || phase === "evaluating"} /></div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 12, color: "#555", marginBottom: 12, fontFamily: "'Space Mono',monospace" }}>SESSION INFO</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "#666" }}>Candidate</span>
                <span style={{ fontSize: 12, color: "#00D4FF" }}>{userName || "Guest"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "#666" }}>Role</span>
                <span style={{ fontSize: 12, color: role?.color }}>{role?.label}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "#666" }}>Progress</span>
                <span style={{ fontSize: 12, color: "#fff" }}>{Math.round((questionIdx/totalQ)*100)}%</span>
              </div>
              {evaluations.length > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "#666" }}>Avg Score</span>
                  <span style={{ fontSize: 12, color: "#10B981" }}>{(evaluations.reduce((a,e)=>a+e.eval.score,0)/evaluations.length).toFixed(1)}/10</span>
                </div>
              )}
            </div>
          </div>

          {/* Main */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="animate-up" style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.15)", borderRadius: 16, padding: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00D4FF", boxShadow: "0 0 8px #00D4FF" }} />
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#00D4FF", letterSpacing: 2 }}>QUESTION {questionIdx+1}</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 500, lineHeight: 1.5, color: "#e0e0f0" }}>
                {phase !== "question" || doneTyping ? (
  currentQ
) : (
  <TypeWriter 
    text={currentQ || ""}
    speed={25}
    onDone={() => setDoneTyping(true)}
  />
)}
              </div>
              {phase === "question" && doneTyping && (
<button 
  onClick={() => startAnswering?.()}
  className="animate-up"
  style={{
    marginTop: 20,
    background: "linear-gradient(135deg,#00D4FF,#0099bb)",
    border: "none",
    color: "#050510",
    padding: "10px 28px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 14
  }}
>
  Start Answering →
</button>
)}
            </div>

            {(phase === "answering" || phase === "evaluating" || phase === "result") && (
              <div className="animate-up" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#555", letterSpacing: 2 }}>YOUR ANSWER</span>
                  <button onClick={startRecording} style={{ background: listening || continuousVoiceMode ? "rgba(239,68,68,0.2)" : "rgba(0,212,255,0.1)", border: `1px solid ${listening || continuousVoiceMode ? "#EF4444" : "rgba(0,212,255,0.3)"}`, color: listening || continuousVoiceMode ? "#EF4444" : "#00D4FF", padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                    {listening ? "🔴 Stop" : continuousVoiceMode ? "🎤 Continuous ON" : "🎤 Voice"}
                  </button>
                </div>
                <textarea value={answer} onChange={e => setAnswer(e.target.value)} disabled={phase !== "answering"} placeholder="Type your answer here..." rows={5}
                  style={{ width: "100%", background: "transparent", border: "none", color: "#e0e0f0", fontSize: 16, lineHeight: 1.7, resize: "none", fontFamily: "'Sora',sans-serif" }} />
                {phase === "answering" && (
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                    <button onClick={submitAnswer} disabled={!answer.trim()} style={{ background: answer.trim() ? "linear-gradient(135deg,#A855F7,#7c3aed)" : "#1a1a3a", border: "none", color: answer.trim() ? "#fff" : "#555", padding: "12px 32px", borderRadius: 8, cursor: answer.trim() ? "pointer" : "not-allowed", fontWeight: 700, fontSize: 14 }}>Submit Answer →</button>
                  </div>
                )}
              </div>
            )}

            {phase === "evaluating" && (
              <div className="animate-fade" style={{ background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: 16, padding: 24, display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 24, height: 24, border: "2px solid rgba(168,85,247,0.3)", borderTop: "2px solid #A855F7", borderRadius: "50%", animation: "authSpin 0.8s linear infinite" }} />
                <div>
                  <div style={{ fontFamily: "'Space Mono',monospace", color: "#A855F7", fontSize: 13 }}>Evaluating your answer...</div>
                  <div style={{ color: "#555", fontSize: 12, marginTop: 4 }}>AI is analyzing correctness, clarity, and depth</div>
                </div>
              </div>
            )}

            {phase === "result" && currentEval && (
              <div className="animate-up" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 28 }}>
                <div style={{ display: "flex", gap: 24, marginBottom: 24 }}>
                  <ScoreRing score={currentEval.score} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 24, color: "#fff", fontWeight: 700 }}>{currentEval.grade}</span>
                      <span style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "3px 10px", fontSize: 12, color: "#999" }}>
                        {currentEval.score >= 8 ? "Excellent" : currentEval.score >= 6 ? "Good" : currentEval.score >= 4 ? "Average" : "Needs Work"}
                      </span>
                    </div>
                    <p style={{ color: "#aaa", fontSize: 15, lineHeight: 1.6 }}>{currentEval.summary}</p>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, padding: 16 }}>
                    <div style={{ fontSize: 11, color: "#10B981", fontFamily: "'Space Mono',monospace", marginBottom: 8, letterSpacing: 1 }}>STRENGTHS</div>
                    {currentEval.strengths.map((s,i) => <div key={i} style={{ color: "#ccc", fontSize: 13, marginBottom: 4 }}>✓ {s}</div>)}
                  </div>
                  <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: 16 }}>
                    <div style={{ fontSize: 11, color: "#EF4444", fontFamily: "'Space Mono',monospace", marginBottom: 8, letterSpacing: 1 }}>WEAKNESSES</div>
                    {currentEval.weaknesses.map((w,i) => <div key={i} style={{ color: "#ccc", fontSize: 13, marginBottom: 4 }}>✗ {w}</div>)}
                  </div>
                </div>
                <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: "#F59E0B", fontFamily: "'Space Mono',monospace", marginBottom: 6, letterSpacing: 1 }}>💡 IMPROVEMENT TIP</div>
                  <div style={{ color: "#ccc", fontSize: 14 }}>{currentEval.improvement}</div>
                </div>
                {currentEval.followUp && (
                  <div style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: "#00D4FF", fontFamily: "'Space Mono',monospace", marginBottom: 6, letterSpacing: 1 }}>FOLLOW-UP</div>
                    <div style={{ color: "#ccc", fontSize: 14 }}>{currentEval.followUp}</div>
                  </div>
                )}
                <button onClick={nextQuestion} style={{ background: "linear-gradient(135deg,#00D4FF,#0099bb)", border: "none", color: "#050510", padding: "12px 32px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
                  {questionIdx+1 >= totalQ ? "View Final Report →" : "Next Question →"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

}