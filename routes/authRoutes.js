const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); // <-- IMPORTAMOS EL GUARDIÁN

// RUTAS PÚBLICAS
router.post('/login', authController.loginUsuario);
router.post('/registro', authController.registrarUsuario); 

// RUTAS PRIVADAS (Gestión del Panel de Usuarios)
router.get('/usuarios', authMiddleware, authController.obtenerUsuarios);
router.put('/usuarios/:id', authMiddleware, authController.actualizarUsuario);
router.delete('/usuarios/:id', authMiddleware, authController.eliminarUsuario);

module.exports = router;