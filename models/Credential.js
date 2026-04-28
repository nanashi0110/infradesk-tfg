const mongoose = require('mongoose');

const credentialSchema = new mongoose.Schema({
  clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  titulo: { type: String, required: true },
  url: { type: String, default: '' },
  usuario: { type: String, required: true },
  password: { type: String, required: true },
  notas: { type: String, default: '' },
  eliminado: { type: Boolean, default: false } 
}, { timestamps: true });

module.exports = mongoose.model('Credential', credentialSchema);