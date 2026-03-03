const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const db = require('./db');
const logger = require('./logger');

// swagger setup
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// controllers
const productController = require('./controllers/productsController');
const documentsController = require('./controllers/documentsController');
const reportsController = require('./controllers/reportsController');

app.use(cors());
app.use(express.json());

const PORT = 3000;

// swagger specification
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'BAS Reborn API',
        version: '1.0.0',
        description: 'Auto-generated API documentation for the BAS Reborn m.1.001 β server'
    },
    servers: [
        { url: `http://localhost:${PORT}` }
    ]
};

const swaggerOptions = {
    swaggerDefinition,
    apis: ['./server/server.js', './server/controllers/*.js']
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Socket.IO Logic
io.on('connection', (socket) => {
    logger.info(`New client connected: ${socket.id}`);

    socket.on('ping', () => {
        logger.info(`Ping received from ${socket.id}`);
        socket.emit('pong', { message: 'pong', timestamp: new Date() });
    });

    socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
    });
});

// Log all incoming requests
app.use((req, res, next) => {
    logger.info(`Incoming API Request: ${req.method} ${req.url}`);
    next();
});

// =======================
// PRODUCTS API
// =======================
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Retrieve a list of products
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Server error
 */
app.get('/api/products', productController.getProducts);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       200:
 *         description: The created product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       500:
 *         description: Server error
 */
app.post('/api/products', productController.createProduct);

// =======================
// DOCUMENTS API
// =======================
/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: List documents with pagination
 *     tags:
 *       - Documents
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: start
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: end
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Paginated documents
 *       500:
 *         description: Server error
 */
app.get('/api/documents', documentsController.list);

/**
 * @swagger
 * /api/documents/{id}:
 *   get:
 *     summary: Get a document by ID
 *     tags:
 *       - Documents
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document object with lines
 *       404:
 *         description: Document not found
 *       500:
 *         description: Server error
 */
app.get('/api/documents/:id', documentsController.getById);

/**
 * @swagger
 * /api/documents:
 *   post:
 *     summary: Create a new document with lines
 *     tags:
 *       - Documents
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               doc_type:
 *                 type: string
 *               lines:
 *                 type: array
 *                 items:
 *                   type: object
 *             required:
 *               - doc_type
 *     responses:
 *       200:
 *         description: Created document information
 *       500:
 *         description: Server error
 */
app.post('/api/documents', documentsController.create);

/**
 * @swagger
 * /api/documents/{id}:
 *   put:
 *     summary: Update an existing document (header and lines)
 *     tags:
 *       - Documents
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Document ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               doc_type:
 *                 type: string
 *               document_date:
 *                 type: string
 *                 format: date
 *               lines:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Updated document
 *       500:
 *         description: Server error
 */
app.put('/api/documents/:id', documentsController.update);

// Swagger docs for derived document endpoints
/**
 * @swagger
 * /api/documents/{id}/invoice-factor:
 *   post:
 *     summary: Create InvoiceFactor based on existing document
 *     tags:
 *       - Documents
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Base document ID
 *     responses:
 *       200:
 *         description: New document created
 *       404:
 *         description: Base document not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/documents/{id}/tax-invoice:
 *   post:
 *     summary: Create TaxInvoice based on SalesInvoice
 *     tags:
 *       - Documents
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: SalesInvoice document ID
 *     responses:
 *       200:
 *         description: New TaxInvoice created
 *       404:
 *         description: Base document not found
 *       500:
 *         description: Server error
 */

// =======================
// POSTING DOCUMENTS (FIFO LOGIC)
// =======================
app.post('/api/documents/:id/post', documentsController.post);

// derived document helpers
app.post('/api/documents/:id/invoice-factor', documentsController.createInvoiceFactor);
app.post('/api/documents/:id/tax-invoice', documentsController.createTaxInvoice);

// generate document content
app.post('/api/documents/generate', documentsController.generateContent);

// document deletion
/**
 * @swagger
 * /api/documents/{id}:
 *   delete:
 *     summary: Delete a document and its lines
 *     tags:
 *       - Documents
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Server error
 */
app.delete('/api/documents/:id', documentsController.delete);



// =======================
// REPORTS API (delegated to controller)
// =======================
app.get('/api/reports/inventory', reportsController.inventory);
app.get('/api/reports/sales', reportsController.sales);
app.get('/api/reports/profits', reportsController.profits);


// swagger components (schemas)
/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         type:
 *           type: string
 *         price:
 *           type: number
 *       required:
 *         - name
 *         - type
 *         - price
 *     ProductInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         type:
 *           type: string
 *         price:
 *           type: number
 *       required:
 *         - name
 *         - type
 *         - price
 *     Document:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         doc_type:
 *           type: string
 *         total_amount:
 *           type: number
 *         status:
 *           type: string
 *         document_date:
 *           type: string
 *           format: date-time
 *         lines:
 *           type: array
 *           items:
 *             type: object
 */

server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
