from time import perf_counter

from iA.ai.detector import detect_products
from iA.camera.capture import capture_image

from iA.services.supabase_service import supabase
from iA.services.scan_service import create_scan, complete_scan
from iA.services.detection_service import create_detection
from iA.services.comparison_service import compare_scan_with_inventory


REFRIGERATOR_ID = "595494f8-76ea-418f-af92-d16ca17d2613"


def get_product_by_ai_label(label):
    response = (
        supabase
        .table("products")
        .select("id, name, brand, ai_label")
        .eq("ai_label", label)
        .eq("is_active", True)
        .limit(1)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


def run_scan(
    refrigerator_id: str = REFRIGERATOR_ID,
    camera_index: int = 0,
    existing_scan_id: str | None = None,
):
    started = perf_counter()

    try:
        # ==========================================
        # 1. CREAR SCAN
        # ==========================================

        print("Creando scan...")

        if existing_scan_id:
            scan_id = existing_scan_id
            supabase.table("scans").update({
                "status": "processing"
            }).eq("id", scan_id).execute()
        else:
            scan = create_scan(refrigerator_id)
            scan_id = scan["id"]

        print(
            f"Scan creado: {scan_id}"
        )

        # ==========================================
        # 2. TOMAR FOTO CON LA CAMARA
        # ==========================================

        print("\nTomando fotografía...")

        image_path = capture_image(
            camera_index=camera_index
        )

        print(
            f"Imagen capturada: {image_path}"
        )

        # ==========================================
        # 3. ANALIZAR CON ROBOFLOW
        # ==========================================

        print("\nAnalizando imagen con Roboflow...")

        detections = detect_products(
            image_path,
            min_confidence=0.70
        )

        # ==========================================
        # PROTECCIÓN: 0 DETECCIONES
        # ==========================================

        if not detections:
            print(
                "\nADVERTENCIA: La IA no detectó ningún producto."
            )

            print(
                "Se cancela la comparación para evitar "
                "marcar todo el inventario como retirado."
            )

            processing_ms = int(
                (perf_counter() - started) * 1000
            )

            completed_scan = complete_scan(
                scan_id=scan_id,
                detected_product_count=0,
                processing_ms=processing_ms
            )

            print(
                "\nScan terminado sin modificar el inventario."
            )

            print(
                f'Estado: {completed_scan["status"]}'
            )

            return completed_scan

        # ==========================================
        # MOSTRAR DETECCIONES
        # ==========================================

        print("\nDetecciones realizadas por IA:")

        for detection in detections:
            print(
                f'{detection["label"]}: '
                f'{detection["quantity"]} | '
                f'Confianza: '
                f'{detection["confidence"]:.2%}'
            )

        # ==========================================
        # 4. GUARDAR DETECCIONES EN SUPABASE
        # ==========================================

        print("\nGuardando detecciones en Supabase...")

        total_detected = 0

        for detection in detections:

            product = get_product_by_ai_label(
                detection["label"]
            )

            if not product:
                print(
                    f'Producto no encontrado para '
                    f'ai_label="{detection["label"]}"'
                )

                continue

            create_detection(
                scan_id=scan_id,
                product_id=product["id"],
                predicted_label=detection["label"],
                confidence=detection["confidence"],
                quantity=detection["quantity"]
            )

            total_detected += detection["quantity"]

            print(
                f'Guardado: {product["name"]} | '
                f'Cantidad: {detection["quantity"]} | '
                f'Confianza: '
                f'{detection["confidence"]:.2%}'
            )

        # ==========================================
        # 5. COMPARAR CON INVENTARIO
        # ==========================================

        print("\nComparando con inventario...")

        changes = compare_scan_with_inventory(
            scan_id=scan_id,
            refrigerator_id=refrigerator_id
        )

        print("\nCambios detectados:")

        if not changes:
            print(
                "No se encontraron cambios."
            )

        for change in changes:
            print(
                f'Producto: {change["product_id"]} | '
                f'Antes: {change["previous_quantity"]} | '
                f'Ahora: {change["new_quantity"]} | '
                f'Tipo: {change["change_type"]}'
            )

        # ==========================================
        # 6. CALCULAR TIEMPO
        # ==========================================

        processing_ms = int(
            (perf_counter() - started) * 1000
        )

        # ==========================================
        # 7. COMPLETAR SCAN
        # ==========================================

        completed_scan = complete_scan(
            scan_id=scan_id,
            detected_product_count=total_detected,
            processing_ms=processing_ms
        )

        print("\nScan completado.")

        print(
            f'Estado: '
            f'{completed_scan["status"]}'
        )

        print(
            f'Productos detectados: '
            f'{completed_scan["detected_product_count"]}'
        )

        print(
            f'Tiempo: '
            f'{completed_scan["processing_ms"]} ms'
        )

        return completed_scan

    except Exception as error:

        print("\nError durante el scan:")
        print(error)
        if 'scan_id' in locals():
            supabase.table("scans").update({
                "status": "failed",
                "error_message": str(error)
            }).eq("id", scan_id).execute()
        raise


def main():
    run_scan()


if __name__ == "__main__":
    main()
