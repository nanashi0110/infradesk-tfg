const Customer = require('../models/Customer');

// 1. CREAR UN CLIENTE
exports.crearCliente = async (req, res) => {
  try {
    const nuevoCliente = new Customer(req.body);
    await nuevoCliente.save();
    res.json({ mensaje: "¡Cliente guardado en MongoDB!", datosDelCliente: nuevoCliente });
  } catch (error) { res.status(500).json({ mensaje: "Error al guardar el cliente" }); }
};

// 2. OBTENER CLIENTES ACTIVOS
exports.obtenerClientes = async (req, res) => {
  try {
    const todosLosClientes = await Customer.find({ eliminado: false }); 
    res.json(todosLosClientes);
  } catch (error) { res.status(500).json({ mensaje: "Error al leer los clientes" }); }
};

// 3. OBTENER UN SOLO CLIENTE
exports.obtenerClientePorId = async (req, res) => {
  try {
    const clienteEncontrado = await Customer.findById(req.params.id);
    if (!clienteEncontrado) return res.status(404).json({ mensaje: "Cliente no encontrado" });
    res.json(clienteEncontrado);
  } catch (error) { res.status(500).json({ mensaje: "Error al buscar el cliente" }); }
};

// 4. ACTUALIZAR UN CLIENTE
exports.actualizarCliente = async (req, res) => {
  try {
    const clienteActualizado = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!clienteActualizado) return res.status(404).json({ mensaje: "Cliente no encontrado" });
    res.json(clienteActualizado);
  } catch (error) { res.status(500).json({ mensaje: "Error al actualizar el cliente" }); }
};

// 5. MOVER A LA PAPELERA
exports.borrarCliente = async (req, res) => {
  try {
    const clienteBorrado = await Customer.findByIdAndUpdate(req.params.id, { eliminado: true }, { new: true });
    if (!clienteBorrado) return res.status(404).json({ mensaje: "Cliente no encontrado" });
    res.json({ mensaje: "Cliente movido a la papelera", datosDelCliente: clienteBorrado });
  } catch (error) { res.status(500).json({ mensaje: "Error al mover a la papelera" }); }
};

// 6. OBTENER CLIENTES EN PAPELERA
exports.getPapelera = async (req, res) => {
  try {
    const clientesPapelera = await Customer.find({ eliminado: true });
    res.json(clientesPapelera);
  } catch (error) { res.status(500).json({ mensaje: "Error al cargar la papelera" }); }
};

// 7. RESTAURAR DE LA PAPELERA
exports.restaurarCliente = async (req, res) => {
  try {
    const clienteRestaurado = await Customer.findByIdAndUpdate(req.params.id, { eliminado: false }, { new: true });
    res.json({ mensaje: "Cliente restaurado", datos: clienteRestaurado });
  } catch (error) { res.status(500).json({ mensaje: "Error al restaurar" }); }
};

// 8. DESTRUIR PERMANENTEMENTE
exports.destruirCliente = async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Cliente destruido permanentemente" });
  } catch (error) { res.status(500).json({ mensaje: "Error al destruir cliente" }); }
};