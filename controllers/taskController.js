const Task = require('../models/Task');

// 1. CREAR UNA TAREA
exports.crearTarea = async (req, res) => {
  try {
    const nuevaTarea = new Task(req.body);
    await nuevaTarea.save();
    const tareaGuardada = await Task.findById(nuevaTarea._id).populate('clienteId', 'nombreEmpresa personaContacto');
    res.status(201).json(tareaGuardada);
  } catch (error) { res.status(500).json({ mensaje: "Error al crear la tarea" }); }
};

// 2. OBTENER TODAS LAS TAREAS
exports.obtenerTareas = async (req, res) => {
  try {
    const tareas = await Task.find().populate('clienteId', 'nombreEmpresa').sort({ fechaVencimiento: 1 }); 
    res.json(tareas);
  } catch (error) { res.status(500).json({ mensaje: "Error al obtener las tareas" }); }
};

// 3. ACTUALIZAR UNA TAREA (Con seguro anti-clonación)
exports.actualizarTarea = async (req, res) => {
  try {
    const datosNuevos = { ...req.body };
    let seHaClonado = false; // Chivato para el Frontend

    // Buscamos la tarea original ANTES de modificarla
    const tareaOriginal = await Task.findById(req.params.id);
    if (!tareaOriginal) return res.status(404).json({ mensaje: "Tarea no encontrada" });

    // Gestión de fechas de resolución
    if (datosNuevos.estado === 'Resuelta') {
      datosNuevos.fechaResolucion = new Date();
    } else if (datosNuevos.estado && datosNuevos.estado !== 'Resuelta') {
      datosNuevos.fechaResolucion = null; 
    }

    // 🔄 LÓGICA DE RECURRENCIA (AUTO-CLONADO SEGURO)
    // Solo clona si pasa a resuelta, es recurrente y NUNCA antes había sido clonada
    if (datosNuevos.estado === 'Resuelta' && tareaOriginal.esRecurrente && !tareaOriginal.clonada) {
      let proximaFecha = new Date(tareaOriginal.fechaVencimiento);

      switch (tareaOriginal.tipoRecurrencia) {
        case 'Semanal': proximaFecha.setDate(proximaFecha.getDate() + 7); break;
        case 'Quincenal': proximaFecha.setDate(proximaFecha.getDate() + 15); break;
        case 'Mensual': proximaFecha.setMonth(proximaFecha.getMonth() + 1); break;
        case 'Trimestral': proximaFecha.setMonth(proximaFecha.getMonth() + 3); break;
        case 'Semestral': proximaFecha.setMonth(proximaFecha.getMonth() + 6); break;
        case 'Anual': proximaFecha.setFullYear(proximaFecha.getFullYear() + 1); break;
      }

      const tareaSiguiente = new Task({
        titulo: tareaOriginal.titulo,
        descripcion: tareaOriginal.descripcion,
        clienteId: tareaOriginal.clienteId,
        prioridad: tareaOriginal.prioridad,
        fechaVencimiento: proximaFecha,
        horaInicio: tareaOriginal.horaInicio,
        horaFin: tareaOriginal.horaFin,
        todoElDia: tareaOriginal.todoElDia,
        esRecurrente: true,
        tipoRecurrencia: tareaOriginal.tipoRecurrencia,
        estado: 'Pendiente',
        clonada: false // El hijo nace sin haber sido clonado
      });
      
      await tareaSiguiente.save();
      
      // Marcamos a la original para que no vuelva a tener hijos
      datosNuevos.clonada = true; 
      seHaClonado = true; // Avisamos de que ha habido parto
    }

    const tareaActualizada = await Task.findByIdAndUpdate(
      req.params.id, 
      { $set: datosNuevos }, 
      { new: true }
    ).populate('clienteId', 'nombreEmpresa');

    // Devolvemos la tarea y el chivato
    res.json({ tarea: tareaActualizada, seHaClonado });
  } catch (error) { res.status(500).json({ mensaje: "Error al actualizar la tarea" }); }
};

// 4. BORRAR UNA TAREA
exports.borrarTarea = async (req, res) => {
  try {
    const tareaBorrada = await Task.findByIdAndDelete(req.params.id);
    if (!tareaBorrada) return res.status(404).json({ mensaje: "Tarea no encontrada" });
    res.json({ mensaje: "Tarea eliminada correctamente" });
  } catch (error) { res.status(500).json({ mensaje: "Error al borrar la tarea" }); }
};