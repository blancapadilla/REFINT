from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, dashboard, inventario, compras, sync, historial, alertas, configuracion # <-- Importar configuracion

app = FastAPI(
    title="FreshFocus AI - Backend API",
    description="API MOCK para la gestión del refrigerador inteligente",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Unir routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(inventario.router)
app.include_router(compras.router)
app.include_router(sync.router)
app.include_router(historial.router)
app.include_router(alertas.router)
app.include_router(configuracion.router)  # <-- Registrar router de configuración

@app.get("/")
def root():
    return {"status": "Backend corriendo exitosamente"}