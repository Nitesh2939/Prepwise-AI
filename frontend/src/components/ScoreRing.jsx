export default function ScoreRing({ score, size = 120 }) {
  const r = 46;
  const circ = 2 * Math.PI * r;
  const dash = circ * (score / 10);

  const color =
    score >= 8 ? "#10B981" :
    score >= 6 ? "#F59E0B" :
    score >= 4 ? "#FF6B35" : "#EF4444";

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#1a1a2e" strokeWidth="8" />
      <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 50 50)" />
      <text x="50" y="50" textAnchor="middle" dominantBaseline="middle"
        fill={color}>{score.toFixed(1)}</text>
    </svg>
  );
}