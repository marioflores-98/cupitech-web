# Fix ranking con filtro de mes
with open(r'C:\Users\Usuario\cupitech-web\backend\kizeo_api.py', 'r', encoding='utf-8') as f:
    k = f.read()

# Agregar mes_filtro al signature
k = k.replace(
    'def get_estadisticas_tecnico(tipo: str = "correctivo", proyectos_filtro=None):',
    'def get_estadisticas_tecnico(tipo: str = "correctivo", proyectos_filtro=None, mes_filtro: str = None):'
)

# Agregar filtro de mes antes del filtro de proyecto
k = k.replace(
    '    # Filtrar por proyecto si el usuario no es admin',
    '''    # Filtrar por mes
    if mes_filtro and 'create_time' in df.columns:
        df = df[df['create_time'].astype(str).str.startswith(mes_filtro)]

    # Filtrar por proyecto si el usuario no es admin'''
)

with open(r'C:\Users\Usuario\cupitech-web\backend\kizeo_api.py', 'w', encoding='utf-8') as f:
    f.write(k)
print("✅ kizeo_api.py actualizado")

# Fix main.py
with open(r'C:\Users\Usuario\cupitech-web\backend\main.py', 'r', encoding='utf-8') as f:
    m = f.read()

m = m.replace(
    'def get_kizeo_stats(tipo: str = "correctivo", authorization: str = Header(None)):\n    sesion = get_sesion_actual(authorization)\n    from kizeo_api import get_estadisticas_tecnico\n    proyectos = sesion["proyectos"] if sesion["rol"] not in ["ingenieria", "ceo", "oficina_central"] else None\n    return {"estadisticas": get_estadisticas_tecnico(tipo)}',
    'def get_kizeo_stats(tipo: str = "correctivo", mes: str = None, authorization: str = Header(None)):\n    sesion = get_sesion_actual(authorization)\n    from kizeo_api import get_estadisticas_tecnico\n    proyectos = sesion["proyectos"] if sesion["rol"] not in ["ingenieria", "ceo", "oficina_central"] else None\n    return {"estadisticas": get_estadisticas_tecnico(tipo, proyectos_filtro=proyectos, mes_filtro=mes if mes else None)}'
)

with open(r'C:\Users\Usuario\cupitech-web\backend\main.py', 'w', encoding='utf-8') as f:
    f.write(m)
print("✅ main.py actualizado")

# Fix App.jsx - agregar mes al Ranking
with open(r'C:\Users\Usuario\cupitech-web\frontend\src\App.jsx', 'r', encoding='utf-8') as f:
    a = f.read()

# Agregar estado mes en Ranking
a = a.replace(
    '''// ── Ranking de Técnicos ───────────────────────────────────
function Ranking({ token }) {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tipo, setTipo] = useState("correctivo");
  const API = "http://localhost:8000";''',
    '''// ── Ranking de Técnicos ───────────────────────────────────
function Ranking({ token }) {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tipo, setTipo] = useState("correctivo");
  const [mes, setMes] = useState("");
  const MESES_RANK = [
    { id: "", label: "📅 Todos" },
    { id: "2026-09", label: "Sep 26" },
    { id: "2026-08", label: "Ago 26" },
    { id: "2026-07", label: "Jul 26" },
    { id: "2026-06", label: "Jun 26" },
    { id: "2026-05", label: "May 26" },
    { id: "2026-04", label: "Abr 26" },
    { id: "2026-03", label: "Mar 26" },
  ];
  const API = "http://localhost:8000";'''
)

# Actualizar useEffect
a = a.replace(
    '''  useEffect(() => { cargar(); }, [tipo]);

  async function cargar() {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/kizeo-stats?tipo=${tipo}`, { headers });''',
    '''  useEffect(() => { cargar(); }, [tipo, mes]);

  async function cargar() {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/kizeo-stats?tipo=${tipo}${mes ? "&mes=" + mes : ""}`, { headers });'''
)

# Agregar select de mes antes de los TIPOS en el Ranking
a = a.replace(
    '''        <div style={{ display: "flex", gap: 8 }}>
          {TIPOS.map(t => (
            <button key={t.id} onClick={() => setTipo(t.id)} style={{
              padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: "bold", fontSize: 13,
              background: tipo === t.id ? "#1E3A5F" : "#F1F5F9",
              color: tipo === t.id ? "#FFFFFF" : "#475569",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "#94A3B8", padding: 40 }}>Calculando ranking...</div>''',
    '''        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select value={mes} onChange={e => setMes(e.target.value)} style={{ padding: "6px 10px", borderRadius: 8, border: "1.5px solid #E2E8F0", fontSize: 12, color: "#475569", cursor: "pointer", outline: "none" }}>
            {MESES_RANK.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
          {TIPOS.map(t => (
            <button key={t.id} onClick={() => setTipo(t.id)} style={{
              padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: "bold", fontSize: 13,
              background: tipo === t.id ? "#1E3A5F" : "#F1F5F9",
              color: tipo === t.id ? "#FFFFFF" : "#475569",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "#94A3B8", padding: 40 }}>Calculando ranking...</div>'''
)

with open(r'C:\Users\Usuario\cupitech-web\frontend\src\App.jsx', 'w', encoding='utf-8') as f:
    f.write(a)
print("✅ App.jsx actualizado")
