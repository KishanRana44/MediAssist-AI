# test_features.py
import numpy as np
from heart_preprocessor import preprocess_heart_audio

with open("./dataset/a0001.wav", "rb") as f:
    spec1 = preprocess_heart_audio(f.read())

with open("./dataset/a0007.wav", "rb") as f:
    spec2 = preprocess_heart_audio(f.read())

print("Spec 1 Mean:", np.mean(spec1), "Std:", np.std(spec1))
print("Spec 2 Mean:", np.mean(spec2), "Std:", np.std(spec2))
print("Difference Mean Abs:", np.mean(np.abs(spec1 - spec2)))