import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv(
    "SUPABASE_SERVICE_ROLE_KEY"
)

if not SUPABASE_URL:
    raise ValueError(
        "No se encontró SUPABASE_URL en .env"
    )

if not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError(
        "No se encontró SUPABASE_SERVICE_ROLE_KEY en .env"
    )

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
)
