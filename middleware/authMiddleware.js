const jwt = require('jsonwebtoken');

// Exportamos una función middleware
module.exports = function(req, res, next) {
  // 1. Buscamos la "pulsera" en la cabecera de la petición
  const authHeader = req.header('Authorization');

  // Si no hay cabecera de autorización, le bloqueamos el paso (401: Unauthorized)
  if (!authHeader) {
    return res.status(401).json({ mensaje: 'Acceso denegado. No hay token de autenticación.' });
  }

  // Normalmente el frontend envía el token con este formato: "Bearer eyJhbGci..."
  // Así que separamos la palabra "Bearer" del token real
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mensaje: 'Acceso denegado. Formato de token inválido.' });
  }

  try {
    // 2. Verificamos si la pulsera es de nuestra discoteca (usando el secreto)
    const verificado = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Si es válido, guardamos la info del usuario en la petición (req.usuario)
    // Esto es muy útil por si luego quieres saber QUÉ usuario creó a QUÉ cliente
    req.usuario = verificado;

    // 4. ¡Le dejamos pasar! Esto ejecuta la función de la ruta que estaba intentando visitar
    next();
    
  } catch (error) {
    // Si el token es falso, lo ha modificado o está caducado, salta aquí
    res.status(401).json({ mensaje: 'Token no válido o caducado. Vuelve a iniciar sesión.' });
  }
};