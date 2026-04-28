import { useState, useEffect } from 'react';

const tituloStyle = { color: '#111827', marginBottom: '10px', borderBottom: '2px solid #E5E7EB', paddingBottom: '10px' };
const inputStyle = { padding: '12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '15px', width: '100%', outline: 'none', boxSizing: 'border-box' };

export default function BovedaCredenciales({ token }) {
  const [credenciales, setCredenciales] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  
  // Estados para el formulario
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState({ clienteId: '', titulo: '', url: '', usuario: '', password: '', notas: '' });
  
  // Estados para el buscador bonito
  const [busquedaClienteForm, setBusquedaClienteForm] = useState('');
  const [mostrarListaClientes, setMostrarListaClientes] = useState(false); // <-- Vuelve el estado visual

  // Estados de visualización
  const [verPassword, setVerPassword] = useState({});
  const [verPasswordForm, setVerPasswordForm] = useState(false);
  const [carpetasColapsadas, setCarpetasColapsadas] = useState({});
  const [modoPapelera, setModoPapelera] = useState(false);

  useEffect(() => {
    document.title = modoPapelera ? "InfraDesk: Papelera Bóveda" : "InfraDesk: Bóveda";
    if (token) cargarDatos();
  }, [token, modoPapelera]);

  const cargarDatos = async () => {
    try {
      const resClientes = await fetch('/api/customers', { headers: { 'Authorization': `Bearer ${token}` } });
      if (resClientes.ok) {
        const datosClientes = await resClientes.json();
        // Orden alfabético estricto asegurado
        const ordenados = datosClientes.sort((a, b) => a.nombreEmpresa.localeCompare(b.nombreEmpresa, 'es', { sensitivity: 'base' }));
        setClientes(ordenados);
      }

      const endpoint = modoPapelera ? '/api/credentials/papelera' : '/api/credentials';
      const resCreds = await fetch(endpoint, { headers: { 'Authorization': `Bearer ${token}` } });
      if (resCreds.ok) {
        setCredenciales(await resCreds.json());
      }
    } catch (error) {
      console.error("Error al cargar datos");
    }
  };

  const resetForm = () => {
    setForm({ clienteId: '', titulo: '', url: '', usuario: '', password: '', notas: '' });
    setBusquedaClienteForm('');
    setEditandoId(null);
    setMostrarForm(false);
    setVerPasswordForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.clienteId) {
      alert("Por favor, selecciona un cliente válido de la lista.");
      return;
    }
    try {
      const urlFetch = editandoId ? `/api/credentials/${editandoId}` : '/api/credentials';
      const method = editandoId ? 'PUT' : 'POST';
      const res = await fetch(urlFetch, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        resetForm();
        cargarDatos();
      }
    } catch (error) { console.error("Error guardando"); }
  };

  const handleEditar = (cred) => {
    setForm({
      clienteId: cred.clienteId._id, titulo: cred.titulo, url: cred.url || '',
      usuario: cred.usuario, password: cred.password, notas: cred.notas || ''
    });
    setBusquedaClienteForm(cred.clienteId.nombreEmpresa);
    setEditandoId(cred._id);
    setMostrarForm(true);
    setVerPasswordForm(true);
    setCarpetasColapsadas(prev => ({ ...prev, [cred.clienteId._id]: false }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Mover esta credencial a la papelera?")) return;
    try {
      await fetch(`/api/credentials/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      cargarDatos();
    } catch (error) { console.error("Error al eliminar"); }
  };

  const handleRestaurar = async (id) => {
    try {
      await fetch(`/api/credentials/${id}/restaurar`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
      cargarDatos();
    } catch (error) { console.error("Error al restaurar"); }
  };

  const handleDestruir = async (id) => {
    if (!window.confirm("⚠️ ¿Destruir PERMANENTEMENTE?")) return;
    try {
      await fetch(`/api/credentials/${id}/destruir`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      cargarDatos();
    } catch (error) { console.error("Error al destruir"); }
  };

  const togglePassword = (id) => setVerPassword(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleCarpeta = (clienteId) => setCarpetasColapsadas(prev => ({ ...prev, [clienteId]: !prev[clienteId] }));

  const credsFiltradas = credenciales.filter(c => 
    c.titulo.toLowerCase().includes(busqueda.toLowerCase()) || 
    c.url.toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.clienteId && c.clienteId.nombreEmpresa.toLowerCase().includes(busqueda.toLowerCase()))
  );

  // Filtrado para la lista visual bonita
  const clientesSugeridos = clientes.filter(c => 
    c.nombreEmpresa.toLowerCase().includes(busquedaClienteForm.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{...tituloStyle, margin: 0, border: 'none'}}>
          {modoPapelera ? '🗑️ Papelera Bóveda' : '🔐 Bóveda de Credenciales'}
        </h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => { setModoPapelera(!modoPapelera); setMostrarForm(false); setBusqueda(''); }}
            style={{ background: modoPapelera ? '#374151' : '#E53E3E', color: 'white', padding: '10px 15px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {modoPapelera ? '🔙 Volver a Bóveda' : '🗑️ Ver Papelera'}
          </button>
          {!modoPapelera && (
            <button 
              onClick={() => { if (mostrarForm) resetForm(); else setMostrarForm(true); }}
              style={{ background: mostrarForm ? '#4B5563' : '#00D1A0', color: 'white', padding: '10px 15px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {mostrarForm ? 'Cancelar' : '➕ Nueva Credencial'}
            </button>
          )}
        </div>
      </div>
      <div style={{ height: '2px', background: '#E5E7EB', width: '100%', marginBottom: '10px', marginTop: '10px' }}></div>

      {mostrarForm && !modoPapelera && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #E5E7EB', marginBottom: '20px', marginTop: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0, color: '#374151', borderBottom: '1px solid #E5E7EB', paddingBottom: '10px' }}>
            {editandoId ? '✏️ Editar Credencial' : '➕ Añadir Nueva Credencial'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
            
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              
              {/* 👇 EL BUSCADOR BONITO (SIN BLOQUEOS) */}
              <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
                <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>📁 Cliente (Carpeta)</label>
                <input 
                  type="text"
                  placeholder="Escribe o selecciona un cliente..."
                  style={inputStyle}
                  value={busquedaClienteForm}
                  onChange={(e) => {
                    setBusquedaClienteForm(e.target.value);
                    setMostrarListaClientes(true);
                    if (e.target.value === '') setForm({...form, clienteId: ''});
                  }}
                  onFocus={() => setMostrarListaClientes(true)}
                  // El setTimeout permite que el clic en la lista se registre antes de cerrarla
                  onBlur={() => setTimeout(() => setMostrarListaClientes(false), 200)}
                />
                
                {mostrarListaClientes && (
                  <div style={{ 
                    position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', 
                    border: '1px solid #E5E7EB', borderRadius: '6px', zIndex: 1000, 
                    maxHeight: '200px', overflowY: 'auto', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                  }}>
                    {clientesSugeridos.length > 0 ? (
                      clientesSugeridos.map(c => (
                        <div 
                          key={c._id} 
                          onClick={() => {
                            setForm({...form, clienteId: c._id});
                            setBusquedaClienteForm(c.nombreEmpresa);
                            setMostrarListaClientes(false);
                          }}
                          style={{ padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid #F3F4F6', fontSize: '14px', background: form.clienteId === c._id ? '#E0FFF9' : 'white', color: '#374151', transition: 'background 0.2s' }}
                          onMouseEnter={(e) => e.target.style.background = '#F3F4F6'}
                          onMouseLeave={(e) => e.target.style.background = form.clienteId === c._id ? '#E0FFF9' : 'white'}
                        >
                          {c.nombreEmpresa}
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '10px 15px', color: '#9CA3AF', fontSize: '14px' }}>No se encontraron coincidencias</div>
                    )}
                  </div>
                )}
                {!form.clienteId && busquedaClienteForm && !mostrarListaClientes && (
                  <span style={{ color: '#E53E3E', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    ⚠️ Selecciona un cliente de la lista
                  </span>
                )}
              </div>

              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Título</label>
                <input type="text" required placeholder="ej: Router Principal" style={inputStyle} value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} />
              </div>
              
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>URL (Opcional)</label>
                <input type="url" placeholder="https://..." style={inputStyle} value={form.url} onChange={e => setForm({...form, url: e.target.value})} />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Usuario</label>
                <input type="text" required placeholder="admin" style={inputStyle} value={form.usuario} onChange={e => setForm({...form, usuario: e.target.value})} />
              </div>
              <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Contraseña</label>
                <input type={verPasswordForm ? "text" : "password"} required placeholder="••••••" style={{...inputStyle, paddingRight: '40px'}} value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                <button type="button" onClick={() => setVerPasswordForm(!verPasswordForm)} style={{ position: 'absolute', right: '10px', bottom: '10px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
                  {verPasswordForm ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Notas (Opcional)</label>
              <input type="text" placeholder="IP: 192.168.1.1..." style={inputStyle} value={form.notas} onChange={e => setForm({...form, notas: e.target.value})} />
            </div>

            <button type="submit" style={{ background: '#111827', color: 'white', padding: '12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
              {editandoId ? '💾 Guardar Cambios' : '💾 Guardar Credencial'}
            </button>
          </form>
        </div>
      )}

      {/* Buscador de la lista principal */}
      <input 
        type="text" 
        placeholder="🔍 Buscar por título, cliente o URL..." 
        value={busqueda} 
        onChange={(e) => setBusqueda(e.target.value)} 
        style={{ ...inputStyle, maxWidth: '400px', border: '2px solid #00D1A0', marginTop: '15px', marginBottom: '20px' }} 
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {clientes.map(cliente => {
          const credsDelCliente = credsFiltradas.filter(c => c.clienteId && c.clienteId._id === cliente._id);
          if (credsDelCliente.length === 0) return null;
          const estaColapsada = carpetasColapsadas[cliente._id];

          return (
            <div key={cliente._id} style={{ background: modoPapelera ? '#FEF2F2' : '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '15px' }}>
              <div onClick={() => toggleCarpeta(cliente._id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}>
                <h3 style={{ margin: 0, color: '#374151', fontSize: '18px' }}>
                  📁 {cliente.nombreEmpresa} <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: 'normal', marginLeft: '8px' }}>({credsDelCliente.length})</span>
                </h3>
                <span style={{ fontSize: '16px', color: '#6B7280' }}>{estaColapsada ? '▶️' : '▼'}</span>
              </div>
              {!estaColapsada && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px', borderTop: '1px solid #D1D5DB', paddingTop: '15px' }}>
                  {credsDelCliente.map(cred => (
                    <div key={cred._id} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', background: 'white', border: '1px solid #E5E7EB', padding: '12px', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, minWidth: '250px' }}>
                        <strong style={{ color: modoPapelera ? '#991B1B' : '#111827' }}>{cred.titulo}</strong>
                        {cred.url && <a href={cred.url} target="_blank" rel="noreferrer" style={{ color: '#00D1A0', fontSize: '14px' }}>{cred.url}</a>}
                        {cred.notas && <span style={{ color: '#6B7280', fontSize: '13px' }}>📝 {cred.notas}</span>}
                      </div>
                      <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: '#F3F4F6', padding: '8px 15px', borderRadius: '6px' }}>
                        <span style={{ color: '#4B5563', fontSize: '14px' }}>👤 {cred.usuario}</span>
                        <span style={{ color: '#4B5563', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          🔑 {verPassword[cred._id] ? cred.password : '••••••••'}
                          <button onClick={() => togglePassword(cred._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
                            {verPassword[cred._id] ? '🙈' : '👁️'}
                          </button>
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginLeft: '15px', gap: '10px' }}>
                        {modoPapelera ? (
                          <>
                            <button onClick={() => handleRestaurar(cred._id)} style={{ background: 'transparent', color: '#10B981', border: 'none', cursor: 'pointer', fontSize: '18px' }} title="Restaurar">♻️</button>
                            <button onClick={() => handleDestruir(cred._id)} style={{ background: 'transparent', color: '#DC2626', border: 'none', cursor: 'pointer', fontSize: '18px' }} title="Eliminar Permanente">🔥</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEditar(cred)} style={{ background: 'transparent', color: '#3B82F6', border: 'none', cursor: 'pointer', fontSize: '18px' }} title="Editar">✏️</button>
                            <button onClick={() => handleEliminar(cred._id)} style={{ background: 'transparent', color: '#E53E3E', border: 'none', cursor: 'pointer', fontSize: '18px' }} title="Papelera">🗑️</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}