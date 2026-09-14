"""
CupiTech Web — Backend API v5
Con autenticación, sesiones y filtro por proyecto
"""
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import sys
import threading
import time

sys.path.append(r'C:\Users\Usuario\asistente-mantenimiento')

app = FastAPI(title="CupiTech API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# ── Mapa solar por proyecto ───────────────────────────────
SOLAR_POR_PROYECTO = {
    "PUEBLA": ["UT547", "UT548", "UT569", "UT500", "UT566_567_camaras", "UT566_567_reflector"],
    "QRO": ["UT001_QRO", "N008_PaseoQroW", "Reflector_N008", "Reflector_N007", "N006_SuperQ", "N010_Mirador", "N011_Zaru", "N007_PaseoQroE", "N014_Zakia", "Nema_0012", "N002_El_Nabo"],
    "TLAXCALA": ["UTT001", "UTT002", "UTT003", "UTT004"],
    "SAN_ANDRES": ["Pue-ATX"],
    "EDOMEX": ["TLBUS01", "TLBUS02", "TLBUS03", "TLBUS04", "TLBUS05", "TLBUS06", "TLBUS07", "TLBUS08", "TLBUS09", "TLBUS10", "TLBUS11", "TLBUS12", "TLBUS13", "TLBUS14", "TLBUS15", "TLBUS16", "TLBUS17", "TLBUS18", "TLBUS19"],
    "LEON": [],
}

PROYECTOS_INFO = [
    {"id": "PUEBLA", "nombre": "Puebla", "uts": 132, "estado": "activo"},
    {"id": "QRO", "nombre": "Querétaro", "uts": 22, "estado": "activo"},
    {"id": "EDOMEX", "nombre": "Edo. México", "uts": 95, "estado": "en_integracion"},
    {"id": "LEON", "nombre": "León", "uts": 0, "estado": "pendiente"},
    {"id": "TLAXCALA", "nombre": "Tlaxcala", "uts": 0, "estado": "pendiente"},
    {"id": "SAN_ANDRES", "nombre": "San Andrés", "uts": 0, "estado": "pendiente"},
]

PROYECTOS_API = ["PUEBLA", "QUERETARO", "EDOMEX", "LEON", "TLAXCALA"]

# ── Caché ─────────────────────────────────────────────────
_cache = {
    "solar": {"data": [], "updated": None},
    "reflectores": {"data": [], "updated": None},
    "alertas": {},
}

def actualizar_solar():
    while True:
        try:
            from solar_api import obtener_todos_api
            _cache["solar"]["data"] = obtener_todos_api()
            _cache["solar"]["updated"] = datetime.now().isoformat()
        except Exception as e:
            print(f"Error solar: {e}")
        time.sleep(300)

def actualizar_reflectores():
    while True:
        try:
            from reflector_api import get_todos_reflectores
            _cache["reflectores"]["data"] = get_todos_reflectores()
            _cache["reflectores"]["updated"] = datetime.now().isoformat()
        except Exception as e:
            print(f"Error reflectores: {e}")
        time.sleep(300)

def parsear_alerta(cam, nivel, color):
    """Extrae solo los campos necesarios de una cámara"""
    return {
        "ut": cam.get("camera_id", cam.get("location", "Desconocida")),
        "nivel": nivel,
        "color": color,
        "lag_min": cam.get("lag_minutes", 0),
        "estado": cam.get("inactive_reason", ""),
    }

def actualizar_alertas():
    while True:
        try:
            from alertas_camaras import obtener_alertas
            for proyecto in PROYECTOS_API:
                try:
                    rojas, naranjas, total = obtener_alertas(proyecto)
                    _cache["alertas"][proyecto] = {
                        "alertas": [parsear_alerta(a, "CRITICO", "#C0392B") for a in rojas] +
                                   [parsear_alerta(a, "ALERTA", "#E67E22") for a in naranjas],
                        "total": total, "criticas": len(rojas), "alertas_count": len(naranjas),
                        "updated": datetime.now().isoformat()
                    }
                except: pass
        except Exception as e:
            print(f"Error alertas: {e}")
        time.sleep(900)

@app.on_event("startup")
def startup():
    threading.Thread(target=actualizar_solar, daemon=True).start()
    threading.Thread(target=actualizar_reflectores, daemon=True).start()
    threading.Thread(target=actualizar_alertas, daemon=True).start()
    print("✅ CupiTech API v5 iniciado")

# ── Auth ──────────────────────────────────────────────────
class LoginRequest(BaseModel):
    correo: str
    password: str

def get_sesion_actual(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No autenticado")
    from usuarios import get_sesion
    sesion = get_sesion(authorization.replace("Bearer ", ""))
    if not sesion:
        raise HTTPException(status_code=401, detail="Sesión expirada")
    return sesion

@app.post("/api/auth/login")
def login(req: LoginRequest):
    from usuarios import login as do_login, get_sesion
    token, error = do_login(req.correo, req.password)
    if error:
        raise HTTPException(status_code=401, detail=error)
    sesion = get_sesion(token)
    return {"token": token, "nombre": sesion["nombre"], "rol": sesion["rol"], "proyectos": sesion["proyectos"]}

@app.post("/api/auth/logout")
def logout(authorization: str = Header(None)):
    if authorization and authorization.startswith("Bearer "):
        from usuarios import logout as do_logout
        do_logout(authorization.replace("Bearer ", ""))
    return {"ok": True}

@app.get("/api/auth/me")
def me(authorization: str = Header(None)):
    return get_sesion_actual(authorization)

# ── Endpoints ─────────────────────────────────────────────
@app.get("/")
def root():
    return {"sistema": "CupiTech API", "version": "1.0.0", "estado": "activo", "timestamp": datetime.now().isoformat()}

@app.get("/health")
def health():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

@app.get("/api/proyectos")
def get_proyectos(authorization: str = Header(None)):
    sesion = get_sesion_actual(authorization)
    proyectos = []
    for p in PROYECTOS_INFO:
        if p["id"] in sesion["proyectos"]:
            cache_a = _cache["alertas"].get(p["id"], {})
            p_copy = p.copy()
            p_copy["criticas"] = cache_a.get("criticas", 0)
            p_copy["alertas"] = cache_a.get("alertas_count", 0)
            proyectos.append(p_copy)
    return {"proyectos": proyectos}

@app.get("/api/alertas/{proyecto}")
def get_alertas_proyecto(proyecto: str, authorization: str = Header(None)):
    sesion = get_sesion_actual(authorization)
    if proyecto.upper() not in sesion["proyectos"]:
        raise HTTPException(status_code=403, detail="Sin acceso a este proyecto")
    data = _cache["alertas"].get(proyecto.upper(), {})
    if not data:
        try:
            from alertas_camaras import obtener_alertas
            rojas, naranjas, total = obtener_alertas(proyecto.upper())
            alertas_list = [parsear_alerta(a, "CRITICO", "#C0392B") for a in rojas]
            alertas_list += [parsear_alerta(a, "ALERTA", "#E67E22") for a in naranjas]
            return {"proyecto": proyecto, "alertas": alertas_list, "total": total, "criticas": len(rojas)}
        except Exception as e:
            return {"proyecto": proyecto, "alertas": [], "total": 0, "error": str(e)}
    return {"proyecto": proyecto, **data}

@app.get("/api/solar")
def get_solar(authorization: str = Header(None)):
    sesion = get_sesion_actual(authorization)
    proyectos_usuario = sesion["proyectos"]
    
    # Filtrar equipos solares según proyectos del usuario
    uts_permitidas = set()
    for p in proyectos_usuario:
        uts_permitidas.update(SOLAR_POR_PROYECTO.get(p, []))
    
    # Si tiene acceso a todo (ingenieria, ceo, oficina_central)
    if sesion["rol"] in ["ingenieria", "ceo", "oficina_central"]:
        equipos = _cache["solar"]["data"]
    else:
        equipos = [e for e in _cache["solar"]["data"] if e.get("ut") in uts_permitidas]
    
    return {"equipos": equipos, "total": len(equipos), "updated": _cache["solar"]["updated"]}

@app.get("/api/reflectores")
def get_reflectores(authorization: str = Header(None)):
    sesion = get_sesion_actual(authorization)
    # Por ahora los reflectores son solo de Puebla
    if "PUEBLA" in sesion["proyectos"] or sesion["rol"] in ["ingenieria", "ceo", "oficina_central"]:
        reflectores = _cache["reflectores"]["data"]
    else:
        reflectores = []
    return {"reflectores": reflectores, "total": len(reflectores)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
