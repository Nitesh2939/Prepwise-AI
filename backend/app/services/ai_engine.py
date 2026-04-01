import google.generativeai as genai
import os
import json
import re
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")


def evaluate_answer(question, answer, role):
    prompt = f"""
You are an expert technical interviewer.

Role: {role}

Question:
{question}

Candidate Answer:
{answer}

Evaluate the answer and return JSON:

{{
"score": number between 1-10,
"grade": "A|B|C|D|F",
"summary": "short feedback",
"strengths": ["point1","point2"],
"weaknesses": ["point1"],
"improvement": "one actionable improvement"
}}
"""
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return {
            "score": 5,
            "grade": "C",
            "summary": "Error in AI evaluation",
            "strengths": [],
            "weaknesses": [str(e)],
            "improvement": "Try again later"
        }


def analyze_interviews_for_dashboard(interviews: list) -> dict:
    """
    Analyzes a list of stored interviews and returns AI-driven insights:
    weak topics, repeated mistakes, suggested improvements.
    """
    if not interviews:
        return {
            "weak_topics": [],
            "repeated_mistakes": [],
            "suggestions": [],
            "overall_insight": "No interview data available yet."
        }

    # Build a compact summary of all Q&A for Gemini
    summaries = []
    for idx, iv in enumerate(interviews):
        role = iv.get("role", "Unknown")
        question = iv.get("question", "")
        answer = iv.get("answer", "")
        evaluation = iv.get("evaluation", {})
        score = evaluation.get("score", "N/A")
        weaknesses = evaluation.get("weaknesses", [])
        summaries.append(
            f"Interview {idx+1} | Role: {role} | Score: {score}/10\n"
            f"Q: {question}\nA: {answer}\nWeaknesses: {', '.join(weaknesses) if weaknesses else 'None'}"
        )

    combined = "\n\n---\n\n".join(summaries[:20])  # limit to 20 for token safety

    prompt = f"""
You are an AI interview coach. Below are multiple interview records for a single candidate.

{combined}

Analyze ALL interviews holistically and return ONLY a valid JSON object with this exact structure:

{{
  "weak_topics": ["topic1", "topic2", "topic3"],
  "repeated_mistakes": ["mistake1", "mistake2", "mistake3"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "overall_insight": "2-3 sentence summary of the candidate's overall performance pattern"
}}

Focus on patterns across interviews, not individual answers.
"""
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        # Strip markdown code fences if present
        text = re.sub(r"```json|```", "", text).strip()
        return json.loads(text)
    except Exception as e:
        return {
            "weak_topics": ["Unable to analyze"],
            "repeated_mistakes": ["AI analysis failed"],
            "suggestions": ["Please try again later"],
            "overall_insight": f"Analysis error: {str(e)}"
        }


def analyze_voice_from_transcript(transcript: str) -> dict:
    """
    Analyzes a transcript string for voice/communication patterns.
    Returns WPM estimate, filler words, confidence score, pauses.
    """
    if not transcript or len(transcript.strip()) < 10:
        return {
            "word_count": 0,
            "estimated_wpm": 0,
            "filler_word_count": 0,
            "filler_words_found": {},
            "confidence_score": 0,
            "pause_frequency": "unknown",
            "communication_tips": []
        }

    words = transcript.split()
    word_count = len(words)

    # Filler word detection
    fillers = ["uh", "um", "like", "you know", "basically", "literally",
               "actually", "so", "right", "okay", "well", "I mean", "kind of", "sort of"]
    filler_counts = {}
    lower_text = transcript.lower()
    for f in fillers:
        count = lower_text.count(f" {f} ") + lower_text.count(f" {f},") + lower_text.count(f" {f}.")
        if count > 0:
            filler_counts[f] = count

    total_fillers = sum(filler_counts.values())

    # Estimate WPM assuming average spoken interview pace (~130wpm baseline)
    # We estimate duration from word count relative to typical answer length
    estimated_duration_min = word_count / 130
    estimated_wpm = round(word_count / max(estimated_duration_min, 0.1))

    # Pause frequency heuristic: count sentence-ending punctuation
    pauses = transcript.count(".") + transcript.count("...") + transcript.count(",")
    pause_ratio = pauses / max(word_count, 1)
    if pause_ratio < 0.05:
        pause_frequency = "low"
    elif pause_ratio < 0.12:
        pause_frequency = "moderate"
    else:
        pause_frequency = "high"

    # Confidence score: penalize heavy filler use, reward longer answers
    filler_ratio = total_fillers / max(word_count, 1)
    base_confidence = 80
    confidence_score = max(10, round(base_confidence - (filler_ratio * 200) + min(word_count / 20, 15)))
    confidence_score = min(confidence_score, 100)

    # AI-generated communication tips
    prompt = f"""
Analyze this interview answer transcript for communication quality:

"{transcript[:1000]}"

Return ONLY a JSON array of 3 short, actionable communication improvement tips.
Example: ["Reduce filler words like 'um'", "Use more concrete examples", "Speak at a steadier pace"]
"""
    tips = []
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        text = re.sub(r"```json|```", "", text).strip()
        tips = json.loads(text)
    except Exception:
        tips = [
            "Practice reducing filler words",
            "Structure answers with clear beginning, middle, end",
            "Speak at a measured, confident pace"
        ]

    return {
        "word_count": word_count,
        "estimated_wpm": estimated_wpm,
        "filler_word_count": total_fillers,
        "filler_words_found": filler_counts,
        "confidence_score": confidence_score,
        "pause_frequency": pause_frequency,
        "communication_tips": tips
    }
