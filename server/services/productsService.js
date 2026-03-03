const productRepo = require('../repositories/productRepository');

module.exports = {
    listProducts: () => productRepo.getAll(),
    addProduct: (productData) => productRepo.create(productData)
};
