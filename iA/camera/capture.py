import cv2
from pathlib import Path
from datetime import datetime


BASE_DIR = Path(__file__).resolve().parents[1]
CAPTURE_DIR = BASE_DIR / "scan-images"

CAPTURE_DIR.mkdir(exist_ok=True)


def capture_image(camera_index=0):
    print(f"Abriendo cámara {camera_index}...")

    # En Windows usamos DirectShow
    camera = cv2.VideoCapture(
        camera_index,
        cv2.CAP_DSHOW
    )

    if not camera.isOpened():
        raise RuntimeError(
            f"No se pudo abrir la cámara {camera_index}"
        )

    # Resolución inicial
    camera.set(
        cv2.CAP_PROP_FRAME_WIDTH,
        1920
    )

    camera.set(
        cv2.CAP_PROP_FRAME_HEIGHT,
        1080
    )

    # Leer algunos frames para que la cámara
    # ajuste exposición/enfoque
    frame = None

    for _ in range(10):
        success, frame = camera.read()

    camera.release()

    if not success or frame is None:
        raise RuntimeError(
            "La cámara abrió pero no pudo capturar una imagen"
        )

    timestamp = datetime.now().strftime(
        "%Y%m%d_%H%M%S"
    )

    image_path = (
        CAPTURE_DIR /
        f"scan_{timestamp}.jpg"
    )

    cv2.imwrite(
        str(image_path),
        frame
    )

    print(
        f"Imagen guardada: {image_path}"
    )

    return str(image_path)


if __name__ == "__main__":
    image = capture_image()

    print(f"Captura terminada: {image}")