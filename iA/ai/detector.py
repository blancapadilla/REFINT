from ultralytics import YOLO


def test_model():
    model = YOLO("yolo11n.pt")

    results = model(
        "https://ultralytics.com/images/bus.jpg"
    )

    for result in results:
        print(result.boxes)


if __name__ == "__main__":
    test_model()