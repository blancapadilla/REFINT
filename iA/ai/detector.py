import os
import base64
import json
from pathlib import Path

from dotenv import load_dotenv
from inference_sdk import InferenceHTTPClient


# -----------------------------
# CONFIGURACIÓN
# -----------------------------

BASE_DIR = Path(__file__).resolve().parents[1]

load_dotenv(BASE_DIR / ".env")

ROBOFLOW_API_KEY = os.getenv("ROBOFLOW_API_KEY")

if not ROBOFLOW_API_KEY:
    raise ValueError(
        "No se encontró ROBOFLOW_API_KEY en el archivo .env"
    )


client = InferenceHTTPClient(
    api_url="https://serverless.roboflow.com",
    api_key=ROBOFLOW_API_KEY
)

WORKSPACE_NAME = "anayafregozo-gmail-com"
WORKFLOW_ID = "datasetfinalesperando"


# -----------------------------
# CONVERTIR IMAGEN
# -----------------------------

def image_to_base64(image_path: str) -> str:
    with open(image_path, "rb") as image_file:
        return base64.b64encode(
            image_file.read()
        ).decode("utf-8")


# -----------------------------
# DETECCIÓN
# -----------------------------

def detect_products(
    image_path: str,
    min_confidence: float = 0.70
):
    """
    Envía una imagen a Roboflow y devuelve
    los productos detectados agrupados por clase.
    """

    if not os.path.exists(image_path):
        raise FileNotFoundError(
            f"No se encontró la imagen: {image_path}"
        )

    image_base64 = image_to_base64(image_path)

    result = client.run_workflow(
        workspace_name=WORKSPACE_NAME,
        workflow_id=WORKFLOW_ID,
        images={
            "image": image_base64
        },
        use_cache=True
    )

    # La estructura real que devolvió tu Workflow es:
    #
    # result[0]
    #   ["predictions"]
    #   ["predictions"]

    raw_predictions = (
        result[0]
        .get("predictions", {})
        .get("predictions", [])
    )

    grouped = {}

    for prediction in raw_predictions:

        confidence = float(
            prediction.get("confidence", 0)
        )

        # Ignorar detecciones poco confiables
        if confidence < min_confidence:
            continue

        label = prediction.get("class")

        if not label:
            continue

        if label not in grouped:
            grouped[label] = {
                "label": label,
                "quantity": 0,
                "confidences": [],
                "boxes": []
            }

        grouped[label]["quantity"] += 1

        grouped[label]["confidences"].append(
            confidence
        )

        grouped[label]["boxes"].append({
            "x": prediction.get("x"),
            "y": prediction.get("y"),
            "width": prediction.get("width"),
            "height": prediction.get("height")
        })

    # -----------------------------
    # CALCULAR CONFIANZA PROMEDIO
    # -----------------------------

    detections = []

    for item in grouped.values():

        confidences = item.pop(
            "confidences"
        )

        average_confidence = (
            sum(confidences)
            / len(confidences)
        )

        item["confidence"] = round(
            average_confidence,
            4
        )

        detections.append(item)

    return detections


# -----------------------------
# PRUEBA
# -----------------------------

if __name__ == "__main__":

    image_path = str(
        BASE_DIR / "test.jpg"
    )

    print("Analizando imagen...")
    print(f"Imagen: {image_path}")

    detections = detect_products(
        image_path
    )

    print("\nProductos detectados:")

    print(
        json.dumps(
            detections,
            indent=2,
            ensure_ascii=False
        )
    )
