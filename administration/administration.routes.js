const { Router, static } = require('express');
const path = require('path');

const router = Router();

// Carpeta con documentos y PDFs
router.use('/documents', static(path.join(__dirname, 'documents')));

module.exports = router;