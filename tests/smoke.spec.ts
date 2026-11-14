import {expect, test} from '@playwright/test';


test('open Mattermost', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Mattermost/i);
});