require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // <-- Importamos CORS

const app = express();
const port = 3000;

// --- MIDDLEWARES ---
app.use(cors()); // Permite que React hable con este servidor
app.use(express.json()); // Permite leer datos en formato JSON

// --- CONEXIÓN A MONGODB ---
const dbURL = `mongodb://root:${process.env.DB_PASSWORD}@localhost:27017/gestion_tecnica_db?authSource=admin`;

mongoose.connect(dbURL)
  .then(() => {
    console.log('Conectado a MongoDB (Docker)');
  })
  .catch((err) => {
    console.error('Error al conectar a MongoDB:', err.message);
  });

// 1. DEFINIR EL ESQUEMA

const customerSchema = new mongoose.Schema({
  nombreEmpresa: { type: String, required: true },
  personaContacto: String,
  telefono: String,
  email: String
});

// 2. CREAR EL MODELO
const CustomerModel = mongoose.model('Customer', customerSchema);

// RUTAS CRUD PARA CLIENTES (Create, Read, Update, Delete)

// RUTA 0: MENSAJE DE BIENVENIDA (GET)
app.get('/', function(req, res) {
  res.json({
    mensaje: "Bienvenido a la API del Sistema de Gestión Técnica",
    status: "Todo funciona"
  });
});

// RUTA 1: CREAR UN CLIENTE (POST)
app.post('/api/customers', async function(req, res) {
  try {
    const nuevoCliente = new CustomerModel(req.body);
    await nuevoCliente.save();
    res.json({
      mensaje: "¡Cliente guardado en MongoDB!",
      datosDelCliente: nuevoCliente
    });
  } catch (error) {
    console.error("Error al guardar:", error.message);
    res.json({ mensaje: "Error al guardar el cliente" });
  }
});

// RUTA 2: OBTENER TODOS LOS CLIENTES (GET)
app.get('/api/customers', async function(req, res) {
  try {
    const todosLosClientes = await CustomerModel.find(); 
    res.json(todosLosClientes);
  } catch (error) {
    console.error("Error al leer clientes:", error.message);
    res.json({ mensaje: "Error al leer los clientes" });
  }
});

// RUTA 3: OBTENER UN SOLO CLIENTE (GET)
app.get('/api/customers/:id', async function(req, res) {
  try {
    const idQueNosPiden = req.params.id;
    const clienteEncontrado = await CustomerModel.findById(idQueNosPiden);

    if (!clienteEncontrado) {
      return res.json({ mensaje: "Cliente no encontrado con ese ID" });
    }
    res.json(clienteEncontrado);
  } catch (error) {
    console.error("Error al buscar cliente:", error.message);
    res.json({ mensaje: "Error al buscar el cliente (ID no válido)" });
  }
});

// RUTA 4: ACTUALIZAR UN CLIENTE (PUT)
app.put('/api/customers/:id', async function(req, res) {
  try {
    const idQueNosPiden = req.params.id;
    const datosNuevos = req.body;

    const clienteActualizado = await CustomerModel.findByIdAndUpdate(
      idQueNosPiden, 
      datosNuevos,
      { new: true } // Nos devuelve el cliente *después* de actualizarlo
    );

    if (!clienteActualizado) {
      return res.json({ mensaje: "Cliente no encontrado, no se puede actualizar" });
    }
    res.json(clienteActualizado);
  } catch (error) {
    console.error("Error al actualizar cliente:", error.message);
    res.json({ mensaje: "Error al actualizar el cliente (ID no válido)" });
  }
});

// RUTA 5: BORRAR UN CLIENTE (DELETE)
app.delete('/api/customers/:id', async function(req, res) {
  try {
    const idQueNosPiden = req.params.id;
    const clienteBorrado = await CustomerModel.findByIdAndDelete(idQueNosPiden);

    if (!clienteBorrado) {
      return res.json({ mensaje: "Cliente no encontrado, no se puede borrar" });
    }
    res.json({ 
      mensaje: "Cliente eliminado con éxito",
      datosDelCliente: clienteBorrado 
    });
  } catch (error) {
    console.error("Error al borrar cliente:", error.message);
    res.json({ mensaje: "Error al borrar el cliente (ID no válido)" });
  }
});

// --- ARRANCAR EL SERVIDOR (Siempre al final) ---
app.listen(port, function() {
  console.log(`🚀 Servidor Express escuchando en http://localhost:${port}`);
});