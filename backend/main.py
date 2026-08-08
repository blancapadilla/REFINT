from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr

app = FastAPI(
    title="FreshFocus AI - Backend API",
    description="API MOCK para la gestión del refrigerador inteligente",
    version="1.0.0"
)

# Permitir solicitudes desde Angular/Ionic (localhost:8100)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELOS PYDANTIC ---
class LoginRequest(BaseModel):
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class SocialLoginRequest(BaseModel):
    proveedor: str
    id_token: str


# --- ENDPOINTS DE AUTENTICACIÓN ---

@app.post("/api/v1/auth/login")
def login(credentials: LoginRequest):
    # Validación simple simulada (Mock)
    if credentials.email == "nombre@ejemplo.com" and credentials.password == "12345678":
        return {
            "access_token": "mock_jwt_token_1234567890",
            "token_type": "bearer",
            "usuario": {
                "id": "usr_01",
                "nombre": "Usuario Prueba",
                "email": credentials.email
            }
        }
    
    # Credenciales por defecto para cualquier otro usuario de prueba
    if credentials.email and len(credentials.password) >= 6:
        return {
            "access_token": "mock_jwt_token_demo",
            "token_type": "bearer",
            "usuario": {
                "id": "usr_demo",
                "nombre": "Usuario Demo",
                "email": credentials.email
            }
        }

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Correo o contraseña incorrectos"
    )


@app.post("/api/v1/auth/forgot-password")
def forgot_password(data: ForgotPasswordRequest):
    return {
        "status": "success",
        "mensaje": f"Se ha enviado un correo a {data.email} con las instrucciones."
    }


@app.post("/api/v1/auth/social-login")
def social_login(data: SocialLoginRequest):
    return {
        "access_token": f"mock_jwt_token_{data.proveedor}",
        "token_type": "bearer",
        "usuario": {
            "id": f"usr_{data.proveedor}_01",
            "nombre": f"Usuario {data.proveedor.capitalize()}",
            "email": f"usuario_{data.proveedor}@ejemplo.com"
        }
    }