import os
import librosa
import numpy as np
import joblib

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, Dense, Dropout, GlobalAveragePooling2D, MaxPooling2D
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from sklearn.utils.class_weight import compute_class_weight

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

DATASET = os.path.abspath(os.path.join(BASE_DIR, "../../dataset"))

features = []
labels = []

print("Loading heart-sound dataset...")

for label in os.listdir(DATASET):

    folder = os.path.join(
        DATASET,
        label
    )

    for file in sorted(os.listdir(folder)):

        path = os.path.join(
            folder,
            file
        )

        signal, sr = librosa.load(path, sr=22050, duration=5, mono=True)

        mel = librosa.feature.melspectrogram(
            y=signal,
            sr=sr,
            n_mels=64,
            n_fft=1024,
            hop_length=512,
        )
        features.append(librosa.power_to_db(mel, ref=np.max).astype(np.float32))

        labels.append(label)

X = np.array(features, dtype=np.float32)
X = (X - X.mean(axis=(1, 2), keepdims=True)) / (X.std(axis=(1, 2), keepdims=True) + 1e-6)
X = X[..., np.newaxis]

encoder = LabelEncoder()

y = encoder.fit_transform(labels)

joblib.dump(
    encoder,
    os.path.join(
        BASE_DIR,
        "label_encoder.pkl"
    )
)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

model = Sequential()

model.add(Conv2D(32, (3, 3), activation="relu", input_shape=X.shape[1:], padding="same"))
model.add(MaxPooling2D((2, 2)))
model.add(Conv2D(64, (3, 3), activation="relu", padding="same"))
model.add(MaxPooling2D((2, 2)))
model.add(Conv2D(96, (3, 3), activation="relu", padding="same"))
model.add(GlobalAveragePooling2D())
model.add(Dense(128, activation="relu"))
model.add(Dropout(0.35))
model.add(Dense(len(encoder.classes_), activation="softmax"))

model.compile(
    optimizer="adam",
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

classes = np.unique(y_train)
class_weights = compute_class_weight("balanced", classes=classes, y=y_train)
model.fit(
    X_train,
    y_train,
    epochs=50,
    batch_size=16,
    validation_data=(
        X_test,
        y_test
    ),
    class_weight=dict(zip(classes, class_weights)),
    verbose=0
)

loss, acc = model.evaluate(X_test, y_test, verbose=0)
predictions = np.argmax(model.predict(X_test, verbose=0), axis=1)
print(classification_report(y_test, predictions, target_names=encoder.classes_, zero_division=0))

print("Accuracy:", acc)

model.save(
    os.path.join(
        BASE_DIR,
        "heart_model.h5"
    )
)

print("Done")