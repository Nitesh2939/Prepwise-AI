import { useState, useEffect, useRef, useCallback } from "react";
import Dashboard from "./pages/Dashboard"
// ── Constants outside component ───────────────────────────────
const ROLES = [
  { id: "frontend", label: "Frontend Developer", icon: "⬡", color: "#00D4FF", questions: [
    "Explain the difference between state and props in React.",
    "What is the Virtual DOM and how does it work?",
    "Describe CSS specificity and how it affects styling.",
    "What are React hooks? Name three and explain their use.",
    "How does event delegation work in JavaScript?",
    "What is the difference between `null` and `undefined`?",
    "Explain closures in JavaScript with an example.",
  ]},
  { id: "backend", label: "Backend Developer", icon: "⬢", color: "#A855F7", questions: [
    "What is REST and what are its core principles?",
    "Explain the difference between SQL and NoSQL databases.",
    "How does authentication differ from authorization?",
    "What is middleware in the context of web frameworks?",
    "Describe how you'd design a rate-limiting system.",
    "What are database indexes and when should you use them?",
    "Explain the CAP theorem.",
  ]},
  { id: "cloud", label: "Cloud Engineer", icon: "◈", color: "#FF6B35", questions: [
    "What is Docker and how does containerization work?",
    "Explain Kubernetes and its key components.",
    "What is CI/CD and why is it important?",
    "Describe the difference between IaaS, PaaS, and SaaS.",
    "What is infrastructure as code? Name a tool.",
    "How does auto-scaling work in cloud environments?",
    "Explain the concept of microservices architecture.",
  ]},
  { id: "data", label: "Data Analyst", icon: "◇", color: "#10B981", questions: [
    "What is the difference between supervised and unsupervised learning?",
    "Explain what a p-value represents.",
    "How do you handle missing data in a dataset?",
    "What is the difference between correlation and causation?",
    "Describe when you would use a bar chart vs a line chart.",
    "What is overfitting and how do you prevent it?",
    "Explain what a confusion matrix is.",
  ]},
  { id: "hr", label: "HR / Behavioral", icon: "◉", color: "#F59E0B", questions: [
    "Tell me about yourself and your background.",
    "Describe a challenging situation and how you resolved it.",
    "Where do you see yourself in 5 years?",
    "What is your greatest professional strength?",
    "Tell me about a time you worked in a team under pressure.",
    "How do you handle constructive criticism?",
    "Why do you want to work at this company?",
  ]},
];

const SYSTEM_PROMPT = `You are an expert technical interviewer AI. Evaluate the candidate's interview answer with precision and fairness.
Return ONLY a valid JSON object with this exact structure:
{
  "score": <number 1-10>,
  "grade": "<A+|A|B+|B|C+|C|D|F>",
  "summary": "<2-3 sentence assessment>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "weaknesses": ["<weakness 1>"],
  "improvement": "<one specific actionable tip>",
  "followUp": "<optional follow-up question or null>"
}
Be specific, honest, and constructive. Score honestly — a weak answer should score low.`;

function buildEvalPrompt(question, answer, roleLabel) {
  return `Interview Role: ${roleLabel}\nQuestion: "${question}"\nCandidate's Answer: "${answer}"\nEvaluate this answer for: technical correctness, clarity, depth, and communication quality.`;
}

// ── Sub-components (outside App to avoid recreation on render) ──

function TypeWriter({ text, speed = 25, onDone }) {
  const [displayed, setDisplayed] = useState("");
  const idx = useRef(0);
  useEffect(() => {
    setDisplayed(""); idx.current = 0;
    if (!text) return;
    const iv = setInterval(() => {
      idx.current++;
      setDisplayed(text.slice(0, idx.current));
      if (idx.current >= text.length) { clearInterval(iv); onDone && onDone(); }
    }, speed);
    return () => clearInterval(iv);
  }, [text]);
  return <span>{displayed}<span className="cursor">|</span></span>;
}

function ScoreRing({ score, size = 120 }) {
  const r = 46, circ = 2 * Math.PI * r, dash = circ * (score / 10);
  const color = score >= 8 ? "#10B981" : score >= 6 ? "#F59E0B" : score >= 4 ? "#FF6B35" : "#EF4444";
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#1a1a2e" strokeWidth="8" />
      <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 50 50)"
        style={{ transition: "stroke-dasharray 1s ease", filter: `drop-shadow(0 0 6px ${color})` }} />
      <text x="50" y="50" textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize="20" fontWeight="bold" fontFamily="'Courier New',monospace">{score.toFixed(1)}</text>
      <text x="50" y="65" textAnchor="middle" fill="#666" fontSize="8" fontFamily="sans-serif">/10</text>
    </svg>
  );
}

function Waveform({ active }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, height: 32 }}>
      {[...Array(12)].map((_, i) => (
        <div key={i} style={{
          width: 3, borderRadius: 2,
          background: active ? "#00D4FF" : "#333",
          height: active ? `${Math.random() * 24 + 8}px` : "4px",
          animation: active ? `wave ${0.5 + i * 0.07}s ease-in-out infinite alternate` : "none",
          transition: "height 0.3s, background 0.3s",
        }} />
      ))}
    </div>
  );
}

// ── Shared navbar shown on all pages ─────────────────────────
function Navbar({ isLoggedIn, userName, onLogout, setPage }) {
  return (
    <nav style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "20px 48px", borderBottom: "1px solid rgba(0,212,255,0.1)",
      position: "relative", zIndex: 10,
    }}>
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 18, color: "#00D4FF", letterSpacing: 2 }}>
        <span style={{ color: "#fff" }}>PREP</span>WISE
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {isLoggedIn ? (
          <>
          <button
  onClick={() => setPage("dashboard")}
  style={{
    background: "transparent",
    border: "1px solid rgba(0,212,255,0.3)",
    color: "#00D4FF",
    padding: "8px 16px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12
  }}
>
  DASHBOARD
</button>
            {/* Avatar + full registered name */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.2)",
              borderRadius: 8, padding: "8px 16px",
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%",
                background: "linear-gradient(135deg,#00D4FF,#A855F7)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700, color: "#050510", flexShrink: 0,
              }}>
                {userName ? userName.charAt(0).toUpperCase() : "U"}
              </div>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#00D4FF", letterSpacing: 0.5, whiteSpace: "nowrap" }}>
                Hello, {userName || "User"} 👋
              </span>
            </div>
            <button onClick={onLogout}
              style={{
                background: "transparent", border: "1px solid rgba(239,68,68,0.4)",
                color: "#EF4444", padding: "8px 20px", borderRadius: 6,
                cursor: "pointer", fontFamily: "'Space Mono',monospace", fontSize: 12, transition: "all 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              LOG OUT
            </button>
          </>
        ) : (
          <>
            <button onClick={() => window.openModal("login")} style={{
              background: "transparent", border: "1px solid rgba(0,212,255,0.3)",
              color: "#00D4FF", padding: "8px 20px", borderRadius: 6,
              cursor: "pointer", fontFamily: "'Space Mono',monospace", fontSize: 12,
            }}>LOG IN</button>
            <button onClick={() => window.openModal("register")} style={{
              background: "#00D4FF", border: "none", color: "#050510",
              padding: "8px 20px", borderRadius: 6, cursor: "pointer",
              fontFamily: "'Space Mono',monospace", fontSize: 12, fontWeight: "bold",
            }}>REGISTER</button>
          </>
        )}
      </div>
    </nav>
  );
}

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Sora:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Sora', sans-serif; background: #050510; color: #e0e0f0; min-height: 100vh; }
  .cursor { animation: blink 1s step-end infinite; }
  @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes wave    { from{transform:scaleY(1)} to{transform:scaleY(2.5)} }
  @keyframes pulse   { 0%,100%{opacity:.6} 50%{opacity:1} }
  @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes authSpin { to { transform: translate(-50%,-50%) rotate(360deg); } }
  .animate-up   { animation: slideUp 0.5s ease forwards; }
  .animate-fade { animation: fadeIn  0.4s ease forwards; }
  .grid-bg {
    background-image: linear-gradient(rgba(0,212,255,0.03) 1px,transparent 1px), linear-gradient(90deg,rgba(0,212,255,0.03) 1px,transparent 1px);
    background-size: 40px 40px;
  }
  ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-track{background:#0a0a1a} ::-webkit-scrollbar-thumb{background:#1a1a3a;border-radius:3px}
  textarea:focus,input:focus{outline:none}
`;

// ══════════════════════════════════════════════════════════════
//  MAIN APP
// ══════════════════════════════════════════════════════════════
export default function App() {
  // ── Auth ────────────────────────────────────────────────────
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName]     = useState("");  // full registered name

  // ── Pages & interview ────────────────────────────────────────
  const [page, setPage]               = useState("landing");
  const [selectedRole, setSelectedRole] = useState(null);
  const [questionIdx, setQuestionIdx]  = useState(0);
  const [answer, setAnswer]            = useState("");
  const [evaluations, setEvaluations]  = useState([]);
  const [currentEval, setCurrentEval]  = useState(null);
  const [loading, setLoading]          = useState(false);
  const [phase, setPhase]              = useState("question");
  const [timer, setTimer]              = useState(120);
  const [timerActive, setTimerActive]  = useState(false);
  const [listening, setListening]      = useState(false);
  const [typeDone, setTypeDone]        = useState(false);

  const timerRef       = useRef(null);
  const recognitionRef = useRef(null);

  const role      = ROLES.find(r => r.id === selectedRole);
  const questions = role?.questions || [];
  const currentQ  = questions[questionIdx];
  const totalQ    = questions.length;

  // ── Read auth from localStorage on mount ────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    const name  = localStorage.getItem("userName");  // full name saved during register
    if (token) {
      setIsLoggedIn(true);
      setUserName(name || "User");
    }
  }, []);

  // ── Logout: clear storage + state, NO page reload ───────────
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    setIsLoggedIn(false);
    setUserName("");
    setPage("landing");
  };

  // ── Login gate: show modal if not logged in ──────────────────
  const requireLogin = (fn) => {
    if (!localStorage.getItem("token")) {
      window.openModal("login");
      return;
    }
    fn();
  };

  // ── Start interview (always gated) ───────────────────────────
  const startInterview = (roleId) => {
    requireLogin(() => {
      setSelectedRole(roleId);
      setQuestionIdx(0);
      setEvaluations([]);
      setCurrentEval(null);
      setAnswer("");
      setPhase("question");
      setTypeDone(false);
      setTimer(120);
      setTimerActive(false);
      setPage("interview");
    });
  };

  // ── Timer ────────────────────────────────────────────────────
  useEffect(() => {
    if (timerActive && timer > 0) timerRef.current = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timerActive, timer]);

  const startAnswering = () => { setPhase("answering"); setTimer(120); setTimerActive(true); };

  // ── AI Evaluation ────────────────────────────────────────────
  const submitAnswer = useCallback(async () => {
    if (!answer.trim()) return;
    setTimerActive(false); setPhase("evaluating"); setLoading(true);
    try {
      const res  = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: buildEvalPrompt(currentQ, answer, role?.label) }],
        }),
      });
      const data   = await res.json();
      const text   = data.content?.map(b => b.text || "").join("") || "";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setCurrentEval(parsed);
      setEvaluations(prev => [...prev, { question: currentQ, answer, eval: parsed }]);
    } catch {
      const fb = { score: 5, grade: "C", summary: "Unable to evaluate.", strengths: ["Attempted"], weaknesses: ["Unavailable"], improvement: "Cover key concepts.", followUp: null };
      setCurrentEval(fb);
      setEvaluations(prev => [...prev, { question: currentQ, answer, eval: fb }]);
    }
    setLoading(false); setPhase("result");
  }, [answer, currentQ, role]);

  const nextQuestion = () => {
    if (questionIdx + 1 >= totalQ) { setPage("report"); return; }
    setQuestionIdx(i => i + 1); setAnswer(""); setCurrentEval(null);
    setPhase("question"); setTypeDone(false); setTimer(120); setTimerActive(false);
  };

  // ── Voice ────────────────────────────────────────────────────
  const toggleVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) { alert("Not supported."); return; }
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR(); rec.continuous = true; rec.interimResults = true;
    rec.onresult = e => setAnswer(Array.from(e.results).map(r => r[0].transcript).join(""));
    rec.onend = () => setListening(false);
    recognitionRef.current = rec; rec.start(); setListening(true);
    if (phase === "question") startAnswering();
  };

  // ════════════════════════════════════════════════
  //  LANDING
  // ════════════════════════════════════════════════
  if (page === "landing") return (
    <>
      <style>{globalStyles}</style>
      <div className="grid-bg" style={{ minHeight: "100vh", background: "#050510" }}>
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px)" }} />
        <Navbar 
  isLoggedIn={isLoggedIn} 
  userName={userName} 
  onLogout={handleLogout}
  setPage={setPage}
/>

        <div style={{ maxWidth: 900, margin: "80px auto 0", padding: "0 48px", textAlign: "center", position: "relative", zIndex: 10 }}>
          <div style={{ display: "inline-block", border: "1px solid rgba(0,212,255,0.3)", borderRadius: 20, padding: "6px 16px", marginBottom: 24, color: "#00D4FF", fontFamily: "'Space Mono',monospace", fontSize: 11, letterSpacing: 2 }}>
            AI-POWERED • REAL-TIME EVALUATION • INSTANT FEEDBACK
          </div>
          <h1 style={{ fontSize: "clamp(40px,7vw,84px)", fontWeight: 700, lineHeight: 1.1, marginBottom: 24 }}>
            <span style={{ color: "#fff" }}>Practice Interviews.</span><br />
            <span style={{ background: "linear-gradient(135deg,#00D4FF,#A855F7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Land Your Dream Job.</span>
          </h1>
          <p style={{ fontSize: 18, color: "#8888aa", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}>
            A hyper-realistic AI interviewer that evaluates your answers, scores your performance, and coaches you to interview excellence.
          </p>
          <button onClick={() => {
  requireLogin(() => {
    setPage("roles")
  })
}} style={{ background: "linear-gradient(135deg,#00D4FF,#0099bb)", border: "none", color: "#050510", padding: "16px 44px", borderRadius: 8, cursor: "pointer", fontSize: 16, fontWeight: 700, letterSpacing: 1, boxShadow: "0 0 40px rgba(0,212,255,0.3)" }}>
            Start Free Interview →
          </button>
          <div style={{ display: "flex", justifyContent: "center", gap: 48, marginTop: 64, padding: "32px 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            {[["5+","Interview Roles"],["AI","Powered Scoring"],["Real-time","Feedback"],["PDF","Reports"]].map(([v,l]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 28, color: "#00D4FF", fontWeight: 700 }}>{v}</div>
                <div style={{ color: "#555", fontSize: 13, marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: 1000, margin: "60px auto", padding: "0 48px", display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          {ROLES.map(r => (
            <div key={r.id}
              style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${r.color}22`, borderRadius: 12, padding: "16px 24px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", transition: "all 0.2s" }}
              onClick={() => startInterview(r.id)}
              onMouseEnter={e => e.currentTarget.style.background = `${r.color}11`}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}>
              <span style={{ fontSize: 20, color: r.color }}>{r.icon}</span>
              <span style={{ color: "#ccc", fontSize: 14 }}>{r.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  // ════════════════════════════════════════════════
  //  ROLES PAGE
  // ════════════════════════════════════════════════
  if (page === "roles") return (
    <>
      <style>{globalStyles}</style>
      <div className="grid-bg" style={{ minHeight: "100vh", background: "#050510" }}>
        <Navbar 
  isLoggedIn={isLoggedIn} 
  userName={userName} 
  onLogout={handleLogout}
  setPage={setPage}
/>
        <div style={{ padding: "40px 48px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <button onClick={() => setPage("landing")} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#666", padding: "8px 16px", borderRadius: 6, cursor: "pointer", marginBottom: 40, fontSize: 13 }}>← Back</button>
            <div style={{ marginBottom: 48 }}>
              <p style={{ color: "#00D4FF", fontFamily: "'Space Mono',monospace", fontSize: 12, letterSpacing: 2, marginBottom: 12 }}>SELECT INTERVIEW TYPE</p>
              <h2 style={{ fontSize: 40, fontWeight: 700 }}>What role are you<br />preparing for?</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
              {ROLES.map((r, i) => (
                <div key={r.id} className="animate-up"
                  style={{ animationDelay: `${i*80}ms`, background: "rgba(255,255,255,0.03)", border: `1px solid ${r.color}33`, borderRadius: 16, padding: 28, cursor: "pointer", transition: "all 0.25s", position: "relative", overflow: "hidden" }}
                  onClick={() => startInterview(r.id)}
                  onMouseEnter={e => { e.currentTarget.style.background=`${r.color}0d`; e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow=`0 20px 40px ${r.color}22`; }}
                  onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.03)"; e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}>
                  <div style={{ fontSize: 36, marginBottom: 16, color: r.color }}>{r.icon}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{r.label}</h3>
                  <p style={{ color: "#555", fontSize: 13 }}>{r.questions.length} questions • AI-scored</p>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${r.color},transparent)`, opacity: 0.5 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
if (page === "dashboard") {
  return <div style={{color:"white"}}>Dashboard Page</div>
}
  // ════════════════════════════════════════════════
  //  INTERVIEW PAGE
  // ════════════════════════════════════════════════
  if (page === "interview") return (
    <>
      <style>{globalStyles}</style>
      <div className="grid-bg" style={{ minHeight: "100vh", background: "#050510", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 14, color: "#00D4FF" }}>INTERVIEW_AI</div>
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
                {phase !== "question" || typeDone ? currentQ : <TypeWriter text={currentQ} speed={25} onDone={() => setTypeDone(true)} />}
              </div>
              {phase === "question" && typeDone && (
                <button onClick={startAnswering} className="animate-up" style={{ marginTop: 20, background: "linear-gradient(135deg,#00D4FF,#0099bb)", border: "none", color: "#050510", padding: "10px 28px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>Start Answering →</button>
              )}
            </div>

            {(phase === "answering" || phase === "evaluating" || phase === "result") && (
              <div className="animate-up" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#555", letterSpacing: 2 }}>YOUR ANSWER</span>
                  <button onClick={toggleVoice} style={{ background: listening ? "rgba(239,68,68,0.2)" : "rgba(0,212,255,0.1)", border: `1px solid ${listening ? "#EF4444" : "rgba(0,212,255,0.3)"}`, color: listening ? "#EF4444" : "#00D4FF", padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                    {listening ? "🔴 Stop" : "🎤 Voice"}
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

  // ════════════════════════════════════════════════
  //  REPORT PAGE
  // ════════════════════════════════════════════════
  if (page === "report") {
    const total = evaluations.length;
    const avg   = total ? evaluations.reduce((a,e) => a+e.eval.score, 0) / total : 0;
    const grade = avg>=9?"A+":avg>=8?"A":avg>=7?"B+":avg>=6?"B":avg>=5?"C":"D";
    const sc    = avg>=8?"#10B981":avg>=6?"#F59E0B":"#EF4444";
    return (
      <>
        <style>{globalStyles}</style>
        <div className="grid-bg" style={{ minHeight: "100vh", background: "#050510" }}>
          <Navbar 
  isLoggedIn={isLoggedIn} 
  userName={userName} 
  onLogout={handleLogout}
  setPage={setPage}
/>
          <div style={{ padding: "40px 48px" }}>
            <div style={{ maxWidth: 860, margin: "0 auto" }}>
              <div className="animate-up" style={{ background: "linear-gradient(135deg,rgba(0,212,255,0.08),rgba(168,85,247,0.05))", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 24, padding: 40, marginBottom: 32, display: "flex", gap: 32, alignItems: "center" }}>
                <div style={{ textAlign: "center" }}>
                  <ScoreRing score={avg} size={140} />
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 32, color: sc, fontWeight: 700, marginTop: 8 }}>{grade}</div>
                  <div style={{ color: "#555", fontSize: 12 }}>Final Grade</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#00D4FF", letterSpacing: 3, marginBottom: 12 }}>INTERVIEW COMPLETE</div>
                  <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>Performance Report</h2>
                  <div style={{ color: "#666", fontSize: 13, marginBottom: 20 }}>
                    Candidate: <span style={{ color: "#00D4FF" }}>{userName}</span> &nbsp;•&nbsp; Role: <span style={{ color: role?.color }}>{role?.label}</span> &nbsp;•&nbsp; {total} questions
                  </div>
                  <div style={{ display: "flex", gap: 24 }}>
                    <div><div style={{ fontFamily: "'Space Mono',monospace", fontSize: 24, color: "#fff" }}>{avg.toFixed(1)}<span style={{ fontSize: 14, color: "#555" }}>/10</span></div><div style={{ color: "#555", fontSize: 12 }}>Avg Score</div></div>
                    <div><div style={{ fontFamily: "'Space Mono',monospace", fontSize: 24, color: "#fff" }}>{evaluations.filter(e=>e.eval.score>=7).length}<span style={{ fontSize: 14, color: "#555" }}>/{total}</span></div><div style={{ color: "#555", fontSize: 12 }}>Strong Answers</div></div>
                    <div><div style={{ fontFamily: "'Space Mono',monospace", fontSize: 24, color: "#fff" }}>{Math.round(avg*10)}%</div><div style={{ color: "#555", fontSize: 12 }}>Readiness</div></div>
                  </div>
                </div>
              </div>

              <div className="animate-up" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24, marginBottom: 24 }}>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 20 }}>QUESTION-BY-QUESTION BREAKDOWN</div>
                {evaluations.map((e,i) => {
                  const c = e.eval.score>=8?"#10B981":e.eval.score>=6?"#F59E0B":"#EF4444";
                  return (
                    <div key={i} style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: "#aaa", maxWidth: "80%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Q{i+1}: {e.question}</span>
                        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, color: c }}>{e.eval.score.toFixed(1)}</span>
                      </div>
                      <div style={{ height: 6, background: "#111", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${e.eval.score*10}%`, background: `linear-gradient(90deg,${c}88,${c})`, borderRadius: 3, transition: "width 1s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 16 }}>DETAILED REVIEW</div>
              {evaluations.map((e,i) => (
                <div key={i} className="animate-up" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24, marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: "#555", fontFamily: "'Space Mono',monospace", marginBottom: 6 }}>Q{i+1}</div>
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

  return null;
}
