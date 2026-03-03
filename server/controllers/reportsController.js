const reportsService = require('../services/reportsService');

exports.inventory = async (req, res) => {
    try {
        const data = await reportsService.inventoryReport(req.query.date);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.sales = async (req, res) => {
    try {
        const { start, end } = req.query;
        const data = await reportsService.salesReport(start, end);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.profits = async (req, res) => {
    try {
        const { start, end } = req.query;
        const data = await reportsService.profitsReport(start, end);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
