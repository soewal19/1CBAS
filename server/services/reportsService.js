const reportsRepo = require('../repositories/reportsRepository');

module.exports = {
    inventoryReport: (date) => reportsRepo.inventory(date),
    salesReport: (start, end) => reportsRepo.sales(start, end),
    profitsReport: (start, end) => reportsRepo.profits(start, end)
};
