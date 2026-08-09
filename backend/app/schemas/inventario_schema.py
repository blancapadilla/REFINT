from pydantic import BaseModel
from typing import Literal

class ProductoBase(BaseModel):
    nombre: str
    cantidad: str
    categoria: str
    estado: Literal['critical', 'soon', 'fresh']
    etiquetaEstado: str
    vencimiento: str
    imagen: str

class ProductoCreate(ProductoBase):
    pass

class ProductoUpdate(ProductoBase):
    pass

class ProductoResponse(ProductoBase):
    id: str

class CategoriaResponse(BaseModel):
    id: str
    nombre: str