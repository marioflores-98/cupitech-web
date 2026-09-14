import { useState, useEffect } from "react";

const API = "http://localhost:8000";

function App() {
  const [proyectos, setProyectos] = useState([]);
  const [solar, setSolar] = useState([]);
  const [reflectores, setReflectores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hora, setHora] = useState(new Date());

  useEffect(() => {
    cargarDatos();
    const timer = setInterval(() => setHora(new Date()), 1000);
    const refresh = setInterval(cargarDatos, 60000);
    return () => { clearInterval(timer); clearInterval(refresh); };
  }, []);

  async function cargarDatos() {
    try {
      const [pRes, sRes, rRes] = await Promise.all([
        fetch(`${API}/api/proyectos`),
        fetch(`${API}/api/solar`),
        fetch(`${API}/api/reflectores`),
      ]);
      const pData = await pRes.json();
      const sData = await sRes.json();
      const rData = await rRes.json();
      setProyectos(pData.proyectos || []);
      setSolar(sData.equipos || []);
      setReflectores(rData.reflectores || []);
    } catch (e) {
      console.error("Error cargando datos:", e);
    } finally {
      setLoading(false);
    }
  }

  const estadoColor = {
    activo: "#166534",
    en_integracion: "#D97706",
    pendiente: "#64748B",
  };

  const estadoLabel = {
    activo: "✅ Activo",
    en_integracion: "🔄 En integración",
    pendiente: "⏳ Pendiente",
  };

  const solarOnline = solar.filter(e => e["Battery SOC"] !== "--").length;
  const refOnline = reflectores.filter(r => r.online).length;

  return (
    <div style={{ fontFamily: "Calibri, sans-serif", background: "#F1F5F9", minHeight: "100vh", padding: 0 }}>

      {/* Header */}
      <div style={{ background: "#1E3A5F", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: "#FFFFFF", fontSize: 24, fontWeight: "bold" }}>🤖 CupiTech</div>
          <div style={{ color: "#94A3B8", fontSize: 13 }}>Plataforma de Mantenimiento — Autotraffic</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "bold" }}>
            {hora.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>
          <div style={{ color: "#94A3B8", fontSize: 13 }}>
            {hora.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>
      </div>

      <div style={{ padding: "24px" }}>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Proyectos activos", valor: proyectos.filter(p => p.estado === "activo").length, total: proyectos.length, color: "#166534", icon: "📍" },
            { label: "Cámaras totales", valor: proyectos.reduce((a, p) => a + p.uts, 0), total: null, color: "#1E3A5F", icon: "📷" },
            { label: "Equipos solares", valor: solarOnline, total: solar.length, color: "#D97706", icon: "☀️" },
            { label: "Reflectores", valor: refOnline, total: reflectores.length, color: "#C0392B", icon: "💡" },
          ].map((kpi, i) => (
            <div key={i} style={{ background: "#FFFFFF", borderRadius: 12, padding: "20px", borderLeft: `4px solid ${kpi.color}`, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
              <div style={{ fontSize: 28 }}>{kpi.icon}</div>
              <div style={{ fontSize: 36, fontWeight: "bold", color: kpi.color, margin: "8px 0" }}>
                {loading ? "..." : kpi.valor}
                {kpi.total !== null && <span style={{ fontSize: 16, color: "#94A3B8" }}>/{kpi.total}</span>}
              </div>
              <div style={{ color: "#64748B", fontSize: 14 }}>{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Proyectos */}
        <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          <h2 style={{ margin: "0 0 16px", color: "#1E3A5F", fontSize: 18 }}>📋 Estado de Proyectos</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
            {proyectos.map((p, i) => (
              <div key={i} style={{ border: `2px solid ${estadoColor[p.estado]}`, borderRadius: 10, padding: 16, background: "#F8FAFC" }}>
                <div style={{ fontWeight: "bold", fontSize: 15, color: "#0F172A" }}>{p.nombre}</div>
                <div style={{ fontSize: 32, fontWeight: "bold", color: estadoColor[p.estado], margin: "8px 0" }}>{p.uts}</div>
                <div style={{ fontSize: 12, color: "#64748B" }}>UTs activas</div>
                <div style={{ marginTop: 8, fontSize: 12, color: estadoColor[p.estado], fontWeight: "bold" }}>
                  {estadoLabel[p.estado]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Solar */}
        <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          <h2 style={{ margin: "0 0 16px", color: "#1E3A5F", fontSize: 18 }}>☀️ Estado Solar Guardian</h2>
          {loading ? <div style={{ color: "#94A3B8" }}>Cargando...</div> : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
              {solar.map((eq, i) => {
                const soc = eq["Battery SOC"];
                const pv = eq["PV Power"];
                const online = soc !== "--";
                const socNum = online ? parseInt(soc) : 0;
                const color = !online ? "#94A3B8" : socNum >= 80 ? "#166534" : socNum >= 50 ? "#D97706" : "#C0392B";
                return (
                  <div key={i} style={{ border: `1px solid ${color}`, borderRadius: 8, padding: 10, background: online ? "#F0FDF4" : "#F8FAFC" }}>
                    <div style={{ fontSize: 10, fontWeight: "bold", color: "#0F172A", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{eq.ut}</div>
                    <div style={{ fontSize: 16, fontWeight: "bold", color }}>{soc}</div>
                    <div style={{ fontSize: 10, color: "#64748B" }}>{online ? pv : "Offline"}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Reflectores */}
        {reflectores.length > 0 && (
          <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <h2 style={{ margin: "0 0 16px", color: "#1E3A5F", fontSize: 18 }}>💡 Reflectores</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {reflectores.map((r, i) => (
                <div key={i} style={{ border: `2px solid ${r.encendido ? "#166534" : "#C0392B"}`, borderRadius: 10, padding: 16, background: "#F8FAFC" }}>
                  <div style={{ fontWeight: "bold", color: "#0F172A" }}>{r.nombre}</div>
                  <div style={{ fontSize: 22, fontWeight: "bold", color: r.encendido ? "#166534" : "#C0392B", margin: "8px 0" }}>
                    {r.encendido ? "🟢 ON" : "🔴 OFF"}
                  </div>
                  {r.voltaje && <div style={{ fontSize: 12, color: "#64748B" }}>⚡ {r.voltaje}V | 🔌 {r.corriente}A</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", color: "#94A3B8", fontSize: 13, marginTop: 8 }}>
          CupiTech v1.0 — Autotraffic © 2026 · Actualización automática cada 60 seg
        </div>

      </div>
    </div>
  );
}

export default App;
