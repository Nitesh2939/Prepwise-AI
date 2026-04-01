import React from "react"

export default function RolesPage({
  isLoggedIn,
  userName,
  handleLogout,
  setPage,
  ROLES,
  startInterview,
  globalStyles
}) {
  return (
    <>
      <style>{globalStyles}</style>

      <div className="grid-bg" style={{ minHeight: "100vh", background: "#050510" }}>


        <div style={{ padding: "40px 48px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>

            {/* BACK BUTTON */}
            <button
              onClick={() => setPage("landing")}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#666",
                padding: "8px 16px",
                borderRadius: 6,
                cursor: "pointer",
                marginBottom: 40,
                fontSize: 13
              }}
            >
              ← Back
            </button>

            {/* TITLE */}
            <div style={{ marginBottom: 48 }}>
              <p style={{
                color: "#00D4FF",
                fontFamily: "'Space Mono',monospace",
                fontSize: 12,
                letterSpacing: 2,
                marginBottom: 12
              }}>
                SELECT INTERVIEW TYPE
              </p>

              <h2 style={{ fontSize: 40, fontWeight: 700 }}>
                What role are you<br />preparing for?
              </h2>
            </div>

            {/* ROLE CARDS */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
              gap: 20
            }}>
              {ROLES.map((r, i) => (
                <div
                  key={r.id}
                  className="animate-up"
                  style={{
                    animationDelay: `${i * 80}ms`,
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${r.color}33`,
                    borderRadius: 16,
                    padding: 28,
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                    transition: "all 0.25s"
                  }}
                  onClick={() => startInterview(r.id)}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = `${r.color}0d`
                    e.currentTarget.style.transform = "translateY(-4px)"
                    e.currentTarget.style.boxShadow = `0 20px 40px ${r.color}22`
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)"
                    e.currentTarget.style.transform = "none"
                    e.currentTarget.style.boxShadow = "none"
                  }}
                >
                  <div style={{
                    fontSize: 36,
                    marginBottom: 16,
                    color: r.color
                  }}>
                    {r.icon}
                  </div>

                  <h3 style={{
                    fontSize: 18,
                    fontWeight: 600,
                    marginBottom: 8
                  }}>
                    {r.label}
                  </h3>

                  <p style={{ color: "#555", fontSize: 13 }}>
                    {r.questions.length} questions • AI-scored
                  </p>

                  <div style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: `linear-gradient(90deg,transparent,${r.color},transparent)`,
                    opacity: 0.5
                  }} />
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </>
  )
}