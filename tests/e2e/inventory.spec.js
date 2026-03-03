import { test, expect } from '@playwright/test';

test.describe('BAS Reborn m.1.001 β Core Inventory Flow', () => {
    test('Should create an order without error', async ({ page }) => {
        await page.goto('/documents/new/Order');
        // wait for editor to render
        await page.waitForSelector('input[readOnly][value="NEW"]');

        // Add a line via helper and save (Write button)
        await page.evaluate(() => window.__testAddLine && window.__testAddLine());
        await page.waitForSelector('input[type="number"]');
        await page.fill('input[type="number"]', '5');
        await page.click('button:has-text("Write")');

        // back on documents list
        await expect(page).toHaveURL(/\/documents/);
    });

    test('Should block selling goods without stock', async ({ page }) => {
        await page.goto('/documents/new/SalesInvoice');
        await page.waitForSelector('input[readOnly][value="NEW"]');
        await page.evaluate(() => window.__testAddLine && window.__testAddLine());
        await page.waitForSelector('input[type="number"]');
        await page.fill('input[type="number"]', '10');
        await page.click('button:has-text("Write")');
        await page.waitForURL(/\/documents/);
        // attempt to post
        await page.click('button:has-text("Post")');
        page.on('dialog', dialog => {
            expect(dialog.message()).toMatch(/stock/i);
            dialog.accept();
        });
    });

    test('Should allow purchase, subsequent sale and generate related documents', async ({ page }) => {
        // Purchase invoice
        await page.goto('/documents/new/PurchaseInvoice');
        await page.waitForSelector('input[readOnly][value="NEW"]');
        await page.evaluate(() => window.__testAddLine && window.__testAddLine());
        await page.waitForSelector('input[type="number"]');
        await page.fill('input[type="number"]', '50');
        await page.click('button:has-text("Write")');
        await page.waitForURL(/\/documents/);
        await page.click('button:has-text("Post")');
        page.once('dialog', d => d.accept());

        // Create order then invoice factor
        await page.goto('/documents/new/Order');
        await page.waitForSelector('input[readOnly][value="NEW"]');
        await page.evaluate(() => window.__testAddLine && window.__testAddLine());
        await page.waitForSelector('input[type="number"]');
        await page.fill('input[type="number"]', '1');
        await page.click('button:has-text("Write")');
        await page.waitForURL(/\/documents/);
        // open first document (should be order)
        await page.click('tbody tr:first-child td:nth-child(2)');
        // click InvoiceFactor button
        await page.click('button:has-text("InvoiceFactor")');
        await page.waitForURL(/\/documents\/edit\//);
        // ensure doc type shows
        await expect(page.locator('input[readOnly][value="InvoiceFactor"]')).toBeVisible();

        // from invoice factor create sales invoice
        await page.click('button:has-text("Create SalesInvoice")');
        await page.waitForURL(/\/documents\/new\/SalesInvoice/);

        // finally create tax invoice from sales invoice
        await page.waitForSelector('input[readOnly][value="NEW"]');
        await page.evaluate(() => window.__testAddLine && window.__testAddLine());
        await page.waitForSelector('input[type="number"]');
        await page.fill('input[type="number"]', '1');
        await page.click('button:has-text("Write")');
        await page.waitForURL(/\/documents/);
        await page.click('tbody tr:first-child td:nth-child(2)');
        await page.click('button:has-text("TaxInvoice")');
        await page.waitForURL(/\/documents\/edit\//);
        await expect(page.locator('input[readOnly][value="TaxInvoice"]')).toBeVisible();
    });

    test('Should filter by date range and delete first document', async ({ page }) => {
        await page.goto('/documents');
        // set start/end inputs
        const inputs = page.locator('input[type="date"]');
        await inputs.nth(0).fill('2024-01-01');
        await inputs.nth(1).fill('2025-12-31');
        await page.waitForTimeout(500);
        const rows = page.locator('tbody tr');
        const rowsBefore = await rows.count();
        if (rowsBefore > 0) {
            const firstText = await rows.first().innerText();
            if (!firstText.includes('No documents found')) {
                // hover to reveal actions then click delete icon
                await page.hover('tbody tr:first-child');
                await page.click('tbody tr:first-child td:last-child button:nth-child(2)');
                page.on('dialog', d => d.accept());
                const rowsAfter = await page.locator('tbody tr').count();
                expect(rowsAfter).toBeLessThan(rowsBefore);
            }
        }
    });
});
