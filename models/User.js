const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  usuario: {               // <-- CAMBIADO: Antes era 'email'
    type: String,
    required: true,
    unique: true           // Sigue siendo único (no puede haber dos "admin")
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);