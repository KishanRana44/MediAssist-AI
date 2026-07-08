import os
import shutil

SOURCE = "../../dataset"
TARGET = "../../dataset_binary"

os.makedirs(
    os.path.join(TARGET, "normal"),
    exist_ok=True
)

os.makedirs(
    os.path.join(TARGET, "abnormal"),
    exist_ok=True
)

for folder in os.listdir(SOURCE):

    folder_path = os.path.join(
        SOURCE,
        folder
    )

    if not os.path.isdir(folder_path):
        continue

    for file in os.listdir(folder_path):

        src = os.path.join(
            folder_path,
            file
        )

        if folder == "normal":

            dst = os.path.join(
                TARGET,
                "normal",
                f"{folder}_{file}"
            )

        else:

            dst = os.path.join(
                TARGET,
                "abnormal",
                f"{folder}_{file}"
            )

        shutil.copy(
            src,
            dst
        )

print("Dataset Created")