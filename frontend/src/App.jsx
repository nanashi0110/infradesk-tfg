import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate, useParams } from 'react-router-dom';

// --- IMPORTAMOS LAS PANTALLAS DE SEGURIDAD ---
import Login from './Login';
import Registro from './Registro';

// ==========================================
// 📄 PANTALLAS (El contenido de la derecha)
// ==========================================

function Inicio() {
  return (
    <div>
      <h1 style={tituloStyle}>🏠 Dashboard</h1>
      <p style={textoStyle}>Bienvenido de vuelta, aquí está el resumen del día</p>
    </div>
  );
}

function NuevoCliente({ token }) {
  const [cliente, setCliente] = useState({ nombreEmpresa: '', personaContacto: '', telefono: '', email: '' });
  const navegar = useNavigate();

  const handleChange = (e) => setCliente({ ...cliente, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await fetch('/api/customers', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(cliente),
      });

      if (respuesta.ok) {
        alert('✅ Cliente guardado con éxito');
        navegar('/clientes'); 
      } else {
        alert('Error al guardar: No tienes permisos o la sesión caducó');
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <h2 style={tituloStyle}>🏢 Alta de Nuevo Cliente</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '400px', gap: '15px', marginTop: '20px' }}>
        <input type="text" name="nombreEmpresa" placeholder="Nombre de Empresa" onChange={handleChange} required style={inputStyle} />
        <input type="text" name="personaContacto" placeholder="Persona de Contacto" onChange={handleChange} style={inputStyle} />
        <input type="text" name="telefono" placeholder="Teléfono" onChange={handleChange} style={inputStyle} />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} style={inputStyle} />
        <button type="submit" style={botonAccion}>Guardar Cliente</button>
      </form>
    </div>
  );
}

function ListaClientes({ token }) {
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    const obtenerClientes = async () => {
      try {
        const respuesta = await fetch('/api/customers', {
          headers: {
            'Authorization': `Bearer ${token}` 
          }
        });
        
        if (respuesta.ok) {
          const datos = await respuesta.json();
          setClientes(datos);
        } else {
          console.error("No autorizado para ver clientes");
        }
      } catch (error) {
        console.error("Error de conexión");
      }
    };
    
    if (token) obtenerClientes();
  }, [token]);

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`⚠️ ¿Estás seguro de que quieres eliminar al cliente "${nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const respuesta = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}` 
        }
      });

      if (respuesta.ok) {
        setClientes(clientes.filter(cliente => cliente._id !== id));
      } else {
        alert("Error al eliminar el cliente");
      }
    } catch (error) {
      console.error("Error de conexión al eliminar", error);
    }
  };

  return (
    <div>
      <h2 style={tituloStyle}>📋 Base de Datos de Clientes</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        {clientes.length === 0 ? <p style={textoStyle}>Cargando o no hay clientes...</p> : null}
        
        {clientes.map((cli) => (
          <div key={cli._id} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            border: '1px solid #E5E7EB', 
            padding: '15px 20px', 
            borderRadius: '8px', 
            background: 'white', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', flex: 1 }}>
              <h3 style={{ margin: 0, color: '#111827', fontSize: '18px', minWidth: '220px' }}>{cli.nombreEmpresa}</h3>
              <span style={{ fontSize: '15px', color: '#4B5563', minWidth: '150px' }}>👤 {cli.personaContacto}</span>
              <span style={{ fontSize: '15px', color: '#4B5563', minWidth: '120px' }}>📞 {cli.telefono}</span>
              <span style={{ fontSize: '15px', color: '#4B5563' }}>✉️ {cli.email}</span>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginLeft: '20px' }}>
              <Link 
                to={`/ficha/${cli._id}`}
                style={{ background: '#3182CE', color: 'white', textDecoration: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Abrir ficha completa"
              >
                ✏️
              </Link>
              
              <button 
                onClick={() => handleEliminar(cli._id, cli.nombreEmpresa)}
                style={{ background: '#E53E3E', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Eliminar cliente"
              >
                🗑️
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

// NUEVO: Componente temporal de la Ficha del Cliente
function FichaCliente({ token }) {
  const { id } = useParams();
  const [editando, setEditando] = useState(false);
  
  // Estado inicial con campos extendidos (Sin el estado del equipo)
  const [cliente, setCliente] = useState({
    nombreEmpresa: '',
    cif: '',
    direccion: '',
    localidad: '',
    cp: '',
    contactos: [{ nombre: '', cargo: '', movil: '' }],
    emails: [''],
    equipos: [{ modelo: '', numSerie: '' }] // <-- QUitado el estado aquí
  });

  // Simulación de carga de datos
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const res = await fetch(`/api/customers/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const datos = await res.json();
        if (res.ok) {
          setCliente(prev => ({ ...prev, ...datos }));
        }
      } catch (error) { console.error("Error al cargar ficha", error); }
    };
    cargarDatos();
  }, [id, token]);

  // --- LÓGICA PARA CAMPOS DINÁMICOS ---
  
  const manejarEmail = (index, valor) => {
    const nuevosEmails = [...cliente.emails];
    nuevosEmails[index] = valor;
    setCliente({...cliente, emails: nuevosEmails});
  };

  const añadirEmail = () => setCliente({...cliente, emails: [...cliente.emails, '']});

  const manejarContacto = (index, campo, valor) => {
    const nuevosContactos = [...cliente.contactos];
    nuevosContactos[index][campo] = valor;
    setCliente({...cliente, contactos: nuevosContactos});
  };

  const añadirContacto = () => setCliente({...cliente, contactos: [...cliente.contactos, { nombre: '', cargo: '', movil: '' }]});

  const manejarEquipo = (index, campo, valor) => {
    const nuevosEquipos = [...cliente.equipos];
    nuevosEquipos[index][campo] = valor;
    setCliente({...cliente, equipos: nuevosEquipos});
  };

  // <-- Quitado el estado de la función de añadir
  const añadirEquipo = () => setCliente({...cliente, equipos: [...cliente.equipos, { modelo: '', numSerie: '' }]});

  // ✅ NUEVO: Función para Guardar en la Base de Datos
  const guardarFicha = async () => {
    // Extraemos los campos intocables de Mongo y enviamos solo el resto (datosLimpios)
    const { _id, createdAt, updatedAt, __v, ...datosLimpios } = cliente;

    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(datosLimpios) 
      });

      if (res.ok) {
        alert('✅ Ficha actualizada correctamente');
        setEditando(false); 
      } else {
        alert('❌ Error al guardar los cambios en la base de datos');
      }
    } catch (error) {
      console.error("Error al guardar", error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={tituloStyle}>📑 Ficha Técnica: {cliente.nombreEmpresa}</h2>
        <button 
          onClick={() => editando ? guardarFicha() : setEditando(true)}
          style={{ ...botonAccion, background: editando ? '#4A5568' : '#3182CE', width: 'auto', padding: '10px 20px' }}
        >
          {editando ? '💾 Guardar Cambios' : '📝 Editar Ficha'}
        </button>
      </div>

      {/* SECCIÓN 1: DATOS FISCALES */}
      <div style={seccionFicha}>
        <h3 style={subtituloFicha}>🏢 Datos de Empresa / Fiscales</h3>
        <div style={gridFicha}>
          <div>
            <label style={labelFicha}>CIF / NIF:</label>
            <input type="text" value={cliente.cif || ''} disabled={!editando} onChange={(e) => setCliente({...cliente, cif: e.target.value})} style={inputFicha} />
          </div>
          <div>
            <label style={labelFicha}>Dirección Completa:</label>
            <input type="text" value={cliente.direccion || ''} disabled={!editando} onChange={(e) => setCliente({...cliente, direccion: e.target.value})} style={inputFicha} />
          </div>
          <div>
            <label style={labelFicha}>Localidad:</label>
            <input type="text" value={cliente.localidad || ''} disabled={!editando} onChange={(e) => setCliente({...cliente, localidad: e.target.value})} style={inputFicha} />
          </div>
          <div>
            <label style={labelFicha}>Código Postal:</label>
            <input type="text" value={cliente.cp || ''} disabled={!editando} onChange={(e) => setCliente({...cliente, cp: e.target.value})} style={inputFicha} />
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: CORREOS (DINÁMICO) */}
      <div style={seccionFicha}>
        <h3 style={subtituloFicha}>✉️ Agenda de Correos</h3>
        {cliente.emails.map((email, idx) => (
          <input key={idx} type="email" value={email || ''} disabled={!editando} onChange={(e) => manejarEmail(idx, e.target.value)} style={{ ...inputFicha, marginBottom: '10px' }} placeholder="correo@ejemplo.com" />
        ))}
        {editando && <button onClick={añadirEmail} style={botonPequeño}>+ Añadir otro correo</button>}
      </div>

      {/* SECCIÓN 3: PERSONAS DE CONTACTO (DINÁMICO) */}
      <div style={seccionFicha}>
        <h3 style={subtituloFicha}>👥 Personas de Contacto</h3>
        {cliente.contactos.map((cont, idx) => (
          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '15px', padding: '10px', background: '#F9FAFB', borderRadius: '8px' }}>
            <input type="text" placeholder="Nombre" value={cont.nombre || ''} disabled={!editando} onChange={(e) => manejarContacto(idx, 'nombre', e.target.value)} style={inputFicha} />
            <input type="text" placeholder="Cargo" value={cont.cargo || ''} disabled={!editando} onChange={(e) => manejarContacto(idx, 'cargo', e.target.value)} style={inputFicha} />
            <input type="text" placeholder="Móvil" value={cont.movil || ''} disabled={!editando} onChange={(e) => manejarContacto(idx, 'movil', e.target.value)} style={inputFicha} />
          </div>
        ))}
        {editando && <button onClick={añadirContacto} style={botonPequeño}>+ Añadir contacto</button>}
      </div>

      {/* SECCIÓN 4: EQUIPOS INSTALADOS (DINÁMICO) */}
      <div style={seccionFicha}>
        <h3 style={subtituloFicha}>🛠️ Equipos e Instalaciones</h3>
        {cliente.equipos.map((eq, idx) => (
          // <-- CAMBIO: Cambiado el gridTemplateColumns a '1fr 1fr' para que solo haya dos columnas
          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <input type="text" placeholder="Modelo Equipo" value={eq.modelo || ''} disabled={!editando} onChange={(e) => manejarEquipo(idx, 'modelo', e.target.value)} style={inputFicha} />
            <input type="text" placeholder="Nº Serie" value={eq.numSerie || ''} disabled={!editando} onChange={(e) => manejarEquipo(idx, 'numSerie', e.target.value)} style={inputFicha} />
          </div>
        ))}
        {editando && <button onClick={añadirEquipo} style={botonPequeño}>+ Registrar equipo</button>}
      </div>
    </div>
  );
}

// --- ESTILOS NUEVOS PARA LA FICHA ---
const seccionFicha = { background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '20px' };
const subtituloFicha = { fontSize: '18px', color: '#1A202C', marginBottom: '15px', borderLeft: '4px solid #00D1A0', paddingLeft: '10px' };
const gridFicha = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };
const labelFicha = { display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: '#4B5563' };
const inputFicha = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', boxSizing: 'border-box' };
const botonPequeño = { padding: '8px 12px', background: '#E2E8F0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' };

// ==========================================
// 🔀 LAYOUT PRINCIPAL (Sidebar + Contenido)
// ==========================================

function App() {
  const [esMovil, setEsMovil] = useState(window.innerWidth <= 768);
  const [menuAbierto, setMenuAbierto] = useState(window.innerWidth > 768);
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  useEffect(() => {
    const handleResize = () => {
      const movil = window.innerWidth <= 768;
      setEsMovil(movil);
      if (movil) setMenuAbierto(false); 
      else setMenuAbierto(true); 
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cerrarSiEsMovil = () => {
    if (esMovil) setMenuAbierto(false);
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem('token');
    setToken('');
  };

  return (
    <BrowserRouter>
      {!token ? (
        <Routes>
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      ) : (
        <div style={{ display: 'flex', width: '100vw', height: '100dvh', fontFamily: 'sans-serif', overflow: 'hidden', position: 'relative' }}>
          
          <div style={{ 
            width: menuAbierto ? '260px' : (esMovil ? '0px' : '70px'), 
            background: '#0D1117', 
            color: 'white',
            transition: 'width 0.3s ease', 
            display: 'flex', 
            flexDirection: 'column',
            boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
            zIndex: 100, 
            position: esMovil ? 'absolute' : 'relative', 
            height: '100%',
            overflowX: 'hidden', 
            whiteSpace: 'nowrap'
          }}>
            
            <div style={{ padding: '20px', background: '#1A202C', display: 'flex', justifyContent: menuAbierto ? 'space-between' : 'center', alignItems: 'center', flexShrink: 0 }}>
              {menuAbierto && <span style={{ fontWeight: 'bold', fontSize: '18px' }}>Dashboard</span>}
              <button onClick={() => setMenuAbierto(!menuAbierto)} style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontSize: '20px' }}>
                {menuAbierto ? '◀' : '▶'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', padding: '15px', gap: '10px', marginTop: '10px', alignItems: menuAbierto ? 'stretch' : 'center', flex: 1, overflowY: 'auto' }}>
              <Link to="/" onClick={cerrarSiEsMovil} style={linkStyle}>{menuAbierto ? '🏠 Inicio' : '🏠'}</Link>
              <Link to="/clientes" onClick={cerrarSiEsMovil} style={linkStyle}>{menuAbierto ? '📋 Clientes' : '📋'}</Link>
              <Link to="/nuevo-cliente" onClick={cerrarSiEsMovil} style={linkStyle}>{menuAbierto ? '➕ Nuevo Cliente' : '➕'}</Link>
              
              <div style={{ height: '1px', background: '#2D3748', margin: '10px 0', flexShrink: 0 }}></div>
              <Link to="/registro" onClick={cerrarSiEsMovil} style={{...linkStyle, color: '#A0AEC0'}}>
                {menuAbierto ? '👥 Añadir Usuario' : '👥'}
              </Link>
            </div>

            <div style={{ padding: '15px', borderTop: '1px solid #2D3748', flexShrink: 0 }}>
              <button onClick={handleCerrarSesion} style={{ width: '100%', padding: '10px', background: '#E53E3E', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center' }}>
                {menuAbierto ? 'Cerrar Sesión' : '🚪'}
              </button>
            </div>
          </div>

          <div style={{ flex: 1, padding: esMovil ? '20px' : '50px', background: '#F3F4F6', overflowY: 'auto', width: '100%' }}>
            {esMovil && !menuAbierto && (
              <button onClick={() => setMenuAbierto(true)} style={{ padding: '10px 15px', marginBottom: '20px', background: '#0D1117', color: 'white', border: 'none', borderRadius: '5px', fontSize: '18px', cursor: 'pointer' }}>
                ☰ Menú
              </button>
            )}

            <Routes>
              <Route path="/" element={<Inicio />} />
              <Route path="/clientes" element={<ListaClientes token={token} />} />
              <Route path="/nuevo-cliente" element={<NuevoCliente token={token} />} />
              <Route path="/registro" element={<Registro token={token} />} /> 
              
              <Route path="/ficha/:id" element={<FichaCliente token={token} />} />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>

          {esMovil && menuAbierto && (
            <div onClick={() => setMenuAbierto(false)} style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100dvh', background: 'rgba(0,0,0,0.5)', zIndex: 90 }} />
          )}

        </div>
      )}
    </BrowserRouter>
  );
}

// --- Estilos Globales para Componentes ---
const tituloStyle = { color: '#111827', marginBottom: '10px', borderBottom: '2px solid #E5E7EB', paddingBottom: '10px' };
const textoStyle = { color: '#4B5563', fontSize: '16px' };
const linkStyle = { color: '#E5E7EB', textDecoration: 'none', fontWeight: '500', fontSize: '16px', display: 'block', padding: '12px', borderRadius: '6px', transition: 'background 0.2s' };
const inputStyle = { padding: '12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '15px', width: '100%', outline: 'none' };
const botonAccion = { padding: '12px', background: '#00D1A0', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px', boxShadow: '0 2px 4px rgba(0,209,160,0.3)' };

export default App;