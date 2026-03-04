const DEFAULT_PRODUCTS = [
    { id: 1, name: 'Industrial Steel', type: 'goods', price: 1200 },
    { id: 2, name: 'Logistics Service', type: 'service', price: 450 },
    { id: 3, name: 'Mainframe Unit', type: 'goods', price: 7800 }
];

const state = {
    products: [...DEFAULT_PRODUCTS],
    documents: [],
    nextDocId: 1
};

const json = (res, code, payload) => {
    res.statusCode = code;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(payload));
};

const setCors = (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

const readBody = (req) =>
    new Promise((resolve, reject) => {
        let raw = '';
        req.on('data', (chunk) => {
            raw += chunk;
        });
        req.on('end', () => {
            if (!raw) return resolve({});
            try {
                resolve(JSON.parse(raw));
            } catch (err) {
                reject(err);
            }
        });
        req.on('error', reject);
    });

const computeTotal = (lines = []) =>
    lines.reduce((sum, line) => sum + Number(line.quantity || 0) * Number(line.price || 0), 0);

const toDateISO = (value) => (value ? new Date(value).toISOString() : new Date().toISOString());

module.exports = async (req, res) => {
    setCors(res);

    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        return res.end();
    }

    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const path = url.pathname;

    try {
        if (req.method === 'GET' && path === '/api/products') {
            return json(res, 200, state.products);
        }

        if (req.method === 'GET' && path === '/api/documents') {
            const page = Math.max(1, Number(url.searchParams.get('page') || 1));
            const limit = Math.max(1, Number(url.searchParams.get('limit') || 10));
            const start = (page - 1) * limit;
            const end = start + limit;
            const sorted = [...state.documents].sort((a, b) => b.id - a.id);
            const data = sorted.slice(start, end);
            return json(res, 200, {
                data,
                pagination: {
                    total: sorted.length,
                    page,
                    limit,
                    pages: Math.max(1, Math.ceil(sorted.length / limit))
                }
            });
        }

        const docByIdMatch = path.match(/^\/api\/documents\/(\d+)$/);
        if (req.method === 'GET' && docByIdMatch) {
            const id = Number(docByIdMatch[1]);
            const doc = state.documents.find((d) => d.id === id);
            if (!doc) return json(res, 404, { error: 'Document not found' });
            return json(res, 200, doc);
        }

        if (req.method === 'POST' && path === '/api/documents') {
            const body = await readBody(req);
            const lines = Array.isArray(body.lines) ? body.lines : [];
            const doc = {
                id: state.nextDocId++,
                doc_type: body.doc_type || 'Order',
                document_date: toDateISO(body.document_date),
                status: 'draft',
                lines: lines.map((line) => ({
                    product_id: Number(line.product_id || 1),
                    quantity: Number(line.quantity || 0),
                    price: Number(line.price || 0)
                })),
                total_amount: computeTotal(lines)
            };
            state.documents.push(doc);
            return json(res, 200, { id: doc.id });
        }

        if (req.method === 'PUT' && docByIdMatch) {
            const id = Number(docByIdMatch[1]);
            const idx = state.documents.findIndex((d) => d.id === id);
            if (idx < 0) return json(res, 404, { error: 'Document not found' });
            const body = await readBody(req);
            const lines = Array.isArray(body.lines) ? body.lines : [];
            const next = {
                ...state.documents[idx],
                doc_type: body.doc_type || state.documents[idx].doc_type,
                document_date: toDateISO(body.document_date || state.documents[idx].document_date),
                lines: lines.map((line) => ({
                    product_id: Number(line.product_id || 1),
                    quantity: Number(line.quantity || 0),
                    price: Number(line.price || 0)
                })),
                total_amount: computeTotal(lines)
            };
            state.documents[idx] = next;
            return json(res, 200, next);
        }

        const postMatch = path.match(/^\/api\/documents\/(\d+)\/post$/);
        if (req.method === 'POST' && postMatch) {
            const id = Number(postMatch[1]);
            const doc = state.documents.find((d) => d.id === id);
            if (!doc) return json(res, 404, { error: 'Document not found' });
            doc.status = 'posted';
            return json(res, 200, { success: true, id });
        }

        if (req.method === 'DELETE' && docByIdMatch) {
            const id = Number(docByIdMatch[1]);
            state.documents = state.documents.filter((d) => d.id !== id);
            return json(res, 200, { success: true });
        }

        if (req.method === 'POST' && path === '/api/documents/generate') {
            return json(res, 200, {
                lines: [
                    {
                        product_id: 1,
                        quantity: 1,
                        price: 1200
                    }
                ]
            });
        }

        const invoiceFactorMatch = path.match(/^\/api\/documents\/(\d+)\/invoice-factor$/);
        if (req.method === 'POST' && invoiceFactorMatch) {
            const baseId = Number(invoiceFactorMatch[1]);
            const base = state.documents.find((d) => d.id === baseId);
            if (!base) return json(res, 404, { error: 'Document not found' });
            const doc = {
                ...base,
                id: state.nextDocId++,
                doc_type: 'InvoiceFactor',
                status: 'draft'
            };
            state.documents.push(doc);
            return json(res, 200, { id: doc.id });
        }

        const taxInvoiceMatch = path.match(/^\/api\/documents\/(\d+)\/tax-invoice$/);
        if (req.method === 'POST' && taxInvoiceMatch) {
            const baseId = Number(taxInvoiceMatch[1]);
            const base = state.documents.find((d) => d.id === baseId);
            if (!base) return json(res, 404, { error: 'Document not found' });
            const doc = {
                ...base,
                id: state.nextDocId++,
                doc_type: 'TaxInvoice',
                status: 'draft'
            };
            state.documents.push(doc);
            return json(res, 200, { id: doc.id });
        }

        if (req.method === 'GET' && path === '/api/reports/profits') {
            const rows = state.documents
                .filter((d) => d.doc_type === 'SalesInvoice' || d.doc_type === 'Order')
                .flatMap((d) => d.lines || [])
                .map((line, index) => ({
                    name: state.products.find((p) => p.id === line.product_id)?.name || `Item ${index + 1}`,
                    qty_sold: line.quantity,
                    total_revenue: line.quantity * line.price,
                    profit: line.quantity * line.price * 0.2
                }));
            return json(res, 200, rows);
        }

        if (req.method === 'GET' && path === '/api/reports/inventory') {
            const rows = state.products.map((p) => ({
                name: p.name,
                total_stock: 100,
                total_value: p.price * 100
            }));
            return json(res, 200, rows);
        }

        if (req.method === 'GET' && path === '/api/reports/sales') {
            return json(res, 200, [
                {
                    total_revenue: state.documents.reduce((sum, d) => sum + Number(d.total_amount || 0), 0)
                }
            ]);
        }

        if (req.method === 'GET' && path === '/api-docs') {
            return json(res, 200, {
                info: 'Swagger is not enabled in serverless lightweight backend.',
                routes: [
                    '/api/products',
                    '/api/documents',
                    '/api/reports/profits',
                    '/api/reports/inventory',
                    '/api/reports/sales'
                ]
            });
        }

        return json(res, 404, { error: 'Not Found' });
    } catch (err) {
        return json(res, 500, { error: err.message || 'Server error' });
    }
};
