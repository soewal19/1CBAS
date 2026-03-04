import { test, expect } from '@playwright/test';

const HOSTED_BASE_URL = process.env.HOSTED_BASE_URL || 'https://1cbas-public-20260304.vercel.app';
const HOSTED_API_BASE_URL = process.env.HOSTED_API_BASE_URL || `${HOSTED_BASE_URL}/api`;

test.describe('Hosted deployment checks', () => {
    test('UI is reachable on hosted domain', async ({ page }) => {
        await page.goto(HOSTED_BASE_URL);
        await expect(page).toHaveURL(new RegExp(`^${HOSTED_BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/?`));
        await expect(page.locator('body')).toBeVisible();
    });

    test('API returns JSON for products endpoint', async ({ request }) => {
        const response = await request.get(`${HOSTED_API_BASE_URL}/products`);
        expect(response.ok()).toBeTruthy();
        const contentType = response.headers()['content-type'] || '';
        expect(contentType).toContain('application/json');

        const payload = await response.json();
        expect(Array.isArray(payload)).toBeTruthy();
    });

    test('Can input data and save new Order document', async ({ page }) => {
        await page.goto(`${HOSTED_BASE_URL}/documents/new/Order`);
        await page.waitForSelector('input[readOnly][value="NEW"]');

        await page.evaluate(() => window.__testAddLine && window.__testAddLine());
        await page.waitForSelector('input[type="number"]');
        await page.fill('input[type="number"]', '3');
        await page.click('button:has-text("Write")');

        await expect(page).toHaveURL(/\/documents(\/edit\/\d+)?$/);
        await expect(page.locator('p:has-text("Error processing document")')).toHaveCount(0);
    });
});
