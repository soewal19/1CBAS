const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const logger = require('./logger');

const dbPath = path.resolve(__dirname, '1cremix.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        logger.error(`Error opening database: ${err.message}`);
    } else {
        logger.info('Connected to the SQLite database.');
        db.run('PRAGMA foreign_keys = ON;', initializeSchema);
    }
});

function initializeSchema() {
    db.serialize(() => {
        // Products Table
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT CHECK(type IN ('goods', 'service')) NOT NULL,
            price REAL NOT NULL
        )`);

        // Documents Table
        db.run(`CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            doc_type TEXT CHECK(doc_type IN ('PurchaseInvoice', 'SalesInvoice', 'Order', 'InvoiceFactor', 'TaxInvoice')) NOT NULL,
            document_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'draft',
            total_amount REAL DEFAULT 0
        )`);

        // Document Lines Table
        db.run(`CREATE TABLE IF NOT EXISTS document_lines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            document_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity REAL NOT NULL,
            price REAL NOT NULL,
            FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id)
        )`);

        // FIFO Inventory Batches Table
        db.run(`CREATE TABLE IF NOT EXISTS inventory_batches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            purchase_doc_line_id INTEGER NOT NULL,
            initial_quantity REAL NOT NULL,
            remaining_quantity REAL NOT NULL,
            cost_per_unit REAL NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id),
            FOREIGN KEY (purchase_doc_line_id) REFERENCES document_lines(id)
        )`);

        // Inventory Transactions Table
        db.run(`CREATE TABLE IF NOT EXISTS inventory_transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            document_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity REAL NOT NULL,
            transaction_type TEXT CHECK(transaction_type IN ('IN', 'OUT')) NOT NULL,
            cost REAL NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (document_id) REFERENCES documents(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
        )`);

        logger.info('Database schema initialized.');
        seedData();
    });
}

function seedData() {
    db.get('SELECT COUNT(*) as count FROM documents', (err, row) => {
        if (err || row.count > 0) return;

        logger.info('Seeding database with 50 default documents...');
        const docTypes = ['PurchaseInvoice', 'SalesInvoice', 'Order', 'InvoiceFactor', 'TaxInvoice'];
        const statuses = ['draft', 'posted'];

        // Ensure we have some products first
        db.run("INSERT OR IGNORE INTO products (name, type, price) VALUES ('Industrial Steel', 'goods', 1200), ('Logistics Service', 'service', 450), ('Mainframe Unit', 'goods', 7800)");

        db.serialize(() => {
            const stmt = db.prepare('INSERT INTO documents (doc_type, status, total_amount, document_date) VALUES (?, ?, ?, ?)');
            for (let i = 1; i <= 50; i++) {
                const type = docTypes[Math.floor(Math.random() * docTypes.length)];
                const status = statuses[Math.floor(Math.random() * statuses.length)];
                const amount = Math.floor(Math.random() * 50000) + 1000;
                const date = new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toISOString();
                stmt.run(type, status, amount, date);
            }
            stmt.finalize();
            logger.info('Successfully seeded 50 documents.');
        });
    });
}

module.exports = db;
