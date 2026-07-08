import os
import json

from ecg_preprocess import preprocess_ecg
from ecg_detector import detect_ecg

# Your existing predictor
import subprocess
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def run_prediction(image_path):
    predictor = os.path.join(BASE_DIR, "ecg_predict.py")

    result = subprocess.run(
        [sys.executable, predictor, image_path],
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        return {
            "success": False,
            "message": result.stderr
        }

    return json.loads(result.stdout)


def pipeline(image_path):

    # -------------------------
    # STEP 1
    # -------------------------

    preprocess = preprocess_ecg(image_path)

    if not preprocess["success"]:
        return preprocess

    processed = preprocess["processedImage"]

    # -------------------------
    # STEP 2
    # -------------------------

    detector = detect_ecg(processed)

    if not detector["success"]:
        return detector

    if not detector["isECG"]:
        return {
            "success": False,
            "message": "Uploaded image is not an ECG."
        }

    # -------------------------
    # STEP 3
    # -------------------------

    prediction = run_prediction(processed)

    if not prediction["success"]:
        return prediction

    # -------------------------
    # STEP 4
    # Placeholder for RAG
    # -------------------------

    rag_context = (
        "Relevant cardiology guidelines "
        "will be retrieved here."
    )

    # -------------------------
    # STEP 5
    # Placeholder for Gemini
    # -------------------------

    summary = (
        "Gemini clinical summary "
        "will be generated here."
    )

    prediction["ragContext"] = rag_context
    prediction["aiSummary"] = summary

    return prediction


if __name__ == "__main__":

    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "message": "Image path missing."
        }))
        sys.exit()

    print(json.dumps(
        pipeline(sys.argv[1])
    ))