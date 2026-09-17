# Fix kizeo_api.py - agregar fecha_creacion y aumentar limit
with open(r'C:\Users\Usuario\cupitech-web\backend\kizeo_api.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Aumentar limit a 500
content = content.replace(
    'df = df.head(limit)',
    'df = df.head(500)'
)

# 2. Agregar fecha_creacion
content = content.replace(
    '"fecha": val("date_et_heure")[:10] if val("date_et_heure") else val("create_time")[:10],',
    '"fecha": val("date_et_heure")[:10] if val("date_et_heure") else val("create_time")[:10],\n            "fecha_creacion": str(row.get("create_time", ""))[:10],'
)

with open(r'C:\Users\Usuario\cupitech-web\backend\kizeo_api.py', 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ kizeo_api.py actualizado")

# Fix App.jsx - actualizar filtro de mes y limit
with open(r'C:\Users\Usuario\cupitech-web\frontend\src\App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Actualizar limit en fetch
content = content.replace(
    'api/kizeo/${tipo}?limit=30',
    'api/kizeo/${tipo}?limit=500'
)
content = content.replace(
    'api/kizeo/${tipo}?limit=200',
    'api/kizeo/${tipo}?limit=500'
)

# Actualizar filtro de mes
content = content.replace(
    '.filter(r => mesFiltro === "todos" || (r.fecha && r.fecha.startsWith(mesFiltro)));',
    '.filter(r => mesFiltro === "todos" || (r.fecha_creacion && r.fecha_creacion.startsWith(mesFiltro)));'
)

with open(r'C:\Users\Usuario\cupitech-web\frontend\src\App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ App.jsx actualizado")
