const productService = require('../services/productsService');

exports.getProducts = async (req, res) => {
    try {
        const products = await productService.listProducts();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const product = await productService.addProduct(req.body);
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
