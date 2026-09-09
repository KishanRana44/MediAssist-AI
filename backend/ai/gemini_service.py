import os
import sys  # 🔥 CRITICAL BUG FIX: Added missing sys module for stderr streaming
import json
import time
import warnings
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

# Silence cluttering ecosystem updates
warnings.filterwarnings("ignore", category=UserWarning)

load_dotenv()

# Define the precise schema contract for the cardiology assistant payload
class MedicalRecommendationSchema(BaseModel):
    findings: str = Field(description="Clinical description mapping based on prediction and context assets.")
    risk_level: str = Field(description="Categorized risk assessment evaluation. Strict bounds: Low, Medium, or Critical.")
    explanation: str = Field(description="Clear physiological explanation behind the registered ECG patterns.")
    recommendations: list[str] = Field(description="List of actionable preventative protocols and clinical directives.")
    follow_up_advice: list[str] = Field(description="List of tracking checkpoints or scheduling requirements.")

# Initialize standard client
client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

def generate_recommendation(prediction, confidence, context):
    """
    Leverages Gemini models configuration matrix to generate a 
    strictly structured JSON payload with automated retry fallback loops.
    """
    if not os.getenv("GEMINI_API_KEY"):
        return json.dumps({
            "success": False,
            "message": "Configuration error: Gemini API credential vector key missing."
        })

    prompt = f"""
You are an advanced clinical cardiology AI assistant integrated into a medical workflow.
Analyze the following telemetry diagnostics to assemble targeted insights:

[DIAGNOSTIC TELEMETRY]
- Identified ECG Pattern Condition: {prediction}
- System Model Inference Confidence: {confidence}%

[RAG MEDICAL KNOWLEDGE RETRIEVAL CONTEXT]
{context}

[TASK SYSTEM DIRECTIVES]
Synthesize the provided verification assets to generate clinical insights. 
Ensure the assessment directly corresponds to the risk magnitude of the prediction condition.
"""

    max_retries = 3
    base_delay = 2  # Initial wait time of 2 seconds

    for attempt in range(max_retries):
        try:
            # Requesting model compilation using strict Pydantic parsing specifications
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=MedicalRecommendationSchema,
                    temperature=0.2, # Lower temperature forces high fidelity deterministic evaluation
                ),
            )
            
            # Successful runtime execution return
            return response.text

        except Exception as e:
            error_str = str(e).upper()
            
            # 🔥 IMPROVED BUG FIX: Catching both error code integers or string representations seamlessly
            is_transient_error = "503" in error_str or "429" in error_str or "UNAVAILABLE" in error_str or "BUSY" in error_str
            
            if is_transient_error and attempt < max_retries - 1:
                # Exponential backoff calculation (2s, 4s, etc.)
                sleep_duration = base_delay * (2 ** attempt)
                print(f"DEBUG: Gemini API high demand (Attempt {attempt + 1}/{max_retries}). Retrying in {sleep_duration}s...", file=sys.stderr)
                time.sleep(sleep_duration)
                continue
            
            # If all retries drain or a fatal structural block occurs, gracefully fall back
            error_payload = {
                "findings": f"An emergency system exception occurred during live runtime inference parsing: {str(e)}",
                "risk_level": "Unknown",
                "explanation": f"Automated recommendation build failed to resolve due to upstream API traffic congestion.",
                "recommendations": ["Re-evaluate raw data logs manually", "Check network gateway interface adapters"],
                "follow_up_advice": ["Consult technical administrator immediately"]
            }
            return json.dumps(error_payload)