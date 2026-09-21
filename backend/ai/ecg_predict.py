import os
import sys
import json

os.environ.setdefault("TF_USE_LEGACY_KERAS", "1")
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "3")

import cv2
import numpy as np
import tensorflow as tf

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "ecg_classification_model.h5"
)
LABELS_PATH = os.path.join(BASE_DIR, "ecg_class_names.json")
MIN_CONFIDENCE = float(os.getenv("ECG_MIN_CONFIDENCE", "0.55"))

# ------------------------------------------
# Load Model
# ------------------------------------------

model = tf.keras.models.load_model(
    MODEL_PATH,
    compile=False
)

# ------------------------------------------
# Disease Labels
# ------------------------------------------

with open(LABELS_PATH, "r", encoding="utf-8") as labels_file:
    CLASS_NAMES = json.load(labels_file)

# ------------------------------------------
# Predict Function
# ------------------------------------------

def error_result(message):
    return {
        "success": True,
        "prediction": "error",
        "confidence": 0,
        "riskLevel": "Unknown",
        "findings": "The ECG could not be classified reliably.",
        "recommendations": ["Upload a clear isolated ECG waveform and obtain clinical review."],
        "followUp": "Repeat the analysis with a suitable ECG waveform.",
        "explanation": message,
        "analysisScope": "ECG5000 isolated heartbeat classifier",
        "inputType": "unsupported ECG input",
        "reliableForThisInput": False,
        "warning": "This result is an error state, not a diagnosis.",
        "probabilities": {name: 0 for name in CLASS_NAMES},
        "tracePredictions": []
    }

def predict_ecg(image_path):

    image = cv2.imread(
        image_path,
        cv2.IMREAD_GRAYSCALE
    )

    if image is None:

        return {

            "success": False,

            "message": "Unable to read ECG image."

        }

    if image.shape[0] >= 250 and image.shape[1] >= 500:
        return error_result(
            "Upload one isolated horizontal ECG waveform image, not a full multi-lead report page."
        )

    try:
        probabilities, trace_indices = predict_page(image)
    except ValueError as error:
        return error_result(str(error))
    class_index = int(np.bincount(trace_indices, minlength=len(CLASS_NAMES)).argmax())
    disease = CLASS_NAMES[class_index]
    confidence = float(probabilities[class_index]) * 100
    if confidence < MIN_CONFIDENCE * 100:
        return {
            "success": True,
            "prediction": "error",
            "confidence": round(confidence, 2),
            "riskLevel": "Unknown",
            "findings": "The ECG could not be classified reliably.",
            "recommendations": [
                "Upload a clearer isolated ECG waveform.",
                "Obtain review from a qualified clinician."
            ],
            "followUp": "Repeat the analysis with a suitable ECG waveform.",
            "explanation": f"No supported class reached the minimum confidence of {MIN_CONFIDENCE * 100:.0f}%.",
            "analysisScope": "ECG5000 isolated heartbeat classifier",
            "inputType": "single ECG trace",
            "reliableForThisInput": False,
            "warning": "This result is an error state, not a diagnosis.",
            "probabilities": {
                name: round(float(probability) * 100, 2)
                for name, probability in zip(CLASS_NAMES, probabilities)
            },
            "tracePredictions": [CLASS_NAMES[index] for index in trace_indices]
        }
    is_normal = disease == "Normal Beat"
    risk_level = "Low" if is_normal else "High"

    return {

        "success": True,

        "prediction": disease,

        "confidence": round(
            confidence,
            2
        ),
        "riskLevel": risk_level,
        "findings": (
            f"The model detected {disease.lower()} in the uploaded ECG beat."
            if not is_normal else
            "The model detected a pattern consistent with a normal beat."
        ),
        "recommendations": ([
            "Seek review by a qualified clinician.",
            "Do not use this automated result as a substitute for emergency care."
        ] if not is_normal else [
            "Continue routine clinical follow-up as advised by your clinician."
        ]),
        "followUp": (
            "Cardiology review recommended."
            if not is_normal else
            "Routine follow-up according to your clinician's advice."
        ),
        "explanation": (
            f"The classifier selected {disease} with {confidence:.2f}% confidence."
        ),
        "analysisScope": "ECG5000 isolated heartbeat classifier",
        "inputType": "single ECG trace",
        "reliableForThisInput": True,
        "warning": None,
        "probabilities": {
            name: round(float(probability) * 100, 2)
            for name, probability in zip(CLASS_NAMES, probabilities)
        },
        "tracePredictions": [CLASS_NAMES[index] for index in trace_indices]

    }


def predict_page(image):
    """Extract several horizontal traces before classifying a full ECG page."""
    height, width = image.shape
    left = max(0, int(width * 0.05))
    right = max(left + 140, int(width * 0.98))
    image = image[:, left:right]

    # Full-page ECGs commonly have three lead rows. A fourth band is useful for
    # printouts that include a long rhythm strip at the bottom.
    band_count = 4 if height >= 550 else 3
    if height < 250:
        band_count = 1
    traces = []
    for band_index in range(band_count):
        top = int(height * band_index / band_count)
        bottom = int(height * (band_index + 1) / band_count)
        band = image[top:bottom]
        threshold = min(150, float(np.percentile(band, 35)))
        dark = band <= threshold
        trace = np.full(band.shape[1], np.nan, dtype=np.float32)
        previous_row = band.shape[0] / 2
        for column in range(band.shape[1]):
            dark_rows = np.flatnonzero(dark[:, column])
            if dark_rows.size:
                closest = dark_rows[np.argmin(np.abs(dark_rows - previous_row))]
                trace[column] = float(closest)
                previous_row = closest

        valid = np.flatnonzero(np.isfinite(trace))
        if valid.size < max(20, trace.size // 5):
            continue
        trace = np.interp(np.arange(trace.size), valid, trace[valid])
        trace = cv2.medianBlur(trace.astype(np.float32), 5)
        trace = cv2.resize(trace.reshape(-1, 1), (1, 140), interpolation=cv2.INTER_AREA).reshape(140, 1)
        trace = 1.0 - (trace - trace.min()) / max(float(trace.max() - trace.min()), 1e-6)
        traces.append(trace)

    if not traces:
        raise ValueError("Unable to extract a waveform trace from this ECG image.")

    batch = np.stack(traces, axis=0)
    trace_probabilities = model.predict(batch, verbose=0)
    return trace_probabilities.mean(axis=0), np.argmax(trace_probabilities, axis=1)

# ------------------------------------------
# CLI
# ------------------------------------------

if __name__ == "__main__":

    if len(sys.argv)<2:

        print(json.dumps({

            "success":False,

            "message":"Image path missing."

        }))

        sys.exit()

    try:
        result = predict_ecg(sys.argv[1])
    except Exception as error:
        result = {
            "success": False,
            "message": str(error),
        }

    print(
        json.dumps(result)
    )