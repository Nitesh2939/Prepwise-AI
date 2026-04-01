import React from "react";

// ── Button factory keeps all button variants DRY ──────────────────────────────
function NavButton({ children, onClick, variant = "outline", active = false }) {
  const base = {
    cursor: "pointer",
    fontFamily: "'Space Mono', monospace",
    fontSize: 12,
    borderRadius: 6,
    padding: "8px 20px",
    transition: "all 0.2s",
    letterSpacing: 0.5,
  };

  const variants = {
    outline: {
      background: active ? "rgba(0,212,255,0.12)" : "transparent",
      border: `1px solid ${active ? "rgba(0,212,255,0.7)" : "rgba(0,212,255,0.3)"}`,
      color: "#00D4FF",
    },
    solid: {
      background: "#00D4FF",
      border: "none",
      color: "#050510",
      fontWeight: "bold",
    },
    danger: {
      background: "transparent",
      border: "1px solid rgba(239,68,68,0.4)",
      color: "#EF4444",
    },
  };

  const [hovered, setHovered] = React.useState(false);

  const hoverOverrides = {
    outline: hovered ? { background: "rgba(0,212,255,0.08)", borderColor: "rgba(0,212,255,0.6)" } : {},
    solid:   hovered ? { background: "#33dcff" } : {},
    danger:  hovered ? { background: "rgba(239,68,68,0.1)" } : {},
  };

  return (
    <button
      onClick={onClick}
      style={{ ...base, ...variants[variant], ...hoverOverrides[variant] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}

// ── Main Navbar ───────────────────────────────────────────────────────────────
export default function Navbar({ isLoggedIn, userName, onLogout, setPage, currentPage }) {

  const handleLogin = () => {
    if (typeof window.openModal === "function") {
      window.openModal("login");
    } else {
      setPage("login");
    }
  };

  const handleRegister = () => {
    if (typeof window.openModal === "function") {
      window.openModal("register");
    } else {
      setPage("register");
    }
  };

  const initial = userName ? userName.charAt(0).toUpperCase() : "U";

  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px 48px",
      borderBottom: "1px solid rgba(0,212,255,0.1)",
      position: "relative",
      zIndex: 10,
    }}>
      {/* ── Logo ── */}
      <div
        onClick={() => setPage("landing")}
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 18,
          letterSpacing: 2,
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <span style={{ color: "#fff" }}>PREP</span>
        <span style={{ color: "#00D4FF" }}>WISE</span>
      </div>

      {/* ── Right side ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {isLoggedIn ? (
          <>
            <NavButton
              variant="outline"
              active={currentPage === "dashboard"}
              onClick={() => setPage("dashboard")}
            >
              DASHBOARD
            </NavButton>

            {/* User badge */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(0,212,255,0.06)",
              border: "1px solid rgba(0,212,255,0.2)",
              borderRadius: 8,
              padding: "8px 16px",
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%",
                background: "linear-gradient(135deg,#00D4FF,#A855F7)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700, color: "#050510", flexShrink: 0,
              }}>
                {initial}
              </div>
              <span style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 12, color: "#00D4FF",
                letterSpacing: 0.5, whiteSpace: "nowrap",
              }}>
                Hello, {userName || "User"} 👋
              </span>
            </div>

            <NavButton variant="danger" onClick={onLogout}>
              LOG OUT
            </NavButton>
          </>
        ) : (
          <>
            <NavButton variant="outline" onClick={handleLogin}>
              LOG IN
            </NavButton>
            <NavButton variant="solid" onClick={handleRegister}>
              REGISTER
            </NavButton>
          </>
        )}
      </div>
    </nav>
  );
}
