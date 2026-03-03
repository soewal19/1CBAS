const db = require('../db');

module.exports = {
    count: (startDate, endDate, docType) => {
        return new Promise((resolve, reject) => {
            let query = 'SELECT COUNT(*) as count FROM documents';
            const params = [];
            const conditions = [];
            if (startDate) {
                conditions.push('document_date >= ?');
                params.push(startDate);
            }
            if (endDate) {
                conditions.push('document_date <= ?');
                params.push(endDate);
            }
            if (docType) {
                conditions.push('doc_type = ?');
                params.push(docType);
            }
            if (conditions.length) {
                query += ' WHERE ' + conditions.join(' AND ');
            }
            db.get(query, params, (err, row) => {
                if (err) return reject(err);
                resolve(row.count);
            });
        });
    },

    list: (limit, offset, startDate, endDate, docType) => {
        return new Promise((resolve, reject) => {
            let query = 'SELECT * FROM documents';
            const params = [];
            const conditions = [];
            if (startDate) {
                conditions.push('document_date >= ?');
                params.push(startDate);
            }
            if (endDate) {
                conditions.push('document_date <= ?');
                params.push(endDate);
            }
            if (docType) {
                conditions.push('doc_type = ?');
                params.push(docType);
            }
            if (conditions.length) {
                query += ' WHERE ' + conditions.join(' AND ');
            }
            query += ' ORDER BY document_date DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);
            db.all(query, params, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },

    delete: (id) => {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM documents WHERE id = ?', [id], function (err) {
                if (err) return reject(err);
                resolve();
            });
        });
    },

    getById: (id) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM documents WHERE id = ?', [id], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });
    },

    getLines: (id) => {
        return new Promise((resolve, reject) => {
            db.all(
                'SELECT dl.*, p.name as product_name, p.type as product_type FROM document_lines dl JOIN products p ON dl.product_id = p.id WHERE document_id = ?',
                [id],
                (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows);
                }
            );
        });
    },

    createHeader: (doc_type, total_amount) => {
        return new Promise((resolve, reject) => {
            db.run('INSERT INTO documents (doc_type, total_amount) VALUES (?, ?)', [doc_type, total_amount], function (err) {
                if (err) return reject(err);
                resolve(this.lastID);
            });
        });
    },

    addLine: (docId, line) => {
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO document_lines (document_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [docId, line.product_id, line.quantity, line.price],
                function (err) {
                    if (err) return reject(err);
                    resolve();
                }
            );
        });
    },

    updateStatus: (id, status) => {
        return new Promise((resolve, reject) => {
            db.run('UPDATE documents SET status = ? WHERE id = ?', [status, id], function (err) {
                if (err) return reject(err);
                resolve();
            });
        });
    },

    updateHeader: (id, doc_type, total_amount, document_date) => {
        return new Promise((resolve, reject) => {
            db.run('UPDATE documents SET doc_type = ?, total_amount = ?, document_date = ? WHERE id = ?',
                [doc_type, total_amount, document_date, id],
                function (err) {
                    if (err) return reject(err);
                    resolve();
                });
        });
    },

    clearLines: (document_id) => {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM document_lines WHERE document_id = ?', [document_id], function (err) {
                if (err) return reject(err);
                resolve();
            });
        });
    }
};
