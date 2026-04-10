"use client";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

// ─── Animation tokens ─────────────────────────────────────────────────────────
const EASE        = [0.22, 1, 0.36, 1];
const SPRING      = { type: "spring", stiffness: 380, damping: 30 };
const SPRING_SOFT = { type: "spring", stiffness: 260, damping: 26 };

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
};

const scaleIn = {
  hidden: { opacity: 0, scaleX: 0 },
  show:   { opacity: 1, scaleX: 1, transition: { duration: 0.7, ease: EASE } },
};

const nodeVariant = {
  hidden: { opacity: 0, scale: 0.5 },
  show:   { opacity: 1, scale: 1,   transition: { type: "spring", stiffness: 420, damping: 28 } },
};

// ─── Step SVG Icons ───────────────────────────────────────────────────────────
const StepIcons = {
  role: ({ accent }) => (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <defs><linearGradient id="ig-role" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop stopColor={accent}/><stop offset="1" stopColor="#A855F7"/></linearGradient></defs>
      <rect x="4" y="4" width="10" height="10" rx="2.5" stroke="url(#ig-role)" strokeWidth="1.5"/>
      <rect x="18" y="4" width="10" height="10" rx="2.5" stroke="url(#ig-role)" strokeWidth="1.5"/>
      <rect x="4" y="18" width="10" height="10" rx="2.5" stroke="url(#ig-role)" strokeWidth="1.5"/>
      <rect x="18" y="18" width="10" height="10" rx="2.5" stroke="url(#ig-role)" strokeWidth="1.5"/>
      <circle cx="9" cy="9" r="2" fill="url(#ig-role)" opacity="0.7"/>
    </svg>
  ),
  interview: ({ accent }) => (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <defs><linearGradient id="ig-int" x1="0" y1="32" x2="32" y2="0" gradientUnits="userSpaceOnUse"><stop stopColor={accent}/><stop offset="1" stopColor="#A855F7"/></linearGradient></defs>
      <path d="M4 8a2 2 0 012-2h20a2 2 0 012 2v12a2 2 0 01-2 2H10l-6 4V8z" stroke="url(#ig-int)" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M10 13h12M10 17.5h7" stroke="url(#ig-int)" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  feedback: ({ accent }) => (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <defs><linearGradient id="ig-fb" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop stopColor={accent}/><stop offset="1" stopColor="#ec4899"/></linearGradient></defs>
      <path d="M6 24L12 14l4 5 5-8 5 5" stroke="url(#ig-fb)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="26" cy="8" r="4" stroke="url(#ig-fb)" strokeWidth="1.5"/>
      <path d="M26 6.5v2l1.2 1.2" stroke="url(#ig-fb)" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  improve: ({ accent }) => (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <defs><linearGradient id="ig-imp" x1="0" y1="32" x2="32" y2="0" gradientUnits="userSpaceOnUse"><stop stopColor={accent}/><stop offset="1" stopColor="#00D4FF"/></linearGradient></defs>
      <path d="M4 26L11 18l4 4 5-8 4 3 4-11" stroke="url(#ig-imp)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="4" cy="26" r="2" fill="url(#ig-imp)"/>
      <circle cx="11" cy="18" r="2" fill="url(#ig-imp)"/>
      <circle cx="15" cy="22" r="2" fill="url(#ig-imp)"/>
      <circle cx="20" cy="14" r="2" fill="url(#ig-imp)"/>
      <circle cx="24" cy="17" r="2" fill="url(#ig-imp)"/>
      <circle cx="28" cy="6"  r="2" fill="url(#ig-imp)"/>
    </svg>
  ),
};

const STEPS = [
  { n: "01", icon: "role",      tag: "SELECT",   title: "Choose Your Interview Role",    desc: "Pick from 12+ role-specific tracks — Software Engineering, Product Management, Data Science, HR, and more. Every track comes with tailored question banks and industry-accurate rubrics.", accent: "#00D4FF"},
  { n: "02", icon: "interview", tag: "PRACTICE", title: "Start Your AI Mock Interview",  desc: "Enter a live interview session with an AI that adapts to your answers. It digs deeper when you're vague, shifts tone when you're confident, and never repeats itself.",                   accent: "#A855F7"},
  { n: "03", icon: "feedback",  tag: "EVALUATE", title: "Get Scored in Real Time",       desc: "Each answer is evaluated across clarity, depth, relevance, and confidence. Scores surface instantly — you see exactly where you stood before moving on.",                                   accent: "#ec4899"},
  { n: "04", icon: "improve",   tag: "GROW",     title: "Track Progress & Improve",      desc: "Visual improvement curves across sessions. A downloadable PDF report with per-question breakdowns, category trends, and a prioritised action list to close your gaps.",                    accent: "#00D4FF"},
];

// ─── CardBody ─────────────────────────────────────────────────────────────────
const CardBody = React.forwardRef(function CardBody(
  { step, hovered, mousePos, onEnter, onLeave, onMove, Icon }, ref
) {
  return (
    <motion.div
      ref={ref}
      onHoverStart={onEnter}
      onHoverEnd={onLeave}
      onMouseMove={onMove}
      whileHover={{ y: -6, scale: 1.012, transition: SPRING_SOFT }}
      whileTap={{  y: -2, scale: 1.004, transition: SPRING }}
      style={{
        position: "relative", width: "100%", maxWidth: 430,
        borderRadius: 24, padding: "40px 36px 36px",
        overflow: "hidden", cursor: "default",
        background: hovered
          ? `linear-gradient(155deg,rgba(255,255,255,0.076) 0%,rgba(8,8,26,0.52) 100%)`
          : `linear-gradient(155deg,rgba(255,255,255,0.048) 0%,rgba(6,6,20,0.68) 100%)`,
        border: `1px solid ${hovered ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)"}`,
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        boxShadow: hovered
          ? `0 28px 72px rgba(0,0,0,.48),0 0 0 1px ${step.accent}22,inset 0 1px 0 rgba(255,255,255,.1)`
          : `0 6px 36px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.06)`,
        transition: "background .3s ease,border-color .3s ease,box-shadow .45s ease",
      }}
    >
      {/* Ghost number */}
      <div style={{ position: "absolute", top: -10, right: 16, fontFamily: "'Syne',sans-serif", fontSize: 110, fontWeight: 800, color: step.accent, opacity: hovered ? 0.06 : 0.036, lineHeight: 1, letterSpacing: "-0.06em", pointerEvents: "none", userSelect: "none", transition: "opacity .4s ease" }}>{step.n}</div>
      {/* Mouse spotlight */}
      <div style={{ position: "absolute", inset: 0, borderRadius: 24, pointerEvents: "none", background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%,${step.accent}1c 0%,transparent 55%)`, opacity: hovered ? 1 : 0, transition: hovered ? "opacity .25s ease" : "opacity .55s ease" }} />
      {/* Top shimmer */}
      <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: `linear-gradient(90deg,transparent,${step.accent}70,transparent)`, opacity: hovered ? 1 : 0.28, transition: "opacity .4s ease", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 2 }}>
        {/* Tag + Icon */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: "0.2em", color: step.accent, background: `${step.accent}10`, border: `1px solid ${step.accent}28`, padding: "5px 11px", borderRadius: 100 }}>{step.tag}</span>
          <motion.div
            animate={{ boxShadow: hovered ? `0 0 30px ${step.accent}32,inset 0 1px 0 ${step.accent}1c` : `0 0 14px ${step.accent}18` }}
            transition={{ duration: 0.4 }}
            style={{ width: 52, height: 52, borderRadius: 15, flexShrink: 0, background: `linear-gradient(145deg,${step.accent}26,${step.accent}0c)`, border: `1px solid ${step.accent}38`, display: "flex", alignItems: "center", justifyContent: "center" }}
          ><Icon accent={step.accent} /></motion.div>
        </div>

        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: step.accent, opacity: 0.6, letterSpacing: "0.14em", marginBottom: 10 }}>STEP {step.n}</div>
        <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 21, fontWeight: 800, color: hovered ? "#f2f2ff" : "#d8d8f0", letterSpacing: "-0.028em", lineHeight: 1.2, marginBottom: 16, transition: "color .3s ease" }}>{step.title}</h3>
        <div style={{ height: 1, background: `linear-gradient(90deg,${step.accent}38,transparent)`, marginBottom: 18, opacity: hovered ? 0.9 : 0.45, transition: "opacity .35s ease" }} />
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14.5, fontWeight: 400, color: "#8888b8", lineHeight: 1.82, margin: 0 }}>{step.desc}</p>
      </div>
    </motion.div>
  );
});

// ─── StepCard ─────────────────────────────────────────────────────────────────
function StepCard({ step, index, isLast }) {
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const cardRef = useRef(null);
  const isEven  = index % 2 === 0;
  const Icon    = StepIcons[step.icon];

  const onMove = (e) => {
    const r = cardRef.current?.getBoundingClientRect();
    if (!r) return;
    setMousePos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  // Alternating slide directions
  const slideLeft  = { hidden: { opacity: 0, x: -52 }, show: { opacity: 1, x: 0, transition: { duration: 0.75, ease: EASE } } };
  const slideRight = { hidden: { opacity: 0, x:  52 }, show: { opacity: 1, x: 0, transition: { duration: 0.75, ease: EASE } } };
  const detailFade = { hidden: { opacity: 0 },          show: { opacity: 1, transition: { duration: 0.6, ease: EASE, delay: 0.25 } } };

  return (
    <motion.div
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
      initial="hidden" whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      style={{ display: "grid", gridTemplateColumns: "1fr 72px 1fr", gap: 0, alignItems: "start", position: "relative" }}
    >
      {/* LEFT SLOT */}
      <motion.div
        className="hiw-left-slot"
        variants={isEven ? slideLeft : detailFade}
        style={{ paddingRight: 52, paddingTop: 8, display: "flex", justifyContent: "flex-end" }}
      >
        {isEven ? (
          <CardBody ref={cardRef} step={step} index={index} hovered={hovered} mousePos={mousePos}
            onEnter={() => setHovered(true)} onLeave={() => { setHovered(false); setMousePos({ x: 50, y: 50 }); }}
            onMove={onMove} Icon={Icon} />
        ) : (
          <div style={{ textAlign: "right" }}>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: "0.16em", color: step.accent, opacity: 0.75 }}>{step.detail}</span>
          </div>
        )}
      </motion.div>

      {/* SPINE */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
        {/* Top connector — draws in from top */}
        {index > 0 ? (
          <motion.div
            variants={{ hidden: { scaleY: 0, opacity: 0 }, show: { scaleY: 1, opacity: 1, transition: { duration: 0.6, ease: EASE, delay: 0.1 } } }}
            style={{ width: 1, flex: "0 0 56px", background: `linear-gradient(to bottom,${STEPS[index-1].accent}66,${step.accent}44)`, transformOrigin: "top" }}
          />
        ) : <div style={{ flex: "0 0 56px" }} />}

        {/* Step node */}
        <motion.div
          variants={nodeVariant}
          style={{
            width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
            background: `radial-gradient(circle at 35% 35%,${step.accent}36,rgba(5,5,16,0.95))`,
            border: `1.5px solid ${hovered ? step.accent + "aa" : step.accent + "66"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", zIndex: 2,
            boxShadow: hovered
              ? `0 0 0 8px ${step.accent}14,0 0 32px ${step.accent}38`
              : `0 0 0 5px ${step.accent}0e,0 0 18px ${step.accent}22`,
            transition: "box-shadow .4s ease,border-color .3s ease",
          }}
        ><Icon accent={step.accent} /></motion.div>

        {/* Bottom connector — draws in downward */}
        {!isLast && (
          <motion.div
            variants={{ hidden: { scaleY: 0, opacity: 0 }, show: { scaleY: 1, opacity: 1, transition: { duration: 0.7, ease: EASE, delay: 0.3 } } }}
            style={{ width: 1, flex: 1, minHeight: 80, background: `linear-gradient(to bottom,${step.accent}44,${STEPS[index+1].accent}33)`, transformOrigin: "top" }}
          />
        )}
      </div>

      {/* RIGHT SLOT */}
      <motion.div
        className="hiw-right-slot"
        variants={!isEven ? slideRight : detailFade}
        style={{ paddingLeft: 52, paddingTop: 8, display: "flex", justifyContent: "flex-start" }}
      >
        {!isEven ? (
          <CardBody ref={cardRef} step={step} index={index} hovered={hovered} mousePos={mousePos}
            onEnter={() => setHovered(true)} onLeave={() => { setHovered(false); setMousePos({ x: 50, y: 50 }); }}
            onMove={onMove} Icon={Icon} />
        ) : (
          <div>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: "0.16em", color: step.accent, opacity: 0.75 }}>{step.detail}</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
function SectionHeader() {
  return (
    <motion.header
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.13 } } }}
      initial="hidden" whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      style={{ textAlign: "center", maxWidth: 1140, margin: "0 auto 120px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}
    >
      {/* Bloom behind header */}
      <div aria-hidden style={{ position: "absolute", top: "18%", left: "50%", transform: "translateX(-50%)", width: "52%", height: 260, background: "radial-gradient(ellipse at 50% 55%,rgba(0,212,255,0.07) 0%,rgba(168,85,247,0.08) 45%,transparent 72%)", filter: "blur(56px)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* Eyebrow */}
        <motion.div variants={fadeUp} style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "7px 18px", borderRadius: 100, border: "1px solid rgba(0,212,255,0.22)", background: "linear-gradient(135deg,rgba(0,212,255,0.08) 0%,rgba(0,212,255,0.03) 100%)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", marginBottom: 36, boxShadow: "0 0 0 1px rgba(0,212,255,0.05),0 0 28px rgba(0,212,255,0.08),inset 0 1px 0 rgba(0,212,255,0.12)" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#00D4FF", boxShadow: "0 0 8px #00D4FF,0 0 18px rgba(0,212,255,.4)", animation: "pulse-dot 2.6s ease-in-out infinite", flexShrink: 0 }} />
          <span style={{ color: "#00D4FF", fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: "0.2em" }}>HOW IT WORKS</span>
        </motion.div>

        {/* Headline */}
        <motion.h2 variants={fadeUp} style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(40px,5.5vw,72px)", fontWeight: 800, letterSpacing: "-0.045em", lineHeight: 1.04, marginBottom: 0 }}>
          <span style={{ color: "#eeeef8", display: "block" }}>From zero to</span>
          <span style={{ display: "block", background: "linear-gradient(135deg,#00D4FF 0%,#A855F7 50%,#ec4899 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", paddingBottom: "0.06em" }}>offer-ready.</span>
        </motion.h2>

        {/* Glowing divider */}
        <motion.div variants={scaleIn} style={{ width: 64, height: 2, borderRadius: 2, background: "linear-gradient(90deg,#00D4FF,#A855F7)", margin: "32px auto 32px", boxShadow: "0 0 16px rgba(0,212,255,.35),0 0 32px rgba(168,85,247,.2)", transformOrigin: "center" }} />

        {/* Sub */}
        <motion.p variants={fadeUp} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "clamp(15px,1.7vw,18px)", fontWeight: 400, color: "#8484b8", lineHeight: 1.84, maxWidth: 520 }}>
          Four deliberate steps that take you from picking a role to receiving
          a scored, actionable report — in a single session.
        </motion.p>
      </div>
    </motion.header>
  );
}

// ─── CTAStrip ─────────────────────────────────────────────────────────────────
function CTAStrip() {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.8, ease: EASE }}
      style={{ maxWidth: 1140, margin: "108px auto 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 24, position: "relative" }}
    >
      {/* Ambient bloom behind button */}
      <motion.div
        aria-hidden
        animate={{ opacity: hovered ? 1 : 0.6 }}
        transition={{ duration: 0.4 }}
        style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: 360, height: 120, background: "radial-gradient(ellipse at 50% 60%,rgba(0,212,255,0.1) 0%,rgba(0,136,204,0.06) 50%,transparent 75%)", filter: "blur(32px)", pointerEvents: "none" }}
      />

      <motion.button
        onHoverStart={() => setHovered(true)}
        onHoverEnd={()   => setHovered(false)}
        whileHover={{ y: -3, scale: 1.02, transition: SPRING_SOFT }}
        whileTap={{  y:  0, scale: 0.97, transition: SPRING }}
        style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          background: "linear-gradient(135deg,#00D4FF 0%,#0088cc 100%)",
          border: "none", color: "#020212",
          padding: "18px 52px", borderRadius: 14,
          cursor: "pointer", fontFamily: "'Syne',sans-serif",
          fontSize: 16, fontWeight: 800, letterSpacing: "0.01em",
          position: "relative", zIndex: 1, overflow: "hidden",
          boxShadow: hovered
            ? "0 0 0 1px rgba(0,212,255,.5),0 8px 64px rgba(0,212,255,.36),inset 0 1px 0 rgba(255,255,255,.3)"
            : "0 0 0 1px rgba(0,212,255,.28),0 4px 44px rgba(0,212,255,.22),inset 0 1px 0 rgba(255,255,255,.24)",
          transition: "box-shadow .35s ease",
        }}
      >
        {/* Shimmer sweep */}
        <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 35%,rgba(255,255,255,.22) 50%,transparent 65%)", transform: hovered ? "translateX(100%)" : "translateX(-100%)", transition: "transform .55s ease", pointerEvents: "none" }} />
        Start Your First Interview
        <motion.svg
          width="18" height="18" viewBox="0 0 18 18" fill="none"
          animate={{ x: hovered ? 3 : 0 }} transition={{ duration: 0.3, ease: EASE }}
        >
          <path d="M3.5 9h11M9.5 4l5 5-5 5" stroke="#020212" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </motion.svg>
      </motion.button>

    </motion.div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function HowItWorks() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Space+Mono:wght@400;700&family=Syne:wght@500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --bg:#050510;--cyan:#00D4FF;--purple:#A855F7;--pink:#ec4899;--hi:#eeeef8;
          --ease-out:cubic-bezier(0.22,1,0.36,1);--ease-spring:cubic-bezier(0.34,1.56,0.64,1);
        }
        html{scroll-behavior:smooth}
        body{background:var(--bg);-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
        @keyframes pulse-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.78)}}
        @media(max-width:720px){
          .hiw-section{padding:96px 20px 108px!important}
          .hiw-row{grid-template-columns:48px 1fr!important}
          .hiw-left-slot{display:none!important}
          .hiw-right-slot{padding-left:24px!important}
        }
      `}</style>

      <section className="hiw-section" style={{ position: "relative", background: "linear-gradient(180deg,#050510 0%,#07071c 35%,#080824 55%,#050510 100%)", padding: "160px 48px 180px", overflow: "hidden" }}>

        {/* Ambient */}
        <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.055) 1px,transparent 1px)", backgroundSize: "38px 38px", maskImage: "radial-gradient(ellipse 85% 85% at 50% 50%,black 20%,transparent 100%)", WebkitMaskImage: "radial-gradient(ellipse 85% 85% at 50% 50%,black 20%,transparent 100%)" }} />
          <div style={{ position: "absolute", top: "-22%", left: "-10%", width: "55vw", height: "55vw", maxWidth: 740, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,212,255,0.058) 0%,transparent 62%)" }} />
          <div style={{ position: "absolute", top: "15%", right: "-14%", width: "52vw", height: "52vw", maxWidth: 720, borderRadius: "50%", background: "radial-gradient(circle,rgba(168,85,247,0.052) 0%,transparent 62%)" }} />
          <div style={{ position: "absolute", bottom: "-18%", left: "25%", width: "50vw", height: "38vw", maxWidth: 680, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(236,72,153,0.03) 0%,transparent 65%)", transform: "rotate(-12deg)" }} />
        </div>

        <div style={{ position: "relative", zIndex: 2 }}>
          <SectionHeader />

          {/* Steps */}
          <div className="hiw-steps" style={{ maxWidth: 1040, margin: "0 auto", display: "flex", flexDirection: "column" }}>
            {STEPS.map((step, i) => (
              <StepCard key={step.n} step={step} index={i} isLast={i === STEPS.length - 1} />
            ))}
          </div>

          <CTAStrip />
        </div>

      </section>
    </>
  );
}
