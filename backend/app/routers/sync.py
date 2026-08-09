from fastapi import APIRouter, HTTPException, status
from app.schemas.sync_schema import ComparacionResponse

router = APIRouter(
    prefix="/api/v1/sync",
    tags=["Sincronización y Comparación"]
)

RESUMEN_DB = {"disponible": 24, "faltante": 8, "agotado": 3}

FILTROS_DB = [
    {"id": "lacteos", "nombre": "Lácteos"},
    {"id": "frutas", "nombre": "Frutas"}
]

ITEMS_CRITICOS_DB = [
    {
        "id": "c1",
        "nombre": "Leche Entera 1L",
        "subtexto": "Última compra: hace 7 días",
        "estado": "agotado",
        "colorPlaceholder": "1",
        "categoria_id": "lacteos"
    },
    {
        "id": "c2",
        "nombre": "Huevos Orgánicos (12)",
        "subtexto": "Quedan: 2 unidades",
        "estado": "faltante",
        "colorPlaceholder": "2",
        "categoria_id": "lacteos"
    },
    {
        "id": "c3",
        "nombre": "Manzanas Verdes",
        "subtexto": "Quedan: 6 unidades",
        "estado": "disponible",
        "colorPlaceholder": "3",
        "categoria_id": "frutas"
    }
]

REPOSICION_DB = ["Pan Integral", "Yogurt Griego"]

USO_DB = {
    "frutas": 12,
    "lacteos": 40,
    "carnes": 16,
    "otros": 32,
    "lleno": 67
}

@router.get("", response_model=ComparacionResponse)
def get_comparacion_data():
    return {
        "resumen": RESUMEN_DB,
        "filtrosCriticos": FILTROS_DB,
        "itemsCriticos": ITEMS_CRITICOS_DB,
        "articulosReposicion": REPOSICION_DB,
        "uso": USO_DB
    }

@router.post("/actualizar-shopping-list")
def actualizar_shopping_list():
    return {
        "status": "success",
        "mensaje": "Lista de compras sincronizada con los artículos de reposición.",
        "agregados": REPOSICION_DB
    }