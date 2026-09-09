import os
import sys
import json

os.environ.setdefault("TF_USE_LEGACY_KERAS", "1")

import cv2
import numpy as np
import tensorflow as tf

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "ecg_classification_model.h5"
)
LABELS_PATH = os.path.join(BASE_DIR, "ecg_class_names.json")

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

    probabilities, trace_indices = predict_page(image)
    class_index = int(np.bincount(trace_indices, minlength=len(CLASS_NAMES)).argmax())
    disease = CLASS_NAMES[class_index]
    confidence = float(probabilities[class_index]) * 100
    is_multi_lead_page = image.shape[0] >= 250 and image.shape[1] >= 500
    is_normal = disease == "Normal Beat"
    risk_level = "Low" if is_normal else "High"
    if disease == "Unknown Beat":
        risk_level = "Medium"

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
        "inputType": "multi-lead ECG page" if is_multi_lead_page else "single ECG trace",
        "reliableForThisInput": not is_multi_lead_page,
        "warning": (
            "This image is a full multi-lead ECG page, while the model was trained on isolated beats. "
            "Treat the classification as experimental and obtain clinical review."
            if is_multi_lead_page else None
        ),
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

    result = predict_ecg(
        sys.argv[1]
    )

    print(
        json.dumps(result)
    )