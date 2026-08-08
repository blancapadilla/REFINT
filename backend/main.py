from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, dashboard

app = FastAPI(
    title="FreshFocus AI - Backend API",
    description="API MOCK para la gestión del refrigerador inteligente",
    version="1.0.0"
)

# Permitir solicitudes desde Angular/Ionic
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Unir los routers modulares
app.include_router(auth.router)
app.include_router(dashboard.router)


@app.get("/")
def root():
    return {"status": "Backend corriendo exitosamente"}