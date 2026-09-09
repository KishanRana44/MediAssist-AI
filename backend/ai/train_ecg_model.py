import json
import os

os.environ.setdefault("TF_USE_LEGACY_KERAS", "1")

import numpy as np
import tensorflow as tf
from sklearn.metrics import classification_report
from sklearn.utils.class_weight import compute_class_weight

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
MODEL_PATH = os.path.join(BASE_DIR, "ecg_classification_model.h5")
LABELS_PATH = os.path.join(BASE_DIR, "ecg_class_names.json")

CLASS_NAMES = {
    1: "Normal Beat",
    2: "R-on-T Beat",
    3: "Premature Ventricular Contraction",
    4: "Supraventricular Premature Beat",
    5: "Unknown Beat",
}


def load_dataset():
    def read_file(filename):
        rows = np.loadtxt(os.path.join(DATA_DIR, filename))
        labels = rows[:, 0].astype(np.int32) - 1
        signals = rows[:, 1:].astype(np.float32)
        minimum = signals.min(axis=1, keepdims=True)
        maximum = signals.max(axis=1, keepdims=True)
        signals = (signals - minimum) / np.maximum(maximum - minimum, 1e-6)
        return signals[..., np.newaxis], labels

    return read_file("ECG5000_TRAIN.txt"), read_file("ECG5000_TEST.txt")


def augment_signals(signals, labels, copies=2):
    rng = np.random.default_rng(42)
    augmented_signals = [signals]
    augmented_labels = [labels]
    for _ in range(copies):
        noise = rng.normal(0, 0.015, signals.shape).astype(np.float32)
        scale = rng.uniform(0.95, 1.05, (signals.shape[0], 1, 1)).astype(np.float32)
        shifted = np.roll(signals * scale + noise, rng.integers(-4, 5), axis=1)
        augmented_signals.append(np.clip(shifted, 0, 1))
        augmented_labels.append(labels)
    return np.concatenate(augmented_signals), np.concatenate(augmented_labels)


def main():
    (x_train, y_train), (x_test, y_test) = load_dataset()
    x_train, y_train = augment_signals(x_train, y_train)

    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(x_train.shape[1], 1)),
        tf.keras.layers.Conv1D(48, 5, activation="relu", padding="same"),
        tf.keras.layers.MaxPooling1D(2),
        tf.keras.layers.BatchNormalization(),
        tf.keras.layers.Conv1D(96, 5, activation="relu", padding="same"),
        tf.keras.layers.MaxPooling1D(2),
        tf.keras.layers.GlobalAveragePooling1D(),
        tf.keras.layers.Dense(96, activation="relu"),
        tf.keras.layers.Dropout(0.25),
        tf.keras.layers.Dense(len(CLASS_NAMES), activation="softmax"),
    ])
    model.compile(
        optimizer="adam",
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )

    classes = np.unique(y_train)
    weights = compute_class_weight("balanced", classes=classes, y=y_train)
    class_weights = dict(zip(classes, weights))
    model.fit(
        x_train,
        y_train,
        validation_data=(x_test, y_test),
        epochs=60,
        batch_size=32,
        class_weight=class_weights,
        callbacks=[
            tf.keras.callbacks.EarlyStopping(patience=8, restore_best_weights=True),
            tf.keras.callbacks.ReduceLROnPlateau(patience=3, factor=0.5),
        ],
        verbose=0,
    )

    loss, accuracy = model.evaluate(x_test, y_test, verbose=0)
    predictions = np.argmax(model.predict(x_test, verbose=0), axis=1)
    print(classification_report(y_test, predictions, target_names=list(CLASS_NAMES.values()), zero_division=0))
    model.save(MODEL_PATH)
    with open(LABELS_PATH, "w", encoding="utf-8") as labels_file:
        json.dump(list(CLASS_NAMES.values()), labels_file, indent=2)
    print(json.dumps({"accuracy": round(float(accuracy), 4), "model": MODEL_PATH}))


if __name__ == "__main__":
    main()