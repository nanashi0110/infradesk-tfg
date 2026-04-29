import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import VistaCalendario from './VistaCalendario'; 

const tituloStyle = { color: '#111827', marginBottom: '5px', borderBottom: '2px solid #E5E7EB', paddingBottom: '10px' };
const textoStyle = { color: '#6B7280', fontSize: '16px', marginBottom: '25px' };

const kpiGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' };
const kpiCard = { background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '5px solid #00D1A0' };
const kpiNumber = { fontSize: '32px', fontWeight: 'bold', color: '#111827', margin: 0 };
const kpiLabel = { fontSize: '14px', color: '#6B7280', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' };

export default function Inicio({ token }) {
  const [stats, setStats] = useState({ clientes: 0, tareasPendientes: 0, credenciales: 0 });
  const [tareasUrgentes, setTareasUrgentes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    document.title = "InfraDesk: Dashboard";
    if (token) cargarEstadisticas();
  }, [token]);

  const cargarEstadisticas = async () => {
    try {
      const [resClientes, resTareas, resCreds] = await Promise.all([
        fetch('/api/customers', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/tasks', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/credentials', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const [clientes, tareas, credenciales] = await Promise.all([
        resClientes.ok ? resClientes.json() : [],
        resTareas.ok ? resTareas.json() : [],
        resCreds.ok ? resCreds.json() : []
      ]);

      const pendientes = tareas.filter(t => t.estado !== 'Resuelta');
      
      setStats({
        clientes: clientes.length || 0,
        tareasPendientes: pendientes.length || 0,
        credenciales: credenciales.length || 0
      });

      const ordenadas = pendientes.sort((a, b) => new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento));
      setTareasUrgentes(ordenadas.slice(0, 5));

    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div>
      <h1 style={tituloStyle}>🏠 Panel de Control</h1>
      <p style={textoStyle}>Resumen general del estado de la plataforma InfraDesk.</p>

      {cargando ? (
        <p style={{ color: '#4B5563', fontWeight: 'bold' }}>Cargando estadísticas...</p>
      ) : (
        <>
          <div style={kpiGrid}>
            <div style={{ ...kpiCard, borderLeftColor: '#3B82F6' }}>
              <div style={{ fontSize: '40px' }}>🏢</div>
              <div>
                <p style={kpiNumber}>{stats.clientes}</p>
                <p style={kpiLabel}>Clientes Activos</p>
              </div>
            </div>
            
            <div style={{ ...kpiCard, borderLeftColor: '#F59E0B' }}>
              <div style={{ fontSize: '40px' }}>⏳</div>
              <div>
                <p style={kpiNumber}>{stats.tareasPendientes}</p>
                <p style={kpiLabel}>Tareas Pendientes</p>
              </div>
            </div>

            <div style={{ ...kpiCard, borderLeftColor: '#10B981' }}>
              <div style={{ fontSize: '40px' }}>🔐</div>
              <div>
                <p style={kpiNumber}>{stats.credenciales}</p>
                <p style={kpiLabel}>Credenciales Seguras</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            
            <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' }}>
                🚨 Tareas de Alta Prioridad
              </h3>
              
              {tareasUrgentes.length === 0 ? (
                <p style={{ color: '#10B981', fontWeight: 'bold', background: '#D1FAE5', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                  ¡Genial! No tienes tareas pendientes.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {tareasUrgentes.map(tarea => {
                    // --- LÓGICA DE FECHAS CORREGIDA ---
                    const hoy = new Date();
                    hoy.setHours(0, 0, 0, 0); // Normalizamos hoy a las 00:00

                    const fechaVencimiento = new Date(tarea.fechaVencimiento);
                    fechaVencimiento.setHours(0, 0, 0, 0); // Normalizamos vencimiento a las 00:00

                    const estaAtrasada = fechaVencimiento < hoy; // Solo será true si el día es anterior a hoy
                    // ----------------------------------

                    return (
                      <div key={tarea._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '8px', background: estaAtrasada ? '#FEF2F2' : '#F9FAFB' }}>
                        <div>
                          <strong style={{ display: 'block', color: '#111827', fontSize: '15px' }}>{tarea.titulo}</strong>
                          <span style={{ fontSize: '13px', color: '#6B7280' }}>
                            {tarea.clienteId?.nombreEmpresa || 'Cliente Desconocido'}
                          </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '12px', fontWeight: 'bold', color: estaAtrasada ? '#DC2626' : '#D97706', background: estaAtrasada ? '#FEE2E2' : '#FEF3C7', padding: '4px 8px', borderRadius: '12px' }}>
                            {estaAtrasada ? 'Atrasada' : 'Próxima'}
                          </span>
                          <span style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                            {fechaVencimiento.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', alignSelf: 'start' }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' }}>
                ⚡ Accesos Rápidos
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                <Link to="/clientes" style={{ background: '#F3F4F6', color: '#374151', textDecoration: 'none', padding: '15px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  🏢 Base de Clientes
                </Link>
                <Link to="/tareas" style={{ background: '#F3F4F6', color: '#374151', textDecoration: 'none', padding: '15px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  ✅ Nueva Tarea
                </Link>
                <Link to="/boveda" style={{ background: '#F3F4F6', color: '#374151', textDecoration: 'none', padding: '15px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  🔐 Bóveda Segura
                </Link>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', borderTop: '2px solid #E5E7EB', paddingTop: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <Link to="/calendario" style={{ color: '#3182CE', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>Ver a pantalla completa ➔</Link>
            </div>
            
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <VistaCalendario token={token} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}