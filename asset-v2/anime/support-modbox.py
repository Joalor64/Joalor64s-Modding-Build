import os

folder_path = "."

for filename in os.listdir(folder_path):
    if filename.endswith(".png"):
        new_name = None

        if filename.endswith("-sprite.png"):
            new_name = filename.replace("-sprite.png", "-ld.png")
        elif filename.endswith("-sprite-hd.png"):
            new_name = filename.replace("-sprite-hd.png", ".png")

        if new_name and new_name != filename:
            old_path = os.path.join(folder_path, filename)
            new_path = os.path.join(folder_path, new_name)
            os.rename(old_path, new_path)
            print(f"Renamed: {filename} → {new_name}")
