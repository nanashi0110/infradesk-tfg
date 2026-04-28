const Credential = require('../models/Credential');
const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const getSecretKey = () => {
  const secret = process.env.VAULT_SECRET || 'ClaveSecretaPorDefecto_Cambiar!!';
  return crypto.createHash('sha256').update(String(secret)).digest('base64').substring(0, 32);
};

const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, getSecretKey(), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

const decrypt = (text) => {
  try {
    let textParts = text.split(':');
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(algorithm, getSecretKey(), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    return 'Error_al_desencriptar';
  }
};

exports.getCredentials = async (req, res) => {
  try {
    const creds = await Credential.find({ eliminado: false }).populate('clienteId', 'nombreEmpresa');
    const credsDecrypted = creds.map(cred => ({
      _id: cred._id, clienteId: cred.clienteId, titulo: cred.titulo, url: cred.url,
      usuario: cred.usuario, password: decrypt(cred.password), notas: cred.notas
    }));
    res.json(credsDecrypted);
  } catch (error) { res.status(500).json({ mensaje: 'Error al obtener credenciales' }); }
};

exports.getPapelera = async (req, res) => {
  try {
    const creds = await Credential.find({ eliminado: true }).populate('clienteId', 'nombreEmpresa');
    const credsDecrypted = creds.map(cred => ({
      _id: cred._id, clienteId: cred.clienteId, titulo: cred.titulo, url: cred.url,
      usuario: cred.usuario, password: decrypt(cred.password), notas: cred.notas
    }));
    res.json(credsDecrypted);
  } catch (error) { res.status(500).json({ mensaje: 'Error al obtener la papelera' }); }
};

exports.createCredential = async (req, res) => {
  try {
    const { clienteId, titulo, url, usuario, password, notas } = req.body;
    const nueva = new Credential({ clienteId, titulo, url, usuario, password: encrypt(password), notas });
    await nueva.save();
    res.status(201).json(nueva);
  } catch (error) { res.status(500).json({ mensaje: 'Error al guardar' }); }
};

exports.updateCredential = async (req, res) => {
  try {
    const { id } = req.params;
    const { clienteId, titulo, url, usuario, password, notas } = req.body;
    const cred = await Credential.findById(id);
    if (!cred) return res.status(404).json({ mensaje: 'No encontrada' });
    
    cred.clienteId = clienteId; cred.titulo = titulo; cred.url = url; 
    cred.usuario = usuario; cred.password = encrypt(password); cred.notas = notas;
    await cred.save();
    res.json({ mensaje: 'Actualizada' });
  } catch (error) { res.status(500).json({ mensaje: 'Error al actualizar' }); }
};

exports.deleteCredential = async (req, res) => {
  try {
    await Credential.findByIdAndUpdate(req.params.id, { eliminado: true });
    res.json({ mensaje: 'Movida a la papelera' });
  } catch (error) { res.status(500).json({ mensaje: 'Error al mover a papelera' }); }
};

exports.restaurarCredential = async (req, res) => {
  try {
    await Credential.findByIdAndUpdate(req.params.id, { eliminado: false });
    res.json({ mensaje: 'Restaurada' });
  } catch (error) { res.status(500).json({ mensaje: 'Error al restaurar' }); }
};

exports.destruirCredential = async (req, res) => {
  try {
    await Credential.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Destruida permanentemente' });
  } catch (error) { res.status(500).json({ mensaje: 'Error al destruir' }); }
};