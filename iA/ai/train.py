from ultralytics import YOLO


def train():
    model = YOLO("yolo11n.pt")

    model.train(
        data="dataset/data.yaml",
        epochs=50,
        imgsz=640,
        batch=8,
        project="runs",
        name="smart_fridge"
    )


if __name__ == "__main__":
    train()