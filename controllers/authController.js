const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. REGISTRAR UN NUEVO USUARIO
exports.registrarUsuario = async (req, res) => {
  try {
    const { nombre, usuario, password } = req.body;
    const usuarioExistente = await User.findOne({ usuario });
    if (usuarioExistente) return res.status(400).json({ mensaje: 'Este nombre de usuario ya existe' });

    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(password, salt);

    const nuevoUsuario = new User({ nombre, usuario, password: passwordEncriptada });
    await nuevoUsuario.save();
    res.status(201).json({ mensaje: '✅ Usuario registrado con éxito' });
  } catch (error) { res.status(500).json({ mensaje: 'Error interno del servidor' }); }
};

// 2. INICIAR SESIÓN (LOGIN)
exports.loginUsuario = async (req, res) => {
  try {
    const { usuario, password } = req.body;
    const userDb = await User.findOne({ usuario });
    if (!userDb) return res.status(400).json({ mensaje: 'Credenciales inválidas' });

    const esPasswordCorrecta = await bcrypt.compare(password, userDb.password);
    if (!esPasswordCorrecta) return res.status(400).json({ mensaje: 'Credenciales inválidas' });

    const token = jwt.sign({ usuarioId: userDb._id }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, usuario: { id: userDb._id, nombre: userDb.nombre, usuario: userDb.usuario } });
  } catch (error) { res.status(500).json({ mensaje: 'Error interno del servidor' }); }
};

// =====================================
// NUEVAS FUNCIONES PARA EL PANEL DE USUARIOS
// =====================================

// 3. OBTENER TODOS LOS USUARIOS (Sin enviar la contraseña, por seguridad)
exports.obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await User.find().select('-password');
    res.json(usuarios);
  } catch (error) { res.status(500).json({ mensaje: 'Error al obtener usuarios' }); }
};

// 4. ACTUALIZAR USUARIO (Nombre, Usuario y opcionalmente Contraseña)
exports.actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, usuario, password } = req.body;

    const userToUpdate = await User.findById(id);
    if (!userToUpdate) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    // Si intenta cambiar el "usuario" a uno que ya existe (y no es él mismo)
    if (usuario !== userToUpdate.usuario) {
      const existe = await User.findOne({ usuario });
      if (existe) return res.status(400).json({ mensaje: 'Ese nombre de usuario ya está en uso' });
    }

    userToUpdate.nombre = nombre;
    userToUpdate.usuario = usuario;

    // Si envía una contraseña nueva, la encriptamos. Si no, dejamos la vieja.
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      userToUpdate.password = await bcrypt.hash(password, salt);
    }

    await userToUpdate.save();
    res.json({ mensaje: 'Usuario actualizado con éxito' });
  } catch (error) { res.status(500).json({ mensaje: 'Error al actualizar usuario' }); }
};

// 5. ELIMINAR USUARIO
exports.eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    // Protección: Evitar que el usuario se borre a sí mismo accidentalmente (opcional, pero buena práctica)
    if (req.user && req.user.usuarioId === id) {
      return res.status(400).json({ mensaje: 'No puedes borrar tu propia cuenta activa' });
    }
    await User.findByIdAndDelete(id);
    res.json({ mensaje: 'Usuario eliminado' });
  } catch (error) { res.status(500).json({ mensaje: 'Error al eliminar usuario' }); }
};