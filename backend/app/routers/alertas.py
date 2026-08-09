from fastapi import APIRouter
from typing import List
from app.schemas.alertas_schema import AlertasResponse, AlertaItem

router = APIRouter(
    prefix="/api/v1/alertas",
    tags=["Centro de Alertas"]
)

RESUMEN_ALERTAS_DB = {
    "criticas": 2,
    "proximos": 4
}

ALERTAS_DB: List[dict] = [
    {
        "id": "alt_1",
        "type": "critical",
        "icon": "closeCircleOutline",
        "title": "Leche Entera (2L)",
        "time": "Hace 21 min",
        "description": "El producto está completamente agotado. No quedan existencias en el compartimiento principal.",
        "action": "Añadir al Carrito",
        "secondaryAction": "Omitir",
        "status": None,
        "progreso": None
    },
    {
        "id": "alt_2",
        "type": "warning",
        "icon": "calendarOutline",
        "title": "Yogur Griego Natural",
        "time": "Hace 1 hora",
        "description": "Vence mañana. Se recomienda consumir pronto o usar en recetas de repostería.",
        "action": "Ver Recetas",
        "secondaryAction": None,
        "status": "85% del tiempo transcurrido",
        "progreso": 85
    },
    {
        "id": "alt_3",
        "type": "yellow",
        "icon": "basketOutline",
        "title": "Huevos (Docena)",
        "time": "Hace 3 horas",
        "description": "Quedan solo 2 unidades. Tu consumo promedio indica que necesitarás más en 2 días.",
        "action": "Comprar",
        "secondaryAction": None,
        "status": None,
        "progreso": None
    },
    {
        "id": "alt_4",
        "type": "success",
        "icon": "cloudOutline",
        "title": "Inventario Sincronizado",
        "time": "Hoy, 08:45 AM",
        "description": "Se han actualizado 12 artículos correctamente después de tu visita al supermercado.",
        "action": "Ver detalles",
        "secondaryAction": None,
        "status": None,
        "progreso": None
    }
]

@router.get("", response_model=AlertasResponse)
def get_alertas():
    return {
        "resumen": RESUMEN_ALERTAS_DB,
        "alerts": ALERTAS_DB
    }

@router.post("/marcar-leido")
def marcar_todo_leido():
    global ALERTAS_DB, RESUMEN_ALERTAS_DB
    # Simula la lectura limpia de alertas
    ALERTAS_DB = []
    RESUMEN_ALERTAS_DB = {"criticas": 0, "proximos": 0}
    return {"status": "success", "mensaje": "Todas las alertas han sido marcadas como leídas."}