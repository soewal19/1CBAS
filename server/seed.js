const db = require('./db');

db.serialize(() => {
    console.log("Seeding products...");
    db.run("INSERT INTO products (name, type, price) VALUES ('MacBook Pro M3', 'goods', 2500.00)");
    db.run("INSERT INTO products (name, type, price) VALUES ('Wireless Mouse', 'goods', 45.99)");
    db.run("INSERT INTO products (name, type, price) VALUES ('Express Delivery', 'service', 20.00)");
    db.run("INSERT INTO products (name, type, price) VALUES ('Office Chair Setup', 'service', 50.00)");
    console.log("Seed complete.");
});
