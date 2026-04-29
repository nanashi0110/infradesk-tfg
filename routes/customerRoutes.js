const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Rutas base
router.post('/', customerController.crearCliente);
router.get('/', customerController.obtenerClientes);
router.get('/papelera', customerController.getPapelera); // <-- NUEVA
router.get('/:id', customerController.obtenerClientePorId);
router.put('/:id', customerController.actualizarCliente);
router.put('/:id/restaurar', customerController.restaurarCliente); // <-- NUEVA
router.delete('/:id', customerController.borrarCliente); // <-- Modificada (mueve a papelera)
router.delete('/:id/destruir', customerController.destruirCliente); // <-- NUEVA

module.exports = router;