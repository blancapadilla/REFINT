from fastapi import APIRouter, status
from app.schemas.configuracion_schema import (
    ConfiguracionResponse,
    ActualizarPreferenciasRequest
)

router = APIRouter(
    prefix="/api/v1/configuracion",
    tags=["Configuración"]
)

CONFIGURACION_DB = {
    "perfil": {
        "nombre": "Alex Riveira",
        "email": "alex.riveira@freshiq.com",
        "plan": "Premium Plan",
        "avatarUrl": "https://lh3.googleusercontent.com/aida-public/AB6AXuCxzXUPhyslY1FIWRBqUKCLvT75cd8meIx3Zmcs_93qGv-I_SQ6VSIV8Z6Odv236FzGybm2WRBqwzeF3bBe-SC9I43Ubhl9O0WcUFT-ImeFyoRthDFQ3ESLqlgXymdnDbWEUupKMS4jrOraC1aFR4LnAjSXVC6GhQf-pX1mjbLg_ElZekgsfoJVfHAm0ue3ZZELRzSnyjw3XtZRAhbLubtVQFojvttJ2glduSmfVecP7ayaLgPUkiHHcTZ4N_A8l3ISxFpysB85KtQ"
    },
    "dispositivos": {
        "camaraConectada": True
    },
    "preferencias": {
        "notificacionesActivadas": True,
        "idioma": "Español",
        "esModoOscuro": False
    }
}


@router.get("", response_model=ConfiguracionResponse)
def get_configuracion():
    return CONFIGURACION_DB


@router.patch("/preferencias")
def actualizar_preferencias(req: ActualizarPreferenciasRequest):
    pref = CONFIGURACION_DB["preferencias"]
    
    if req.notificacionesActivadas is not None:
        pref["notificacionesActivadas"] = req.notificacionesActivadas
    if req.idioma is not None:
        pref["idioma"] = req.idioma
    if req.esModoOscuro is not None:
        pref["esModoOscuro"] = req.esModoOscuro

    return {"status": "success", "preferencias": pref}


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout():
    return {"status": "success", "mensaje": "Sesión cerrada correctamente"}