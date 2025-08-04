import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    testMatch: '**/*.spec.ts',
    timeout: 30 * 1000,
    expect: {
        timeout: 5000
    },
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        ['html'],
        ['json', { outputFile: 'test-results/performance-results.json' }],
        ['junit', { outputFile: 'test-results/junit.xml' }]
    ],
    use: {
        baseURL: 'http://localhost:8011',
        trace: 'on-first-retry',
        // Enable clipboard permissions for testing
        permissions: ['clipboard-read', 'clipboard-write'],
        screenshot: 'only-on-failure',
        video: 'retain-on-failure'
    },

    projects: [
        // Desktop browsers
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] }
        }
        // Temporarily disabled for testing
        // {
        //     name: 'firefox',
        //     use: { ...devices['Desktop Firefox'] }
        // },
        // {
        //     name: 'webkit',
        //     use: { ...devices['Desktop Safari'] }
        // },
        // {
        //     name: 'edge',
        //     use: { ...devices['Desktop Edge'] }
        // },

        // // Mobile browsers
        // {
        //     name: 'Mobile Chrome',
        //     use: { ...devices['Pixel 5'] }
        // },
        // {
        //     name: 'Mobile Safari',
        //     use: { ...devices['iPhone 12'] }
        // },

        // // Tablet browsers
        // {
        //     name: 'iPad',
        //     use: { ...devices['iPad Pro'] }
        // }
    ],

    webServer: {
        command: 'pnpm dev',
        url: 'http://localhost:8011',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000
    }
});
