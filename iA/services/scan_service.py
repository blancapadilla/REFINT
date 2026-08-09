from services.supabase_service import supabase


def create_scan(refrigerator_id: str):
    scan_data = {
        "refrigerator_id": refrigerator_id,
        "status": "processing",
        "scan_type": "automatico"
    }

    response = (
        supabase
        .table("scans")
        .insert(scan_data)
        .execute()
    )

    return response.data[0]

from datetime import datetime, timezone

from services.supabase_service import supabase


def create_scan(refrigerator_id: str):
    scan_data = {
        "refrigerator_id": refrigerator_id,
        "status": "processing",
        "scan_type": "automatico"
    }

    response = (
        supabase
        .table("scans")
        .insert(scan_data)
        .execute()
    )

    return response.data[0]


def complete_scan(
    scan_id: str,
    detected_product_count: int,
    processing_ms: int | None = None
):
    data = {
        "status": "completed",
        "finished_at": datetime.now(timezone.utc).isoformat(),
        "detected_product_count": detected_product_count
    }

    if processing_ms is not None:
        data["processing_ms"] = processing_ms

    response = (
        supabase
        .table("scans")
        .update(data)
        .eq("id", scan_id)
        .execute()
    )

    return response.data[0]