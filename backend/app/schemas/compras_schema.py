from pydantic import BaseModel
from typing import List, Optional, Literal

class ItemBadge(BaseModel):
    texto: str
    tipo: Literal['critico', 'agotado']

class ItemCompra(BaseModel):
    id: str
    nombre: str
    marcado: bool
    badge: Optional[ItemBadge] = None

class ItemCompraCreate(BaseModel):
    nombre: str
    categoria_id: str
    badge: Optional[ItemBadge] = None

class CategoriaCompra(BaseModel):
    id: str
    nombre: str
    icono: str
    color: Literal['blue', 'green', 'teal']
    items: List[ItemCompra]

class EstadisticasCompra(BaseModel):
    ahorro_proyectado: str
    plan_optimizado: str

class ShoppingListResponse(BaseModel):
    categorias: List[CategoriaCompra]
    estadisticas: EstadisticasCompra