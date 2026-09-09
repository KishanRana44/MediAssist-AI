import os
import sys
import json
import warnings

# ==========================================
# 1. STRICT SILENCING (Must be at the very top)
# ==========================================
# Suppress TensorFlow C++ logs (0 = all, 3 = none)
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
# Suppress Python warnings (like deprecation warnings from Librosa)
warnings.filterwarnings('ignore')

import librosa
import joblib
import numpy as np

# Use Agg backend for headless environments (prevents GUI errors)
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import librosa.display

# Import Keras ONLY AFTER setting the environment variables
import tensorflow as tf
tf.get_logger().setLevel('ERROR')
from tensorflow.keras.models import load_model

# ==========================================
# Load Model & Encoder
# ==========================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

try:
    model = load_model(os.path.join(BASE_DIR, "heart_model.h5"))
    encoder = joblib.load(os.path.join(BASE_DIR, "label_encoder.pkl"))
except Exception as e:
    print(json.dumps({"error": f"Failed to load model files: {str(e)}"}))
    sys.exit(1)

# ==========================================
# Medical Interpretations
# ==========================================

interpretations = {
    "normal": "Heart sounds appear normal.",
    "abnormal": "Abnormal heart sounds detected. Clinical evaluation recommended.",
    "uncertain": "Model confidence too low for reliable diagnosis."
}

# ==========================================
# Check Input
# ==========================================

if len(sys.argv) < 2:
    print(json.dumps({"error": "No audio file provided."}))
    sys.exit(1)

file_path = sys.argv[1]

if not os.path.exists(file_path):
    print(json.dumps({"error": "Audio file not found."}))
    sys.exit(1)

# ==========================================
# Load Audio
# ==========================================

try:
    signal, sr = librosa.load(file_path, sr=22050, mono=True, duration=5)
except Exception as e:
    print(json.dumps({"error": f"Audio processing failed: {str(e)}"}))
    sys.exit(1)

# ==========================================
# Spectrogram Generation
# ==========================================
audio_dir = os.path.dirname(file_path)
base_name = os.path.basename(file_path)
name_without_ext = os.path.splitext(base_name)[0]
img_filename = f"{name_without_ext}.png"
img_path = os.path.join(audio_dir, img_filename)

try:
    S = librosa.feature.melspectrogram(y=signal, sr=sr, n_mels=128)
    S_DB = librosa.power_to_db(S, ref=np.max)

    plt.figure(figsize=(10, 4))
    librosa.display.specshow(S_DB, sr=sr, x_axis='time', y_axis='mel', cmap='magma') 
    plt.axis('off')
    plt.tight_layout(pad=0)
    plt.savefig(img_path, bbox_inches='tight', pad_inches=0, transparent=True)
    plt.close()
except Exception:
    img_filename = None 

# ==========================================
# Feature Extraction & Prediction
# ==========================================

try:
    mfcc = librosa.feature.mfcc(y=signal, sr=sr, n_mfcc=40)
    mfcc = np.mean(mfcc.T, axis=0)
    mfcc = np.expand_dims(mfcc, axis=0)

    prediction = model.predict(mfcc, verbose=0)
    idx = np.argmax(prediction)
    
    label = encoder.inverse_transform([idx])[0]
    confidence = float(np.max(prediction))

    if confidence >= 0.90:
        confidenceLevel = "High Confidence"
    elif confidence >= 0.70:
        confidenceLevel = "Moderate Confidence"
    else:
        confidenceLevel = "Low Confidence"

    if confidence < 0.55:
        label = "uncertain"

    probabilities = {}
    for i, cls in enumerate(encoder.classes_):
        probabilities[cls] = round(float(prediction[0][i]), 4)

    result = {
        "prediction": label,
        "confidence": round(confidence, 4),
        "confidenceLevel": confidenceLevel,
        "probabilities": probabilities,
        "interpretation": interpretations.get(label, "No interpretation available."),
        "spectrogramFile": img_filename
    }

    # This MUST be the only thing printed to stdout
    print(json.dumps(result))

except Exception as e:
    print(json.dumps({"error": f"Prediction failed: {str(e)}"}))
    sys.exit(1)