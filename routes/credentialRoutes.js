const express = require('express');
const router = express.Router();
const credentialController = require('../controllers/credentialController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware); 

router.get('/', credentialController.getCredentials);
router.get('/papelera', credentialController.getPapelera); 
router.post('/', credentialController.createCredential);
router.put('/:id', credentialController.updateCredential);
router.put('/:id/restaurar', credentialController.restaurarCredential); 
router.delete('/:id', credentialController.deleteCredential);
router.delete('/:id/destruir', credentialController.destruirCredential); 

module.exports = router;