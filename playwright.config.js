import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    timeout: 30 * 1000,
    expect: { timeout: 5000 },
    fullyParallel: true,
    retries: 0,
    workers: 1,
    reporter: 'list',
    use: {
        actionTimeout: 0,
        trace: 'on-first-retry',
        baseURL: 'http://localhost:5175', // Vite dev server port (adjusted)
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        }
    ],
});
