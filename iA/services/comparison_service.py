from iA.services.supabase_service import supabase


def compare_scan_with_inventory(scan_id: str, refrigerator_id: str):
    # 1. Obtener detecciones del scan
    detections_response = (
        supabase
        .table("detections")
        .select("product_id, detected_quantity")
        .eq("scan_id", scan_id)
        .execute()
    )

    detections = detections_response.data

    detected_map = {}

    for detection in detections:
        product_id = detection["product_id"]
        quantity = float(detection["detected_quantity"])

        if product_id in detected_map:
            detected_map[product_id] += quantity
        else:
            detected_map[product_id] = quantity

    # 2. Obtener inventario actual
    inventory_response = (
        supabase
        .table("inventory_items")
        .select(
            "product_id, quantity, unit, "
            "products(is_ai_detectable)"
        )
        .eq("refrigerator_id", refrigerator_id)
        .execute()
    )

    inventory = inventory_response.data

    # 3. Solo productos detectables por IA
    inventory_map = {}

    for item in inventory:
        product = item.get("products") or {}

        if product.get("is_ai_detectable") is not True:
            continue

        inventory_map[item["product_id"]] = {
            "quantity": float(item["quantity"]),
            "unit": item["unit"]
        }

    # 4. Obtener todos los productos involucrados
    all_product_ids = set(inventory_map.keys()) | set(detected_map.keys())

    changes = []

    # 5. Comparar
    for product_id in all_product_ids:
        inventory_item = inventory_map.get(product_id)

        if inventory_item:
            previous_quantity = inventory_item["quantity"]
            unit = inventory_item["unit"]
        else:
            previous_quantity = 0
            unit = "unidad"

        new_quantity = detected_map.get(product_id, 0)

        difference = new_quantity - previous_quantity

        if previous_quantity == 0 and new_quantity > 0:
            change_type = "added"

        elif previous_quantity > 0 and new_quantity == 0:
            change_type = "removed"

        elif difference != 0:
            change_type = "quantity_changed"

        else:
            change_type = "unchanged"

        change_data = {
            "scan_id": scan_id,
            "product_id": product_id,
            "unit": unit,
            "previous_quantity": previous_quantity,
            "new_quantity": new_quantity,
            "change_type": change_type
        }

        response = (
            supabase
            .table("scan_changes")
            .insert(change_data)
            .execute()
        )

        changes.append(response.data[0])

    return changes
