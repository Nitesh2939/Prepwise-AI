import React from "react"

export default function LandingPage({
  isLoggedIn,
  userName,
  handleLogout,
  setPage,
  ROLES,
  startInterview,
  requireLogin,
  globalStyles
}) {
  return (
    <>
      <style>{globalStyles}</style>

      <div className="grid-bg" style={{ minHeight: "100vh", background: "#050510" }}>
        
        {/* Background effect */}
        <div style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px)"
        }} />


        {/* HERO SECTION */}
        <div style={{
          maxWidth: 900,
          margin: "80px auto 0",
          padding: "0 48px",
          textAlign: "center",
          position: "relative",
          zIndex: 10
        }}>

          <div style={{
            display: "inline-block",
            border: "1px solid rgba(0,212,255,0.3)",
            borderRadius: 20,
            padding: "6px 16px",
            marginBottom: 24,
            color: "#00D4FF",
            fontFamily: "'Space Mono',monospace",
            fontSize: 11,
            letterSpacing: 2
          }}>
            AI-POWERED • REAL-TIME EVALUATION • INSTANT FEEDBACK
          </div>

          <h1 style={{
            fontSize: "clamp(40px,7vw,84px)",
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: 24
          }}>
            <span style={{ color: "#fff" }}>Practice Interviews.</span><br />
            <span style={{
              background: "linear-gradient(135deg,#00D4FF,#A855F7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              Land Your Dream Job.
            </span>
          </h1>

          <p style={{
            fontSize: 18,
            color: "#8888aa",
            maxWidth: 560,
            margin: "0 auto 40px",
            lineHeight: 1.7
          }}>
            A hyper-realistic AI interviewer that evaluates your answers, scores your performance, and coaches you to interview excellence.
          </p>

          {/* START BUTTON */}
          <button
            onClick={() => {
              requireLogin(() => {
                setPage("roles")
              })
            }}
            style={{
              background: "linear-gradient(135deg,#00D4FF,#0099bb)",
              border: "none",
              color: "#050510",
              padding: "16px 44px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: 1,
              boxShadow: "0 0 40px rgba(0,212,255,0.3)"
            }}
          >
            Start Free Interview →
          </button>

          {/* STATS */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: 48,
            marginTop: 64,
            padding: "32px 0",
            borderTop: "1px solid rgba(255,255,255,0.06)"
          }}>
            {[["5+","Interview Roles"],["AI","Powered Scoring"],["Real-time","Feedback"],["PDF","Reports"]].map(([v,l]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: 28,
                  color: "#00D4FF",
                  fontWeight: 700
                }}>{v}</div>
                <div style={{ color: "#555", fontSize: 13, marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ROLES CARDS */}
        <div style={{
          maxWidth: 1000,
          margin: "60px auto",
          padding: "0 48px",
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          justifyContent: "center"
        }}>
          {ROLES.map(r => (
            <div key={r.id}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${r.color}22`,
                borderRadius: 12,
                padding: "16px 24px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                cursor: "pointer"
              }}
              onClick={() => startInterview(r.id)}
            >
              <span style={{ fontSize: 20, color: r.color }}>{r.icon}</span>
              <span style={{ color: "#ccc", fontSize: 14 }}>{r.label}</span>
            </div>
          ))}
        </div>

      </div>
    </>
  )
}