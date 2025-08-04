import { test, expect } from '@playwright/test';

test.describe('FormattingToolbar E2E', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to a group chat (adjust the group ID as needed)
        // We'll use a test group ID - in a real app you'd use actual data
        await page.goto('/p/688bb53049eb64910d0e169e');

        // Wait for the chat input (which contains RichMessageEditor) to be visible
        await page.waitForSelector('[data-testid="lexical-composer"]', {
            timeout: 10000
        });
    });

    test('should render formatting toolbar buttons in group chat', async ({
        page
    }) => {
        // Look for the formatting toolbar buttons
        const boldButton = page.locator('[data-testid="format-bold"]');
        const italicButton = page.locator('[data-testid="format-italic"]');
        const underlineButton = page.locator(
            '[data-testid="format-underline"]'
        );
        const strikethroughButton = page.locator(
            '[data-testid="format-strikethrough"]'
        );

        // Check that all buttons are visible
        await expect(boldButton).toBeVisible();
        await expect(italicButton).toBeVisible();
        await expect(underlineButton).toBeVisible();
        await expect(strikethroughButton).toBeVisible();
    });

    test('should show correct tooltips on hover', async ({ page }) => {
        const boldButton = page.locator('[data-testid="format-bold"]');

        // Hover over the bold button and check tooltip
        await boldButton.hover();
        await expect(boldButton).toHaveAttribute('title', 'Bold (Ctrl+B)');

        const italicButton = page.locator('[data-testid="format-italic"]');
        await italicButton.hover();
        await expect(italicButton).toHaveAttribute('title', 'Italic (Ctrl+I)');

        const underlineButton = page.locator(
            '[data-testid="format-underline"]'
        );
        await underlineButton.hover();
        await expect(underlineButton).toHaveAttribute(
            'title',
            'Underline (Ctrl+U)'
        );

        const strikethroughButton = page.locator(
            '[data-testid="format-strikethrough"]'
        );
        await strikethroughButton.hover();
        await expect(strikethroughButton).toHaveAttribute(
            'title',
            'Strikethrough (Ctrl+Shift+S)'
        );
    });

    test('should toggle formatting when buttons are clicked', async ({
        page
    }) => {
        // Click in the editor to focus it
        const editor = page.locator('[data-testid="content-editable"]');
        await editor.click();

        // Type some text
        await page.keyboard.type('Hello World');

        // Select all text
        await page.keyboard.press('Ctrl+a');

        // Click bold button
        const boldButton = page.locator('[data-testid="format-bold"]');
        await boldButton.click();

        // The button should now appear active (has primary background)
        await expect(boldButton).toHaveClass(/bg-primary/);

        // Click bold again to toggle off
        await boldButton.click();

        // The button should no longer be active (back to ghost variant)
        await expect(boldButton).not.toHaveClass(/bg-primary/);
    });

    test('should work with keyboard shortcuts', async ({ page }) => {
        // Click in the editor to focus it
        const editor = page.locator('[data-testid="content-editable"]');
        await editor.click();

        // Type some text
        await page.keyboard.type('Hello World');

        // Select all text
        await page.keyboard.press('Ctrl+a');

        // Use Ctrl+B to toggle bold
        await page.keyboard.press('Ctrl+b');

        // The bold button should now appear active
        const boldButton = page.locator('[data-testid="format-bold"]');
        await expect(boldButton).toHaveClass(/bg-primary/);

        // Use Ctrl+I to toggle italic
        await page.keyboard.press('Ctrl+i');

        // The italic button should now appear active
        const italicButton = page.locator('[data-testid="format-italic"]');
        await expect(italicButton).toHaveClass(/bg-primary/);
    });

    test('should also work in direct message chat', async ({ page }) => {
        // Navigate to a direct message chat
        await page.goto('/d/688bb53049eb64910d0e169c');

        // Wait for the chat input to be visible
        await page.waitForSelector('[data-testid="lexical-composer"]', {
            timeout: 10000
        });

        // Check that formatting buttons are still available
        const boldButton = page.locator('[data-testid="format-bold"]');
        const italicButton = page.locator('[data-testid="format-italic"]');

        await expect(boldButton).toBeVisible();
        await expect(italicButton).toBeVisible();
    });
});
