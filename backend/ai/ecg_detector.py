import cv2
import os
import json
import sys
import numpy as np


def detect_ecg(image_path):

    if not os.path.exists(image_path):
        return {
            "success": False,
            "message": "Image not found."
        }

    image = cv2.imread(image_path)

    if image is None:
        return {
            "success": False,
            "message": "Invalid image."
        }

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    # -----------------------------------
    # Edge Detection
    # -----------------------------------

    edges = cv2.Canny(
        gray,
        50,
        150
    )

    edge_pixels = np.sum(edges > 0)

    # -----------------------------------
    # Horizontal Line Detection
    # ECG grids contain many horizontal
    # and vertical lines.
    # -----------------------------------

    horizontal_kernel = cv2.getStructuringElement(
        cv2.MORPH_RECT,
        (35,1)
    )

    vertical_kernel = cv2.getStructuringElement(
        cv2.MORPH_RECT,
        (1,35)
    )

    horizontal = cv2.morphologyEx(
        edges,
        cv2.MORPH_OPEN,
        horizontal_kernel
    )

    vertical = cv2.morphologyEx(
        edges,
        cv2.MORPH_OPEN,
        vertical_kernel
    )

    horizontal_score = np.sum(horizontal > 0)

    vertical_score = np.sum(vertical > 0)

    # -----------------------------------
    # Wave Detection
    # -----------------------------------

    contours,_ = cv2.findContours(
        edges,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    contour_count = len(contours)

    # -----------------------------------
    # ECG Confidence Score
    # -----------------------------------

    score = (
        edge_pixels * 0.2 +
        horizontal_score * 0.3 +
        vertical_score * 0.3 +
        contour_count * 15
    )

    is_ecg = score > 12000

    return {

        "success": True,

        "isECG": is_ecg,

        "score": round(score,2),

        "edgePixels": int(edge_pixels),

        "horizontalLines": int(horizontal_score),

        "verticalLines": int(vertical_score),

        "contours": contour_count

    }


if __name__ == "__main__":

    if len(sys.argv) < 2:

        print(json.dumps({

            "success": False,

            "message": "Image path missing."

        }))

        sys.exit()

    result = detect_ecg(sys.argv[1])

    print(json.dumps(result))