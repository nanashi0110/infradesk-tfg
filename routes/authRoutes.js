const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); // <-- NUEVO: Traemos al portero

// ==========================================
// RUTAS DE AUTENTICACIÓN
// ==========================================

// RUTA PÚBLICA: Iniciar sesión (Cualquiera puede intentar entrar)
router.post('/login', authController.loginUsuario);

// RUTA PRIVADA: Registrar usuario (Solo un administrador logueado puede hacerlo)
// Fíjate que hemos metido a 'authMiddleware' en medio de la ruta
router.post('/registro', authMiddleware, authController.registrarUsuario);

module.exports = router;