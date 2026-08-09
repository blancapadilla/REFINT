from fastapi import APIRouter
from app.schemas.historial_schema import HistorialResponse

router = APIRouter(
    prefix="/api/v1/historial",
    tags=["Historial de Actividad"]
)

TODAY_ACTIVITIES_DB = [
    {
        "id": "h1",
        "title": "Alerta de caducidad",
        "description": "Yogur Griego está a punto de vencer.",
        "time": "03:33 AM",
        "icon": "notificationsOutline",
        "color": "danger"
    },
    {
        "id": "h2",
        "title": "Leche agregada",
        "description": "Se detectaron 2 unidades nuevas.",
        "time": "09:20 AM",
        "icon": "cubeOutline",
        "color": "primary"
    }
]

YESTERDAY_ACTIVITIES_DB = [
    {
        "id": "h3",
        "title": "Espinacas agotadas",
        "description": "Añadido automáticamente a Shopping.",
        "time": "07:15 PM",
        "icon": "cartOutline",
        "color": "gray"
    },
    {
        "id": "h4",
        "title": "Sincronización completa",
        "description": "Base de datos actualizada...",
        "time": "12:30 PM",
        "icon": "syncOutline",
        "color": "gray"
    }
]

@router.get("", response_model=HistorialResponse)
def get_historial():
    return {
        "todayActivities": TODAY_ACTIVITIES_DB,
        "yesterdayActivities": YESTERDAY_ACTIVITIES_DB
    }

@router.get("/mas", response_model=HistorialResponse)
def cargar_mas_actividad():
    # Simulación de carga de eventos más antiguos
    actividades_extra = [
        {
            "id": "h5",
            "title": "Ajuste de Temperatura",
            "description": "Optimizada a 3 °C por sistema inteligente.",
            "time": "08:00 AM",
            "icon": "syncOutline",
            "color": "primary"
        }
    ]
    return {
        "todayActivities": [],
        "yesterdayActivities": YESTERDAY_ACTIVITIES_DB + actividades_extra
    }