"""
CupiTech Web — Backend API v5
Con autenticación, sesiones y filtro por proyecto
"""
from fastapi import FastAPI, HTTPException, Header
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import pathlib
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import sys
import threading
import time

from dotenv import load_dotenv
load_dotenv()
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
        "ut": cam.get("location", cam.get("camera_id", "Desconocida")),
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


# ── Mapas ─────────────────────────────────────────────────
MAPAS_DIR = pathlib.Path(__file__).parent / "mapas"

MAPAS_CONFIG = {
    "PUEBLA": {
        "camaras": "mapa_puebla.html",
        "red": "mapa_red_puebla.html",
    },
    "QRO": {
        "camaras": "mapa_queretaro.html",
        "red": "mapa_red_queretaro.html" if (MAPAS_DIR / "mapa_red_queretaro.html").exists() else "mapa_queretaro.html",
    },
    "EDOMEX": {
        "camaras": "mapa_mexibus.html",
        "red": "mapa_trolebus.html",
    },
    "TLAXCALA": {
        "camaras": "mapa_tlaxcala.html",
        "red": "mapa_tlaxcala.html",
    },
    "SAN_ANDRES": {
        "camaras": "mapa_sanandres.html",
        "red": "mapa_sanandres.html",
    },
    "LEON": {
        "camaras": "mapa_leon.html",
        "red": "mapa_leon.html",
    },
}

@app.get("/api/mapas")
def get_mapas_disponibles(authorization: str = Header(None)):
    sesion = get_sesion_actual(authorization)
    disponibles = {}
    for proyecto in sesion["proyectos"]:
        if proyecto in MAPAS_CONFIG:
            disponibles[proyecto] = list(MAPAS_CONFIG[proyecto].keys())
    return {"mapas": disponibles}

@app.get("/mapas/{proyecto}/{tipo}")
def get_mapa(proyecto: str, tipo: str):
    config = MAPAS_CONFIG.get(proyecto.upper(), {})
    archivo = config.get(tipo.lower())
    if not archivo:
        raise HTTPException(status_code=404, detail="Mapa no encontrado")
    ruta = MAPAS_DIR / archivo
    if not ruta.exists():
        raise HTTPException(status_code=404, detail=f"Archivo {archivo} no encontrado")
    return FileResponse(ruta, media_type="text/html")
@app.get("/api/accesos/{proyecto}/{ut}")
def get_acceso(proyecto: str, ut: str, authorization: str = Header(None)):
    sesion = get_sesion_actual(authorization)
    if proyecto.upper() not in sesion["proyectos"]:
        raise HTTPException(status_code=403, detail="Sin acceso")
    from accesos_api import buscar_acceso
    resultado, error = buscar_acceso(ut, proyecto.upper())
    if error:
        raise HTTPException(status_code=404, detail=error)
    return resultado

@app.get("/api/accesos/{proyecto}")
def get_uts(proyecto: str, authorization: str = Header(None)):
    sesion = get_sesion_actual(authorization)
    if proyecto.upper() not in sesion["proyectos"]:
        raise HTTPException(status_code=403, detail="Sin acceso")
    from accesos_api import listar_uts
    return {"uts": listar_uts(proyecto.upper()), "proyecto": proyecto}

@app.get("/api/inventario/{proyecto}")
def get_inventario_proyecto(proyecto: str, authorization: str = Header(None)):
    sesion = get_sesion_actual(authorization)
    if proyecto.upper() not in sesion["proyectos"]:
        raise HTTPException(status_code=403, detail="Sin acceso")
    from inventario_api import get_resumen_proyecto, get_movimientos
    resumen = get_resumen_proyecto(proyecto.upper())
    resumen["movimientos"] = get_movimientos(proyecto.upper())
    return resumen

@app.get("/api/inventario/{proyecto}/{ut}")
def get_inventario_ut_endpoint(proyecto: str, ut: str, authorization: str = Header(None)):
    sesion = get_sesion_actual(authorization)
    if proyecto.upper() not in sesion["proyectos"]:
        raise HTTPException(status_code=403, detail="Sin acceso")
    from inventario_api import get_inventario_ut, get_movimientos
    resultado, error = get_inventario_ut(ut, proyecto.upper())
    if error:
        raise HTTPException(status_code=404, detail=error)
    resultado["movimientos"] = get_movimientos(ut=ut)
    return resultado

# ── Chat con CupiTech ─────────────────────────────────────
from database import (init_db, crear_conversacion, get_conversaciones,
                      get_mensajes, agregar_mensaje, actualizar_titulo_conversacion,
                      eliminar_conversacion)
import anthropic as _anthropic
import glob, openpyxl, chromadb
from chromadb.utils import embedding_functions

init_db()
_claude = _anthropic.Anthropic()

# Cargar RAG de ChromaDB
_CHROMA_PATH = r"C:\Users\Usuario\asistente-mantenimiento\chroma_db"
_OBSIDIAN_PATH = r"C:\Users\Usuario\asistente-mantenimiento\CupiTech"
_EXCEL_UBICACIONES = r"C:\Users\Usuario\asistente-mantenimiento\UTs_PROYECTOS_Procesado.xlsx"

def _init_rag_chat():
    try:
        client = chromadb.PersistentClient(path=_CHROMA_PATH)
        efn = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name="paraphrase-multilingual-MiniLM-L12-v2",
            local_files_only=True
        )
        col = client.get_collection(name="cupitech_conocimiento", embedding_function=efn)
        print(f"✅ RAG Chat: {col.count()} fragmentos")
        return col
    except Exception as e:
        print(f"⚠️ RAG Chat no disponible: {e}")
        return None

def _buscar_rag_chat(collection, query, n=5):
    try:
        r = collection.query(query_texts=[query], n_results=min(n, collection.count()))
        return "\n\n---\n\n".join(
            f"[{m['fuente']}]\n{d}"
            for d, m in zip(r["documents"][0], r["metadatas"][0])
        )
    except:
        return None

def _cargar_conocimiento_chat():
    docs = []
    for archivo in glob.glob(_OBSIDIAN_PATH + "/**/*.md", recursive=True):
        try:
            with open(archivo, "r", encoding="utf-8") as f:
                docs.append(f.read()[:2000])
        except: pass
    try:
        wb = openpyxl.load_workbook(_EXCEL_UBICACIONES, read_only=True)
        txt = ""
        for sh in wb.sheetnames:
            ws = wb[sh]
            for i, row in enumerate(ws.iter_rows(values_only=True)):
                if i > 100: break
                txt += " | ".join(str(v) if v else "" for v in row) + "\n"
        docs.append(txt)
    except: pass
    return "\n\n".join(docs[:30])

_RAG_CHAT = _init_rag_chat()
_CONOCIMIENTO_BASE = _cargar_conocimiento_chat()

SYSTEM_CHAT = f"""Eres CupiTech, el asistente de mantenimiento de Autotraffic.

Tu función es ayudar a técnicos de campo, Jefes de Proyecto y personal de Oficina Central a:
- Diagnosticar fallas en cámaras ANPR (Vidar Speed, Viion, Hikvision)
- Resolver problemas de comunicación, energía eléctrica e iluminación
- Consultar procedimientos paso a paso
- Saber cuándo escalar un problema y a quién
- Consultar información de equipos solares y componentes
- Consultar la ubicación exacta de cualquier UT
- Consultar accesos remotos de cámaras

REGLAS:
1. Responde siempre en español, de forma clara y práctica
2. Para técnicos en campo: instrucciones paso a paso, simples y directas
3. Para Jefes de Proyecto: sin tecnicismos, diles qué acción tomar
4. Si la falla requiere escalar, dilo claramente
5. Nunca inventes procedimientos — usa solo el conocimiento documentado
6. Si preguntan por acceso a una UT, consulta los datos disponibles
7. Respuestas concisas — máximo 3-4 pasos por mensaje

BASE DE CONOCIMIENTO:
{_CONOCIMIENTO_BASE}
"""

class ChatMsg(BaseModel):
    conversacion_id: int
    mensaje: str

class NuevaConversacion(BaseModel):
    titulo: str = "Nueva conversación"

@app.get("/api/chat/conversaciones")
def listar_conversaciones(authorization: str = Header(None)):
    sesion = get_sesion_actual(authorization)
    return {"conversaciones": get_conversaciones(sesion["correo"])}

@app.post("/api/chat/conversaciones")
def nueva_conversacion(body: NuevaConversacion, authorization: str = Header(None)):
    sesion = get_sesion_actual(authorization)
    id_ = crear_conversacion(sesion["correo"], body.titulo)
    return {"id": id_}

@app.delete("/api/chat/conversaciones/{conv_id}")
def borrar_conversacion(conv_id: int, authorization: str = Header(None)):
    sesion = get_sesion_actual(authorization)
    eliminar_conversacion(conv_id, sesion["correo"])
    return {"ok": True}

@app.get("/api/chat/{conv_id}/mensajes")
def listar_mensajes(conv_id: int, authorization: str = Header(None)):
    sesion = get_sesion_actual(authorization)
    msgs = get_mensajes(conv_id, sesion["correo"])
    if msgs is None:
        raise HTTPException(status_code=403, detail="Sin acceso")
    return {"mensajes": msgs}

@app.post("/api/chat/{conv_id}/mensajes")
def enviar_mensaje(conv_id: int, body: ChatMsg, authorization: str = Header(None)):
    sesion = get_sesion_actual(authorization)
    msgs = get_mensajes(conv_id, sesion["correo"])
    if msgs is None:
        raise HTTPException(status_code=403, detail="Sin acceso")
    agregar_mensaje(conv_id, "user", body.mensaje)
    historial = [{"role": m["rol"], "content": m["contenido"]} for m in msgs]
    historial.append({"role": "user", "content": body.mensaje})
    try:
        system_final = SYSTEM_CHAT
        if _RAG_CHAT:
            contexto = _buscar_rag_chat(_RAG_CHAT, body.mensaje)
            if contexto:
                system_final = SYSTEM_CHAT + f"\n\nCONTEXTO RELEVANTE:\n{contexto}"
        resp = _claude.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1000,
            system=system_final,
            messages=historial
        )
        respuesta = resp.content[0].text
    except Exception as e:
        respuesta = f"⚠️ Error al conectar con CupiTech: {str(e)}"
    agregar_mensaje(conv_id, "assistant", respuesta)
    if len(msgs) == 0:
        titulo = body.mensaje[:50] + ("..." if len(body.mensaje) > 50 else "")
        actualizar_titulo_conversacion(conv_id, titulo)
    return {"respuesta": respuesta}
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
