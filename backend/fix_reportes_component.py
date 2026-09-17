
import re

with open(r'C:\Users\Usuario\cupitech-web\frontend\src\App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Encontrar inicio y fin del componente Reportes
inicio = content.find('// ── Reportes Kizeo')
if inicio == -1:
    print("No encontrado")
    exit()

# Buscar el siguiente componente o App principal
fin = content.find('// ── App principal', inicio)
if fin == -1:
    fin = content.find('// ─── App', inicio)

if fin == -1:
    print("No se encontró el fin")
    exit()

nuevo_contenido = content[:inicio] + """// ── Reportes Kizeo ────────────────────────────────────────
function Reportes({ token, proyectosUsuario }) {
  const [tipo, setTipo] = useState("correctivo");
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);
  const [proyectoFiltro, setProyectoFiltro] = useState("todos");
  const [mesFiltro, setMesFiltro] = useState("todos");
  const API = "http://localhost:8000";
  const headers = { "Authorization": `Bearer ${token}` };

  const PROYECTOS = [
    { id: "todos", label: "🌐 Todos" },
    { id: "PUEBLA", label: "Puebla" },
    { id: "QRO", label: "Querétaro" },
    { id: "EDOMEX", label: "Mexibús/Trolebús" },
    { id: "TLAXCALA", label: "Tlaxcala" },
    { id: "LEON", label: "León" },
  ];

  const MESES = [
    { id: "todos", label: "📅 Todos los meses" },
    { id: "2026-09", label: "Sep 2026" },
    { id: "2026-08", label: "Ago 2026" },
    { id: "2026-07", label: "Jul 2026" },
    { id: "2026-06", label: "Jun 2026" },
    { id: "2026-05", label: "May 2026" },
    { id: "2026-04", label: "Abr 2026" },
    { id: "2026-03", label: "Mar 2026" },
  ];

  const TIPOS = [
    { id: "correctivo", label: "🔧 Correctivos" },
    { id: "preventivo", label: "🔵 Preventivos" },
    { id: "diagnostico", label: "🔍 Diagnósticos" },
  ];

  const ESTADO_COLOR = {
    "Terminado": { bg: "#DCFCE7", color: "#166534" },
    "Pendiente": { bg: "#FEF9C3", color: "#854D0E" },
  };

  useEffect(() => { cargar(); }, [tipo]);

  const reportesFiltrados = reportes
    .filter(r => proyectoFiltro === "todos" || r.proyecto_id === proyectoFiltro)
    .filter(r => mesFiltro === "todos" || (r.fecha && r.fecha.startsWith(mesFiltro)));

  async function cargar() {
    setLoading(true);
    setSeleccionado(null);
    try {
      const r = await fetch(`${API}/api/kizeo/${tipo}?limit=200`, { headers });
      const data = await r.json();
      setReportes(data.reportes || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function formatTiempo(min) {
    if (!min) return "--";
    if (min < 60) return `${min} min`;
    return `${Math.floor(min/60)}h ${min%60}min`;
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ margin: 0, color: "#1E3A5F", fontSize: 22 }}>📋 Reportes Kizeo</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {/* Filtro proyecto */}
          <div style={{ display: "flex", gap: 4 }}>
            {PROYECTOS.map(p => (
              <button key={p.id} onClick={() => setProyectoFiltro(p.id)} style={{
                padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11,
                background: proyectoFiltro === p.id ? "#C0392B" : "#F1F5F9",
                color: proyectoFiltro === p.id ? "#FFFFFF" : "#475569", fontWeight: proyectoFiltro === p.id ? "bold" : "normal"
              }}>{p.label}</button>
            ))}
          </div>
          {/* Filtro mes */}
          <select value={mesFiltro} onChange={e => setMesFiltro(e.target.value)} style={{
            padding: "6px 10px", borderRadius: 8, border: "1.5px solid #E2E8F0",
            fontSize: 12, color: "#475569", cursor: "pointer", outline: "none"
          }}>
            {MESES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
          <div style={{ width: 1, height: 28, background: "#E2E8F0" }}></div>
          {/* Tipo */}
          {TIPOS.map(t => (
            <button key={t.id} onClick={() => setTipo(t.id)} style={{
              padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: "bold", fontSize: 12,
              background: tipo === t.id ? "#1E3A5F" : "#F1F5F9",
              color: tipo === t.id ? "#FFFFFF" : "#475569",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "#94A3B8", padding: 40 }}>Cargando reportes...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: seleccionado ? "1fr 1fr" : "1fr", gap: 16 }}>
          {/* Lista */}
          <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 13, color: "#64748B", marginBottom: 12 }}>
              {reportesFiltrados.length} reportes
              {proyectoFiltro !== "todos" && ` · ${PROYECTOS.find(p=>p.id===proyectoFiltro)?.label}`}
              {mesFiltro !== "todos" && ` · ${MESES.find(m=>m.id===mesFiltro)?.label}`}
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#F1F5F9" }}>
                  {["#", "Fecha", "UT", "Proyecto", "Técnico", "Falla", "Tiempo", "Estado"].map((h, i) => (
                    <th key={i} style={{ padding: "6px 8px", textAlign: "left", color: "#64748B", fontWeight: "bold" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportesFiltrados.map((rep, i) => {
                  const est = ESTADO_COLOR[rep.estado] || { bg: "#F1F5F9", color: "#475569" };
                  return (
                    <tr key={i} onClick={() => setSeleccionado(rep)} style={{
                      borderBottom: "0.5px solid #E2E8F0", cursor: "pointer",
                      background: seleccionado?.id === rep.id ? "#EFF6FF" : i % 2 === 0 ? "#FFFFFF" : "#F8FAFC"
                    }}>
                      <td style={{ padding: "7px 8px", fontWeight: "bold", color: "#1E3A5F" }}>#{rep.numero}</td>
                      <td style={{ padding: "7px 8px", color: "#64748B" }}>{rep.fecha}</td>
                      <td style={{ padding: "7px 8px", fontWeight: "bold", color: "#0F172A" }}>{rep.ut || "--"}</td>
                      <td style={{ padding: "7px 8px", color: "#475569" }}>{rep.proyecto || "--"}</td>
                      <td style={{ padding: "7px 8px", color: "#475569" }}>{rep.tecnico || "--"}</td>
                      <td style={{ padding: "7px 8px", color: "#475569", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rep.falla || "--"}</td>
                      <td style={{ padding: "7px 8px", color: "#64748B" }}>{formatTiempo(rep.tiempo_resolucion_min)}</td>
                      <td style={{ padding: "7px 8px" }}>
                        <span style={{ background: est.bg, color: est.color, padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: "bold" }}>
                          {rep.estado}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Detalle */}
          {seleccionado && (
            <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: "bold", color: "#1E3A5F" }}>Reporte #{seleccionado.numero}</div>
                  <div style={{ fontSize: 13, color: "#64748B" }}>{seleccionado.tipo_label} · {seleccionado.fecha}</div>
                </div>
                <button onClick={() => setSeleccionado(null)} style={{ background: "#F1F5F9", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer", fontSize: 13 }}>✕</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                {[
                  ["📍 UT", seleccionado.ut],
                  ["🗂️ Proyecto", seleccionado.proyecto],
                  ["📅 Fecha", seleccionado.fecha],
                  ["📌 Vialidad", seleccionado.vialidad],
                  ["👷 Técnico", seleccionado.tecnico_completo || seleccionado.tecnico],
                  ["🕐 Inicio", seleccionado.inicio],
                  ["🕓 Fin", seleccionado.fin],
                  ["⏱️ Tiempo", formatTiempo(seleccionado.tiempo_resolucion_min)],
                ].map(([label, val], i) => (
                  <div key={i} style={{ background: "#F8FAFC", borderRadius: 8, padding: "8px 12px" }}>
                    <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: "bold", color: "#0F172A" }}>{val || "--"}</div>
                  </div>
                ))}
              </div>
              {seleccionado.falla && seleccionado.falla !== "--" && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: 12, marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: "#DC2626", fontWeight: "bold", marginBottom: 4 }}>🔴 FALLA / ACCIÓN</div>
                  <div style={{ fontSize: 13, color: "#0F172A" }}>{seleccionado.falla}</div>
                </div>
              )}
              {seleccionado.componente && seleccionado.componente !== "--" && (
                <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, padding: 12, marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: "#166534", fontWeight: "bold", marginBottom: 4 }}>📦 COMPONENTE</div>
                  <div style={{ fontSize: 13, color: "#0F172A" }}>{seleccionado.componente} {seleccionado.cantidad !== "--" ? `(${seleccionado.cantidad})` : ""}</div>
                </div>
              )}
              {seleccionado.observaciones && seleccionado.observaciones !== "--" && seleccionado.observaciones !== "N/A" && (
                <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 11, color: "#64748B", fontWeight: "bold", marginBottom: 4 }}>💬 OBSERVACIONES</div>
                  <div style={{ fontSize: 13, color: "#475569" }}>{seleccionado.observaciones}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


""" + content[fin:]

with open(r'C:\Users\Usuario\cupitech-web\frontend\src\App.jsx', 'w', encoding='utf-8') as f:
    f.write(nuevo_contenido)

print("OK")
