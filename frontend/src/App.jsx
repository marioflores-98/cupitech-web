import { useState, useEffect } from "react";
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
