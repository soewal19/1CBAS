const documentsService = require('../services/documentsService');

exports.list = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const start = req.query.start;
        const end = req.query.end;
        const type = req.query.type;
        const result = await documentsService.listDocuments(page, limit, start, end, type);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const result = await documentsService.updateDocument(req.params.id, req.body);
        const io = req.app.get('io');
        if (io) io.emit('document_updated', { id: Number(req.params.id) });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const result = await documentsService.deleteDocument(req.params.id);
        const io = req.app.get('io');
        if (io) io.emit('document_deleted', { id: Number(req.params.id) });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const doc = await documentsService.getDocument(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Document not found' });
        res.json(doc);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const result = await documentsService.createDocument(req.body);
        const io = req.app.get('io');
        if (io) io.emit('document_added', { id: result.id, doc_type: req.body.doc_type || 'Order' });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.post = async (req, res) => {
    try {
        const result = await documentsService.postDocument(req.params.id);
        const io = req.app.get('io');
        if (io) io.emit('document_posted', { id: Number(req.params.id) });
        res.json(result);
    } catch (err) {
        if (err.status) {
            res.status(err.status).json({ error: err.message });
        } else {
            res.status(500).json({ error: err.message || 'Internal error' });
        }
    }
};

exports.createInvoiceFactor = async (req, res) => {
    try {
        const newDoc = await documentsService.createInvoiceFactor(req.params.id);
        res.json(newDoc);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message || 'Server error' });
    }
};

exports.createTaxInvoice = async (req, res) => {
    try {
        const newDoc = await documentsService.createTaxInvoice(req.params.id);
        res.json(newDoc);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message || 'Server error' });
    }
};

exports.generateContent = async (req, res) => {
    try {
        const { docType, documentDate } = req.body;
        const lines = await documentsService.generateDocumentLines(docType, documentDate);
        res.json({ lines });
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message || 'Server error' });
    }
};
