import os

for folder in os.listdir("../../dataset_binary"):
    path = os.path.join("../../dataset_binary", folder)

    if os.path.isdir(path):
        print(folder, len(os.listdir(path)))