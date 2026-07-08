import os
import sys
import json
import cv2
import numpy as np

OUTPUT_SIZE = (512, 512)


def preprocess_ecg(image_path):
    if not os.path.exists(image_path):
        return {
            "success": False,
            "message": "Image not found."
        }

    image = cv2.imread(image_path)

    if image is None:
        return {
            "success": False,
            "message": "Unable to read image."
        }

    # Resize
    image = cv2.resize(image, OUTPUT_SIZE)

    # Grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Denoise
    gray = cv2.GaussianBlur(gray, (3, 3), 0)

    # Contrast Enhancement
    clahe = cv2.createCLAHE(
        clipLimit=2.0,
        tileGridSize=(8, 8)
    )

    enhanced = clahe.apply(gray)

    # Adaptive Threshold
    binary = cv2.adaptiveThreshold(
        enhanced,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        11,
        2
    )

    output_dir = os.path.join(
        os.path.dirname(image_path),
        "processed"
    )

    os.makedirs(output_dir, exist_ok=True)

    output_file = os.path.join(
        output_dir,
        os.path.basename(image_path)
    )

    cv2.imwrite(output_file, binary)

    return {
        "success": True,
        "processedImage": output_file,
        "width": OUTPUT_SIZE[0],
        "height": OUTPUT_SIZE[1]
    }


if __name__ == "__main__":

    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "message": "Image path missing."
        }))
        sys.exit()

    result = preprocess_ecg(sys.argv[1])

    print(json.dumps(result))