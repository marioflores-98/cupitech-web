# Fix completo para reportes con filtro de mes
import re

# 1. Actualizar kizeo_api.py
with open(r'C:\Users\Usuario\cupitech-web\backend\kizeo_api.py', 'r', encoding='utf-8') as f:
    k = f.read()

k = k.replace('df = df.head(limit)', 'df = df.head(500)')
k = k.replace(
    '"fecha": val("date_et_heure")[:10] if val("date_et_heure") else val("create_time")[:10],',
    '"fecha": val("date_et_heure")[:10] if val("date_et_heure") else val("create_time")[:10],\n            "fecha_creacion": str(row.get("create_time", ""))[:10],'
)

with open(r'C:\Users\Usuario\cupitech-web\backend\kizeo_api.py', 'w', encoding='utf-8') as f:
    f.write(k)
print("✅ kizeo_api.py actualizado")

# 2. Actualizar App.jsx
with open(r'C:\Users\Usuario\cupitech-web\frontend\src\App.jsx', 'r', encoding='utf-8') as f:
    a = f.read()

# Actualizar limit
a = a.replace('api/kizeo/${tipo}?limit=30', 'api/kizeo/${tipo}?limit=500')
a = a.replace('api/kizeo/${tipo}?limit=200', 'api/kizeo/${tipo}?limit=500')

# Agregar estado mesFiltro después de proyectoFiltro
a = a.replace(
    'const [proyectoFiltro, setProyectoFiltro] = useState("todos");',
    '''const [proyectoFiltro, setProyectoFiltro] = useState("todos");
  const [mesFiltro, setMesFiltro] = useState("todos");
  const MESES = [
    { id: "todos", label: "📅 Todos" },
    { id: "2026-09", label: "Sep 26" },
    { id: "2026-08", label: "Ago 26" },
    { id: "2026-07", label: "Jul 26" },
    { id: "2026-06", label: "Jun 26" },
    { id: "2026-05", label: "May 26" },
    { id: "2026-04", label: "Abr 26" },
    { id: "2026-03", label: "Mar 26" },
  ];'''
)

# Actualizar filtro
a = a.replace(
    '''  const reportesFiltrados = proyectoFiltro === "todos"
    ? reportes
    : reportes.filter(r => r.proyecto_id === proyectoFiltro);''',
    '''  const reportesFiltrados = reportes
    .filter(r => proyectoFiltro === "todos" || r.proyecto_id === proyectoFiltro)
    .filter(r => mesFiltro === "todos" || (r.fecha_creacion && r.fecha_creacion.startsWith(mesFiltro)));'''
)

# Agregar select de mes en el UI — después del div de proyectos y antes del separador
a = a.replace(
    '''          </div>
          <div style={{ width: 1, height: 32, background: "#E2E8F0" }}></div>
          {TIPOS.map(t => (''',
    '''          </div>
          <select value={mesFiltro} onChange={e => setMesFiltro(e.target.value)} style={{ padding: "6px 10px", borderRadius: 8, border: "1.5px solid #E2E8F0", fontSize: 12, color: "#475569", cursor: "pointer", outline: "none" }}>
            {MESES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
          <div style={{ width: 1, height: 32, background: "#E2E8F0" }}></div>
          {TIPOS.map(t => (''',
    1  # Solo reemplazar la PRIMERA ocurrencia
)

with open(r'C:\Users\Usuario\cupitech-web\frontend\src\App.jsx', 'w', encoding='utf-8') as f:
    f.write(a)
print("✅ App.jsx actualizado")
