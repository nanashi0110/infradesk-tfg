const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const authMiddleware = require('../middleware/authMiddleware'); // El guardián de seguridad

// ==========================================
// RUTAS PRIVADAS (CRUD CLIENTES) 
// Todas están protegidas por authMiddleware
// ==========================================

// La ruta base aquí es '/' porque en el server.js le diremos que todas empiezan por '/api/customers'
router.post('/', authMiddleware, customerController.crearCliente);
router.get('/', authMiddleware, customerController.obtenerClientes);
router.get('/:id', authMiddleware, customerController.obtenerClientePorId);
router.put('/:id', authMiddleware, customerController.actualizarCliente);
router.delete('/:id', authMiddleware, customerController.borrarCliente);

module.exports = router;