const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', customerController.crearCliente);
router.get('/', customerController.obtenerClientes);
router.get('/papelera', customerController.getPapelera);
router.get('/:id', customerController.obtenerClientePorId);
router.put('/:id', customerController.actualizarCliente);
router.put('/:id/restaurar', customerController.restaurarCliente);
router.delete('/:id', customerController.borrarCliente);
router.delete('/:id/destruir', customerController.destruirCliente);

module.exports = router;