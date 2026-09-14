"""
accesos_api.py
Módulo para consultar accesos remotos desde los Masters de interconexiones
"""
import pandas as pd
import os

BASE = r'C:\Users\Usuario\asistente-mantenimiento'

MASTERS = {
    "PUEBLA": {
        "archivo": os.path.join(BASE, "Puebla_Interconexiones_Master_v3.xlsx"),
        "hoja": "Búsqueda por UT",
        "header": 1,
        "col_ut": "Código de Ubicación",
    },
    "QRO": {
        "archivo": os.path.join(BASE, "Queretaro", "Queretaro_Interconexiones_Master_v1.xlsx"),
        "hoja": "Interconexiones",
        "header": 1,
        "col_ut": "Código UT",
    },
}

CAMPOS = [
    "Enlace directo (con puerto)",
    "Puerto WAN",
    "IP Cámara",
    "Módem SSID",
    "Contraseña WiFi",
    "Teléfono línea",
    "MAC Cámara",
    "TeamViewer ID",
    "TeamViewer Pass",
    "Red Telcel (4G)",
    "Contraseña 4G",
    "S/N Módem",
    "IMEI",
    "Vialidad",
    "Tipo",
    "Grupo DynDNS",
]

def buscar_acceso(ut: str, proyecto: str = "PUEBLA"):
    """Busca los datos de acceso de una UT en el Master correspondiente"""
    master = MASTERS.get(proyecto.upper())
    if not master:
        return None, f"Proyecto '{proyecto}' no encontrado"
    
    try:
        df = pd.read_excel(master["archivo"], sheet_name=master["hoja"], header=master["header"])
        df.columns = [str(c).strip() for c in df.columns]
        
        col_ut = master["col_ut"]
        df[col_ut] = df[col_ut].astype(str).str.strip().str.upper()
        
        ut = ut.upper().strip()
        fila = df[df[col_ut] == ut]
        
        if fila.empty:
            # Buscar parcial
            fila = df[df[col_ut].str.contains(ut, na=False)]
        
        if fila.empty:
            return None, f"UT '{ut}' no encontrada en {proyecto}"
        
        row = fila.iloc[0]
        resultado = {"ut": str(row.get(col_ut, ut)), "proyecto": proyecto, "campos": {}}
        
        for campo in CAMPOS:
            if campo in df.columns:
                val = str(row.get(campo, "")).strip()
                if val and val != "nan":
                    resultado["campos"][campo] = val
        
        return resultado, None
    except Exception as e:
        return None, f"Error: {str(e)}"

def listar_uts(proyecto: str = "PUEBLA"):
    """Lista todas las UTs disponibles en un proyecto"""
    master = MASTERS.get(proyecto.upper())
    if not master:
        return []
    try:
        df = pd.read_excel(master["archivo"], sheet_name=master["hoja"], header=master["header"])
        col_ut = master["col_ut"]
        uts = df[col_ut].dropna().astype(str).str.strip().str.upper().tolist()
        return [ut for ut in uts if ut and ut != "NAN"]
    except:
        return []

if __name__ == "__main__":
    print("=== Prueba accesos ===")
    resultado, error = buscar_acceso("UT411", "PUEBLA")
    if error:
        print(f"Error: {error}")
    else:
        print(f"UT: {resultado['ut']}")
        for k, v in resultado['campos'].items():
            print(f"  {k}: {v}")
