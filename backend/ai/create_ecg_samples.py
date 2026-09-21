import os
import json
import shutil
import tempfile

import cv2
import numpy as np

os.environ.setdefault("TF_USE_LEGACY_KERAS", "1")

from ecg_predict import CLASS_NAMES, predict_ecg

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
OUTPUT_DIR = os.path.join(BASE_DIR, "sample_ecg_images")
CLASS_FILES = {
    "Normal Beat": "1_normal_beat.png",
    "R-on-T Beat": "2_r_on_t_beat.png",
    "Premature Ventricular Contraction": "3_premature_ventricular_contraction.png",
    "Supraventricular Premature Beat": "4_supraventricular_premature_beat.png",
}


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for existing_file in os.listdir(OUTPUT_DIR):
        if existing_file.endswith(".png"):
            os.remove(os.path.join(OUTPUT_DIR, existing_file))
    rows = np.vstack([
        np.loadtxt(os.path.join(DATA_DIR, "ECG5000_TRAIN.txt")),
        np.loadtxt(os.path.join(DATA_DIR, "ECG5000_TEST.txt")),
    ])

    signals = rows[:, 1:].astype(np.float32)
    minimum = signals.min(axis=1, keepdims=True)
    maximum = signals.max(axis=1, keepdims=True)
    signals = (signals - minimum) / np.maximum(maximum - minimum, 1e-6)
    temporary_dir = tempfile.mkdtemp(prefix="ecg_samples_")

    verification = {}
    try:
        for class_index, class_name in enumerate(CLASS_NAMES):
            candidate_indices = np.flatnonzero(rows[:, 0].astype(np.int32) - 1 == class_index)
            output_name = CLASS_FILES[class_name]
            verified_path = None
            for candidate_index in candidate_indices[:100]:
                row = signals[candidate_index]
                signal = cv2.resize(row.reshape(1, -1), (700, 1), interpolation=cv2.INTER_LINEAR).reshape(-1)
                canvas = np.full((240, 700), 255, dtype=np.uint8)
                points = np.column_stack([
                    np.arange(700),
                    (220 - signal * 200).astype(np.int32),
                ])
                candidate_path = os.path.join(temporary_dir, output_name)
                cv2.polylines(canvas, [points], False, 0, 2, cv2.LINE_8)
                cv2.imwrite(candidate_path, canvas)
                result = predict_ecg(candidate_path)
                if result["prediction"] == class_name:
                    verified_path = candidate_path
                    break

            if verified_path is None:
                verification[class_name] = {"verified": False, "message": "No rendered sample matched this label."}
                continue
            shutil.copyfile(verified_path, os.path.join(OUTPUT_DIR, output_name))
            verification[class_name] = {"verified": True, "file": output_name}
    finally:
        shutil.rmtree(temporary_dir, ignore_errors=True)

    with open(os.path.join(OUTPUT_DIR, "verification.json"), "w", encoding="utf-8") as report_file:
        json.dump(verification, report_file, indent=2)
    print(f"Created {len(CLASS_NAMES)} sample images in {OUTPUT_DIR}")
    print(json.dumps(verification, indent=2))


if __name__ == "__main__":
    main()