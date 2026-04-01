from fastapi import APIRouter, Depends, HTTPException, Query
from app.database.mongodb import db
from app.utils.dependencies import get_current_user
from app.services.ai_engine import analyze_interviews_for_dashboard, analyze_voice_from_transcript
from datetime import datetime, timedelta
from collections import defaultdict
import math

router = APIRouter()


def get_user_interviews(user_id: str) -> list:
    """Fetch all interviews for a user, sorted by created_at descending."""
    interviews = list(
        db.interviews.find({"user_id": user_id}, {"_id": 0})
        .sort("created_at", -1)
    )
    return interviews


def extract_score(iv: dict) -> float:
    """Safely extract numeric score from interview record."""
    try:
        return float(iv.get("evaluation", {}).get("score", 0))
    except (TypeError, ValueError):
        return 0.0


def assign_grade(score: float) -> str:
    if score >= 9:
        return "A+"
    elif score >= 8:
        return "A"
    elif score >= 7:
        return "B"
    elif score >= 6:
        return "C"
    elif score >= 5:
        return "D"
    return "F"


def compute_trend(interviews: list, days: int) -> float:
    """
    Returns the average score change over the last `days` days
    compared to the `days` period before that.
    """
    now = datetime.utcnow()
    cutoff_recent = now - timedelta(days=days)
    cutoff_prev = now - timedelta(days=days * 2)

    recent, previous = [], []
    for iv in interviews:
        created = iv.get("created_at")
        if not created:
            continue
        if isinstance(created, str):
            try:
                created = datetime.fromisoformat(created)
            except Exception:
                continue
        score = extract_score(iv)
        if created >= cutoff_recent:
            recent.append(score)
        elif created >= cutoff_prev:
            previous.append(score)

    avg_recent = sum(recent) / len(recent) if recent else None
    avg_prev = sum(previous) / len(previous) if previous else None

    if avg_recent is None:
        return 0.0
    if avg_prev is None:
        return 0.0

    change = avg_recent - avg_prev
    return round(change, 2)


# ─────────────────────────────────────────────
# GET /dashboard/overview
# ─────────────────────────────────────────────
@router.get("/overview")
def get_overview(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    interviews = get_user_interviews(user_id)

    if not interviews:
        return {
            "total_interviews": 0,
            "avg_score": 0,
            "best_score": 0,
            "weakest_area": "N/A",
            "trend_7_days": 0,
            "trend_30_days": 0
        }

    scores = [extract_score(iv) for iv in interviews]
    avg_score = round(sum(scores) / len(scores), 2)
    best_score = round(max(scores), 2)

    # Weakest area: role/topic with lowest average score
    role_scores = defaultdict(list)
    for iv in interviews:
        role = iv.get("role", "General")
        role_scores[role].append(extract_score(iv))
    role_avgs = {r: sum(s) / len(s) for r, s in role_scores.items()}
    weakest_area = min(role_avgs, key=role_avgs.get) if role_avgs else "N/A"

    trend_7 = compute_trend(interviews, 7)
    trend_30 = compute_trend(interviews, 30)

    return {
        "total_interviews": len(interviews),
        "avg_score": avg_score,
        "best_score": best_score,
        "weakest_area": weakest_area,
        "trend_7_days": trend_7,
        "trend_30_days": trend_30
    }


# ─────────────────────────────────────────────
# GET /dashboard/performance
# ─────────────────────────────────────────────
@router.get("/performance")
def get_performance(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    interviews = get_user_interviews(user_id)

    if not interviews:
        return {
            "score_over_time": [],
            "category_performance": [],
            "radar_data": [],
            "improvement_comparison": {"recent_avg": 0, "previous_avg": 0, "change_pct": 0}
        }

    # Score progression over time (chronological)
    score_over_time = []
    for iv in sorted(interviews, key=lambda x: x.get("created_at", "")):
        created = iv.get("created_at", "")
        if isinstance(created, datetime):
            label = created.strftime("%b %d")
        else:
            try:
                label = datetime.fromisoformat(str(created)).strftime("%b %d")
            except Exception:
                label = str(created)[:10]
        score_over_time.append({
            "date": label,
            "score": extract_score(iv),
            "role": iv.get("role", "General")
        })

    # Category (role) average scores
    role_scores = defaultdict(list)
    for iv in interviews:
        role = iv.get("role", "General")
        role_scores[role].append(extract_score(iv))
    category_performance = [
        {"category": role, "avg_score": round(sum(s) / len(s), 2), "count": len(s)}
        for role, s in role_scores.items()
    ]

    # Radar chart: evaluate across fixed skill dimensions from stored evaluations
    dimension_scores = defaultdict(list)
    skill_map = {
        "technical_accuracy": ["technical", "accuracy", "correct", "knowledge"],
        "communication": ["communication", "clarity", "articulate", "explain"],
        "problem_solving": ["problem", "solution", "approach", "logic"],
        "confidence": ["confidence", "assertive", "delivery"],
        "depth": ["depth", "detail", "thorough", "comprehensive"]
    }
    for iv in interviews:
        eval_data = iv.get("evaluation", {})
        summary = (eval_data.get("summary", "") + " " + " ".join(eval_data.get("strengths", []))).lower()
        score = extract_score(iv)
        for dim, keywords in skill_map.items():
            if any(kw in summary for kw in keywords):
                dimension_scores[dim].append(score)
            else:
                dimension_scores[dim].append(score * 0.85)  # slight penalty if not mentioned

    radar_data = [
        {"skill": dim.replace("_", " ").title(), "score": round(sum(s) / len(s), 2)}
        for dim, s in dimension_scores.items()
    ]

    # Improvement comparison: last 5 vs previous 5
    recent_5 = interviews[:5]
    prev_5 = interviews[5:10]
    recent_avg = round(sum(extract_score(iv) for iv in recent_5) / len(recent_5), 2) if recent_5 else 0
    prev_avg = round(sum(extract_score(iv) for iv in prev_5) / len(prev_5), 2) if prev_5 else 0
    change_pct = round(((recent_avg - prev_avg) / prev_avg * 100), 1) if prev_avg else 0

    return {
        "score_over_time": score_over_time,
        "category_performance": category_performance,
        "radar_data": radar_data,
        "improvement_comparison": {
            "recent_avg": recent_avg,
            "previous_avg": prev_avg,
            "change_pct": change_pct
        }
    }


# ─────────────────────────────────────────────
# GET /dashboard/history
# ─────────────────────────────────────────────
@router.get("/history")
def get_history(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, le=50),
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])
    interviews = get_user_interviews(user_id)

    # Paginate
    total = len(interviews)
    start = (page - 1) * limit
    end = start + limit
    page_data = interviews[start:end]

    history = []
    for iv in page_data:
        created = iv.get("created_at", "")
        if isinstance(created, datetime):
            date_str = created.strftime("%Y-%m-%d %H:%M")
        else:
            try:
                date_str = datetime.fromisoformat(str(created)).strftime("%Y-%m-%d %H:%M")
            except Exception:
                date_str = str(created)[:16]

        score = extract_score(iv)
        eval_data = iv.get("evaluation", {})

        history.append({
            "date": date_str,
            "role": iv.get("role", "General"),
            "score": score,
            "grade": assign_grade(score),
            "question": iv.get("question", ""),
            "answer": iv.get("answer", ""),
            "ai_feedback": {
                "summary": eval_data.get("summary", ""),
                "strengths": eval_data.get("strengths", []),
                "weaknesses": eval_data.get("weaknesses", []),
                "improvement": eval_data.get("improvement", ""),
                "grade": eval_data.get("grade", assign_grade(score))
            }
        })

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": math.ceil(total / limit),
        "interviews": history
    }


# ─────────────────────────────────────────────
# GET /dashboard/analysis
# ─────────────────────────────────────────────
@router.get("/analysis")
def get_analysis(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    interviews = get_user_interviews(user_id)

    if not interviews:
        return {
            "weak_topics": [],
            "repeated_mistakes": [],
            "suggestions": [],
            "overall_insight": "No interviews found. Start practicing to get insights!",
            "interviews_analyzed": 0
        }

    # Use most recent 20 for AI analysis to keep token usage reasonable
    sample = interviews[:20]
    ai_result = analyze_interviews_for_dashboard(sample)

    # Also compute score distribution
    scores = [extract_score(iv) for iv in interviews]
    distribution = {"excellent": 0, "good": 0, "average": 0, "poor": 0}
    for s in scores:
        if s >= 8:
            distribution["excellent"] += 1
        elif s >= 6:
            distribution["good"] += 1
        elif s >= 4:
            distribution["average"] += 1
        else:
            distribution["poor"] += 1

    return {
        **ai_result,
        "interviews_analyzed": len(sample),
        "score_distribution": distribution
    }


# ─────────────────────────────────────────────
# GET /dashboard/voice-analysis
# ─────────────────────────────────────────────
@router.get("/voice-analysis")
def get_voice_analysis(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    interviews = get_user_interviews(user_id)

    if not interviews:
        return {
            "avg_wpm": 0,
            "avg_confidence": 0,
            "total_filler_words": 0,
            "filler_breakdown": {},
            "avg_pause_frequency": "unknown",
            "communication_tips": [],
            "trend": []
        }

    # Analyze up to last 10 interviews for voice metrics
    results = []
    for iv in interviews[:10]:
        answer = iv.get("answer", "")
        if answer and len(answer.strip()) > 10:
            analysis = analyze_voice_from_transcript(answer)
            created = iv.get("created_at", "")
            try:
                if isinstance(created, datetime):
                    label = created.strftime("%b %d")
                else:
                    label = datetime.fromisoformat(str(created)).strftime("%b %d")
            except Exception:
                label = "Unknown"
            results.append({
                "date": label,
                "role": iv.get("role", "General"),
                **analysis
            })

    if not results:
        return {
            "avg_wpm": 0,
            "avg_confidence": 0,
            "total_filler_words": 0,
            "filler_breakdown": {},
            "avg_pause_frequency": "unknown",
            "communication_tips": [],
            "trend": []
        }

    avg_wpm = round(sum(r["estimated_wpm"] for r in results) / len(results))
    avg_confidence = round(sum(r["confidence_score"] for r in results) / len(results))
    total_fillers = sum(r["filler_word_count"] for r in results)

    # Aggregate filler breakdown
    combined_fillers: dict = {}
    for r in results:
        for word, count in r.get("filler_words_found", {}).items():
            combined_fillers[word] = combined_fillers.get(word, 0) + count

    # Most common pause frequency
    freq_counts = defaultdict(int)
    for r in results:
        freq_counts[r["pause_frequency"]] += 1
    avg_pause = max(freq_counts, key=freq_counts.get)

    # Collect latest unique tips
    all_tips = []
    seen = set()
    for r in results:
        for tip in r.get("communication_tips", []):
            if tip not in seen:
                all_tips.append(tip)
                seen.add(tip)

    # Trend data for charts (chronological)
    trend = [
        {
            "date": r["date"],
            "wpm": r["estimated_wpm"],
            "confidence": r["confidence_score"],
            "fillers": r["filler_word_count"]
        }
        for r in reversed(results)
    ]

    return {
        "avg_wpm": avg_wpm,
        "avg_confidence": avg_confidence,
        "total_filler_words": total_fillers,
        "filler_breakdown": combined_fillers,
        "avg_pause_frequency": avg_pause,
        "communication_tips": all_tips[:5],
        "trend": trend
    }
