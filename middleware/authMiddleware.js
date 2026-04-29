const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ mensaje: 'Acceso denegado. No hay token de autenticación.' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mensaje: 'Acceso denegado. Formato de token inválido.' });
  }

  try {
    const verificado = jwt.verify(token, process.env.JWT_SECRET);

    req.usuario = verificado;

    next();
    
  } catch (error) {
    res.status(401).json({ mensaje: 'Token no válido o caducado. Vuelve a iniciar sesión.' });
  }
};