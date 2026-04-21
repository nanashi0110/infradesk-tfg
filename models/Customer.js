const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  nombreEmpresa: { type: String, required: true },
  personaContacto: { type: String, default: '' },
  telefono: { type: String, default: '' },
  email: { type: String, default: '' },
  
  // --- NUEVOS CAMPOS AVANZADOS (FICHA) ---
  cif: { type: String, default: '' },
  direccion: { type: String, default: '' },
  localidad: { type: String, default: '' },
  cp: { type: String, default: '' },
  
  emails: [{ type: String }],
  
  contactos: [{
    nombre: { type: String, default: '' },
    cargo: { type: String, default: '' },
    movil: { type: String, default: '' }
  }],
  
  equipos: [{
    modelo: { type: String, default: '' },
    numSerie: { type: String, default: '' },
  }]
}, {
  timestamps: true 
});

module.exports = mongoose.model('Customer', customerSchema);