import { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";

const API = "http://localhost:8000";

// ── Login ─────────────────────────────────────────────────
function Login({ onLogin }) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.detail || "Error al iniciar sesión");
      } else {
        localStorage.setItem("cupitech_token", data.token);
        localStorage.setItem("cupitech_user", JSON.stringify(data));
        onLogin(data);
      }
    } catch (e) {
      setError("No se pudo conectar al servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#1E3A5F", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Calibri, sans-serif" }}>
      <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 48, width: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🤖</div>
          <div style={{ fontSize: 28, fontWeight: "bold", color: "#1E3A5F" }}>CupiTech</div>
          <div style={{ fontSize: 14, color: "#64748B", marginTop: 4 }}>Plataforma de Mantenimiento — Autotraffic</div>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: "bold", color: "#475569", display: "block", marginBottom: 6 }}>Correo electrónico</label>
            <input
              type="email"
              value={correo}
              onChange={e => setCorreo(e.target.value)}
              placeholder="usuario@autotraffic.com.mx"
              required
              style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "2px solid #E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: "bold", color: "#475569", display: "block", marginBottom: 6 }}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "2px solid #E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {error && (
            <div style={{ background: "#FEE2E2", border: "1px solid #C0392B", borderRadius: 8, padding: "10px 16px", color: "#C0392B", fontSize: 13, marginBottom: 16 }}>
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "14px", borderRadius: 8, border: "none", background: loading ? "#94A3B8" : "#C0392B", color: "#FFFFFF", fontSize: 16, fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 24, color: "#94A3B8", fontSize: 12 }}>
          CupiTech v1.0 · Autotraffic © 2026
        </div>
      </div>
    </div>
  );
}

// ── NavBar ────────────────────────────────────────────────
function NavBar({ hora, usuario, onLogout }) {
  const location = useLocation();
  const links = [
    { path: "/", label: "📊 Dashboard" },
    { path: "/alertas", label: "🚨 Alertas" },
    { path: "/solar", label: "☀️ Solar" },
    { path: "/reflectores", label: "💡 Reflectores" },
    { path: "/accesos", label: "🔗 Accesos" },
    { path: "/inventario", label: "📦 Inventario" },
    { path: "/mapas", label: "🗺️ Mapas" },
    { path: "/chat", label: "💬 Chat" },
    { path: "/reportes", label: "📋 Reportes" },
    { path: "/bi", label: "📊 BI Mantenimiento" },
    { path: "/ranking", label: "🏆 Ranking" },
  ];
  return (
    <div style={{ background: "#1E3A5F", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div style={{ padding: "12px 0" }}>
          <div style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "bold" }}>🤖 CupiTech</div>
          <div style={{ color: "#94A3B8", fontSize: 10 }}>Autotraffic</div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {links.map(l => (
            <Link key={l.path} to={l.path} style={{
              padding: "8px 14px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: "bold",
              background: location.pathname === l.path ? "#C0392B" : "transparent",
              color: location.pathname === l.path ? "#FFFFFF" : "#94A3B8",
            }}>{l.label}</Link>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "bold" }}>
            {hora.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>
          <div style={{ color: "#94A3B8", fontSize: 10 }}>
            {hora.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
          </div>
        </div>
        <div style={{ borderLeft: "1px solid #334155", paddingLeft: 16 }}>
          <div style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "bold" }}>{usuario?.nombre?.split(" ")[0]}</div>
          <button onClick={onLogout} style={{ background: "none", border: "none", color: "#94A3B8", fontSize: 11, cursor: "pointer", padding: 0 }}>Cerrar sesión</button>
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

      <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
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
                  {p.alertas > 0 && <span style={{ color: "#E67E22", fontWeight: "bold" }}>🟠 {p.alertas}</span>}
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
function Alertas({ token, proyectosUsuario }) {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proyecto, setProyecto] = useState(proyectosUsuario[0] || "PUEBLA");

  useEffect(() => { cargar(); }, [proyecto]);

  async function cargar() {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/alertas/${proyecto}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await r.json();
      setAlertas(data.alertas || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const proyectosDisp = ["PUEBLA", "QRO", "EDOMEX", "LEON", "TLAXCALA"].filter(p => proyectosUsuario.includes(p));

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0, color: "#1E3A5F", fontSize: 22 }}>🚨 Alertas activas</h1>
        <div style={{ display: "flex", gap: 8 }}>
          {proyectosDisp.map(p => (
            <button key={p} onClick={() => setProyecto(p)} style={{
              padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: "bold", fontSize: 13,
              background: proyecto === p ? "#C0392B" : "#F1F5F9", color: proyecto === p ? "#FFFFFF" : "#475569",
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
          <div style={{ marginBottom: 16, color: "#64748B" }}>{alertas.length} cámara(s) con alerta</div>
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
              <div key={i} style={{ border: `2px solid ${color}`, borderRadius: 10, padding: 12, background: online ? "#F0FDF4" : "#F8FAFC" }}>
                <div style={{ fontSize: 11, fontWeight: "bold", color: "#0F172A", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{eq.ut}</div>
                <div style={{ fontSize: 22, fontWeight: "bold", color }}>{soc}</div>
                <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{online ? pv : "Offline"}</div>
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
              <div style={{ fontSize: 26, fontWeight: "bold", color: r.encendido ? "#166534" : "#C0392B", margin: "8px 0" }}>
                {r.encendido ? "🟢 ENCENDIDO" : "🔴 APAGADO"}
              </div>
              <div style={{ fontSize: 13, color: "#64748B" }}>{r.online ? "✅ En línea" : "❌ Offline"}</div>
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

// Componente Accesos — agregar al App.jsx

function Accesos({ token, proyectosUsuario }) {
  const [proyecto, setProyecto] = useState(proyectosUsuario[0] || "PUEBLA");
  const [busqueda, setBusqueda] = useState("");
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API = "http://localhost:8000";

  async function buscarUT() {
    if (!busqueda.trim()) return;
    setLoading(true);
    setError("");
    setResultado(null);
    try {
      const r = await fetch(`${API}/api/accesos/${proyecto}/${busqueda.trim().toUpperCase()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.detail || "UT no encontrada");
      } else {
        setResultado(data);
      }
    } catch (e) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  const iconos = {
    "Enlace directo (con puerto)": "🌐",
    "Puerto WAN": "🔌",
    "IP Cámara": "📷",
    "Módem SSID": "📶",
    "Contraseña WiFi": "🔑",
    "Teléfono línea": "📱",
    "MAC Cámara": "💻",
    "TeamViewer ID": "🖥️",
    "TeamViewer Pass": "🔐",
    "Red Telcel (4G)": "📡",
    "Contraseña 4G": "🔑",
    "S/N Módem": "🔢",
    "IMEI": "📋",
    "Vialidad": "📍",
    "Tipo": "🔗",
    "Grupo DynDNS": "🌍",
  };

  const proyectosDisp = ["PUEBLA", "QRO"].filter(p => proyectosUsuario.includes(p));

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ margin: "0 0 20px", color: "#1E3A5F", fontSize: 22 }}>🔗 Accesos Remotos</h1>

      {/* Buscador */}
      <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          {/* Selector proyecto */}
          <div style={{ display: "flex", gap: 8 }}>
            {proyectosDisp.map(p => (
              <button key={p} onClick={() => { setProyecto(p); setResultado(null); setBusqueda(""); }} style={{
                padding: "10px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: "bold", fontSize: 13,
                background: proyecto === p ? "#1E3A5F" : "#F1F5F9",
                color: proyecto === p ? "#FFFFFF" : "#475569",
              }}>{p}</button>
            ))}
          </div>
          {/* Campo de búsqueda */}
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            onKeyDown={e => e.key === "Enter" && buscarUT()}
            placeholder="Ej: UT411 o AJS02800W_A"
            style={{ flex: 1, minWidth: 200, padding: "10px 16px", borderRadius: 8, border: "2px solid #E2E8F0", fontSize: 14, outline: "none" }}
          />
          <button onClick={buscarUT} disabled={loading} style={{
            padding: "10px 24px", borderRadius: 8, border: "none", background: "#C0392B", color: "#FFFFFF",
            fontWeight: "bold", fontSize: 14, cursor: "pointer",
          }}>
            {loading ? "Buscando..." : "🔍 Buscar"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "#FEE2E2", border: "1px solid #C0392B", borderRadius: 12, padding: 20, color: "#C0392B", marginBottom: 16 }}>
          ❌ {error}
        </div>
      )}

      {/* Resultado */}
      {resultado && (
        <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 26, fontWeight: "bold", color: "#1E3A5F" }}>{resultado.ut}</div>
              <div style={{ color: "#64748B", fontSize: 14 }}>{resultado.campos?.Vialidad || ""} · {resultado.proyecto}</div>
            </div>
            <div style={{ background: "#F0FDF4", border: "2px solid #166534", borderRadius: 8, padding: "8px 16px", color: "#166534", fontWeight: "bold", fontSize: 13 }}>
              ✅ Datos encontrados
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {Object.entries(resultado.campos).filter(([k]) => k !== "Vialidad").map(([campo, valor], i) => (
              <div key={i} style={{ border: "1px solid #E2E8F0", borderRadius: 10, padding: 16, background: "#F8FAFC" }}>
                <div style={{ fontSize: 12, color: "#64748B", marginBottom: 4 }}>
                  {iconos[campo] || "•"} {campo}
                </div>
                <div style={{ fontSize: 15, fontWeight: "bold", color: "#0F172A", wordBreak: "break-all" }}>
                  {campo.includes("Enlace") ? (
                    <a href={valor} target="_blank" rel="noreferrer" style={{ color: "#2563EB" }}>{valor}</a>
                  ) : valor}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {!resultado && !error && !loading && (
        <div style={{ textAlign: "center", padding: 60, color: "#94A3B8" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 18, fontWeight: "bold" }}>Busca una UT para ver sus accesos</div>
          <div style={{ fontSize: 14, marginTop: 8 }}>Escribe el código de la UT y presiona Enter o el botón Buscar</div>
        </div>
      )}
    </div>
  );
}


// ── Inventario ────────────────────────────────────────────
function Inventario({ token, proyectosUsuario }) {
  const [vista, setVista] = useState("general");
  const [proyecto, setProyecto] = useState(proyectosUsuario[0] || "PUEBLA");
  const [busqueda, setBusqueda] = useState("");
  const [datos, setDatos] = useState(null);
  const [datosUT, setDatosUT] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingUT, setLoadingUT] = useState(false);
  const [error, setError] = useState("");

  const API = "http://localhost:8000";
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { cargarGeneral(); }, [proyecto]);

  async function cargarGeneral() {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/inventario/${proyecto}`, { headers });
      const data = await r.json();
      setDatos(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function buscarUT() {
    if (!busqueda.trim()) return;
    setLoadingUT(true);
    setError("");
    setDatosUT(null);
    try {
      const r = await fetch(`${API}/api/inventario/${proyecto}/${busqueda.trim().toUpperCase()}`, { headers });
      const data = await r.json();
      if (!r.ok) { setError(data.detail || "UT no encontrada"); }
      else { setDatosUT(data); setVista("ut"); }
    } catch (e) { setError("Error de conexión"); }
    finally { setLoadingUT(false); }
  }

  const tipoColor = {
    "Cambio por falla": "#C0392B",
    "Instalación": "#166534",
    "Retiro sin reemplazo": "#64748B",
    "Robo": "#7C3AED",
    "Daño físico": "#D97706",
    "Sustitución preventiva": "#2563EB",
  };

  const catIcon = {
    "Cámara": "📷", "Eléctrico": "⚡", "Comunicación": "📡",
    "Solar": "☀️", "Iluminación": "💡", "Estructura": "🏗️", "Otro": "📦"
  };

  const proyectosDisp = ["PUEBLA", "QRO"].filter(p => proyectosUsuario.includes(p));

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0, color: "#1E3A5F", fontSize: 22 }}>📦 Inventario</h1>
        <div style={{ display: "flex", gap: 8 }}>
          {proyectosDisp.map(p => (
            <button key={p} onClick={() => { setProyecto(p); setVista("general"); setDatosUT(null); }} style={{
              padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: "bold", fontSize: 13,
              background: proyecto === p ? "#1E3A5F" : "#F1F5F9", color: proyecto === p ? "#FFFFFF" : "#475569",
            }}>{p}</button>
          ))}
        </div>
      </div>

      {/* Buscador */}
      <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => { setVista("general"); setDatosUT(null); }} style={{
            padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: "bold",
            background: vista === "general" ? "#1E3A5F" : "#F1F5F9", color: vista === "general" ? "#FFFFFF" : "#475569"
          }}>📊 General</button>
          <button onClick={() => setVista("ut")} style={{
            padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: "bold",
            background: vista === "ut" ? "#1E3A5F" : "#F1F5F9", color: vista === "ut" ? "#FFFFFF" : "#475569"
          }}>🔍 Por UT</button>
        </div>
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          onKeyDown={e => e.key === "Enter" && buscarUT()}
          placeholder="Buscar UT (ej: UT522)"
          style={{ flex: 1, padding: "10px 16px", borderRadius: 8, border: "2px solid #E2E8F0", fontSize: 14, outline: "none" }}
        />
        <button onClick={buscarUT} disabled={loadingUT} style={{
          padding: "10px 20px", borderRadius: 8, border: "none", background: "#C0392B", color: "#FFFFFF",
          fontWeight: "bold", fontSize: 13, cursor: "pointer",
        }}>{loadingUT ? "..." : "Buscar"}</button>
      </div>

      {error && <div style={{ background: "#FEE2E2", border: "1px solid #C0392B", borderRadius: 10, padding: 16, color: "#C0392B", marginBottom: 16 }}>❌ {error}</div>}

      {/* Vista General */}
      {vista === "general" && datos && !loading && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
            {[
              { label: "Sitios con inventario", valor: datos.total_sitios || 0, color: "#1E3A5F", icon: "📍" },
              { label: "Total componentes", valor: datos.total_componentes || 0, color: "#166534", icon: "📦" },
              { label: "En falla", valor: datos.en_falla || 0, color: "#C0392B", icon: "⚠️" },
              { label: "Valor total", valor: `$${((datos.total_valor || 0) / 1000000).toFixed(2)}M`, color: "#D97706", icon: "💰" },
            ].map((k, i) => (
              <div key={i} style={{ background: "#FFFFFF", borderLeft: `4px solid ${k.color}`, borderRadius: 10, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                <div style={{ fontSize: 22 }}>{k.icon}</div>
                <div style={{ fontSize: 28, fontWeight: "bold", color: k.color, margin: "4px 0" }}>{k.valor}</div>
                <div style={{ fontSize: 12, color: "#64748B" }}>{k.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {/* Por categoría */}
            <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
              <h3 style={{ margin: "0 0 12px", color: "#1E3A5F", fontSize: 15 }}>Por categoría</h3>
              {(datos.por_categoria || []).map((cat, i) => {
                const maxVal = Math.max(...(datos.por_categoria || []).map(c => c.valor));
                const pct = maxVal > 0 ? (cat.valor / maxVal) * 100 : 0;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 13, width: 120, color: "#0F172A" }}>{catIcon[cat.categoria] || "📦"} {cat.categoria}</span>
                    <div style={{ flex: 1, background: "#F1F5F9", borderRadius: 4, height: 8, overflow: "hidden" }}>
                      <div style={{ background: "#1E3A5F", height: "100%", width: `${pct}%` }}></div>
                    </div>
                    <span style={{ fontSize: 12, color: "#64748B", width: 70, textAlign: "right" }}>${(cat.valor / 1000).toFixed(0)}k</span>
                  </div>
                );
              })}
            </div>

            {/* Top sitios */}
            <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
              <h3 style={{ margin: "0 0 12px", color: "#1E3A5F", fontSize: 15 }}>Sitios con más valor</h3>
              {(datos.sitios || []).slice(0, 5).map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "#F8FAFC", borderRadius: 8, marginBottom: 6, cursor: "pointer" }}
                  onClick={() => { setBusqueda(s.ut); buscarUT(); }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: "bold", color: "#0F172A" }}>{s.ut}</div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>{s.componentes} componentes</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontWeight: "bold", color: "#D97706" }}>${(s.valor_total / 1000).toFixed(0)}k</div>
                    {s.en_falla > 0 && <div style={{ fontSize: 11, color: "#C0392B" }}>⚠️ {s.en_falla} falla(s)</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabla todos los sitios */}
          <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <h3 style={{ margin: "0 0 12px", color: "#1E3A5F", fontSize: 15 }}>Todos los sitios</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F1F5F9" }}>
                  {["UT", "Vialidad", "Componentes", "Estado", "Valor total"].map((h, i) => (
                    <th key={i} style={{ padding: "8px 10px", textAlign: i > 1 ? "center" : "left", color: "#64748B", fontWeight: "bold", fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(datos.sitios || []).map((s, i) => (
                  <tr key={i} style={{ borderBottom: "0.5px solid #E2E8F0", cursor: "pointer", background: i % 2 === 0 ? "#FFFFFF" : "#F8FAFC" }}
                    onClick={() => { setBusqueda(s.ut); buscarUT(); }}>
                    <td style={{ padding: "8px 10px", fontWeight: "bold", color: "#1E3A5F" }}>{s.ut}</td>
                    <td style={{ padding: "8px 10px", color: "#64748B" }}>{s.vialidad}</td>
                    <td style={{ padding: "8px 10px", textAlign: "center" }}>{s.componentes}</td>
                    <td style={{ padding: "8px 10px", textAlign: "center" }}>
                      <span style={{ background: s.estado === "OK" ? "#DCFCE7" : "#FEE2E2", color: s.estado === "OK" ? "#166534" : "#C0392B", padding: "2px 8px", borderRadius: 10, fontSize: 11 }}>{s.estado}</span>
                    </td>
                    <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: "bold", color: "#D97706" }}>${s.valor_total.toLocaleString("es-MX", { maximumFractionDigits: 0 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vista Por UT */}
      {vista === "ut" && datosUT && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
            {[
              { label: "Componentes", valor: datosUT.total_componentes, color: "#1E3A5F", icon: "📦" },
              { label: "Instalados", valor: datosUT.total_componentes - datosUT.en_falla, color: "#166534", icon: "✅" },
              { label: "En falla", valor: datosUT.en_falla, color: "#C0392B", icon: "⚠️" },
              { label: "Valor del sitio", valor: `$${datosUT.valor_total.toLocaleString("es-MX", { maximumFractionDigits: 0 })}`, color: "#D97706", icon: "💰" },
            ].map((k, i) => (
              <div key={i} style={{ background: "#FFFFFF", borderLeft: `4px solid ${k.color}`, borderRadius: 10, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                <div style={{ fontSize: 22 }}>{k.icon}</div>
                <div style={{ fontSize: 26, fontWeight: "bold", color: k.color, margin: "4px 0" }}>{k.valor}</div>
                <div style={{ fontSize: 12, color: "#64748B" }}>{k.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
              <h3 style={{ margin: "0 0 4px", color: "#1E3A5F", fontSize: 16 }}>{datosUT.ut}</h3>
              <div style={{ color: "#64748B", fontSize: 13, marginBottom: 12 }}>{datosUT.vialidad} · {datosUT.proyecto}</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "#F1F5F9" }}>
                    {["Componente", "Marca/Modelo", "N° Serie", "Estado", "Costo"].map((h, i) => (
                      <th key={i} style={{ padding: "6px 8px", textAlign: i > 2 ? "center" : "left", color: "#64748B", fontWeight: "bold" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(datosUT.componentes || []).map((c, i) => (
                    <tr key={i} style={{ borderBottom: "0.5px solid #E2E8F0", background: i % 2 === 0 ? "#FFFFFF" : "#F8FAFC" }}>
                      <td style={{ padding: "7px 8px", color: "#0F172A" }}>{catIcon[c.categoria] || "📦"} {c.componente}</td>
                      <td style={{ padding: "7px 8px", color: "#64748B" }}>{c.marca} / {c.modelo}</td>
                      <td style={{ padding: "7px 8px", color: "#64748B", fontSize: 11 }}>{c.serie}</td>
                      <td style={{ padding: "7px 8px", textAlign: "center" }}>
                        <span style={{ background: c.estado === "Instalado" ? "#DCFCE7" : "#FEE2E2", color: c.estado === "Instalado" ? "#166534" : "#C0392B", padding: "2px 6px", borderRadius: 8, fontSize: 10 }}>{c.estado}</span>
                      </td>
                      <td style={{ padding: "7px 8px", textAlign: "right", color: "#D97706", fontWeight: "bold" }}>${c.costo_total.toLocaleString("es-MX", { maximumFractionDigits: 0 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
              <h3 style={{ margin: "0 0 12px", color: "#1E3A5F", fontSize: 15 }}>🔄 Movimientos</h3>
              {(datosUT.movimientos || []).length === 0 ? (
                <div style={{ color: "#94A3B8", textAlign: "center", padding: 20 }}>Sin movimientos registrados</div>
              ) : (
                (datosUT.movimientos || []).map((m, i) => (
                  <div key={i} style={{ borderLeft: `3px solid ${tipoColor[m.tipo] || "#64748B"}`, padding: "8px 12px", background: "#F8FAFC", borderRadius: "0 6px 6px 0", marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, fontWeight: "bold", color: "#0F172A" }}>{m.tipo}</span>
                      <span style={{ fontSize: 11, color: "#64748B" }}>{m.fecha?.split("T")[0]}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{m.componente} · {m.tecnico}</div>
                    {m.motivo && <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2, fontStyle: "italic" }}>{m.motivo}</div>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {vista === "ut" && !datosUT && !loadingUT && !error && (
        <div style={{ textAlign: "center", padding: 60, color: "#94A3B8" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
          <div style={{ fontSize: 18, fontWeight: "bold" }}>Busca una UT para ver su inventario</div>
          <div style={{ fontSize: 14, marginTop: 8 }}>Escribe el código y presiona Enter o Buscar</div>
        </div>
      )}

      {loading && <div style={{ textAlign: "center", color: "#94A3B8", padding: 40 }}>Cargando inventario...</div>}
    </div>
  );
}


// ── Mapas ─────────────────────────────────────────────────
function Mapas({ token, proyectosUsuario, usuario }) {
  const [proyecto, setProyecto] = useState(proyectosUsuario[0] || "PUEBLA");
  const [tipo, setTipo] = useState("camaras");
  const API = "http://localhost:8000";

  const MAPAS_DISPONIBLES = {
    "PUEBLA": ["camaras", "red"],
    "QRO": ["camaras"],
    "EDOMEX": ["camaras", "red"],
    "TLAXCALA": ["camaras"],
    "SAN_ANDRES": ["camaras"],
    "LEON": ["camaras"],
  };

  const tipoLabel = { camaras: "📍 Cámaras", red: "🔗 Red" };
  const proyNombre = { PUEBLA: "Puebla", QRO: "Querétaro", EDOMEX: "Edo. México", TLAXCALA: "Tlaxcala", SAN_ANDRES: "San Andrés", LEON: "León" };

  const proyectosDisp = ["PUEBLA", "QRO", "EDOMEX", "TLAXCALA", "SAN_ANDRES", "LEON"].filter(p => proyectosUsuario.includes(p));
  const tiposDisp = MAPAS_DISPONIBLES[proyecto] || ["camaras"];
  const mapaUrl = `${API}/mapas/${proyecto}/${tipo}?token=${token}`;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ margin: 0, color: "#1E3A5F", fontSize: 22 }}>🗺️ Mapas interactivos</h1>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {proyectosDisp.map(p => (
              <button key={p} onClick={() => { setProyecto(p); setTipo("camaras"); }} style={{
                padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: "bold", fontSize: 12,
                background: proyecto === p ? "#1E3A5F" : "#F1F5F9",
                color: proyecto === p ? "#FFFFFF" : "#475569",
              }}>{proyNombre[p] || p}</button>
            ))}
          </div>
          <div style={{ width: 1, height: 32, background: "#E2E8F0" }}></div>
          <div style={{ display: "flex", gap: 6 }}>
            {tiposDisp.map(t => (
              <button key={t} onClick={() => setTipo(t)} style={{
                padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: "bold", fontSize: 12,
                background: tipo === t ? "#C0392B" : "#F1F5F9",
                color: tipo === t ? "#FFFFFF" : "#475569",
              }}>{tipoLabel[t]}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: "#FFFFFF", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
        <iframe
          key={mapaUrl}
          src={mapaUrl}
          style={{ width: "100%", height: "600px", border: "none", display: "block" }}
          title={`Mapa ${proyecto} ${tipo}`}
        />
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#475569" }}>
          <div style={{ width: 10, height: 10, background: "#22C55E", borderRadius: "50%" }}></div> OK
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#475569" }}>
          <div style={{ width: 10, height: 10, background: "#EF4444", borderRadius: "50%" }}></div> Crítica
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#475569" }}>
          <div style={{ width: 10, height: 10, background: "#F59E0B", borderRadius: "50%" }}></div> Alerta
        </div>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "#94A3B8" }}>
          {proyNombre[proyecto]} · {tipoLabel[tipo]}
        </div>
      </div>
    </div>
  );
}


// ── Chat ──────────────────────────────────────────────────
function Chat({ token, usuario }) {
  const [conversaciones, setConversaciones] = useState([]);
  const [convActual, setConvActual] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingConv, setLoadingConv] = useState(true);
  const mensajesRef = useRef(null);
  const API = "http://localhost:8000";
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  useEffect(() => { cargarConversaciones(); }, []);
  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [mensajes]);

  async function cargarConversaciones() {
    try {
      const r = await fetch(`${API}/api/chat/conversaciones`, { headers });
      const data = await r.json();
      setConversaciones(data.conversaciones || []);
    } catch (e) { console.error(e); }
    finally { setLoadingConv(false); }
  }

  async function nuevaConversacion() {
    const r = await fetch(`${API}/api/chat/conversaciones`, {
      method: "POST", headers,
      body: JSON.stringify({ titulo: null })
    });
    const data = await r.json();
    setConvActual(data.id);
    setMensajes([]);
    await cargarConversaciones();
  }

  async function seleccionarConversacion(id) {
    setConvActual(id);
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/chat/${id}/mensajes`, { headers });
      const data = await r.json();
      setMensajes(data.mensajes || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function borrarConversacion(id, e) {
    e.stopPropagation();
    await fetch(`${API}/api/chat/conversaciones/${id}`, { method: "DELETE", headers });
    if (convActual === id) { setConvActual(null); setMensajes([]); }
    await cargarConversaciones();
  }

  async function enviar() {
    if (!texto.trim() || !convActual || loading) return;
    const msg = texto.trim();
    setTexto("");
    setMensajes(prev => [...prev, { rol: "user", contenido: msg, created_at: new Date().toISOString() }]);
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/chat/${convActual}/mensajes`, {
        method: "POST", headers,
        body: JSON.stringify({ conversacion_id: convActual, mensaje: msg })
      });
      const data = await r.json();
      setMensajes(prev => [...prev, { rol: "assistant", contenido: data.respuesta, created_at: new Date().toISOString() }]);
      await cargarConversaciones();
    } catch (e) {
      setMensajes(prev => [...prev, { rol: "assistant", contenido: "⚠️ Error de conexión. Intenta de nuevo.", created_at: new Date().toISOString() }]);
    } finally { setLoading(false); }
  }

  const iniciales = (nombre) => nombre?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "U";

  return (
    <div style={{ padding: 24, height: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>
      <h1 style={{ margin: "0 0 16px", color: "#1E3A5F", fontSize: 22 }}>💬 Chat con CupiTech</h1>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16, flex: 1, overflow: "hidden" }}>

        {/* Sidebar */}
        <div style={{ background: "#FFFFFF", borderRadius: 12, border: "0.5px solid #E2E8F0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: 14, borderBottom: "0.5px solid #E2E8F0" }}>
            <button onClick={nuevaConversacion} style={{
              width: "100%", padding: "8px", background: "#C0392B", color: "#fff",
              border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: "bold"
            }}>+ Nueva conversación</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
            {loadingConv ? (
              <div style={{ color: "#94A3B8", fontSize: 12, textAlign: "center", padding: 20 }}>Cargando...</div>
            ) : conversaciones.length === 0 ? (
              <div style={{ color: "#94A3B8", fontSize: 12, textAlign: "center", padding: 20 }}>Sin conversaciones</div>
            ) : conversaciones.map(conv => (
              <div key={conv.id} onClick={() => seleccionarConversacion(conv.id)} style={{
                padding: "10px 12px", borderRadius: 8, marginBottom: 4, cursor: "pointer",
                background: convActual === conv.id ? "#F1F5F9" : "transparent",
                borderLeft: convActual === conv.id ? "3px solid #C0392B" : "3px solid transparent",
                display: "flex", justifyContent: "space-between", alignItems: "flex-start"
              }}>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontSize: 12, fontWeight: "bold", color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {conv.titulo || "Nueva conversación"}
                  </div>
                  <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>
                    {conv.total_mensajes} mensajes
                  </div>
                </div>
                <button onClick={(e) => borrarConversacion(conv.id, e)} style={{
                  background: "none", border: "none", color: "#94A3B8", cursor: "pointer",
                  fontSize: 14, padding: "0 0 0 6px", flexShrink: 0
                }}>×</button>
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div style={{ background: "#FFFFFF", borderRadius: 12, border: "0.5px solid #E2E8F0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {!convActual ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
              <div style={{ fontSize: 18, fontWeight: "bold", color: "#1E3A5F", marginBottom: 8 }}>CupiTech</div>
              <div style={{ fontSize: 14, marginBottom: 20 }}>Asistente técnico de Autotraffic</div>
              <button onClick={nuevaConversacion} style={{
                padding: "10px 24px", background: "#C0392B", color: "#fff",
                border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer", fontWeight: "bold"
              }}>Iniciar conversación</button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ padding: "12px 20px", borderBottom: "0.5px solid #E2E8F0", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, background: "#1E3A5F", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: "bold", color: "#0F172A" }}>CupiTech</div>
                  <div style={{ fontSize: 11, color: "#22C55E" }}>● Asistente técnico Autotraffic</div>
                </div>
              </div>

              {/* Messages */}
              <div ref={mensajesRef} style={{ flex: 1, overflowY: "auto", padding: 20, background: "#F8FAFC", display: "flex", flexDirection: "column", gap: 14 }}>
                {mensajes.length === 0 && !loading && (
                  <div style={{ textAlign: "center", color: "#94A3B8", padding: 20, fontSize: 13 }}>
                    Escribe tu primera pregunta...
                  </div>
                )}
                {mensajes.map((m, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, flexDirection: m.rol === "user" ? "row-reverse" : "row", alignItems: "flex-start" }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                      background: m.rol === "user" ? "#C0392B" : "#1E3A5F",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: m.rol === "user" ? 11 : 14, color: "#fff", fontWeight: "bold"
                    }}>
                      {m.rol === "user" ? iniciales(usuario?.nombre) : "🤖"}
                    </div>
                    <div style={{
                      background: m.rol === "user" ? "#1E3A5F" : "#FFFFFF",
                      color: m.rol === "user" ? "#FFFFFF" : "#0F172A",
                      borderRadius: m.rol === "user" ? "12px 0 12px 12px" : "0 12px 12px 12px",
                      padding: "10px 14px", maxWidth: "75%",
                      border: m.rol === "assistant" ? "0.5px solid #E2E8F0" : "none",
                      fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap"
                    }}>
                      {m.contenido}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#1E3A5F", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🤖</div>
                    <div style={{ background: "#FFFFFF", border: "0.5px solid #E2E8F0", borderRadius: "0 12px 12px 12px", padding: "10px 14px", color: "#94A3B8", fontSize: 13 }}>
                      Pensando...
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div style={{ padding: 14, borderTop: "0.5px solid #E2E8F0", display: "flex", gap: 8 }}>
                <input
                  value={texto}
                  onChange={e => setTexto(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && enviar()}
                  placeholder="Escribe tu pregunta..."
                  disabled={loading}
                  style={{ flex: 1, padding: "10px 16px", borderRadius: 24, border: "1.5px solid #E2E8F0", fontSize: 13, outline: "none" }}
                />
                <button onClick={enviar} disabled={loading || !texto.trim()} style={{
                  width: 40, height: 40, background: loading ? "#94A3B8" : "#C0392B",
                  border: "none", borderRadius: "50%", cursor: "pointer", color: "#fff",
                  fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center"
                }}>➤</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


// ── Reportes Kizeo ────────────────────────────────────────
function Reportes({ token, proyectosUsuario }) {
  const [tipo, setTipo] = useState("correctivo");
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);
  const API = "http://localhost:8000";
  const headers = { "Authorization": `Bearer ${token}` };
  const PROYECTOS = [
    { id: "todos", label: "🌐 Todos" },
    { id: "PUEBLA", label: "Puebla" },
    { id: "QRO", label: "Querétaro" },
    { id: "EDOMEX", label: "Mexibús / Trolebús" },
    { id: "TLAXCALA", label: "Tlaxcala" },
    { id: "LEON", label: "León" },
  ];
  const [proyectoFiltro, setProyectoFiltro] = useState("todos");
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
  ];
  const TIPOS = [
    { id: "correctivo", label: "🔧 Correctivos" },
    { id: "preventivo", label: "🔵 Preventivos" },
    { id: "diagnostico", label: "🔍 Diagnósticos" },
  ];

  const ESTADO_COLOR = {
    "Terminado": { bg: "#DCFCE7", color: "#166534" },
    "received": { bg: "#DCFCE7", color: "#166534" },
    "Enviado": { bg: "#FEF9C3", color: "#854D0E" },
    "sent": { bg: "#FEF9C3", color: "#854D0E" },
  };

  useEffect(() => { cargar(); }, [tipo]);
  const reportesFiltrados = reportes
    .filter(r => proyectoFiltro === "todos" || r.proyecto_id === proyectoFiltro)
    .filter(r => mesFiltro === "todos" || (r.fecha_creacion && r.fecha_creacion.startsWith(mesFiltro)));

  async function cargar() {
    setLoading(true);
    setSeleccionado(null);
    try {
      const r = await fetch(`${API}/api/kizeo/${tipo}?limit=500`, { headers });
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0, color: "#1E3A5F", fontSize: 22 }}>📋 Reportes Kizeo</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {PROYECTOS.map(p => (
              <button key={p.id + p.label} onClick={() => setProyectoFiltro(p.id)} style={{
                padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12,
                background: proyectoFiltro === p.id ? "#C0392B" : "#F1F5F9",
                color: proyectoFiltro === p.id ? "#FFFFFF" : "#475569",
              }}>{p.label}</button>
            ))}
          </div>
          <select value={mesFiltro} onChange={e => setMesFiltro(e.target.value)} style={{ padding: "6px 10px", borderRadius: 8, border: "1.5px solid #E2E8F0", fontSize: 12, color: "#475569", cursor: "pointer", outline: "none" }}>
            {MESES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
          <div style={{ width: 1, height: 32, background: "#E2E8F0" }}></div>
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
        <div style={{ textAlign: "center", color: "#94A3B8", padding: 40 }}>Cargando reportes de Kizeo...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: seleccionado ? "1fr 1fr" : "1fr", gap: 16 }}>
          
          {/* Lista */}
          <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 13, color: "#64748B", marginBottom: 12 }}>{reportesFiltrados.length} reportes</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#F1F5F9" }}>
                  {["#", "Fecha", "UT", "Técnico", "Falla", "Tiempo", "Estado"].map((h, i) => (
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
                      <td style={{ padding: "7px 8px", color: "#475569" }}>{rep.tecnico?.split(" ")[0] || "--"}</td>
                      <td style={{ padding: "7px 8px", color: "#475569", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rep.falla || "--"}</td>
                      <td style={{ padding: "7px 8px", color: "#64748B" }}>{formatTiempo(rep.tiempo_resolucion_min)}</td>
                      <td style={{ padding: "7px 8px" }}>
                        <span style={{ background: est.bg, color: est.color, padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: "bold" }}>
                          {rep.estado === "received" ? "Terminado" : rep.estado || "--"}
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
                  ["📅 Fecha", seleccionado.fecha],
                  ["👷 Técnico", seleccionado.tecnico],
                  ["✅ Validador", seleccionado.validador],
                  ["🕐 Inicio", seleccionado.inicio],
                  ["🕓 Fin", seleccionado.fin],
                  ["⏱️ Tiempo", formatTiempo(seleccionado.tiempo_resolucion_min)],
                  ["📌 Vialidad", seleccionado.vialidad],
                ].map(([label, val], i) => (
                  <div key={i} style={{ background: "#F8FAFC", borderRadius: 8, padding: "8px 12px" }}>
                    <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: "bold", color: "#0F172A" }}>{val || "--"}</div>
                  </div>
                ))}
              </div>

              {seleccionado.falla && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: 12, marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: "#DC2626", fontWeight: "bold", marginBottom: 4 }}>🔴 FALLA / ACCIÓN REQUERIDA</div>
                  <div style={{ fontSize: 13, color: "#0F172A" }}>{seleccionado.falla}</div>
                </div>
              )}

              {seleccionado.componente && (
                <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, padding: 12, marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: "#166534", fontWeight: "bold", marginBottom: 4 }}>📦 COMPONENTE REEMPLAZADO</div>
                  <div style={{ fontSize: 13, color: "#0F172A" }}>{seleccionado.componente} {seleccionado.cantidad ? `(${seleccionado.cantidad})` : ""}</div>
                </div>
              )}

              {seleccionado.observaciones && seleccionado.observaciones !== "N/A" && (
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

// ── Power BI ──────────────────────────────────────────────
function BI() {
  const reportes = [
    { nombre: "Dashboard Mantenimiento", url: "https://app.powerbi.com/links/lyA8lD-bRI?ctid=d4b3c73a-7555-49a9-ab7e-e702f3f63d07&pbi_source=linkShare", icon: "🔧" },
  ];
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ margin: "0 0 20px", color: "#1E3A5F", fontSize: 22 }}>📊 Dashboards BI — Autotraffic</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {reportes.map((r, i) => (
          <div key={i} style={{ background: "#FFFFFF", borderRadius: 12, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{r.icon}</div>
            <div style={{ fontSize: 16, fontWeight: "bold", color: "#1E3A5F", marginBottom: 16 }}>{r.nombre}</div>
            <a href={r.url} target="_blank" rel="noreferrer" style={{
              display: "inline-block", padding: "10px 24px", background: "#C0392B", color: "#FFFFFF",
              borderRadius: 8, textDecoration: "none", fontWeight: "bold", fontSize: 14
            }}>Abrir en Power BI ↗</a>
          </div>
        ))}
      </div>
    </div>
  );
}


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

// ── App principal ─────────────────────────────────────────
function AppContent({ usuario, token, onLogout }) {
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
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [pRes, sRes, rRes] = await Promise.all([
        fetch(`${API}/api/proyectos`, { headers }),
        fetch(`${API}/api/solar`, { headers }),
        fetch(`${API}/api/reflectores`, { headers }),
      ]);
      setProyectos((await pRes.json()).proyectos || []);
      setSolar((await sRes.json()).equipos || []);
      setReflectores((await rRes.json()).reflectores || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ fontFamily: "Calibri, sans-serif", background: "#F1F5F9", minHeight: "100vh" }}>
      <NavBar hora={hora} usuario={usuario} onLogout={onLogout} />
      <Routes>
        <Route path="/" element={<Dashboard proyectos={proyectos} solar={solar} reflectores={reflectores} loading={loading} />} />
        <Route path="/alertas" element={<Alertas token={token} proyectosUsuario={usuario?.proyectos || []} />} />
        <Route path="/solar" element={<Solar solar={solar} loading={loading} />} />
        <Route path="/reflectores" element={<Reflectores reflectores={reflectores} loading={loading} />} />
        <Route path="/accesos" element={<Accesos token={token} proyectosUsuario={usuario?.proyectos || []} />} />
        <Route path="/inventario" element={<Inventario token={token} proyectosUsuario={usuario?.proyectos || []} />} />
        <Route path="/mapas" element={<Mapas token={token} proyectosUsuario={usuario?.proyectos || []} usuario={usuario} />} />
        <Route path="/chat" element={<Chat token={token} usuario={usuario} />} />
        <Route path="/reportes" element={<Reportes token={token} proyectosUsuario={usuario?.proyectos || []} />} />
        <Route path="/bi" element={<BI />} />
        <Route path="/ranking" element={<Ranking token={token} />} />
        <Route path="/ranking" element={<Ranking token={token} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <div style={{ textAlign: "center", color: "#94A3B8", fontSize: 12, padding: "16px 0" }}>
        CupiTech v1.0 — Autotraffic © 2026 · Actualización cada 60 seg
      </div>
    </div>
  );
}

function App() {
  const [usuario, setUsuario] = useState(() => {
    const saved = localStorage.getItem("cupitech_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("cupitech_token") || null);

  function handleLogin(data) {
    setUsuario(data);
    setToken(data.token);
  }

  function handleLogout() {
    localStorage.removeItem("cupitech_token");
    localStorage.removeItem("cupitech_user");
    setUsuario(null);
    setToken(null);
  }

  if (!usuario || !token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <AppContent usuario={usuario} token={token} onLogout={handleLogout} />
    </Router>
  );
}

export default App;
