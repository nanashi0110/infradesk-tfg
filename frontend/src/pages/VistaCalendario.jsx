import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

moment.locale('es', {
  months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
  monthsShort: 'Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic'.split('_'),
  weekdays: 'Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado'.split('_'),
  weekdaysShort: 'Lun_Mar_Mié_Jue_Vie_Sáb_Dom'.split('_'),
  weekdaysMin: 'Do_Lu_Ma_Mi_Ju_Vi_Sá'.split('_'),
  week: {
    dow: 1, 
    doy: 4  
  }
});

const localizer = momentLocalizer(moment);

const tituloStyle = { color: '#111827', marginBottom: '10px', borderBottom: '2px solid #E5E7EB', paddingBottom: '10px' };

const CustomToolbar = (toolbar) => {
  const goToBack = () => toolbar.onNavigate('PREV');
  const goToNext = () => toolbar.onNavigate('NEXT');
  const goToToday = () => toolbar.onNavigate('TODAY');

  const handleMonthChange = (e) => {
    const newDate = moment(toolbar.date).month(e.target.value).toDate();
    toolbar.onNavigate('DATE', newDate);
  };

  const handleYearChange = (e) => {
    const newDate = moment(toolbar.date).year(e.target.value).toDate();
    toolbar.onNavigate('DATE', newDate);
  };

  const currentYear = moment().year();
  const years = [];
  for (let i = currentYear - 50; i <= currentYear + 50; i++) {
    years.push(i);
  }

  const mesesSpanish = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  return (
    <div className="rbc-toolbar" style={{ marginBottom: '20px' }}>
      <span className="rbc-btn-group">
        <button type="button" onClick={goToToday} style={{ fontWeight: 'bold' }}>Hoy</button>
        <button type="button" onClick={goToBack}>❮</button>
        <button type="button" onClick={goToNext}>❯</button>
      </span>

      <span className="rbc-toolbar-label" style={{ display: 'flex', gap: '5px', justifyContent: 'center', alignItems: 'center' }}>
        <select 
          value={moment(toolbar.date).month()} 
          onChange={handleMonthChange}
          style={{ border: '1px solid #E2E8F0', padding: '5px 10px', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', background: '#F8FAFC', outline: 'none' }}
        >
          {mesesSpanish.map((mes, idx) => (
            <option key={mes} value={idx}>{mes}</option>
          ))}
        </select>

        <select 
          value={moment(toolbar.date).year()} 
          onChange={handleYearChange}
          style={{ border: '1px solid #E2E8F0', padding: '5px 10px', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', background: '#F8FAFC', outline: 'none' }}
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </span>

      <span className="rbc-btn-group">
        <button type="button" onClick={() => toolbar.onView('month')} className={toolbar.view === 'month' ? 'rbc-active' : ''}>Mes</button>
        <button type="button" onClick={() => toolbar.onView('week')} className={toolbar.view === 'week' ? 'rbc-active' : ''}>Semana</button>
        <button type="button" onClick={() => toolbar.onView('day')} className={toolbar.view === 'day' ? 'rbc-active' : ''}>Día</button>
        <button type="button" onClick={() => toolbar.onView('agenda')} className={toolbar.view === 'agenda' ? 'rbc-active' : ''}>Agenda</button>
      </span>
    </div>
  );
};

export default function VistaCalendario({ token }) {
  const [eventos, setEventos] = useState([]);
  const [fechaActual, setFechaActual] = useState(new Date());
  const [vistaActual, setVistaActual] = useState('month');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  useEffect(() => {
    document.title = "InfraDesk: Calendario";
    const cargarTareas = async () => {
      try {
        const res = await fetch('/api/tasks', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          const tareasDb = await res.json();
          const tareasTransformadas = tareasDb.map(tarea => {
            const fechaInicio = new Date(tarea.fechaVencimiento);
            const fechaFin = new Date(tarea.fechaVencimiento);
            if (tarea.todoElDia) {
                fechaInicio.setHours(0, 0, 0, 0);
                fechaFin.setHours(23, 59, 59, 999);
            } else {
                const [hIni, mIni] = (tarea.horaInicio || "09:00").split(':');
                const [hFin, mFin] = (tarea.horaFin || "14:00").split(':');
                fechaInicio.setHours(parseInt(hIni), parseInt(mIni), 0, 0);
                fechaFin.setHours(parseInt(hFin), parseInt(mFin), 0, 0);
            }
            return {
              id: tarea._id,
              title: tarea.titulo, 
              cliente: tarea.clienteId?.nombreEmpresa || 'Sin cliente',
              start: fechaInicio,
              end: fechaFin, 
              allDay: tarea.todoElDia,
              estado: tarea.estado,
              prioridad: tarea.prioridad,
              hInicio: tarea.horaInicio,
              hFin: tarea.horaFin
            };
          });
          setEventos(tareasTransformadas);
        }
      } catch (error) {
        console.error("Error al cargar tareas para el calendario", error);
      }
    };
    if (token) cargarTareas();
  }, [token]);

  const eventStyleGetter = (evento) => {
    let backgroundColor = '#3182CE'; 
    if (evento.estado === 'Resuelta') backgroundColor = '#48BB78'; 
    else if (evento.prioridad === 'Urgente') backgroundColor = '#E53E3E'; 
    else if (evento.prioridad === 'Alta') backgroundColor = '#DD6B20'; 
    else if (evento.prioridad === 'Baja') backgroundColor = '#A0AEC0'; 
    return {
      style: { backgroundColor, borderRadius: '4px', opacity: evento.estado === 'Resuelta' ? 0.7 : 1, color: 'white', border: 'none', display: 'block', fontSize: '12px', padding: '2px 5px' }
    };
  };

  const abrirModalDia = (fechaClica) => {
    setDiaSeleccionado(fechaClica);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setDiaSeleccionado(null);
  };

  const tareasDelDia = diaSeleccionado 
    ? eventos.filter(e => new Date(e.start).toDateString() === new Date(diaSeleccionado).toDateString())
    : [];

  return (
    <div style={{ height: '85vh', background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', position: 'relative' }}>
      <h2 style={{ ...tituloStyle, marginTop: 0 }}>📅 Calendario de Actuaciones</h2>
      
      <Calendar
        localizer={localizer}
        events={eventos}
        startAccessor="start"
        endAccessor="end"
        culture="es"
        date={fechaActual}
        onNavigate={(nuevaFecha) => setFechaActual(nuevaFecha)}
        view={vistaActual}
        onView={(nuevaVista) => setVistaActual(nuevaVista)}
        views={['month', 'week', 'day', 'agenda']}
        components={{ toolbar: CustomToolbar }}
        selectable={true}
        onSelectSlot={(slotInfo) => abrirModalDia(slotInfo.start)} 
        onSelectEvent={(evento) => abrirModalDia(evento.start)} 
        onDrillDown={(fecha) => abrirModalDia(fecha)}
        
        formats={{
          weekdayFormat: 'dddd', // Muestra "Lunes", "Martes", etc.
        }}
        
        messages={{
          next: "Sig.",
          previous: "Ant.",
          today: "Hoy",
          month: "Mes",
          week: "Semana",
          day: "Día",
          agenda: "Agenda",
          noEventsInRange: "Sin actuaciones en este periodo.",
          showMore: (total) => `+${total} más`
        }}
        eventPropGetter={eventStyleGetter}
        style={{ height: 'calc(100% - 60px)' }}
      />

      {modalAbierto && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100dvh',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }} onClick={cerrarModal}>
          <div style={{
            background: 'white', padding: '25px', borderRadius: '12px', width: '90%', maxWidth: '500px',
            maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #E2E8F0', paddingBottom: '10px', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#1A202C' }}>
                📆 Tareas del {diaSeleccionado.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
              <button onClick={cerrarModal} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✖️</button>
            </div>
            {tareasDelDia.length === 0 ? (
              <p style={{ color: '#718096', textAlign: 'center', padding: '20px 0' }}>Sin actuaciones programadas.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {tareasDelDia.map(tarea => (
                  <div key={tarea.id} style={{ 
                    padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0',
                    borderLeft: tarea.estado === 'Resuelta' ? '5px solid #48BB78' : '5px solid #3182CE',
                    background: tarea.estado === 'Resuelta' ? '#F0FFF4' : '#F7FAFC'
                  }}>
                    <h4 style={{ margin: '0 0 5px 0', textDecoration: tarea.estado === 'Resuelta' ? 'line-through' : 'none' }}>{tarea.title}</h4>
                    <p style={{ margin: "4px 0", fontSize: '13px', color: '#4A5568' }}>🏢 Cliente: <strong>{tarea.cliente}</strong></p>
                    <p style={{ margin: "4px 0", fontSize: '13px', color: '#718096' }}>🕒 Horario: {tarea.allDay ? 'Todo el día' : `${tarea.hInicio} - ${tarea.hFin}`}</p>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                      <span style={{ fontSize: '11px', background: '#E2E8F0', padding: '2px 6px', borderRadius: '4px' }}>{tarea.estado}</span>
                      <span style={{ fontSize: '11px', background: '#E2E8F0', padding: '2px 6px', borderRadius: '4px' }}>Prioridad: {tarea.prioridad}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}