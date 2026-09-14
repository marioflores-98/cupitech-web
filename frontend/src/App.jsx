import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";

const API = "http://localhost:8000";

// ── Componente de navegación ──────────────────────────────
function NavBar({ hora }) {
  const location = useLocation();
  const links = [
    { path: "/", label: "📊 Dashboard" },
    { path: "/alertas", label: "🚨 Alertas" },
    { path: "/solar", label: "☀️ Solar" },
    { path: "/reflectores", label: "💡 Reflectores" },
  ];
  return (
    <div style={{ background: "#1E3A5F", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <div style={{ padding: "16px 0" }}>
          <div style={{ color: "#FFFFFF", fontSize: 20, fontWeight: "bold" }}>🤖 CupiTech</div>
          <div style={{ color: "#94A3B8", fontSize: 11 }}>Autotraffic</div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {links.map(l => (
            <Link key={l.path} to={l.path} style={{
              padding: "8px 16px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: "bold",
              background: location.pathname === l.path ? "#C0392B" : "transparent",
              color: location.pathname === l.path ? "#FFFFFF" : "#94A3B8",
            }}>{l.label}</Link>
          ))}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "bold" }}>
          {hora.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </div>
        <div style={{ color: "#94A3B8", fontSize: 11 }}>
          {hora.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────
function Dashboard({ proyectos, solar, reflectores, loading }) {
  const estadoColor = { activo: "#166534", en_integracion: "#D97706", pendiente: "#64748B" };
  const estadoLabel = { activo: "✅ Activo", en_integracion: "🔄 En integración", pendiente: "⏳ Pendiente" };
  const solarOnline = solar.filter(e => e["Battery SOC"] !== "--").length;
  const refOnline = reflectores.filter(r => r.online).length;
  const totalAlertas = proyectos.reduce((a, p) => a + (p.criticas || 0) + (p.alertas || 0), 0);

  return (
    <div style={{ padding: 24 }}>
      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Proyectos activos", valor: proyectos.filter(p => p.estado === "activo").length, total: proyectos.length, color: "#166534", icon: "📍" },
          { label: "Cámaras totales", valor: proyectos.reduce((a, p) => a + p.uts, 0), total: null, color: "#1E3A5F", icon: "📷" },
          { label: "Alertas activas", valor: totalAlertas, total: null, color: totalAlertas > 0 ? "#C0392B" : "#166534", icon: "🚨" },
          { label: "Equipos solares", valor: solarOnline, total: solar.length, color: "#D97706", icon: "☀️" },
          { label: "Reflectores", valor: refOnline, total: reflectores.length, color: "#C0392B", icon: "💡" },
        ].map((kpi, i) => (
          <div key={i} style={{ background: "#FFFFFF", borderRadius: 12, padding: 20, borderLeft: `4px solid ${kpi.color}`, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 24 }}>{kpi.icon}</div>
            <div style={{ fontSize: 32, fontWeight: "bold", color: kpi.color, margin: "6px 0" }}>
              {loading ? "..." : kpi.valor}
              {kpi.total !== null && <span style={{ fontSize: 14, color: "#94A3B8" }}>/{kpi.total}</span>}
            </div>
            <div style={{ color: "#64748B", fontSize: 13 }}>{kpi.label}</div>
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
              <div style={{ fontSize: 30, fontWeight: "bold", color: estadoColor[p.estado], margin: "6px 0" }}>{p.uts}</div>
              <div style={{ fontSize: 11, color: "#64748B" }}>UTs activas</div>
              {(p.criticas > 0 || p.alertas > 0) && (
                <div style={{ marginTop: 6, fontSize: 11 }}>
                  {p.criticas > 0 && <span style={{ color: "#C0392B", fontWeight: "bold" }}>🔴 {p.criticas} críticas </span>}
                  {p.alertas > 0 && <span style={{ color: "#E67E22", fontWeight: "bold" }}>🟠 {p.alertas} alertas</span>}
                </div>
              )}
              <div style={{ marginTop: 6, fontSize: 11, color: estadoColor[p.estado], fontWeight: "bold" }}>{estadoLabel[p.estado]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Alertas ───────────────────────────────────────────────
function Alertas() {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proyecto, setProyecto] = useState("PUEBLA");

  useEffect(() => {
    cargar();
  }, [proyecto]);

  async function cargar() {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/alertas/${proyecto}`);
      const data = await r.json();
      setAlertas(data.alertas || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0, color: "#1E3A5F", fontSize: 22 }}>🚨 Alertas activas</h1>
        <div style={{ display: "flex", gap: 8 }}>
          {["PUEBLA", "QUERETARO", "EDOMEX"].map(p => (
            <button key={p} onClick={() => setProyecto(p)} style={{
              padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: "bold", fontSize: 13,
              background: proyecto === p ? "#C0392B" : "#F1F5F9",
              color: proyecto === p ? "#FFFFFF" : "#475569",
            }}>{p}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "#94A3B8", padding: 40 }}>Consultando cámaras...</div>
      ) : alertas.length === 0 ? (
        <div style={{ background: "#F0FDF4", border: "2px solid #166534", borderRadius: 12, padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 48 }}>✅</div>
          <div style={{ fontSize: 20, fontWeight: "bold", color: "#166534", marginTop: 8 }}>Sin alertas activas</div>
          <div style={{ color: "#64748B", marginTop: 4 }}>Todas las cámaras de {proyecto} están operativas</div>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: 16, color: "#64748B" }}>{alertas.length} cámara(s) con alerta en {proyecto}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {alertas.map((a, i) => (
              <div key={i} style={{ background: "#FFFFFF", border: `2px solid ${a.color}`, borderRadius: 10, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{a.nivel === "CRITICO" ? "🔴" : "🟠"}</div>
                <div style={{ fontWeight: "bold", fontSize: 16, color: "#0F172A" }}>{a.ut}</div>
                <div style={{ marginTop: 4, fontSize: 13, fontWeight: "bold", color: a.color }}>{a.nivel}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Solar ─────────────────────────────────────────────────
function Solar({ solar, loading }) {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ margin: "0 0 20px", color: "#1E3A5F", fontSize: 22 }}>☀️ Solar Guardian — {solar.length} equipos</h1>
      {loading ? <div style={{ color: "#94A3B8" }}>Cargando...</div> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
          {solar.map((eq, i) => {
            const soc = eq["Battery SOC"];
            const pv = eq["PV Power"];
            const online = soc !== "--";
            const socNum = online ? parseInt(soc) : 0;
            const color = !online ? "#94A3B8" : socNum >= 80 ? "#166534" : socNum >= 50 ? "#D97706" : "#C0392B";
            return (
              <div key={i} style={{ border: `2px solid ${color}`, borderRadius: 10, padding: 12, background: online ? "#F0FDF4" : "#F8FAFC", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 11, fontWeight: "bold", color: "#0F172A", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{eq.ut}</div>
                <div style={{ fontSize: 22, fontWeight: "bold", color }}>{soc}</div>
                <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{online ? pv : "Offline"}</div>
                {eq.max_pv && eq.max_pv !== "--" && (
                  <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 2 }}>Pico: {eq.max_pv}</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Reflectores ───────────────────────────────────────────
function Reflectores({ reflectores, loading }) {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ margin: "0 0 20px", color: "#1E3A5F", fontSize: 22 }}>💡 Reflectores — {reflectores.length} equipos</h1>
      {loading ? <div style={{ color: "#94A3B8" }}>Cargando...</div> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {reflectores.map((r, i) => (
            <div key={i} style={{ background: "#FFFFFF", border: `2px solid ${r.encendido ? "#166534" : "#C0392B"}`, borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
              <div style={{ fontWeight: "bold", fontSize: 16, color: "#0F172A", marginBottom: 8 }}>{r.nombre}</div>
              <div style={{ fontSize: 28, fontWeight: "bold", color: r.encendido ? "#166534" : "#C0392B", margin: "8px 0" }}>
                {r.encendido ? "🟢 ENCENDIDO" : "🔴 APAGADO"}
              </div>
              <div style={{ fontSize: 13, color: "#64748B" }}>
                {r.online ? "✅ En línea" : "❌ Offline"}
              </div>
              {r.voltaje && (
                <div style={{ marginTop: 8, fontSize: 13, color: "#475569" }}>
                  ⚡ {r.voltaje}V | 🔌 {r.corriente}A | 💪 {r.potencia_real}W
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── App principal ─────────────────────────────────────────
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
      setProyectos((await pRes.json()).proyectos || []);
      setSolar((await sRes.json()).equipos || []);
      setReflectores((await rRes.json()).reflectores || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Router>
      <div style={{ fontFamily: "Calibri, sans-serif", background: "#F1F5F9", minHeight: "100vh" }}>
        <NavBar hora={hora} />
        <Routes>
          <Route path="/" element={<Dashboard proyectos={proyectos} solar={solar} reflectores={reflectores} loading={loading} />} />
          <Route path="/alertas" element={<Alertas />} />
          <Route path="/solar" element={<Solar solar={solar} loading={loading} />} />
          <Route path="/reflectores" element={<Reflectores reflectores={reflectores} loading={loading} />} />
        </Routes>
        <div style={{ textAlign: "center", color: "#94A3B8", fontSize: 12, padding: "16px 0" }}>
          CupiTech v1.0 — Autotraffic © 2026 · Actualización cada 60 seg
        </div>
      </div>
    </Router>
  );
}

export default App;
