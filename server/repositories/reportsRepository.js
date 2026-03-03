const db = require('../db');

module.exports = {
    inventory: (date) => {
        const params = [];
        const dateFilter = date ? 'AND date(ib.created_at) <= date(?)' : '';
        if (date) params.push(date);
        const query = `
            SELECT p.name, SUM(ib.remaining_quantity) as total_stock, 
                   SUM(ib.remaining_quantity * ib.cost_per_unit) as total_value
            FROM inventory_batches ib
            JOIN products p ON ib.product_id = p.id
            WHERE ib.remaining_quantity > 0 ${dateFilter}
            GROUP BY p.id
        `;
        return new Promise((resolve, reject) => {
            db.all(query, params, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },

    sales: (start, end) => {
        const params = [];
        const dateFilter = (start && end) ? 'AND date(d.document_date) BETWEEN date(?) AND date(?)' : '';
        if (start && end) params.push(start, end);
        const query = `
            SELECT p.name, SUM(dl.quantity) as total_qty, SUM(dl.quantity * dl.price) as total_revenue
            FROM document_lines dl
            JOIN documents d ON dl.document_id = d.id
            JOIN products p ON dl.product_id = p.id
            WHERE d.doc_type = 'SalesInvoice' AND d.status = 'posted' ${dateFilter}
            GROUP BY p.id
        `;
        return new Promise((resolve, reject) => {
            db.all(query, params, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },

    profits: (start, end) => {
        const txFilter = (start && end) ? 'AND date(it.created_at) BETWEEN date(?) AND date(?)' : '';
        const txParams = start && end ? [start, end] : [];
        const salesFilter = (start && end) ? 'AND date(d2.document_date) BETWEEN date(?) AND date(?)' : '';
        const salesParams = start && end ? [start, end] : [];
        const detailedQuery = `
            SELECT p.name, 
                   SUM(it.quantity) as qty_sold, 
                   SUM(it.cost) as total_cost,
                   (SELECT SUM(dl2.quantity * dl2.price) 
                    FROM document_lines dl2 
                    JOIN documents d2 ON dl2.document_id = d2.id 
                    WHERE dl2.product_id = it.product_id 
                    AND d2.doc_type = 'SalesInvoice' 
                    AND d2.status = 'posted'
                    ${salesFilter}
                   ) as total_revenue
            FROM inventory_transactions it
            JOIN products p ON it.product_id = p.id
            WHERE it.transaction_type = 'OUT' ${txFilter}
            GROUP BY it.product_id
        `;
        const params = [...salesParams, ...txParams];
        return new Promise((resolve, reject) => {
            db.all(detailedQuery, params, (err, rows) => {
                if (err) return reject(err);
                resolve(rows.map(r => ({
                    ...r,
                    profit: (r.total_revenue || 0) - r.total_cost
                })));
            });
        });
    }
};
