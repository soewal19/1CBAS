const db = require('../db');

module.exports = {
    getAll: () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM products', [], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },

    create: ({ name, type, price }) => {
        return new Promise((resolve, reject) => {
            db.run('INSERT INTO products (name, type, price) VALUES (?, ?, ?)', [name, type, price], function (err) {
                if (err) return reject(err);
                resolve({ id: this.lastID, name, type, price });
            });
        });
    }
};
