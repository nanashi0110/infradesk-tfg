const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. REGISTRAR UN NUEVO USUARIO
exports.registrarUsuario = async (req, res) => {
  try {
    const { nombre, usuario, password } = req.body; // <-- CAMBIADO 'email' por 'usuario'

    const usuarioExistente = await User.findOne({ usuario }); // <-- CAMBIADO
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'Este nombre de usuario ya existe' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(password, salt);

    const nuevoUsuario = new User({
      nombre,
      usuario, // <-- CAMBIADO
      password: passwordEncriptada
    });

    await nuevoUsuario.save();
    res.status(201).json({ mensaje: '✅ Usuario registrado con éxito' });

  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// 2. INICIAR SESIÓN (LOGIN)
exports.loginUsuario = async (req, res) => {
  try {
    const { usuario, password } = req.body; // <-- CAMBIADO 'email' por 'usuario'

    const userDb = await User.findOne({ usuario }); // <-- CAMBIADO
    if (!userDb) {
      return res.status(400).json({ mensaje: 'Credenciales inválidas' });
    }

    const esPasswordCorrecta = await bcrypt.compare(password, userDb.password);
    if (!esPasswordCorrecta) {
      return res.status(400).json({ mensaje: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { usuarioId: userDb._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '8h' }
    );

    res.json({ 
      token, 
      usuario: { id: userDb._id, nombre: userDb.nombre, usuario: userDb.usuario } // <-- CAMBIADO
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};