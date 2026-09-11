import os
import sys
import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
from sklearn.model_selection import train_test_split
from heart_preprocessor import preprocess_heart_audio

dataset_path = sys.argv[1] if len(sys.argv) > 1 else "./dataset"
ref_file = os.path.join(dataset_path, "REFERENCE.csv")

df = pd.read_csv(ref_file, header=None, names=["filename", "label"])

X, y = [], []
for _, row in df.iterrows():
    wav_path = os.path.join(dataset_path, f"{row['filename']}.wav")
    if not os.path.exists(wav_path):
        continue
    try:
        with open(wav_path, "rb") as f:
            spec = preprocess_heart_audio(f.read())
        X.append(spec[0])
        # 1 = Normal (0), -1 = Abnormal (1)
        y.append(0 if int(row["label"]) == 1 else 1)
    except Exception:
        continue

X = np.array(X, dtype=np.float32)
y = np.array(y, dtype=np.int32)

X_train, X_val, y_train, y_val = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Convert to categorical for label smoothing
y_train_cat = tf.keras.utils.to_categorical(y_train, 2)
y_val_cat = tf.keras.utils.to_categorical(y_val, 2)

model = models.Sequential([
    layers.Input(shape=(64, 79, 1)),
    layers.Conv2D(32, (3, 3), activation="relu", padding="same"),
    layers.BatchNormalization(),
    layers.MaxPooling2D((2, 2)),

    layers.Conv2D(64, (3, 3), activation="relu", padding="same"),
    layers.BatchNormalization(),
    layers.MaxPooling2D((2, 2)),

    layers.Conv2D(128, (3, 3), activation="relu", padding="same"),
    layers.BatchNormalization(),
    layers.GlobalAveragePooling2D(),

    layers.Dense(64, activation="relu"),
    layers.Dropout(0.3),
    layers.Dense(2, activation="softmax")
])

# Label smoothing prevents probability over-saturation
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=3e-4),
    loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=0.1),
    metrics=["accuracy"]
)

# Moderate class weight penalty: 1.0 (Normal) vs 1.6 (Abnormal)
model.fit(
    X_train, y_train_cat,
    validation_data=(X_val, y_val_cat),
    epochs=25,
    batch_size=32,
    class_weight={0: 1.0, 1: 1.6}
)

save_path = os.path.join(os.path.dirname(__file__), "heart_sound_model.keras")
model.save(save_path)
print(f"Calibrated model saved to: {save_path}")