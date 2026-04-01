import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { useState, useEffect, useRef, useCallback } from "react";
import Dashboard from "./pages/Dashboard"
import LandingPage from "./pages/LandingPage"
import RolesPage from "./pages/RolesPage"
import InterviewPage from "./pages/InterviewPage"
import ReportPage from "./pages/ReportPage"
import TypeWriter from "./components/TypeWriter"
import Navbar from "./components/Navbar"          // ← single source of truth
//import Waveform from "./components/Waveform"

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

// ── Shared Navbar props helper ─────────────────────────────────
// Avoids repeating the same 5 props on every page render
function useNavbarProps(isLoggedIn, userName, handleLogout, setPage, page) {
  return { isLoggedIn, userName, onLogout: handleLogout, setPage, currentPage: page };
}

// ══════════════════════════════════════════════════════════════
//  MAIN APP
// ══════════════════════════════════════════════════════════════
export default function App() {
  // ── Auth ────────────────────────────────────────────────────
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName]     = useState("");

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
  const [continuousVoiceMode, setContinuousVoiceMode] = useState(false);

  const timerRef       = useRef(null);
  const recognitionRef = useRef(null);

  const roleData = ROLES?.find(r => r.id === selectedRole);
  const questions = roleData?.questions || [];
  const totalQ    = questions.length;
  const currentQ  = questions?.[questionIdx] || "";

  // ── Read auth from localStorage on mount ────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    const name  = localStorage.getItem("userName");
    if (token) {
      setIsLoggedIn(true);
      setUserName(name || "User");
    }
  }, []);

  // ── Logout ───────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    setIsLoggedIn(false);
    setUserName("");
    setPage("landing");
  };

  // ── Login gate ───────────────────────────────────────────────
  const requireLogin = (fn) => {
    if (!localStorage.getItem("token")) {
      window.openModal("login");
      return;
    }
    fn();
  };

  // ── Start interview ──────────────────────────────────────────
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

  const startAnswering = () => {
    setAnswer("");
    setPhase("answering");
    setTimer(120);
    setTimerActive(true);
  };

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
          messages: [{ role: "user", content: buildEvalPrompt(currentQ, answer, roleData?.label) }],
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
  }, [answer, currentQ, roleData]);

  const nextQuestion = () => {
    if (questionIdx + 1 >= totalQ) {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) { console.log("Stop recognizer:", e.message); }
        recognitionRef.current = null;
      }
      setContinuousVoiceMode(false);
      setListening(false);
      setPage("report");
      return;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) { console.log("Cleanup recognizer:", e.message); }
      recognitionRef.current = null;
    }
    setListening(false);
    setAnswer("");
    setQuestionIdx(i => i + 1);
    setCurrentEval(null);
    setPhase("question");
    setTypeDone(false);
    setTimer(120);
    setTimerActive(false);
    if (continuousVoiceMode) {
      setTimeout(() => { startVoiceRecognizer(); }, 150);
    }
  };

  // ── Voice ────────────────────────────────────────────────────
  const startVoiceRecognizer = useCallback(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition not supported in your browser.");
      setContinuousVoiceMode(false);
      return;
    }
    try {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SR();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";
      let isListeningStarted = false;
      rec.onstart = () => {
        if (!isListeningStarted) {
          isListeningStarted = true;
          setListening(true);
          if (phase === "question") startAnswering();
        }
      };
      let accumulatedFinal = "";
      rec.onresult = (e) => {
        let interimTranscript = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const transcript = e.results[i][0].transcript;
          if (e.results[i].isFinal) { accumulatedFinal += transcript + " "; }
          else { interimTranscript += transcript; }
        }
        const fullTranscript = accumulatedFinal + interimTranscript;
        if (fullTranscript.trim()) setAnswer(fullTranscript.trim());
      };
      rec.onend = () => { setListening(false); };
      rec.onerror = e => { if (e.error !== "aborted") console.error("🎙️ Speech recognition error:", e.error); };
      recognitionRef.current = rec;
      rec.start();
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      setListening(false);
      setContinuousVoiceMode(false);
    }
  }, [continuousVoiceMode, page, phase]);

  const toggleVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition not supported in your browser.");
      return;
    }
    if (listening || continuousVoiceMode) {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) { console.log("Stop recognizer:", e.message); }
        recognitionRef.current = null;
      }
      setListening(false);
      setContinuousVoiceMode(false);
      return;
    }
    setContinuousVoiceMode(true);
    startVoiceRecognizer();
  };

  // ── Shared Navbar props ──────────────────────────────────────
  const navbarProps = {
    isLoggedIn,
    userName,
    onLogout: handleLogout,
    setPage,
    currentPage: page,
  };

  // ── Inject global styles once ────────────────────────────────
  const StyleTag = () => <style>{globalStyles}</style>;

  // ════════════════════════════════════════════════
  //  RENDER — Navbar wraps ALL pages
  // ════════════════════════════════════════════════
  return (
    <>
      <StyleTag />
      <Navbar {...navbarProps} />

      {page === "landing" && (
        <LandingPage
          isLoggedIn={isLoggedIn}
          userName={userName}
          handleLogout={handleLogout}
          setPage={setPage}
          ROLES={ROLES}
          startInterview={startInterview}
          requireLogin={requireLogin}
          globalStyles={globalStyles}
        />
      )}

      {page === "roles" && (
        <RolesPage
          isLoggedIn={isLoggedIn}
          userName={userName}
          handleLogout={handleLogout}
          setPage={setPage}
          ROLES={ROLES}
          startInterview={startInterview}
          globalStyles={globalStyles}
        />
      )}

      {page === "dashboard" && (
        <Dashboard setPage={setPage} />
      )}

      {page === "interview" && (
        <InterviewPage
          isLoggedIn={isLoggedIn}
          userName={userName}
          handleLogout={handleLogout}
          setPage={setPage}
          selectedRole={selectedRole}
          ROLES={ROLES}
          questionIdx={questionIdx}
          questions={questions}
          answer={answer}
          setAnswer={setAnswer}
          recording={listening}
          startRecording={toggleVoice}
          stopRecording={toggleVoice}
          listening={listening}
          continuousVoiceMode={continuousVoiceMode}
          evaluating={loading}
          doneTyping={typeDone}
          setDoneTyping={setTypeDone}
          evaluateAnswer={submitAnswer}
          nextQuestion={nextQuestion}
          startAnswering={startAnswering}
          phase={phase}
          timer={timer}
          evaluations={evaluations}
          currentEval={currentEval}
          globalStyles={globalStyles}
        />
      )}

      {page === "report" && (
        <ReportPage
          isLoggedIn={isLoggedIn}
          userName={userName}
          handleLogout={handleLogout}
          setPage={setPage}
          evaluations={evaluations}
          selectedRole={selectedRole}
          ROLES={ROLES}
          startInterview={startInterview}
          globalStyles={globalStyles}
        />
      )}
    </>
  );
}
