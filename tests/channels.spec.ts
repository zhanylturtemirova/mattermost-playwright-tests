import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { authDir, baseURL } from '../test-env';

const team = 'qa-playground';
const townSquare = `${baseURL}/${team}/channels/town-square`;
test.use({ storageState: `${authDir}/member.json` });


for (const length of [63, 64, 65]) {
  test(`validates a channel name of ${length} characters`, async ({ page }) => {
    const name = `qa-${randomUUID()}`.padEnd(length, 'x');

    await page.goto(townSquare);
    await page.getByRole('button', { name: /^add channels$/i }).click();
    await page.getByText(/^create new channel$/i).click();

    const dialog = page.getByRole('dialog');
    const nameInput = dialog.getByRole('textbox', { name: /channel name/i });
    await nameInput.fill(name);
    await nameInput.press('Tab');

    if (length === 65) {
      await expect(
        dialog.getByText('Channel names must have maximum 64 characters.', { exact: true }),
      ).toBeVisible();
      return;
    }

    await dialog.getByRole('button', { name: /^create(?: channel)?$/i }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
  });
}