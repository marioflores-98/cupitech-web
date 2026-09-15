"""
database.py
Base de datos SQLite para CupiTech Web
Tablas: chat_historiales, incidencias, inventario_movimientos
"""
import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'cupitech.db')

def get_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Crea las tablas si no existen"""
    conn = get_conn()
    c = conn.cursor()

    # ── Chat historiales ──────────────────────────────────
    c.execute('''CREATE TABLE IF NOT EXISTS chat_conversaciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_correo TEXT NOT NULL,
        titulo TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS chat_mensajes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversacion_id INTEGER NOT NULL,
        rol TEXT NOT NULL,
        contenido TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (conversacion_id) REFERENCES chat_conversaciones(id)
    )''')

    # ── Incidencias ───────────────────────────────────────
    c.execute('''CREATE TABLE IF NOT EXISTS incidencias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        proyecto TEXT NOT NULL,
        ut TEXT NOT NULL,
        tipo TEXT NOT NULL,
        descripcion TEXT,
        estado TEXT DEFAULT 'Abierta',
        prioridad TEXT DEFAULT 'Media',
        tecnico_asignado TEXT,
        abierta_por TEXT NOT NULL,
        fecha_apertura TEXT DEFAULT (datetime('now')),
        fecha_cierre TEXT,
        tiempo_resolucion_min INTEGER,
        notas TEXT
    )''')

    # ── Inventario ────────────────────────────────────────
    c.execute('''CREATE TABLE IF NOT EXISTS inventario_movimientos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        proyecto TEXT NOT NULL,
        ut TEXT NOT NULL,
        tipo_movimiento TEXT NOT NULL,
        componente TEXT NOT NULL,
        marca TEXT,
        modelo TEXT,
        serie TEXT,
        estado TEXT,
        cantidad INTEGER DEFAULT 1,
        costo_unitario REAL DEFAULT 0,
        costo_total REAL DEFAULT 0,
        tecnico TEXT NOT NULL,
        motivo TEXT,
        fecha_movimiento TEXT DEFAULT (datetime('now')),
        notas TEXT
    )''')

    conn.commit()
    conn.close()
    print("✅ Base de datos SQLite inicializada")

# ── Chat functions ────────────────────────────────────────
def crear_conversacion(correo: str, titulo: str = None):
    conn = get_conn()
    c = conn.cursor()
    titulo = titulo or f"Conversación {datetime.now().strftime('%d/%m/%Y %H:%M')}"
    c.execute("INSERT INTO chat_conversaciones (usuario_correo, titulo) VALUES (?, ?)", (correo, titulo))
    id_ = c.lastrowid
    conn.commit()
    conn.close()
    return id_

def get_conversaciones(correo: str):
    conn = get_conn()
    c = conn.cursor()
    rows = c.execute("""
        SELECT cc.*, COUNT(cm.id) as total_mensajes,
               MAX(cm.created_at) as ultimo_mensaje
        FROM chat_conversaciones cc
        LEFT JOIN chat_mensajes cm ON cc.id = cm.conversacion_id
        WHERE cc.usuario_correo = ?
        GROUP BY cc.id
        ORDER BY cc.updated_at DESC
        LIMIT 20
    """, (correo,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_mensajes(conversacion_id: int, correo: str):
    conn = get_conn()
    c = conn.cursor()
    conv = c.execute("SELECT * FROM chat_conversaciones WHERE id = ? AND usuario_correo = ?",
                     (conversacion_id, correo)).fetchone()
    if not conv:
        conn.close()
        return None
    msgs = c.execute("SELECT * FROM chat_mensajes WHERE conversacion_id = ? ORDER BY created_at",
                     (conversacion_id,)).fetchall()
    conn.close()
    return [dict(m) for m in msgs]

def agregar_mensaje(conversacion_id: int, rol: str, contenido: str):
    conn = get_conn()
    c = conn.cursor()
    c.execute("INSERT INTO chat_mensajes (conversacion_id, rol, contenido) VALUES (?, ?, ?)",
              (conversacion_id, rol, contenido))
    c.execute("UPDATE chat_conversaciones SET updated_at = datetime('now') WHERE id = ?",
              (conversacion_id,))
    conn.commit()
    conn.close()

def actualizar_titulo_conversacion(conversacion_id: int, titulo: str):
    conn = get_conn()
    c = conn.cursor()
    c.execute("UPDATE chat_conversaciones SET titulo = ? WHERE id = ?", (titulo, conversacion_id))
    conn.commit()
    conn.close()

def eliminar_conversacion(conversacion_id: int, correo: str):
    conn = get_conn()
    c = conn.cursor()
    c.execute("DELETE FROM chat_mensajes WHERE conversacion_id = ?", (conversacion_id,))
    c.execute("DELETE FROM chat_conversaciones WHERE id = ? AND usuario_correo = ?",
              (conversacion_id, correo))
    conn.commit()
    conn.close()

# ── Incidencias functions ─────────────────────────────────
def crear_incidencia(proyecto, ut, tipo, descripcion, prioridad, tecnico_asignado, abierta_por):
    conn = get_conn()
    c = conn.cursor()
    c.execute("""INSERT INTO incidencias 
        (proyecto, ut, tipo, descripcion, prioridad, tecnico_asignado, abierta_por)
        VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (proyecto, ut, tipo, descripcion, prioridad, tecnico_asignado, abierta_por))
    id_ = c.lastrowid
    conn.commit()
    conn.close()
    return id_

def get_incidencias(proyecto: str = None, estado: str = None):
    conn = get_conn()
    c = conn.cursor()
    query = "SELECT * FROM incidencias WHERE 1=1"
    params = []
    if proyecto:
        query += " AND proyecto = ?"
        params.append(proyecto)
    if estado:
        query += " AND estado = ?"
        params.append(estado)
    query += " ORDER BY fecha_apertura DESC"
    rows = c.execute(query, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def cerrar_incidencia(id_: int, notas: str, tecnico: str):
    conn = get_conn()
    c = conn.cursor()
    inc = c.execute("SELECT * FROM incidencias WHERE id = ?", (id_,)).fetchone()
    if inc:
        apertura = datetime.fromisoformat(inc['fecha_apertura'])
        ahora = datetime.now()
        minutos = int((ahora - apertura).total_seconds() / 60)
        c.execute("""UPDATE incidencias SET estado='Cerrada', fecha_cierre=datetime('now'),
                     tiempo_resolucion_min=?, notas=? WHERE id=?""",
                  (minutos, notas, id_))
        conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Base de datos lista en:", DB_PATH)
