"""
CupiTech Web — Backend API
FastAPI REST API para la PWA de CupiTech
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import sys
import threading
import time

sys.path.append(r'C:\Users\Usuario\asistente-mantenimiento')

app = FastAPI(
    title="CupiTech API",
    description="API REST para CupiTech — Plataforma de Mantenimiento Autotraffic",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Caché en memoria ──────────────────────────────────────
_cache = {
    "solar": {"data": [], "updated": None},
    "reflectores": {"data": [], "updated": None},
}

def actualizar_solar():
    """Actualiza datos solares en background cada 5 minutos"""
    while True:
        try:
            from solar_api import obtener_todos_api
            datos = obtener_todos_api()
            _cache["solar"]["data"] = datos
            _cache["solar"]["updated"] = datetime.now().isoformat()
        except Exception as e:
            print(f"Error solar cache: {e}")
        time.sleep(300)  # cada 5 minutos

def actualizar_reflectores():
    """Actualiza reflectores en background cada 5 minutos"""
    while True:
        try:
            from reflector_api import get_todos_reflectores, formatear_estado_telegram
            datos = get_todos_reflectores()
            _cache["reflectores"]["data"] = datos
            _cache["reflectores"]["updated"] = datetime.now().isoformat()
        except Exception as e:
            print(f"Error reflectores cache: {e}")
        time.sleep(300)

@app.on_event("startup")
def startup():
    """Inicia los threads de caché al arrancar"""
    threading.Thread(target=actualizar_solar, daemon=True).start()
    threading.Thread(target=actualizar_reflectores, daemon=True).start()
    print("✅ Threads de caché iniciados")

# ── Endpoints ─────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "sistema": "CupiTech API",
        "version": "1.0.0",
        "estado": "activo",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
def health():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

@app.get("/api/proyectos")
def get_proyectos():
    return {
        "proyectos": [
            {"id": "PUEBLA", "nombre": "Puebla", "uts": 132, "estado": "activo"},
            {"id": "QRO", "nombre": "Querétaro", "uts": 22, "estado": "activo"},
            {"id": "EDOMEX", "nombre": "Edo. México", "uts": 95, "estado": "en_integracion"},
            {"id": "LEON", "nombre": "León", "uts": 0, "estado": "pendiente"},
            {"id": "TLAXCALA", "nombre": "Tlaxcala", "uts": 0, "estado": "pendiente"},
        ]
    }

@app.get("/api/solar")
def get_solar():
    """Retorna datos solares desde caché"""
    return {
        "equipos": _cache["solar"]["data"],
        "total": len(_cache["solar"]["data"]),
        "updated": _cache["solar"]["updated"],
        "cargando": len(_cache["solar"]["data"]) == 0
    }

@app.get("/api/reflectores")
def get_reflectores():
    """Retorna reflectores desde caché"""
    return {
        "reflectores": _cache["reflectores"]["data"],
        "total": len(_cache["reflectores"]["data"]),
        "updated": _cache["reflectores"]["updated"],
        "cargando": len(_cache["reflectores"]["data"]) == 0
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
