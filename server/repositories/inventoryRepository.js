const db = require('../db');

module.exports = {
    createBatch: ({ product_id, purchase_doc_line_id, initial_quantity, remaining_quantity, cost_per_unit }) => {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO inventory_batches (product_id, purchase_doc_line_id, initial_quantity, remaining_quantity, cost_per_unit) 
                 VALUES (?, ?, ?, ?, ?)`,
                [product_id, purchase_doc_line_id, initial_quantity, remaining_quantity, cost_per_unit],
                function (err) {
                    if (err) return reject(err);
                    resolve(this.lastID);
                }
            );
        });
    },

    createTransaction: ({ document_id, product_id, quantity, transaction_type, cost }) => {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO inventory_transactions (document_id, product_id, quantity, transaction_type, cost) 
                 VALUES (?, ?, ?, ?, ?)`,
                [document_id, product_id, quantity, transaction_type, cost],
                function (err) {
                    if (err) return reject(err);
                    resolve();
                }
            );
        });
    },

    getBatches: (product_id) => {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM inventory_batches WHERE product_id = ? AND remaining_quantity > 0 ORDER BY created_at ASC`,
                [product_id],
                (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows);
                }
            );
        });
    },

    updateBatchRemaining: (id, remaining) => {
        return new Promise((resolve, reject) => {
            db.run('UPDATE inventory_batches SET remaining_quantity = ? WHERE id = ?', [remaining, id], function (err) {
                if (err) return reject(err);
                resolve();
            });
        });
    }
};
