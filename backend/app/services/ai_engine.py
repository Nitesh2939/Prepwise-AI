from google.genai import Client
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create Gemini client
client = Client(api_key=os.getenv("GEMINI_API_KEY"))

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

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )

    return response.text