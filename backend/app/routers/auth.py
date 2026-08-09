from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Autenticación"]
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


# --- ENDPOINTS ---

@router.post("/login")
def login(credentials: LoginRequest):
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


@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest):
    return {
        "status": "success",
        "mensaje": f"Se ha enviado un correo a {data.email} con las instrucciones."
    }


@router.post("/social-login")
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