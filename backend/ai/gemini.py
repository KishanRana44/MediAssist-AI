import os
import json
from dotenv import load_dotenv
from google import genai

# ==========================================
# Load Environment
# ==========================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

load_dotenv(
    os.path.join(
        BASE_DIR,
        "..",
        ".env"
    )
)

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env")

client = genai.Client(
    api_key=API_KEY
)


# ==========================================
# ECG AI
# ==========================================

def analyze_ecg(
    prediction,
    confidence,
    contexts
):

    context = "\n\n".join(contexts)

    prompt = f"""
You are an expert cardiologist.

ECG Prediction:
{prediction}

Confidence:
{confidence}

Clinical Guidelines:
{context}

Return ONLY valid JSON.

{{
    "riskLevel":"",
    "findings":"",
    "recommendations":[],
    "followUp":"",
    "doctorSummary":"",
    "patientSummary":""
}}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    text = response.text.strip()

    # Remove Markdown if Gemini returns it
    if text.startswith("```"):
        text = text.replace("```json", "")
        text = text.replace("```", "")
        text = text.strip()

    try:
        return json.loads(text)

    except Exception:

        return {

            "riskLevel": "Unknown",

            "findings": text,

            "recommendations": [],

            "followUp": "",

            "doctorSummary": text,

            "patientSummary": text

        }


# ==========================================
# Test
# ==========================================

if __name__ == "__main__":

    result = analyze_ecg(

        "Normal Sinus Rhythm",

        98.4,

        [

            "Normal sinus rhythm originates from the sinoatrial node.",

            "Routine follow-up is recommended."

        ]

    )

    print(
        json.dumps(
            result,
            indent=4
        )
    )