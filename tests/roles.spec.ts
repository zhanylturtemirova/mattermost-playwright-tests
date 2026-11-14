import { expect, test } from '@playwright/test';
import { authDir, baseURL } from '../test-env';

const team = 'qa-playground';
const townSquareUrl = `${baseURL}/${team}/channels/town-square`;


const usersUrl = `${baseURL}/admin_console/user_management/users`;

test.describe('System Admin', () => {
test.use({ storageState: `${authDir}/admin.json` });
  test('can open User Management', async ({ page }) => {
    await page.goto(usersUrl);

    await expect(page).toHaveURL(usersUrl);
    await expect(page.getByPlaceholder('Search users')).toBeVisible();
  });
});

test.describe('Member', () => {
test.use({ storageState: `${authDir}/member.json` });
  test('is redirected to Town Square from User Management', async ({ page }) => {
    await page.goto(townSquareUrl);
    await expect(page).toHaveURL(townSquareUrl);

    await page.goto(usersUrl);

    await expect(page).toHaveURL(townSquareUrl);
    await expect(page.getByPlaceholder('Search users')).not.toBeVisible();
  });
});