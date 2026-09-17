"""
kizeo_api.py v2
Lee los CSV de Kizeo desde OneDrive — siempre actualizados
"""
import pandas as pd
import os
from datetime import datetime

ONEDRIVE_PATH = r"C:\Users\Usuario\OneDrive - Autotraffic\MANTENIMIENTO 2026\Archivos BI 2026"

CSV_FILES = {
    "correctivo":        "reporte_correctivo.csv",
    "correctivo_enlace": "reporte_correctivo_enlace.csv",
    "diagnostico":       "reporte_diagnostico.csv",
    "diagnostico_enlace":"reporte_diagnostico_enlace.csv",
    "preventivo":        "reporte_preventivo.csv",
}

TIPO_LABEL = {
    "correctivo":        "🔧 Correctivo",
    "preventivo":        "🔵 Preventivo",
    "diagnostico":       "🔍 Diagnóstico",
    "correctivo_enlace": "🔧 Correctivo Enlace",
    "diagnostico_enlace":"🔍 Diagnóstico Enlace",
}

PROYECTO_ID_MAP = {
    "Puebla":    "PUEBLA",
    "Querétaro": "QRO",
    "Mexibús":   "EDOMEX",
    "Trolebús":  "EDOMEX",
    "León":      "LEON",
    "Tlaxcala":  "TLAXCALA",
    "San Andrés Cholula": "SAN_ANDRES",
}

def leer_csv(tipo: str) -> pd.DataFrame:
    """Lee el CSV de Kizeo desde OneDrive"""
    archivo = CSV_FILES.get(tipo)
    if not archivo:
        return pd.DataFrame()
    ruta = os.path.join(ONEDRIVE_PATH, archivo)
    if not os.path.exists(ruta):
        print(f"⚠️ No encontrado: {ruta}")
        return pd.DataFrame()
    try:
        df = pd.read_csv(ruta, encoding='utf-8-sig', low_memory=False)
        return df
    except Exception as e:
        print(f"Error leyendo CSV {archivo}: {e}")
        return pd.DataFrame()

def get_reportes_resumidos(tipo: str = "correctivo", limit: int = 50):
    """Obtiene reportes resumidos desde CSV de OneDrive"""
    df = leer_csv(tipo)
    if df.empty:
        return []
    
    # Ordenar por fecha descendente
    if 'create_time' in df.columns:
        df = df.sort_values('create_time', ascending=False)
    
    df = df.head(500)
    reportes = []
    
    for _, row in df.iterrows():
        def val(col):
            v = row.get(col, "")
            return str(v).strip() if pd.notna(v) and str(v) != 'nan' else ""
        
        proyecto = val("proyecto")
        proyecto_id = PROYECTO_ID_MAP.get(proyecto, "")
        
        # Calcular tiempo de resolución
        tiempo_min = None
        try:
            inicio = val("inicio_de_diagnostico") or val("date_et_heure")
            fin = val("fecha_y_hora_de_finalizacion_") or val("fecha_y_hora_de_finalizacion")
            if inicio and fin:
                fmt = "%Y-%m-%d %H:%M"
                ini = datetime.strptime(inicio[:16], fmt)
                fn = datetime.strptime(fin[:16], fmt)
                tiempo_min = int((fn - ini).total_seconds() / 60)
        except:
            pass
        
        # Técnico
        tecnico = val("responsable") or val("nombre_del_supervisor_respons") or val("user_name")
        if "(" in tecnico:
            tecnico = tecnico.split("(")[0].strip()
        
        reportes.append({
            "id": str(row.get("id", "")),
            "numero": str(row.get("record_number", row.name + 1)),
            "tipo": tipo,
            "tipo_label": TIPO_LABEL.get(tipo, tipo),
            "ut": val("base_datos_clientes_"),
            "proyecto": proyecto,
            "proyecto_id": proyecto_id,
            "fecha": val("date_et_heure")[:10] if val("date_et_heure") else val("create_time")[:10],
            "fecha_creacion": str(row.get("create_time", ""))[:10],
            "vialidad": val("vialidad"),
            "tecnico": tecnico.split()[0] if tecnico else "--",
            "tecnico_completo": tecnico,
            "falla": val("accion_requerida") or val("actividad_requerida") or "--",
            "componente": val("componente_o_material") or "--",
            "cantidad": val("cantidad") or "--",
            "inicio": val("inicio_de_diagnostico"),
            "fin": val("fecha_y_hora_de_finalizacion_") or val("fecha_y_hora_de_finalizacion"),
            "tiempo_resolucion_min": tiempo_min,
            "estado": "Terminado",
            "observaciones": val("observaciones") or val("otra") or "--",
        })
    
    return reportes

def get_reporte_detalle(tipo: str, reporte_id: str):
    """Obtiene detalle completo de un reporte por ID"""
    df = leer_csv(tipo)
    if df.empty:
        return None
    
    fila = df[df['id'].astype(str) == str(reporte_id)]
    if fila.empty:
        return None
    
    row = fila.iloc[0]
    reportes = get_reportes_resumidos(tipo, 1000)
    for r in reportes:
        if r["id"] == str(reporte_id):
            return r
    return None

def get_estadisticas_tecnico(tipo: str = "correctivo", proyectos_filtro=None):
    """Calcula ranking de técnicos filtrado por proyectos si aplica"""
    df = leer_csv(tipo)
    if df.empty:
        return []
    
    # Filtrar por proyecto si el usuario no es admin
    if proyectos_filtro:
        proyecto_nombres = {
            "PUEBLA": "Puebla", "QRO": "Querétaro",
            "EDOMEX": ["Mexibús", "Trolebús"],
            "TLAXCALA": "Tlaxcala", "LEON": "León",
            "SAN_ANDRES": "San Andrés Cholula",
        }
        nombres_permitidos = []
        for p in proyectos_filtro:
            n = proyecto_nombres.get(p, "")
            if isinstance(n, list):
                nombres_permitidos.extend(n)
            elif n:
                nombres_permitidos.append(n)
        if nombres_permitidos and 'proyecto' in df.columns:
            df = df[df['proyecto'].isin(nombres_permitidos)]
    """Calcula ranking de técnicos"""
    df = leer_csv(tipo)
    if df.empty:
        return []
    
    stats = {}
    for _, row in df.iterrows():
        tecnico = str(row.get("responsable", row.get("nombre_del_supervisor_respons", "Desconocido")) or "")
        if "(" in tecnico:
            tecnico = tecnico.split("(")[0].strip()
        if not tecnico or tecnico == "nan":
            continue
        
        if tecnico not in stats:
            stats[tecnico] = {"tecnico": tecnico, "total_reportes": 0, "tiempos": []}
        
        stats[tecnico]["total_reportes"] += 1
        
        try:
            inicio = str(row.get("inicio_de_diagnostico", ""))
            fin = str(row.get("fecha_y_hora_de_finalizacion_", row.get("fecha_y_hora_de_finalizacion", "")))
            if inicio and fin and inicio != "nan" and fin != "nan":
                ini = datetime.strptime(inicio[:16], "%Y-%m-%d %H:%M")
                fn = datetime.strptime(fin[:16], "%Y-%m-%d %H:%M")
                mins = int((fn - ini).total_seconds() / 60)
                if mins > 0:
                    stats[tecnico]["tiempos"].append(mins)
        except:
            pass
    
    resultado = []
    for t, s in stats.items():
        avg = int(sum(s["tiempos"]) / len(s["tiempos"])) if s["tiempos"] else None
        resultado.append({
            "tecnico": t,
            "total_reportes": s["total_reportes"],
            "tiempo_promedio_min": avg,
        })
    
    return sorted(resultado, key=lambda x: x["total_reportes"], reverse=True)

if __name__ == "__main__":
    print("=== Prueba Kizeo CSV ===")
    for tipo in ["correctivo", "preventivo", "diagnostico"]:
        r = get_reportes_resumidos(tipo, 3)
        print(f"\n{tipo}: {len(r)} reportes")
        for rep in r:
            print(f"  {rep['ut']} | {rep['proyecto']} | {rep['tecnico']} | {rep['falla'][:40]}")
