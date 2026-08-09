from pydantic import BaseModel, EmailStr
from typing import Optional

class UsuarioPerfil(BaseModel):
    nombre: str
    email: str
    plan: str
    avatarUrl: str

class DispositivosConfig(BaseModel):
    camaraConectada: bool

class PreferenciasApp(BaseModel):
    notificacionesActivadas: bool
    idioma: str
    esModoOscuro: bool

class ConfiguracionResponse(BaseModel):
    perfil: UsuarioPerfil
    dispositivos: DispositivosConfig
    preferencias: PreferenciasApp

class ActualizarPreferenciasRequest(BaseModel):
    notificacionesActivadas: Optional[bool] = None
    idioma: Optional[str] = None
    esModoOscuro: Optional[bool] = None