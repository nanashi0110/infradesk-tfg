import { useState, useEffect } from 'react';

const tituloStyle = { color: '#111827', marginBottom: '10px', borderBottom: '2px solid #E5E7EB', paddingBottom: '10px' };
const inputStyle = { padding: '12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '15px', width: '100%', outline: 'none', boxSizing: 'border-box' };
const botonAccion = { padding: '12px', background: '#00D1A0', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 2px 4px rgba(0,209,160,0.3)' };

export default function GestionUsuarios({ token }) {
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  
  const [form, setForm] = useState({ nombre: '', usuario: '', password: '' });
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  useEffect(() => {
    document.title = "InfraDesk: Usuarios";
    if (token) cargarUsuarios();
  }, [token]);

  const cargarUsuarios = async () => {
    try {
      const res = await fetch('/api/auth/usuarios', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setUsuarios(await res.json());
    } catch (error) { console.error("Error al cargar usuarios"); }
  };

  const handleCambioForm = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const abrirCrear = () => {
    setEditandoId(null);
    setForm({ nombre: '', usuario: '', password: '' });
    setMensaje({ texto: '', tipo: '' });
    setMostrarModal(true);
  };

  const abrirEditar = (user) => {
    setEditandoId(user._id);
    setForm({ nombre: user.nombre, usuario: user.usuario, password: '' }); // Password vacío por seguridad
    setMensaje({ texto: '', tipo: '' });
    setMostrarModal(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setMensaje({ texto: '', tipo: '' });

    try {
      const url = editandoId ? `/api/auth/usuarios/${editandoId}` : '/api/auth/registro';
      const method = editandoId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const datos = await res.json();

      if (res.ok) {
        setMostrarModal(false);
        cargarUsuarios();
        alert(editandoId ? '✅ Usuario actualizado' : '✅ Usuario creado');
      } else {
        setMensaje({ texto: datos.mensaje || 'Error al guardar', tipo: 'error' });
      }
    } catch (err) { setMensaje({ texto: 'Error de conexión', tipo: 'error' }); }
  };

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`⚠️ ¿Estás seguro de eliminar a ${nombre}? Perderá el acceso al sistema.`)) return;
    try {
      const res = await fetch(`/api/auth/usuarios/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) cargarUsuarios();
      else alert("No puedes eliminar este usuario");
    } catch (error) { console.error("Error eliminando"); }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{...tituloStyle, margin: 0, border: 'none'}}>👥 Panel de Administradores</h2>
        <button onClick={abrirCrear} style={{ ...botonAccion, display: 'flex', alignItems: 'center', gap: '8px' }}>
          ➕ Nuevo Usuario
        </button>
      </div>
      <div style={{ height: '2px', background: '#E5E7EB', width: '100%', marginBottom: '20px', marginTop: '10px' }}></div>

      {/* LISTA DE USUARIOS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {usuarios.map((user) => (
          <div key={user._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #E5E7EB', padding: '15px 20px', borderRadius: '8px', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', flex: 1 }}>
              <h3 style={{ margin: 0, color: '#111827', fontSize: '18px', minWidth: '200px' }}>{user.nombre}</h3>
              <span style={{ fontSize: '15px', color: '#4B5563', background: '#F3F4F6', padding: '5px 10px', borderRadius: '6px' }}>
                🔑 @{user.usuario}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginLeft: '20px' }}>
              <button onClick={() => abrirEditar(user)} style={{ background: '#3B82F6', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontSize: '15px' }} title="Editar o cambiar contraseña">✏️ Editar</button>
              <button onClick={() => handleEliminar(user._id, user.nombre)} style={{ background: '#E53E3E', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontSize: '15px' }} title="Eliminar acceso">🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL CREAR / EDITAR */}
      {mostrarModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', position: 'relative' }}>
            <button onClick={() => setMostrarModal(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6B7280' }}>✖</button>
            <h3 style={{ margin: '0 0 20px 0', color: '#111827', borderBottom: '1px solid #E5E7EB', paddingBottom: '10px' }}>
              {editandoId ? '✏️ Editar Usuario' : '👥 Nuevo Usuario'}
            </h3>
            
            {mensaje.texto && (
              <div style={{ background: mensaje.tipo === 'error' ? '#FEE2E2' : '#D1FAE5', color: mensaje.tipo === 'error' ? '#DC2626' : '#059669', padding: '10px', borderRadius: '5px', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>
                {mensaje.texto}
              </div>
            )}

            <form onSubmit={handleGuardar} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Nombre Completo</label>
                <input type="text" name="nombre" value={form.nombre} onChange={handleCambioForm} required style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Nombre de Usuario (Login)</label>
                <input type="text" name="usuario" value={form.usuario} onChange={handleCambioForm} required style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
                  {editandoId ? 'Nueva Contraseña (dejar en blanco para no cambiar)' : 'Contraseña'}
                </label>
                <input type="password" name="password" value={form.password} onChange={handleCambioForm} required={!editandoId} style={inputStyle} placeholder="••••••••" />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setMostrarModal(false)} style={{ flex: 1, padding: '12px', background: '#F3F4F6', color: '#4B5563', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>
                <button type="submit" style={{ ...botonAccion, flex: 2, marginTop: 0 }}>{editandoId ? 'Guardar Cambios' : 'Crear Usuario'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}