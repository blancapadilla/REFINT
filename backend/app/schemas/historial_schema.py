from pydantic import BaseModel
from typing import List, Literal

class ActividadItem(BaseModel):
    id: str
    title: str
    description: str
    time: str
    icon: str  # Nombre del ícono enviado como texto (ej: 'notificationsOutline')
    color: Literal['danger', 'primary', 'gray']

class HistorialResponse(BaseModel):
    todayActivities: List[ActividadItem]
    yesterdayActivities: List[ActividadItem]