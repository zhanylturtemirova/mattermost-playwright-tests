import { expect, test } from '@playwright/test';
import { authDir, baseURL } from '../test-env';

const team = 'qa-playground';
const townSquare = `${baseURL}/${team}/channels/town-square`;

test.use({ storageState: `${authDir}/member.json` });

test('a posted message stays visible after reload', async ({ page }) => {
  const message = `Playwright test ${Date.now()}`;

  await page.goto(townSquare);
  
 const composer = page.getByTestId('post_textbox');
  await composer.fill(message);
  await page.getByRole('button', { name: 'Send Now', exact: true }).click();
  await expect(composer).toHaveValue('');

  const postedMessage = page
    .locator('[id^="postMessageText_"]')
    .getByText(message, { exact: true });

  await expect(postedMessage).toBeVisible();

  await page.reload();

  await expect(postedMessage).toBeVisible();
});
