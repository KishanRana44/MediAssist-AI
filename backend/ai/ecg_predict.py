import os
import sys
import json
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

CLASS_NAMES = [

    "Normal Sinus Rhythm",

    "ST-Elevation Myocardial Infarction"

]

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

    image = cv2.resize(
        image,
        (224,224)
    )

    image = image.astype("float32") / 255.0

    image = np.expand_dims(
        image,
        axis=-1
    )

    image = np.expand_dims(
        image,
        axis=0
    )

    prediction = model.predict(
        image,
        verbose=0
    )[0][0]

    if prediction >= 0.5:

        disease = CLASS_NAMES[0]

        confidence = prediction * 100

    else:

        disease = CLASS_NAMES[1]

        confidence = (1-prediction)*100

    return {

        "success": True,

        "prediction": disease,

        "confidence": round(
            confidence,
            2
        )

    }

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