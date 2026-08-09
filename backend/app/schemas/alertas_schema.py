from pydantic import BaseModel
from typing import List, Optional, Literal

class AlertaItem(BaseModel):
    id: str
    type: Literal['critical', 'warning', 'yellow', 'success']
    icon: str  # Nombre en texto del ícono (ej. 'closeCircleOutline')
    title: str
    time: str
    description: str
    action: Optional[str] = None
    secondaryAction: Optional[str] = None
    status: Optional[str] = None
    progreso: Optional[int] = None

class ResumenAlertas(BaseModel):
    criticas: int
    proximos: int

class AlertasResponse(BaseModel):
    resumen: ResumenAlertas
    alerts: List[AlertaItem]