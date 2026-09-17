with open(r'C:\Users\Usuario\cupitech-web\frontend\src\App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

ranking_component = '''
// ── Ranking de Técnicos ───────────────────────────────────
function Ranking({ token }) {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tipo, setTipo] = useState("correctivo");
  const API = "http://localhost:8000";
  const headers = { "Authorization": `Bearer ${token}` };

  const TIPOS = [
    { id: "correctivo", label: "🔧 Correctivos" },
    { id: "preventivo", label: "🔵 Preventivos" },
    { id: "diagnostico", label: "🔍 Diagnósticos" },
  ];

  useEffect(() => { cargar(); }, [tipo]);

  async function cargar() {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/kizeo-stats?tipo=${tipo}`, { headers });
      const data = await r.json();
      setStats(data.estadisticas || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function formatTiempo(min) {
    if (!min) return "--";
    if (min < 60) return `${min} min`;
    return `${Math.floor(min/60)}h ${min%60}min`;
  }

  const medallas = ["🥇", "🥈", "🥉"];
  const maxReportes = Math.max(...stats.map(s => s.total_reportes), 1);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0, color: "#1E3A5F", fontSize: 22 }}>🏆 Ranking de Técnicos</h1>
        <div style={{ display: "flex", gap: 8 }}>
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
        <div style={{ textAlign: "center", color: "#94A3B8", padding: 40 }}>Calculando ranking...</div>
      ) : (
        <div>
          {/* Top 3 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
            {stats.slice(0, 3).map((s, i) => (
              <div key={i} style={{
                background: "#FFFFFF", borderRadius: 12, padding: 24, textAlign: "center",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                borderTop: `4px solid ${i === 0 ? "#F59E0B" : i === 1 ? "#94A3B8" : "#CD7F32"}`
              }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>{medallas[i]}</div>
                <div style={{ fontSize: 18, fontWeight: "bold", color: "#0F172A", marginBottom: 4 }}>
                  {s.tecnico.split(" ")[0]}
                </div>
                <div style={{ fontSize: 13, color: "#64748B", marginBottom: 12 }}>{s.tecnico}</div>
                <div style={{ fontSize: 36, fontWeight: "bold", color: "#1E3A5F", margin: "8px 0" }}>
                  {s.total_reportes}
                </div>
                <div style={{ fontSize: 12, color: "#64748B" }}>reportes</div>
                {s.tiempo_promedio_min && (
                  <div style={{ marginTop: 8, fontSize: 13, color: "#166534", fontWeight: "bold" }}>
                    ⏱️ {formatTiempo(s.tiempo_promedio_min)} promedio
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Tabla completa */}
          <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <h3 style={{ margin: "0 0 16px", color: "#1E3A5F", fontSize: 16 }}>Ranking completo</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F1F5F9" }}>
                  {["Pos", "Técnico", "Reportes", "Tiempo promedio", "Desempeño"].map((h, i) => (
                    <th key={i} style={{ padding: "8px 12px", textAlign: i > 1 ? "center" : "left", color: "#64748B", fontWeight: "bold" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.map((s, i) => {
                  const pct = Math.round((s.total_reportes / maxReportes) * 100);
                  return (
                    <tr key={i} style={{ borderBottom: "0.5px solid #E2E8F0", background: i % 2 === 0 ? "#FFFFFF" : "#F8FAFC" }}>
                      <td style={{ padding: "10px 12px", fontWeight: "bold", color: "#1E3A5F" }}>
                        {medallas[i] || `#${i + 1}`}
                      </td>
                      <td style={{ padding: "10px 12px", fontWeight: "bold", color: "#0F172A" }}>{s.tecnico}</td>
                      <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: "bold", color: "#1E3A5F" }}>{s.total_reportes}</td>
                      <td style={{ padding: "10px 12px", textAlign: "center", color: "#64748B" }}>{formatTiempo(s.tiempo_promedio_min)}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <div style={{ background: "#F1F5F9", borderRadius: 4, height: 8, overflow: "hidden" }}>
                          <div style={{ background: i === 0 ? "#F59E0B" : "#1E3A5F", height: "100%", width: `${pct}%` }}></div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

'''

# Insertar antes de App principal
content = content.replace(
    "// ── App principal",
    ranking_component + "// ── App principal"
)

# Agregar pestaña en NavBar
content = content.replace(
    '{ path: "/bi", label: "📊 BI Mantenimiento" },',
    '{ path: "/bi", label: "📊 BI Mantenimiento" },\n    { path: "/ranking", label: "🏆 Ranking" },'
)
content = content.replace(
    '{ path: "/bi", label: "📊 BI" },',
    '{ path: "/bi", label: "📊 BI" },\n    { path: "/ranking", label: "🏆 Ranking" },'
)

# Agregar ruta
content = content.replace(
    '<Route path="/bi" element={<BI />} />',
    '<Route path="/bi" element={<BI />} />\n        <Route path="/ranking" element={<Ranking token={token} />} />'
)

with open(r'C:\Users\Usuario\cupitech-web\frontend\src\App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("OK")
