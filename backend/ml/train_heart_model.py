import os
import librosa
import numpy as np
import joblib

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.utils import to_categorical

from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

DATASET = os.path.join(
    BASE_DIR,
    "../../dataset_binary"
)

features = []
labels = []

print("Loading Dataset...")

for label in os.listdir(DATASET):

    folder = os.path.join(
        DATASET,
        label
    )

    for file in os.listdir(folder):

        path = os.path.join(
            folder,
            file
        )

        signal, sr = librosa.load(
            path,
            sr=22050,
            duration=5
        )

        mfcc = librosa.feature.mfcc(
            y=signal,
            sr=sr,
            n_mfcc=40
        )

        mfcc = np.mean(
            mfcc.T,
            axis=0
        )

        features.append(mfcc)
        labels.append(label)

X = np.array(features)

encoder = LabelEncoder()

y = encoder.fit_transform(labels)

joblib.dump(
    encoder,
    os.path.join(
        BASE_DIR,
        "label_encoder.pkl"
    )
)

y = to_categorical(y)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

model = Sequential()

model.add(
    Dense(
        256,
        activation="relu",
        input_shape=(40,)
    )
)

model.add(
    Dropout(0.3)
)

model.add(
    Dense(
        128,
        activation="relu"
    )
)

model.add(
    Dense(
        2,
        activation="softmax"
    )
)

model.compile(
    optimizer="adam",
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

model.fit(
    X_train,
    y_train,
    epochs=50,
    batch_size=16,
    validation_data=(
        X_test,
        y_test
    )
)

loss, acc = model.evaluate(
    X_test,
    y_test
)

print("Accuracy:", acc)

model.save(
    os.path.join(
        BASE_DIR,
        "heart_model.h5"
    )
)

print("Done")