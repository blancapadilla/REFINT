from pydantic import BaseModel
from typing import List, Literal

class ResumenComparacion(BaseModel):
    disponible: int
    faltante: int
    agotado: int

class FiltroCritico(BaseModel):
    id: str
    nombre: str

class ItemCritico(BaseModel):
    id: str
    nombre: str
    subtexto: str
    estado: Literal['disponible', 'faltante', 'agotado']
    colorPlaceholder: Literal['1', '2', '3']
    categoria_id: str

class UsoInventario(BaseModel):
    frutas: int
    lacteos: int
    carnes: int
    otros: int
    lleno: int

class ComparacionResponse(BaseModel):
    resumen: ResumenComparacion
    filtrosCriticos: List[FiltroCritico]
    itemsCriticos: List[ItemCritico]
    articulosReposicion: List[str]
    uso: UsoInventario