with open(r'C:\Users\Usuario\cupitech-web\backend\main.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Reemplazar el sistema de chat para usar RAG
viejo = '''# ── Chat con CupiTech ─────────────────────────────────────
from database import (init_db, crear_conversacion, get_conversaciones,
                      get_mensajes, agregar_mensaje, actualizar_titulo_conversacion,
                      eliminar_conversacion)
import anthropic as _anthropic

init_db()
_claude = _anthropic.Anthropic()

SYSTEM_CHAT = """Eres CupiTech, el asistente técnico de mantenimiento de Autotraffic.
Ayudas con diagnóstico de fallas en cámaras ANPR, cinemómetros y equipos de control de tráfico.
También apoyas con procedimientos técnicos, accesos remotos, inventario de equipos,
sistemas solares y reflectores en autopistas y carreteras de México.
Responde en español, de forma clara y práctica. Para técnicos da instrucciones paso a paso.
Si no tienes información específica, dilo claramente y sugiere escalar con el ingeniero."""'''

nuevo = '''# ── Chat con CupiTech ─────────────────────────────────────
from database import (init_db, crear_conversacion, get_conversaciones,
                      get_mensajes, agregar_mensaje, actualizar_titulo_conversacion,
                      eliminar_conversacion)
import anthropic as _anthropic
import glob, openpyxl, chromadb
from chromadb.utils import embedding_functions

init_db()
_claude = _anthropic.Anthropic()

# Cargar RAG de ChromaDB
_CHROMA_PATH = r"C:\\Users\\Usuario\\asistente-mantenimiento\\chroma_db"
_OBSIDIAN_PATH = r"C:\\Users\\Usuario\\asistente-mantenimiento\\CupiTech"
_EXCEL_UBICACIONES = r"C:\\Users\\Usuario\\asistente-mantenimiento\\UTs_PROYECTOS_Procesado.xlsx"

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
        return "\\n\\n---\\n\\n".join(
            f"[{m['fuente']}]\\n{d}"
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
                txt += " | ".join(str(v) if v else "" for v in row) + "\\n"
        docs.append(txt)
    except: pass
    return "\\n\\n".join(docs[:30])

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
"""'''

if viejo in content:
    content = content.replace(viejo, nuevo)
    print("✅ SYSTEM_CHAT actualizado con RAG")
else:
    print("❌ No encontrado — buscar manualmente")

# Actualizar el endpoint de enviar mensaje para usar RAG
viejo2 = '''    try:
        resp = _claude.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1000,
            system=SYSTEM_CHAT,
            messages=historial
        )
        respuesta = resp.content[0].text
    except Exception as e:
        respuesta = f"⚠️ Error al conectar con CupiTech: {str(e)}"'''

nuevo2 = '''    try:
        system_final = SYSTEM_CHAT
        if _RAG_CHAT:
            contexto = _buscar_rag_chat(_RAG_CHAT, body.mensaje)
            if contexto:
                system_final = SYSTEM_CHAT + f"\\n\\nCONTEXTO RELEVANTE:\\n{contexto}"
        resp = _claude.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1000,
            system=system_final,
            messages=historial
        )
        respuesta = resp.content[0].text
    except Exception as e:
        respuesta = f"⚠️ Error al conectar con CupiTech: {str(e)}"'''

if viejo2 in content:
    content = content.replace(viejo2, nuevo2)
    print("✅ Endpoint actualizado con RAG dinámico")
else:
    print("❌ Endpoint no encontrado")

with open(r'C:\Users\Usuario\cupitech-web\backend\main.py', 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ main.py actualizado")
