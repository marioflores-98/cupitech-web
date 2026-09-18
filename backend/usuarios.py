"""
CupiTech Web — Gestión de usuarios y autenticación
"""
import hashlib
import secrets
from datetime import datetime, timedelta

# ── Base de usuarios ──────────────────────────────────────
USUARIOS = {
    "mario.flores@autotraffic.com.mx": {
        "nombre": "Mario Flores Bernabe",
        "rol": "ingenieria",
        "proyectos": ["PUEBLA", "QRO", "EDOMEX", "LEON", "TLAXCALA", "SAN_ANDRES"],
        "password_hash": hashlib.sha256("Cupitech2026!".encode()).hexdigest(),
    },
    "diego.torres@autotraffic.com.mx": {
        "nombre": "Diego Torres",
        "rol": "ceo",
        "proyectos": ["PUEBLA", "QRO", "EDOMEX", "LEON", "TLAXCALA", "SAN_ANDRES"],
        "password_hash": hashlib.sha256("Cupitech2026!".encode()).hexdigest(),
    },
    "jorge.aguilar@autotraffic.com.mx": {
        "nombre": "Jorge Aguilar",
        "rol": "oficina_central",
        "proyectos": ["PUEBLA", "QRO", "EDOMEX", "LEON", "TLAXCALA", "SAN_ANDRES"],
        "password_hash": hashlib.sha256("Cupitech2026!".encode()).hexdigest(),
    },
    "tania.castillo@autotraffic.com.mx": {
        "nombre": "Tania Castillo",
        "rol": "oficina_central",
        "proyectos": ["PUEBLA", "QRO", "EDOMEX", "LEON", "TLAXCALA", "SAN_ANDRES"],
        "password_hash": hashlib.sha256("Cupitech2026!".encode()).hexdigest(),
    },
    "gustavo.torres@autotraffic.com.mx": {
        "nombre": "Gustavo Torres",
        "rol": "jp",
        "proyectos": ["PUEBLA"],
        "password_hash": hashlib.sha256("Cupitech2026!".encode()).hexdigest(),
    },
    "jonathan.valentin@autotraffic.com.mx": {
        "nombre": "Jonathan Valentin",
        "rol": "tecnico",
        "proyectos": ["PUEBLA"],
        "password_hash": hashlib.sha256("Cupitech2026!".encode()).hexdigest(),
    },
    "armando.garcia@autotraffic.com.mx": {
        "nombre": "Armando Garcia",
        "rol": "tecnico",
        "proyectos": ["PUEBLA"],
        "password_hash": hashlib.sha256("Cupitech2026!".encode()).hexdigest(),
    },
    "joseph.enciso@autotraffic.com.mx": {
        "nombre": "Joseph Enciso Mercado",
        "rol": "jp",
        "proyectos": ["QRO"],
        "password_hash": hashlib.sha256("Cupitech2026!".encode()).hexdigest(),
    },
    "juan.olalde@autotraffic.com.mx": {
        "nombre": "Juan Olalde",
        "rol": "tecnico",
        "proyectos": ["QRO"],
        "password_hash": hashlib.sha256("Cupitech2026!".encode()).hexdigest(),
    },
    "uriel.varela@autotraffic.com.mx": {
        "nombre": "Uriel Varela",
        "rol": "tecnico",
        "proyectos": ["QRO"],
        "password_hash": hashlib.sha256("Cupitech2026!".encode()).hexdigest(),
    },
    "hector.rugerio@autotraffic.onmicrosoft.com": {
        "nombre": "Hector Rugerio",
        "rol": "proveedor",
        "proyectos": ["PUEBLA", "TLAXCALA", "SAN_ANDRES"],
        "password_hash": hashlib.sha256("Cupitech2026!".encode()).hexdigest(),
    },
}

# ── Sesiones en memoria ───────────────────────────────────
_sesiones = {}

def login(correo: str, password: str):
    """Valida credenciales y retorna token de sesión"""
    correo = correo.lower().strip()
    usuario = USUARIOS.get(correo)
    if not usuario:
        return None, "Usuario no encontrado"
    
    pwd_hash = hashlib.sha256(password.encode()).hexdigest()
    if pwd_hash != usuario["password_hash"]:
        return None, "Contraseña incorrecta"
    
    # Generar token de sesión
    token = secrets.token_hex(32)
    _sesiones[token] = {
        "correo": correo,
        "nombre": usuario["nombre"],
        "rol": usuario["rol"],
        "proyectos": usuario["proyectos"],
        "created": datetime.now(),
        "expires": datetime.now() + timedelta(hours=24),
    }
    return token, None

def get_sesion(token: str):
    """Obtiene datos de sesión por token"""
    sesion = _sesiones.get(token)
    if not sesion:
        return None
    if datetime.now() > sesion["expires"]:
        del _sesiones[token]
        return None
    return sesion

def logout(token: str):
    """Cierra sesión"""
    if token in _sesiones:
        del _sesiones[token]
    return True

if __name__ == "__main__":
    print("=== Prueba de login ===")
    token, error = login("mario.flores@autotraffic.com.mx", "Cupitech2026!")
    if token:
        sesion = get_sesion(token)
        print(f"✅ Login exitoso")
        print(f"   Usuario: {sesion['nombre']}")
        print(f"   Rol: {sesion['rol']}")
        print(f"   Proyectos: {sesion['proyectos']}")
    else:
        print(f"❌ Error: {error}")
