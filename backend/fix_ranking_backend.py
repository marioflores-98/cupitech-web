with open(r'C:\Users\Usuario\cupitech-web\backend\main.py', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '''@app.get("/api/kizeo-stats")
def get_kizeo_stats(authorization: str = Header(None)):
    sesion = get_sesion_actual(authorization)
    from kizeo_api import get_estadisticas_tecnico
    return {"estadisticas": get_estadisticas_tecnico("correctivo", 200)}''',
    '''@app.get("/api/kizeo-stats")
def get_kizeo_stats(tipo: str = "correctivo", authorization: str = Header(None)):
    sesion = get_sesion_actual(authorization)
    from kizeo_api import get_estadisticas_tecnico
    return {"estadisticas": get_estadisticas_tecnico(tipo)}'''
)

with open(r'C:\Users\Usuario\cupitech-web\backend\main.py', 'w', encoding='utf-8') as f:
    f.write(content)
print("OK")
