import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const tituloStyle = { color: '#111827', marginBottom: '10px', borderBottom: '2px solid #E5E7EB', paddingBottom: '10px' };
const textoStyle = { color: '#4B5563', fontSize: '16px' };
const inputStyle = { padding: '12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '15px', width: '100%', outline: 'none', boxSizing: 'border-box' };
const botonAccion = { padding: '12px', background: '#00D1A0', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 2px 4px rgba(0,209,160,0.3)' };

export default function ListaClientes({ token }) {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  
  // Estados para el Modal de Nuevo Cliente
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({ nombreEmpresa: '', personaContacto: '', telefono: '', email: '' });
  
  useEffect(() => {
    document.title = "InfraDesk: Clientes";
    if (token) obtenerClientes();
  }, [token]);

  // Sacamos la función fuera del useEffect para poder llamarla cuando queramos actualizar la lista
  const obtenerClientes = async () => {
    try {
      const respuesta = await fetch('/api/customers', { headers: { 'Authorization': `Bearer ${token}` } });
      if (respuesta.ok) {
        const datos = await respuesta.json();
        const clientesOrdenados = datos.sort((a, b) => a.nombreEmpresa.localeCompare(b.nombreEmpresa));
        setClientes(clientesOrdenados);
      } else {
        console.error("No autorizado para ver clientes");
      }
    } catch (error) {
      console.error("Error de conexión");
    }
  };

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`⚠️ ¿Estás seguro de que quieres eliminar al cliente "${nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      const respuesta = await fetch(`/api/customers/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (respuesta.ok) {
        setClientes(clientes.filter(cliente => cliente._id !== id));
      } else {
        alert("Error al eliminar el cliente");
      }
    } catch (error) { console.error("Error de conexión al eliminar", error); }
  };

  // Funciones del Modal
  const handleCambioModal = (e) => setNuevoCliente({ ...nuevoCliente, [e.target.name]: e.target.value });

  const handleGuardarCliente = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(nuevoCliente),
      });

      if (respuesta.ok) {
        // 1. Mensaje de éxito
        alert('✅ Cliente guardado con éxito');
        
        // 2. Limpiar el formulario y cerrar el modal inmediatamente
        setNuevoCliente({ nombreEmpresa: '', personaContacto: '', telefono: '', email: '' }); 
        setMostrarModal(false);
        
        // 3. Volver a pedir a la BD la lista para que se actualice la pantalla visualmente
        obtenerClientes(); 
      } else {
        alert('Error al guardar: No tienes permisos o la sesión caducó');
      }
    } catch (error) { 
      console.error("Error:", error); 
      alert('Error de red al intentar guardar');
    }
  };

  const clientesFiltrados = clientes.filter((cli) => 
    cli.nombreEmpresa.toLowerCase().includes(busqueda.toLowerCase()) || 
    (cli.personaContacto && cli.personaContacto.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{...tituloStyle, margin: 0, border: 'none'}}>📋 Base de Datos de Clientes</h2>
        <button 
          onClick={() => setMostrarModal(true)}
          style={{ ...botonAccion, display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          ➕ Nuevo Cliente
        </button>
      </div>
      <div style={{ height: '2px', background: '#E5E7EB', width: '100%', marginBottom: '15px', marginTop: '10px' }}></div>
      
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="🔍 Buscar por empresa o contacto..." 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ ...inputStyle, maxWidth: '400px', border: '2px solid #00D1A0' }}
        />
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {clientes.length === 0 ? <p style={textoStyle}>Cargando o no hay clientes...</p> : null}
        {clientes.length > 0 && clientesFiltrados.length === 0 ? <p style={{ color: '#E53E3E', fontWeight: 'bold' }}>No se ha encontrado ningún cliente.</p> : null}
        
        {clientesFiltrados.map((cli) => (
          <div key={cli._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #E5E7EB', padding: '15px 20px', borderRadius: '8px', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', flex: 1 }}>
              <h3 style={{ margin: 0, color: '#111827', fontSize: '18px', minWidth: '220px' }}>{cli.nombreEmpresa}</h3>
              <span style={{ fontSize: '15px', color: '#4B5563', minWidth: '150px' }}>👤 {cli.personaContacto}</span>
              <span style={{ fontSize: '15px', color: '#4B5563', minWidth: '120px' }}>📞 {cli.telefono}</span>
              <span style={{ fontSize: '15px', color: '#4B5563' }}>✉️ {cli.email}</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginLeft: '20px' }}>
              <Link to={`/ficha/${cli._id}`} style={{ background: '#00D1A0', color: 'white', textDecoration: 'none', padding: '10px 15px', borderRadius: '5px', fontSize: '16px', display: 'flex', alignItems: 'center' }} title="Abrir ficha">✏️</Link>
              <button onClick={() => handleEliminar(cli._id, cli.nombreEmpresa)} style={{ background: '#4B5563', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center' }} title="Eliminar">🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {mostrarModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', position: 'relative' }}>
            <button 
              onClick={() => {
                setMostrarModal(false);
                setNuevoCliente({ nombreEmpresa: '', personaContacto: '', telefono: '', email: '' });
              }}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6B7280' }}
            >
              ✖
            </button>
            <h3 style={{ margin: '0 0 20px 0', color: '#111827', borderBottom: '1px solid #E5E7EB', paddingBottom: '10px' }}>🏢 Alta de Nuevo Cliente</h3>
            <form onSubmit={handleGuardarCliente} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input type="text" name="nombreEmpresa" placeholder="Nombre de Empresa" value={nuevoCliente.nombreEmpresa} onChange={handleCambioModal} required style={inputStyle} />
              <input type="text" name="personaContacto" placeholder="Persona de Contacto" value={nuevoCliente.personaContacto} onChange={handleCambioModal} style={inputStyle} />
              <input type="text" name="telefono" placeholder="Teléfono" value={nuevoCliente.telefono} onChange={handleCambioModal} style={inputStyle} />
              <input type="email" name="email" placeholder="Email" value={nuevoCliente.email} onChange={handleCambioModal} style={inputStyle} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => { setMostrarModal(false); setNuevoCliente({ nombreEmpresa: '', personaContacto: '', telefono: '', email: '' }); }} style={{ flex: 1, padding: '12px', background: '#F3F4F6', color: '#4B5563', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>
                <button type="submit" style={{ ...botonAccion, flex: 2, marginTop: 0 }}>Guardar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}