"""
CupiTech Web — Backend API v3
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
    "alertas": {},  # por proyecto
}

PROYECTOS = ["PUEBLA", "QUERETARO", "EDOMEX", "LEON", "TLAXCALA"]

def actualizar_solar():
    while True:
        try:
            from solar_api import obtener_todos_api
            datos = obtener_todos_api()
            _cache["solar"]["data"] = datos
            _cache["solar"]["updated"] = datetime.now().isoformat()
        except Exception as e:
            print(f"Error solar cache: {e}")
        time.sleep(300)

def actualizar_reflectores():
    while True:
        try:
            from reflector_api import get_todos_reflectores
            datos = get_todos_reflectores()
            _cache["reflectores"]["data"] = datos
            _cache["reflectores"]["updated"] = datetime.now().isoformat()
        except Exception as e:
            print(f"Error reflectores cache: {e}")
        time.sleep(300)

def actualizar_alertas():
    while True:
        try:
            from alertas_camaras import obtener_alertas
            for proyecto in PROYECTOS:
                try:
                    rojas, naranjas, total = obtener_alertas(proyecto)
                    alertas_list = []
                    for a in rojas:
                        alertas_list.append({"ut": a, "nivel": "CRITICO", "color": "#C0392B"})
                    for a in naranjas:
                        alertas_list.append({"ut": a, "nivel": "ALERTA", "color": "#E67E22"})
                    _cache["alertas"][proyecto] = {
                        "alertas": alertas_list,
                        "total": total,
                        "criticas": len(rojas),
                        "alertas_count": len(naranjas),
                        "updated": datetime.now().isoformat()
                    }
                except:
                    pass
        except Exception as e:
            print(f"Error alertas cache: {e}")
        time.sleep(900)  # cada 15 min

@app.on_event("startup")
def startup():
    threading.Thread(target=actualizar_solar, daemon=True).start()
    threading.Thread(target=actualizar_reflectores, daemon=True).start()
    threading.Thread(target=actualizar_alertas, daemon=True).start()
    print("✅ Threads de caché iniciados")

# ── Endpoints ─────────────────────────────────────────────

@app.get("/")
def root():
    return {"sistema": "CupiTech API", "version": "1.0.0", "estado": "activo", "timestamp": datetime.now().isoformat()}

@app.get("/health")
def health():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

@app.get("/api/proyectos")
def get_proyectos():
    proyectos = [
        {"id": "PUEBLA", "nombre": "Puebla", "uts": 132, "estado": "activo"},
        {"id": "QRO", "nombre": "Querétaro", "uts": 22, "estado": "activo"},
        {"id": "EDOMEX", "nombre": "Edo. México", "uts": 95, "estado": "en_integracion"},
        {"id": "LEON", "nombre": "León", "uts": 0, "estado": "pendiente"},
        {"id": "TLAXCALA", "nombre": "Tlaxcala", "uts": 0, "estado": "pendiente"},
    ]
    # Agregar conteo de alertas por proyecto
    for p in proyectos:
        cache_alertas = _cache["alertas"].get(p["id"], {})
        p["criticas"] = cache_alertas.get("criticas", 0)
        p["alertas"] = cache_alertas.get("alertas_count", 0)
    return {"proyectos": proyectos}

@app.get("/api/alertas")
def get_alertas_todas():
    """Todas las alertas de todos los proyectos"""
    todas = []
    for proyecto, data in _cache["alertas"].items():
        for a in data.get("alertas", []):
            a["proyecto"] = proyecto
            todas.append(a)
    return {
        "alertas": todas,
        "total": len(todas),
        "criticas": len([a for a in todas if a["nivel"] == "CRITICO"]),
        "updated": datetime.now().isoformat()
    }

@app.get("/api/alertas/{proyecto}")
def get_alertas_proyecto(proyecto: str):
    """Alertas de un proyecto específico"""
    data = _cache["alertas"].get(proyecto.upper(), {})
    if not data:
        # Si no está en caché, consultar directamente
        try:
            from alertas_camaras import obtener_alertas
            rojas, naranjas, total = obtener_alertas(proyecto.upper())
            alertas_list = []
            for a in rojas:
                alertas_list.append({"ut": a, "nivel": "CRITICO", "color": "#C0392B", "proyecto": proyecto})
            for a in naranjas:
                alertas_list.append({"ut": a, "nivel": "ALERTA", "color": "#E67E22", "proyecto": proyecto})
            return {"proyecto": proyecto, "alertas": alertas_list, "total": total, "criticas": len(rojas)}
        except Exception as e:
            return {"proyecto": proyecto, "alertas": [], "total": 0, "error": str(e)}
    return {"proyecto": proyecto, **data}

@app.get("/api/solar")
def get_solar():
    return {"equipos": _cache["solar"]["data"], "total": len(_cache["solar"]["data"]), "updated": _cache["solar"]["updated"], "cargando": len(_cache["solar"]["data"]) == 0}

@app.get("/api/reflectores")
def get_reflectores():
    return {"reflectores": _cache["reflectores"]["data"], "total": len(_cache["reflectores"]["data"]), "updated": _cache["reflectores"]["updated"]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
