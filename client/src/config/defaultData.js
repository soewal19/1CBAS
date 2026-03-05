export const DEFAULT_PRODUCTS = [
    { id: 1, name: 'Industrial Steel', type: 'goods', price: 1200 },
    { id: 2, name: 'Logistics Service', type: 'service', price: 450 },
    { id: 3, name: 'Mainframe Unit', type: 'goods', price: 7800 }
];

const DOC_TYPES = ['Order', 'PurchaseInvoice', 'SalesInvoice', 'InvoiceFactor', 'TaxInvoice'];

export const buildDefaultDocuments = (count = 20) => {
    const rows = [];
    for (let i = 1; i <= count; i += 1) {
        const type = DOC_TYPES[i % DOC_TYPES.length];
        const product = DEFAULT_PRODUCTS[i % DEFAULT_PRODUCTS.length];
        const qty = (i % 5) + 1;
        rows.push({
            id: i,
            doc_type: type,
            status: i % 3 === 0 ? 'posted' : 'draft',
            document_date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
            total_amount: qty * product.price
        });
    }
    return rows;
};

export const DEFAULT_INVENTORY_REPORT = DEFAULT_PRODUCTS.map((product) => ({
    name: product.name,
    total_stock: 100,
    total_value: product.price * 100
}));

export const DEFAULT_PROFIT_REPORT = DEFAULT_PRODUCTS.map((product, idx) => {
    const qty = idx + 2;
    const totalRevenue = qty * product.price;
    return {
        name: product.name,
        qty_sold: qty,
        total_revenue: totalRevenue,
        profit: Math.round(totalRevenue * 0.2)
    };
});
