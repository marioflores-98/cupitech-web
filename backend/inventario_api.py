"""
inventario_api.py
Módulo para consultar el inventario desde la PWA
"""
import pandas as pd
import os

BASE = r'C:\Users\Usuario\asistente-mantenimiento'
EXCEL = os.path.join(BASE, 'CupiTech_Inventario_Master.xlsx')

def get_inventario_ut(ut: str, proyecto: str = None):
    """Obtiene componentes de una UT específica"""
    try:
        df = pd.read_excel(EXCEL, sheet_name='Inventario', header=1)
        df['Codigo_UT'] = df['Codigo_UT'].astype(str).str.strip().str.upper()
        ut = ut.upper().strip()
        fila = df[df['Codigo_UT'] == ut]
        if fila.empty:
            return None, f"No hay inventario registrado para {ut}"
        
        componentes = []
        total = 0
        for _, row in fila.iterrows():
            costo = float(row.get('Costo_Total', 0) or 0)
            total += costo
            componentes.append({
                'id': str(row.get('ID_Registro', '')),
                'categoria': str(row.get('Categoria', '')),
                'componente': str(row.get('Componente', '')),
                'marca': str(row.get('Marca', '')),
                'modelo': str(row.get('Modelo', '')),
                'serie': str(row.get('Numero_Serie', '')),
                'estado': str(row.get('Estado', 'Instalado')),
                'cantidad': int(row.get('Cantidad', 1) or 1),
                'costo_unitario': float(row.get('Costo_Unitario', 0) or 0),
                'costo_total': costo,
                'tecnico': str(row.get('Tecnico', '')),
                'fecha': str(row.get('Fecha_Registro', '')),
            })
        
        en_falla = len([c for c in componentes if c['estado'] == 'Falla'])
        
        return {
            'ut': ut,
            'proyecto': str(fila.iloc[0].get('Proyecto', proyecto or '')),
            'vialidad': str(fila.iloc[0].get('Vialidad', '')),
            'componentes': componentes,
            'total_componentes': len(componentes),
            'en_falla': en_falla,
            'valor_total': total,
        }, None
    except Exception as e:
        return None, f"Error: {str(e)}"

def get_resumen_proyecto(proyecto: str):
    """Obtiene resumen general de inventario por proyecto"""
    try:
        df = pd.read_excel(EXCEL, sheet_name='Inventario', header=1)
        df['Proyecto'] = df['Proyecto'].astype(str).str.strip().str.upper()
        df_proy = df[df['Proyecto'] == proyecto.upper()]
        
        if df_proy.empty:
            return {"proyecto": proyecto, "sitios": [], "total_valor": 0, "total_componentes": 0}
        
        # Agrupar por UT
        sitios = []
        for ut, grupo in df_proy.groupby('Codigo_UT'):
            valor = float(grupo['Costo_Total'].sum())
            en_falla = len(grupo[grupo['Estado'] == 'Falla'])
            sitios.append({
                'ut': str(ut),
                'vialidad': str(grupo.iloc[0].get('Vialidad', '')),
                'componentes': len(grupo),
                'en_falla': en_falla,
                'estado': 'Falla' if en_falla > 0 else 'OK',
                'valor_total': valor,
            })
        
        sitios.sort(key=lambda x: x['valor_total'], reverse=True)
        
        # Resumen por categoría
        categorias = {}
        for _, row in df_proy.iterrows():
            cat = str(row.get('Categoria', 'Otro'))
            val = float(row.get('Costo_Total', 0) or 0)
            categorias[cat] = categorias.get(cat, 0) + val
        
        return {
            'proyecto': proyecto,
            'total_sitios': len(sitios),
            'total_componentes': len(df_proy),
            'total_valor': float(df_proy['Costo_Total'].sum()),
            'en_falla': len(df_proy[df_proy['Estado'] == 'Falla']),
            'sitios': sitios,
            'por_categoria': [{'categoria': k, 'valor': v} for k, v in sorted(categorias.items(), key=lambda x: x[1], reverse=True)],
        }
    except Exception as e:
        return {"proyecto": proyecto, "sitios": [], "total_valor": 0, "error": str(e)}

def get_movimientos(proyecto: str = None, ut: str = None, limit: int = 20):
    """Obtiene historial de movimientos"""
    try:
        df = pd.read_excel(EXCEL, sheet_name='Movimientos', header=1)
        if proyecto:
            df = df[df['Proyecto'].astype(str).str.upper() == proyecto.upper()]
        if ut:
            df = df[df['Codigo_UT'].astype(str).str.upper() == ut.upper()]
        
        df = df.tail(limit)
        movimientos = []
        for _, row in df.iterrows():
            movimientos.append({
                'id': str(row.get('ID_Movimiento', '')),
                'fecha': str(row.get('Fecha_Movimiento', '')),
                'tipo': str(row.get('Tipo_Movimiento', '')),
                'ut': str(row.get('Codigo_UT', '')),
                'componente': str(row.get('Componente', '')),
                'tecnico': str(row.get('Tecnico', '')),
                'motivo': str(row.get('Motivo', '')),
                'costo': float(row.get('Costo_Total', 0) or 0),
            })
        return movimientos
    except Exception as e:
        return []

if __name__ == "__main__":
    print("=== Prueba inventario API ===")
    resultado, error = get_inventario_ut('UT411')
    if error:
        print(f"Error: {error}")
    else:
        print(f"UT: {resultado['ut']} | Componentes: {resultado['total_componentes']} | Valor: ${resultado['valor_total']:,.2f}")
    
    resumen = get_resumen_proyecto('PUEBLA')
    print(f"Puebla: {resumen['total_sitios']} sitios | ${resumen['total_valor']:,.2f}")
