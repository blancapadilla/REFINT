from iA.services.supabase_service import supabase


def create_detection(
    scan_id: str,
    product_id: str,
    predicted_label: str,
    confidence: float,
    quantity: int = 1
):
    detection_data = {
        "scan_id": scan_id,
        "product_id": product_id,
        "predicted_label": predicted_label,
        "confidence": confidence,
        "detected_quantity": quantity
    }

    response = (
        supabase
        .table("detections")
        .insert(detection_data)
        .execute()
    )

    return response.data[0]
