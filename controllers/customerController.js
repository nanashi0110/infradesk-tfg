const Customer = require('../models/Customer');

// 1. CREAR UN CLIENTE
exports.crearCliente = async (req, res) => {
  try {
    const nuevoCliente = new Customer(req.body);
    await nuevoCliente.save();
    res.json({ mensaje: "¡Cliente guardado en MongoDB!", datosDelCliente: nuevoCliente });
  } catch (error) {
    console.error("Error al guardar:", error.message);
    res.status(500).json({ mensaje: "Error al guardar el cliente" });
  }
};

// 2. OBTENER TODOS LOS CLIENTES
exports.obtenerClientes = async (req, res) => {
  try {
    const todosLosClientes = await Customer.find(); 
    res.json(todosLosClientes);
  } catch (error) {
    console.error("Error al leer clientes:", error.message);
    res.status(500).json({ mensaje: "Error al leer los clientes" });
  }
};

// 3. OBTENER UN SOLO CLIENTE
exports.obtenerClientePorId = async (req, res) => {
  try {
    const clienteEncontrado = await Customer.findById(req.params.id);
    if (!clienteEncontrado) {
      return res.status(404).json({ mensaje: "Cliente no encontrado con ese ID" });
    }
    res.json(clienteEncontrado);
  } catch (error) {
    console.error("Error al buscar cliente:", error.message);
    res.status(500).json({ mensaje: "Error al buscar el cliente (ID no válido)" });
  }
};

// 4. ACTUALIZAR UN CLIENTE (Esta es la que usa el botón de Guardar Cambios en la Ficha)
exports.actualizarCliente = async (req, res) => {
  try {
    const clienteActualizado = await Customer.findByIdAndUpdate(
      req.params.id, 
      req.body,
      { new: true } // Devuelve el cliente modificado
    );

    if (!clienteActualizado) {
      return res.status(404).json({ mensaje: "Cliente no encontrado, no se puede actualizar" });
    }
    res.json(clienteActualizado);
  } catch (error) {
    console.error("Error al actualizar cliente:", error.message);
    res.status(500).json({ mensaje: "Error al actualizar el cliente" });
  }
};

// 5. BORRAR UN CLIENTE
exports.borrarCliente = async (req, res) => {
  try {
    const clienteBorrado = await Customer.findByIdAndDelete(req.params.id);
    if (!clienteBorrado) {
      return res.status(404).json({ mensaje: "Cliente no encontrado, no se puede borrar" });
    }
    res.json({ mensaje: "Cliente eliminado con éxito", datosDelCliente: clienteBorrado });
  } catch (error) {
    console.error("Error al borrar cliente:", error.message);
    res.status(500).json({ mensaje: "Error al borrar el cliente" });
  }
};