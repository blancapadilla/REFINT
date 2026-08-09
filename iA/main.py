from time import perf_counter

from services.scan_service import create_scan, complete_scan
from services.detection_service import create_detection
from services.comparison_service import compare_scan_with_inventory


REFRIGERATOR_ID = "595494f8-76ea-418f-af92-d16ca17d2613"

PRODUCTS = [
    {
        "id": "e2af1899-9eca-45d2-aab5-7a7b5edaa726",
        "label": "milk_carton",
        "confidence": 0.96,
        "quantity": 1
    },
    {
        "id": "ea78dd5a-6c77-4b8d-88b1-7470a32c5188",
        "label": "egg_carton",
        "confidence": 0.91,
        "quantity": 1
    },
    {
        "id": "1d5e4b06-5db3-457f-ac5f-be6d1e93a111",
        "label": "greek_yogurt",
        "confidence": 0.88,
        "quantity": 2
    }
]


def main():
    started = perf_counter()

    try:
        print("Creando scan...")

        scan = create_scan(REFRIGERATOR_ID)

        print(f'Scan creado: {scan["id"]}')

        print("\nGuardando detecciones...")

        for product in PRODUCTS:
            create_detection(
                scan_id=scan["id"],
                product_id=product["id"],
                predicted_label=product["label"],
                confidence=product["confidence"],
                quantity=product["quantity"]
            )

            print(
                f'{product["label"]}: '
                f'{product["quantity"]}'
            )

        print("\nComparando con inventario...")

        changes = compare_scan_with_inventory(
            scan_id=scan["id"],
            refrigerator_id=REFRIGERATOR_ID
        )

        print("\nCambios detectados:")

        for change in changes:
            print(
                f'Producto: {change["product_id"]} | '
                f'Antes: {change["previous_quantity"]} | '
                f'Ahora: {change["new_quantity"]} | '
                f'Tipo: {change["change_type"]}'
            )

        processing_ms = int(
            (perf_counter() - started) * 1000
        )

        completed_scan = complete_scan(
            scan_id=scan["id"],
            detected_product_count=len(PRODUCTS),
            processing_ms=processing_ms
        )

        print("\nScan completado.")
        print(f'Estado: {completed_scan["status"]}')
        print(
            f'Productos detectados: '
            f'{completed_scan["detected_product_count"]}'
        )
        print(
            f'Tiempo: '
            f'{completed_scan["processing_ms"]} ms'
        )

    except Exception as error:
        print("\nError:")
        print(error)


if __name__ == "__main__":
    main()