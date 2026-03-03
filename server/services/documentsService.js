const db = require('../db');
const docRepo = require('../repositories/documentRepository');
const inventoryRepo = require('../repositories/inventoryRepository');
const logger = require('../logger');

async function listDocuments(page = 1, limit = 10, start, end, docType) {
    const offset = (page - 1) * limit;
    const total = await docRepo.count(start, end, docType);
    const data = await docRepo.list(limit, offset, start, end, docType);
    return {
        data,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
        }
    };
}

async function deleteDocument(id) {
    // remove document and cascade
    await docRepo.delete(id);
    return { success: true };
}

async function getDocument(id) {
    const doc = await docRepo.getById(id);
    if (!doc) return null;
    const lines = await docRepo.getLines(id);
    doc.lines = lines;
    return doc;
}

function createDocument({ doc_type, lines, document_date }) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');

            let total_amount = 0;
            lines.forEach(line => total_amount += (line.quantity * line.price));

            const insertSql = document_date
                ? 'INSERT INTO documents (doc_type, total_amount, document_date) VALUES (?, ?, ?)'
                : 'INSERT INTO documents (doc_type, total_amount) VALUES (?, ?)';
            const params = document_date ? [doc_type, total_amount, document_date] : [doc_type, total_amount];

            db.run(insertSql, params, function (err) {
                if (err) {
                    logger.error(`Error inserting document header: ${err.message}`);
                    db.run('ROLLBACK');
                    return reject(err);
                }
                const docId = this.lastID;
                let completedLines = 0;

                if (lines.length === 0) {
                    db.run('COMMIT');
                    logger.info(`Empty document created: ID ${docId}`);
                    return resolve({ id: docId, doc_type, total_amount });
                }

                lines.forEach(line => {
                    db.run('INSERT INTO document_lines (document_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                        [docId, line.product_id, line.quantity, line.price], function (err) {
                            if (err) {
                                logger.error(`Error inserting document line: ${err.message}`);
                                db.run('ROLLBACK');
                                return reject(err);
                            }

                            completedLines++;
                            if (completedLines === lines.length) {
                                db.run('COMMIT', (err) => {
                                    if (err) {
                                        logger.error(`Error committing document creation: ${err.message}`);
                                        return reject(err);
                                    }
                                    logger.info(`Document created: ID ${docId}, Type: ${doc_type}`);
                                    resolve({ id: docId, doc_type, total_amount });
                                });
                            }
                        });
                });
            });
        });
    });
}

async function updateDocument(id, { doc_type, lines, document_date }) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            let total_amount = 0;
            lines.forEach(line => total_amount += (line.quantity * line.price));

            docRepo.updateHeader(id, doc_type, total_amount, document_date)
                .then(() => docRepo.clearLines(id))
                .then(() => {
                    let completed = 0;
                    if (lines.length === 0) return Promise.resolve();
                    return new Promise((res, rej) => {
                        lines.forEach(line => {
                            db.run('INSERT INTO document_lines (document_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                                [id, line.product_id, line.quantity, line.price], function (err) {
                                    if (err) return rej(err);
                                    completed++;
                                    if (completed === lines.length) res();
                                });
                        });
                    });
                })
                .then(() => {
                    db.run('COMMIT');
                    resolve({ success: true, id });
                })
                .catch(err => {
                    db.run('ROLLBACK');
                    reject(err);
                });
        });
    });
}

async function postDocument(id) {
    const doc = await docRepo.getById(id);
    if (!doc) throw { status: 404, message: 'Document not found' };
    if (doc.status === 'posted') throw { status: 400, message: 'Document already posted' };

    const lines = await new Promise((resolve, reject) => {
        db.all('SELECT dl.*, p.type as product_type FROM document_lines dl JOIN products p ON dl.product_id = p.id WHERE document_id = ?', [id], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });

    if (doc.doc_type === 'PurchaseInvoice') {
        return postPurchase(doc, lines);
    } else if (doc.doc_type === 'SalesInvoice') {
        return postSales(doc, lines);
    } else {
        await docRepo.updateStatus(id, 'posted');
        return { success: true, message: 'Document posted' };
    }
}

// create a new document of given type copied from an existing one
async function createDerivedDocument(baseId, newType) {
    const base = await getDocument(baseId);
    if (!base) throw { status: 404, message: 'Base document not found' };
    const lines = base.lines.map(l => ({ product_id: l.product_id, quantity: l.quantity, price: l.price }));
    const newDoc = await createDocument({ doc_type: newType, lines });
    return newDoc;
}

async function createInvoiceFactor(baseId) {
    return createDerivedDocument(baseId, 'InvoiceFactor');
}

async function createTaxInvoice(baseId) {
    return createDerivedDocument(baseId, 'TaxInvoice');
}

function postPurchase(doc, lines) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            let errorOccurred = false;

            lines.forEach(line => {
                if (line.product_type === 'goods') {
                    inventoryRepo.createBatch({
                        product_id: line.product_id,
                        purchase_doc_line_id: line.id,
                        initial_quantity: line.quantity,
                        remaining_quantity: line.quantity,
                        cost_per_unit: line.price
                    }).catch(() => { errorOccurred = true; });

                    inventoryRepo.createTransaction({
                        document_id: doc.id,
                        product_id: line.product_id,
                        quantity: line.quantity,
                        transaction_type: 'IN',
                        cost: line.price
                    }).catch(() => { errorOccurred = true; });
                }
            });

            if (errorOccurred) {
                logger.error(`Failed to post PurchaseInvoice ID ${doc.id} due to transaction error.`);
                db.run('ROLLBACK');
                return reject({ status: 500, message: 'Failed to post purchase' });
            } else {
                docRepo.updateStatus(doc.id, 'posted')
                    .then(() => db.run('COMMIT'))
                    .then(() => {
                        logger.info(`PurchaseInvoice ID ${doc.id} posted. Batches updated.`);
                        resolve({ success: true });
                    })
                    .catch(err => reject(err));
            }
        });
    });
}

function postSales(doc, lines) {
    const requiredGoods = lines.filter(l => l.product_type === 'goods');
    if (requiredGoods.length === 0) {
        return docRepo.updateStatus(doc.id, 'posted').then(() => ({ success: true, message: 'Only services posted' }));
    }

    const stockPromises = requiredGoods.map(line => {
        return inventoryRepo.getBatches(line.product_id).then(batches => {
            let quantityNeeded = line.quantity;
            const availableStock = batches.reduce((sum, b) => sum + b.remaining_quantity, 0);
            if (availableStock < quantityNeeded) {
                throw { type: 'STOCK_ERROR', product_id: line.product_id, deficit: quantityNeeded - availableStock };
            }

            const batchUpdates = [];
            const transactions = [];
            let totalCost = 0;

            for (let batch of batches) {
                if (quantityNeeded <= 0) break;

                const qtyToTake = Math.min(batch.remaining_quantity, quantityNeeded);
                batchUpdates.push({ id: batch.id, remaining: batch.remaining_quantity - qtyToTake });

                transactions.push({
                    document_id: doc.id,
                    product_id: line.product_id,
                    quantity: qtyToTake,
                    cost: batch.cost_per_unit * qtyToTake
                });

                totalCost += batch.cost_per_unit * qtyToTake;
                quantityNeeded -= qtyToTake;
            }

            return { batchUpdates, transactions };
        });
    });

    return Promise.all(stockPromises).then(results => {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                results.forEach(resGroup => {
                    resGroup.batchUpdates.forEach(update => {
                        db.run('UPDATE inventory_batches SET remaining_quantity = ? WHERE id = ?', [update.remaining, update.id]);
                    });

                    resGroup.transactions.forEach(t => {
                        db.run(`INSERT INTO inventory_transactions (document_id, product_id, quantity, transaction_type, cost) 
                            VALUES (?, ?, ?, 'OUT', ?)`, [t.document_id, t.product_id, t.quantity, t.cost]);
                    });
                });

                db.run("UPDATE documents SET status = 'posted' WHERE id = ?", [doc.id]);
                db.run('COMMIT');
                logger.info(`Sales Invoice ${doc.id} correctly posted natively evaluating FIFO limits.`);
                resolve({ success: true });
            });
        });
    });
}

// Generate document lines based on business logic (similar to 1C Enterprise)
async function generateDocumentLines(docType, documentDate) {
    return new Promise((resolve, reject) => {
        const parsedDate = documentDate ? new Date(documentDate) : new Date();
        const baseDate = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
        const month = baseDate.getMonth() + 1;
        const dayOfWeek = baseDate.getDay();

        // Pull products in random order so Generate does not produce the same set each time.
        db.all('SELECT * FROM products WHERE type = ? ORDER BY RANDOM() LIMIT 20', ['goods'], (err, products) => {
            if (err) return reject(err);

            if (products.length === 0) {
                return resolve([]);
            }

            const lines = [];

            const seasonBoost = month >= 11 || month <= 1 ? 1.2 : month >= 6 && month <= 8 ? 0.9 : 1.0;
            const weekdayBoost = dayOfWeek === 0 || dayOfWeek === 6 ? 0.8 : 1.0;

            const makePrice = (basePrice, mode) => {
                const randomSpread = 0.95 + Math.random() * 0.2;
                const modeMultiplier = mode === 'purchase' ? 0.65 : mode === 'sales' ? 1.05 : 1.0;
                const priced = basePrice * randomSpread * seasonBoost * modeMultiplier;
                return Number(priced.toFixed(2));
            };

            const makeQty = (min, max) => {
                const raw = Math.floor(Math.random() * (max - min + 1)) + min;
                return Math.max(1, Math.round(raw * weekdayBoost));
            };

            switch (docType) {
                case 'Order':
                    products.slice(0, Math.min(5, products.length)).forEach(product => {
                        lines.push({
                            id: Date.now() + Math.random(),
                            product_id: product.id,
                            quantity: makeQty(1, 12),
                            price: makePrice(product.price, 'order')
                        });
                    });
                    break;

                case 'PurchaseInvoice':
                    products.slice(0, Math.min(8, products.length)).forEach(product => {
                        lines.push({
                            id: Date.now() + Math.random(),
                            product_id: product.id,
                            quantity: makeQty(10, 60),
                            price: makePrice(product.price, 'purchase')
                        });
                    });
                    break;

                case 'SalesInvoice':
                    products.slice(0, Math.min(6, products.length)).forEach(product => {
                        lines.push({
                            id: Date.now() + Math.random(),
                            product_id: product.id,
                            quantity: makeQty(1, 6),
                            price: makePrice(product.price, 'sales')
                        });
                    });
                    break;

                default:
                    const itemCount = Math.floor(Math.random() * 4) + 3;
                    products.slice(0, itemCount).forEach(product => {
                        lines.push({
                            id: Date.now() + Math.random(),
                            product_id: product.id,
                            quantity: makeQty(1, 8),
                            price: makePrice(product.price, 'order')
                        });
                    });
                    break;
            }

            resolve(lines);
        });
    });
}

module.exports = {
    listDocuments,
    getDocument,
    createDocument,
    updateDocument,
    deleteDocument,
    postDocument,
    createInvoiceFactor,
    createTaxInvoice,
    generateDocumentLines
};
