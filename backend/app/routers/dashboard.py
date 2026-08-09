from fastapi import APIRouter

router = APIRouter(
    prefix="/api/v1/dashboard",
    tags=["Dashboard"]
)


@router.get("")
def get_dashboard_data():
    return {
        "usuario": "Bene",
        "sensores": {
            "temperatura": {
                "valor": "3 °C",
                "estado": "Óptima",
                "color": "primary"
            },
            "humedad": {
                "valor": "45 %",
                "estado": "Nivel Estable",
                "color": "secondary"
            }
        },
        "resumen": {
            "total_productos": 67,
            "agregados_hoy": 4,
            "por_vencer": 3,
            "escaseando": 5
        },
        "productos_por_vencer": [
            {
                "id": "prod_01",
                "nombre": "Leche Entera",
                "image": "assets/images/products/lecheentera.webp",
                "vence": "1 día restante",
                "progreso": 10,
                "clase": "danger"
            },
            {
                "id": "prod_02",
                "nombre": "Espinacas",
                "image": "assets/images/products/espinacas.png",
                "vence": "3 días restantes",
                "progreso": 30,
                "clase": "warning"
            }
        ],
        "distribucion": [
            { "color": "primary", "label": "Lácteos & Huevos", "percent": 67 },
            { "color": "secondary", "label": "Vegetales", "percent": 13 },
            { "color": "tertiary", "label": "Proteínas", "percent": 20 }
        ],
        "recetas_recomendadas": [
            {
                "id": "rec_01",
                "title": "Omelette Cremoso de Espinacas",
                "description": "Receta recomendada",
                "variant": "green",
                "image": "assets/images/recipes/omeleet.png"
            },
            {
                "id": "rec_02",
                "title": "Quiche de Tres Quesos",
                "description": "Lácteos por vencer",
                "variant": "orange",
                "image": "assets/images/recipes/quiche.jpg"
            }
        ]
    }