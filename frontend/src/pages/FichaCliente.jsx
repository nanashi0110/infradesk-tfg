import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const tituloStyle = { color: '#111827', marginBottom: '10px', borderBottom: '2px solid #E5E7EB', paddingBottom: '10px' };
const textoStyle = { color: '#4B5563', fontSize: '16px' };
const botonAccion = { padding: '12px', background: '#00D1A0', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px', boxShadow: '0 2px 4px rgba(0,209,160,0.3)' };

const seccionFicha = { background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '20px' };
const subtituloFicha = { fontSize: '18px', color: '#1A202C', marginBottom: '15px', borderLeft: '4px solid #00D1A0', paddingLeft: '10px' };
const gridFicha = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };
const labelFicha = { display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: '#4B5563' };
const inputFicha = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', boxSizing: 'border-box' };
const botonPequeño = { padding: '8px 12px', background: '#E2E8F0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' };
const botonBorrarFila = { background: 'transparent', color: '#E53E3E', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '5px 10px', display: 'flex', alignItems: 'center' };

export default function FichaCliente({ token }) {
  const { id } = useParams();
  const [editando, setEditando] = useState(false);
  const [tareasCliente, setTareasCliente] = useState([]); 
  
  const [cliente, setCliente] = useState({
    nombreEmpresa: '', cif: '', direccion: '', localidad: '', cp: '',
    personaContacto: '', telefono: '', email: '',
    contactos: [{ nombre: '', cargo: '', movil: '' }],
    emails: [''],
    equipos: [{ modelo: '', numSerie: '' }]
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const res = await fetch(`/api/customers/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const datos = await res.json();
        if (res.ok) {
          if (!datos.emails || datos.emails.length === 0) datos.emails = [''];
          if (!datos.contactos || datos.contactos.length === 0) datos.contactos = [{ nombre: '', cargo: '', movil: '' }];
          if (!datos.equipos || datos.equipos.length === 0) datos.equipos = [{ modelo: '', numSerie: '' }];
          
          setCliente(prev => ({ ...prev, ...datos }));
          document.title = `InfraDesk: ${datos.nombreEmpresa}`;
        }

        const resTareas = await fetch('/api/tasks', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resTareas.ok) {
          const todas = await resTareas.json();
          setTareasCliente(todas.filter(t => t.clienteId?._id === id));
        }
      } catch (error) { console.error("Error al cargar ficha", error); }
    };
    cargarDatos();
  }, [id, token]);

  // --- LÓGICA DE EMAILS ---
  const manejarEmail = (index, valor) => {
    const nuevosEmails = [...cliente.emails];
    nuevosEmails[index] = valor;
    setCliente({...cliente, emails: nuevosEmails});
  };
  const añadirEmail = () => setCliente({...cliente, emails: [...cliente.emails, '']});
  const borrarEmail = (index) => {
    const filtrados = cliente.emails.filter((_, i) => i !== index);
    setCliente({...cliente, emails: filtrados.length > 0 ? filtrados : ['']});
  };

  // --- LÓGICA DE CONTACTOS ---
  const manejarContacto = (index, campo, valor) => {
    const nuevosContactos = [...cliente.contactos];
    nuevosContactos[index][campo] = valor;
    setCliente({...cliente, contactos: nuevosContactos});
  };
  const añadirContacto = () => setCliente({...cliente, contactos: [...cliente.contactos, { nombre: '', cargo: '', movil: '' }]});
  const borrarContacto = (index) => {
    const filtrados = cliente.contactos.filter((_, i) => i !== index);
    setCliente({...cliente, contactos: filtrados.length > 0 ? filtrados : [{ nombre: '', cargo: '', movil: '' }]});
  };

  // --- LÓGICA DE EQUIPOS ---
  const manejarEquipo = (index, campo, valor) => {
    const nuevosEquipos = [...cliente.equipos];
    nuevosEquipos[index][campo] = valor;
    setCliente({...cliente, equipos: nuevosEquipos});
  };
  const añadirEquipo = () => setCliente({...cliente, equipos: [...cliente.equipos, { modelo: '', numSerie: '' }]});
  const borrarEquipo = (index) => {
    const filtrados = cliente.equipos.filter((_, i) => i !== index);
    setCliente({...cliente, equipos: filtrados.length > 0 ? filtrados : [{ modelo: '', numSerie: '' }]});
  };

  // --- GUARDADO Y LIMPIEZA AUTOMÁTICA ---
  const guardarFicha = async () => {
    const emailsLimpios = cliente.emails.filter(email => email.trim() !== '');
    const contactosLimpios = cliente.contactos.filter(cont => cont.nombre.trim() !== '' || cont.movil.trim() !== '' || cont.cargo.trim() !== '');
    const equiposLimpios = cliente.equipos.filter(eq => eq.modelo.trim() !== '' || eq.numSerie.trim() !== '');

    const datosLimpios = {
      nombreEmpresa: cliente.nombreEmpresa,
      cif: cliente.cif,
      direccion: cliente.direccion,
      localidad: cliente.localidad,
      cp: cliente.cp,
      personaContacto: cliente.personaContacto,
      telefono: cliente.telefono,
      email: cliente.email,
      emails: emailsLimpios,
      contactos: contactosLimpios,
      equipos: equiposLimpios
    };

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
        setCliente(prev => ({ 
          ...prev, 
          emails: emailsLimpios.length > 0 ? emailsLimpios : [''],
          contactos: contactosLimpios.length > 0 ? contactosLimpios : [{ nombre: '', cargo: '', movil: '' }],
          equipos: equiposLimpios.length > 0 ? equiposLimpios : [{ modelo: '', numSerie: '' }]
        }));
        setEditando(false); 
      }
    } catch (error) { console.error("Error al guardar", error); }
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

      <div style={seccionFicha}>
        <h3 style={subtituloFicha}>🏢 Datos de Empresa / Fiscales</h3>
        <div style={gridFicha}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelFicha}>Nombre de la Empresa:</label>
            <input type="text" value={cliente.nombreEmpresa || ''} disabled={!editando} onChange={(e) => setCliente({...cliente, nombreEmpresa: e.target.value})} style={inputFicha} />
          </div>
          <div>
            <label style={labelFicha}>CIF / NIF:</label>
            <input type="text" value={cliente.cif || ''} disabled={!editando} onChange={(e) => setCliente({...cliente, cif: e.target.value})} style={inputFicha} />
          </div>
          <div>
            <label style={labelFicha}>Dirección:</label>
            <input type="text" value={cliente.direccion || ''} disabled={!editando} onChange={(e) => setCliente({...cliente, direccion: e.target.value})} style={inputFicha} />
          </div>
          <div>
            <label style={labelFicha}>Localidad:</label>
            <input type="text" value={cliente.localidad || ''} disabled={!editando} onChange={(e) => setCliente({...cliente, localidad: e.target.value})} style={inputFicha} />
          </div>
          <div>
            <label style={labelFicha}>C.P.:</label>
            <input type="text" value={cliente.cp || ''} disabled={!editando} onChange={(e) => setCliente({...cliente, cp: e.target.value})} style={inputFicha} />
          </div>
          
          <div style={{ gridColumn: 'span 2', height: '1px', background: '#E5E7EB', margin: '10px 0' }}></div>
          
          <div>
            <label style={labelFicha}>Contacto Principal:</label>
            <input type="text" value={cliente.personaContacto || ''} disabled={!editando} onChange={(e) => setCliente({...cliente, personaContacto: e.target.value})} style={inputFicha} placeholder="Nombre del responsable" />
          </div>
          <div>
            <label style={labelFicha}>Teléfono Principal:</label>
            <input type="text" value={cliente.telefono || ''} disabled={!editando} onChange={(e) => setCliente({...cliente, telefono: e.target.value})} style={inputFicha} placeholder="Ej: 600 123 456" />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelFicha}>Email Principal:</label>
            <input type="email" value={cliente.email || ''} disabled={!editando} onChange={(e) => setCliente({...cliente, email: e.target.value})} style={inputFicha} placeholder="correo@empresa.com" />
          </div>
        </div>
      </div>

      <div style={seccionFicha}>
        <h3 style={subtituloFicha}>✉️ Agenda de Correos Adicionales</h3>
        {cliente.emails.map((email, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
            <input type="email" value={email || ''} disabled={!editando} onChange={(e) => manejarEmail(idx, e.target.value)} style={{ ...inputFicha, margin: 0 }} placeholder="correo@ejemplo.com" />
            {editando && (
              <button onClick={() => borrarEmail(idx)} style={botonBorrarFila} title="Eliminar correo">🗑️</button>
            )}
          </div>
        ))}
        {editando && <button onClick={añadirEmail} style={botonPequeño}>+ Añadir otro correo</button>}
      </div>

      <div style={seccionFicha}>
        <h3 style={subtituloFicha}>👥 Personas de Contacto Adicionales</h3>
        {cliente.contactos.map((cont, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px', padding: '10px', background: '#F9FAFB', borderRadius: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', flex: 1 }}>
              <input type="text" placeholder="Nombre" value={cont.nombre || ''} disabled={!editando} onChange={(e) => manejarContacto(idx, 'nombre', e.target.value)} style={inputFicha} />
              <input type="text" placeholder="Cargo" value={cont.cargo || ''} disabled={!editando} onChange={(e) => manejarContacto(idx, 'cargo', e.target.value)} style={inputFicha} />
              <input type="text" placeholder="Móvil" value={cont.movil || ''} disabled={!editando} onChange={(e) => manejarContacto(idx, 'movil', e.target.value)} style={inputFicha} />
            </div>
            {editando && (
              <button onClick={() => borrarContacto(idx)} style={botonBorrarFila} title="Eliminar contacto">🗑️</button>
            )}
          </div>
        ))}
        {editando && <button onClick={añadirContacto} style={botonPequeño}>+ Añadir contacto</button>}
      </div>

      <div style={seccionFicha}>
        <h3 style={subtituloFicha}>🛠️ Equipos e Instalaciones</h3>
        {cliente.equipos.map((eq, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', flex: 1 }}>
              <input type="text" placeholder="Modelo" value={eq.modelo || ''} disabled={!editando} onChange={(e) => manejarEquipo(idx, 'modelo', e.target.value)} style={inputFicha} />
              <input type="text" placeholder="Nº Serie" value={eq.numSerie || ''} disabled={!editando} onChange={(e) => manejarEquipo(idx, 'numSerie', e.target.value)} style={inputFicha} />
            </div>
            {editando && (
              <button onClick={() => borrarEquipo(idx)} style={botonBorrarFila} title="Eliminar equipo">🗑️</button>
            )}
          </div>
        ))}
        {editando && <button onClick={añadirEquipo} style={botonPequeño}>+ Registrar equipo</button>}
      </div>

      <div style={{ ...seccionFicha, borderTop: '4px solid #3182CE' }}>
        <h3 style={subtituloFicha}>📋 Tareas y Estado de Servicio</h3>
        {tareasCliente.length === 0 ? (
          <p style={textoStyle}>No hay tareas registradas para este cliente.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {tareasCliente.map(t => (
              <div key={t._id} style={{ 
                padding: '12px', borderRadius: '8px', 
                background: t.estado === 'Resuelta' ? '#F0FFF4' : '#F7FAFC',
                border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'white', background: t.estado === 'Resuelta' ? '#48BB78' : '#3182CE', padding: '2px 8px', borderRadius: '10px', marginRight: '10px' }}>
                    {t.estado}
                  </span>
                  <strong style={{ textDecoration: t.estado === 'Resuelta' ? 'line-through' : 'none' }}>{t.titulo}</strong>
                  <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#718096' }}>
                    📅 Límite: {new Date(t.fechaVencimiento).toLocaleDateString()}
                    {t.fechaResolucion && ` | ✓ Cerrada el ${new Date(t.fechaResolucion).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}