from fastapi import APIRouter, HTTPException, status
from typing import List
import uuid
from app.schemas.inventario_schema import (
    ProductoResponse, 
    ProductoCreate, 
    ProductoUpdate, 
    CategoriaResponse
)

router = APIRouter(
    prefix="/api/v1/inventario",
    tags=["Inventario"]
)

# Base de Datos Simulada en Memoria (Mock)
PRODUCTOS_DB: List[dict] = [
    {
        "id": "1",
        "nombre": "Leche Entera",
        "cantidad": "3 Litros",
        "categoria": "lacteos",
        "estado": "critical",
        "etiquetaEstado": "Crítico",
        "vencimiento": "Vence: Mañana",
        "imagen": "https://lh3.googleusercontent.com/aida-public/AB6AXuDtDBOUVvdgvEgTVlA2cENbF8knIfdl4ViLT8qM78sRD_3-lcS7GKie6R_mtKLHZLjhWajAUrO9upVONIor2zprZGuHpyVv8ek0PKfJOio1DO4fy8fa168bQo0NyZ2AeBTCzoj7iUQb5AahCW5vHhn5NjXXFjvcg-fsQxTBWSZOb4kcpT0MuwuFNh3H1H6o8DBqg2UDjJOqT_bh1el9G1FbMynkM_ySvHqWAjRzPPfUfMStrHLz1wwf-AjTPVLlMzVPWu7vlTFIV6U"
    },
    {
        "id": "2",
        "nombre": "Huevos Orgánicos",
        "cantidad": "13 unidades",
        "categoria": "lacteos",
        "estado": "fresh",
        "etiquetaEstado": "Fresco",
        "vencimiento": "Vence: Oct 24, 2026",
        "imagen": "https://lh3.googleusercontent.com/aida-public/AB6AXuBea0BBQev_7EOUuIE3ShGm5jBlngeN1sYln_gqm2y1ZpoMlq5z4YnxUqPLrhvHN7NLeBULITIz-IHtKJLiVMd0G-JPZ4tKAXb89uDkCyrSruqXxZ8S735qKBCOC_wUwr8TI36VOeVhubqGARfaWXatSz1bNqELfoAWKHmnIoI6_THP2tQjaDsbdFVloO7FZCFH4FxcBDNzVsGYSu_mTrJTZApA3Uwqqu624WposLe2MVLFf5bNgJVdTu4OYde7z9yqtqjuALacdfo"
    },
    {
        "id": "3",
        "nombre": "Yogurt Griego",
        "cantidad": "500g",
        "categoria": "lacteos",
        "estado": "soon",
        "etiquetaEstado": "Pronto",
        "vencimiento": "Vence: 3 días restantes",
        "imagen": "https://lh3.googleusercontent.com/aida-public/AB6AXuAI_-R3dol8hY_EMfyX0TPH_3YfJ18s4MJh13XdNr-OEuCVR8bfn13oezgi7ffJpyRAwo3IP9ocVhzAlahKzcDr-HbK_4wXWMKJwgNN8pcr4yV0pLLYqlhL76Od5LAywL0lRAsSMxpfJf6JprmZFd3-tE6kAm0mG9-86lbqbkppk5Ndc_bjkqkCLmqKmTKByKNUpi4aD-K5bdmUT-Xy7UD7iF5MqUSsrgi8OENPlmQwqvhKRBBEQvowDkxjlq2w-Fqa5285ysXcZTI"
    },
    {
        "id": "4",
        "nombre": "Aguacate Hass",
        "cantidad": "3 unidades",
        "categoria": "vegetales",
        "estado": "fresh",
        "etiquetaEstado": "Fresco",
        "vencimiento": "Vence: Oct 28, 2026",
        "imagen": "https://lh3.googleusercontent.com/aida-public/AB6AXuA-xRxLcMtj-_UXUGxgt7axg2OSoqx1JoKzIAlDiaMoe3ITKnpxIvLx2RgYbvQyLlmt9DWp8FFWlXMFIGtIaAwHxn0nfDU-lTfXDUhnF7BnscfwSd7LR5et-bzRc4NvRKLFBpze4jcljtbv8t1uLe246h1b7l2z3_l4fhOwluA9xS9pzV8uyoRWLse14zCM46fGvZBllnFNE09J11-P1GDzcLu3q35sI54qpOpwyJJL_h7VXX6zOD2BzIlJFHwoxgof4YJ1Zu0JSmE"
    }
]

CATEGORIAS_DB = [
    {"id": "todos", "nombre": "Todos"},
    {"id": "lacteos", "nombre": "Lácteos"},
    {"id": "vegetales", "nombre": "Vegetales"},
    {"id": "carnes", "nombre": "Carnes"},
    {"id": "bebidas", "nombre": "Bebidas"}
]


# --- ENDPOINTS ---

@router.get("", response_model=List[ProductoResponse])
def get_productos():
    return PRODUCTOS_DB


@router.get("/categorias", response_model=List[CategoriaResponse])
def get_categorias():
    return CATEGORIAS_DB


@router.post("", response_model=ProductoResponse, status_code=status.HTTP_201_CREATED)
def crear_producto(producto: ProductoCreate):
    nuevo_producto = producto.model_dump()
    nuevo_producto["id"] = str(uuid.uuid4())[:8]
    PRODUCTOS_DB.append(nuevo_producto)
    return nuevo_producto


@router.put("/{producto_id}", response_model=ProductoResponse)
def actualizar_producto(producto_id: str, producto_update: ProductoUpdate):
    for index, prod in enumerate(PRODUCTOS_DB):
        if prod["id"] == producto_id:
            updated_prod = producto_update.model_dump()
            updated_prod["id"] = producto_id
            PRODUCTOS_DB[index] = updated_prod
            return updated_prod
            
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Producto no encontrado"
    )


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(producto_id: str):
    global PRODUCTOS_DB
    for index, prod in enumerate(PRODUCTOS_DB):
        if prod["id"] == producto_id:
            PRODUCTOS_DB.pop(index)
            return
            
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Producto no encontrado"
    )