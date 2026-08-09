from fastapi import APIRouter, HTTPException, status
from typing import List
import uuid
from app.schemas.compras_schema import (
    ShoppingListResponse,
    ItemCompra,
    ItemCompraCreate,
    CategoriaCompra,
    EstadisticasCompra
)

router = APIRouter(
    prefix="/api/v1/compras",
    tags=["Lista de Compras"]
)

# Base de datos en memoria (Mock)
CATEGORIAS_COMPRA_DB: List[dict] = [
    {
        "id": "lacteos",
        "nombre": "Lácteos",
        "icono": "waterOutline",
        "color": "blue",
        "items": [
            {"id": "item_1", "nombre": "Leche Entera (1L)", "marcado": False, "badge": {"texto": "CRÍTICO", "tipo": "critico"}},
            {"id": "item_2", "nombre": "Yogurt Griego", "marcado": False, "badge": None},
            {"id": "item_3", "nombre": "Queso Parmesano", "marcado": False, "badge": None}
        ]
    },
    {
        "id": "verduras",
        "nombre": "Verduras",
        "icono": "leafOutline",
        "color": "green",
        "items": [
            {"id": "item_4", "nombre": "Espinacas Baby-Blue", "marcado": False, "badge": {"texto": "Agotado", "tipo": "agotado"}},
            {"id": "item_5", "nombre": "Pimientos Rojos", "marcado": False, "badge": None}
        ]
    },
    {
        "id": "frutas",
        "nombre": "Frutas",
        "icono": "nutritionOutline",
        "color": "teal",
        "items": [
            {"id": "item_6", "nombre": "Arándanos", "marcado": False, "badge": None}
        ]
    }
]

ESTADISTICAS_DB = {
    "ahorro_proyectado": "21%",
    "plan_optimizado": "Zero Waste"
}


# --- ENDPOINTS ---

@router.get("", response_model=ShoppingListResponse)
def get_lista_compras():
    return {
        "categorias": CATEGORIAS_COMPRA_DB,
        "estadisticas": ESTADISTICAS_DB
    }


@router.patch("/items/{item_id}/toggle")
def toggle_item(item_id: str):
    for cat in CATEGORIAS_COMPRA_DB:
        for item in cat["items"]:
            if item["id"] == item_id:
                item["marcado"] = not item["marcado"]
                return {"status": "success", "item": item}
                
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Ítem no encontrado"
    )


@router.post("/generar-automatica", response_model=ShoppingListResponse)
def generar_lista_freshiq():
    # Simula la predicción inteligente agregando insumos faltantes
    nuevo_item = {
        "id": f"item_{uuid.uuid4().hex[:6]}",
        "nombre": "Café en Grano (Sugerido FreshIQ)",
        "marcado": False,
        "badge": {"texto": "Sugerido", "tipo": "critico"}
    }
    
    # Lo agregamos a la primera categoría
    CATEGORIAS_COMPRA_DB[0]["items"].append(nuevo_item)
    
    return {
        "categorias": CATEGORIAS_COMPRA_DB,
        "estadisticas": ESTADISTICAS_DB
    }


@router.post("/items", status_code=status.HTTP_201_CREATED)
def agregar_item(item_req: ItemCompraCreate):
    nuevo = {
        "id": f"item_{uuid.uuid4().hex[:6]}",
        "nombre": item_req.nombre,
        "marcado": False,
        "badge": item_req.badge.model_dump() if item_req.badge else None
    }
    
    for cat in CATEGORIAS_COMPRA_DB:
        if cat["id"] == item_req.categoria_id:
            cat["items"].append(nuevo)
            return {"status": "success", "item": nuevo}
            
    # Si la categoría no existe, la agrega a la primera por defecto
    CATEGORIAS_COMPRA_DB[0]["items"].append(nuevo)
    return {"status": "success", "item": nuevo}