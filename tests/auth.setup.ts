import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { env } from "node:process";

const baseURL = env.MM_BASE_URL ?? "http://localhost:8065";
const townSquare = `${baseURL}/qa-playground/channels/town-square`;
const authDir = env.MM_AUTH_DIR ?? 'playwright/.auth';
const accounts = [
  {
    name: "admin",
    loginEnv: "MM_ADMIN_LOGIN",
    passwordEnv: "MM_ADMIN_PASSWORD",
  },
  {
    name: "member",
    loginEnv: "MM_MEMBER_LOGIN",
    passwordEnv: "MM_MEMBER_PASSWORD",
  },
];

for (const account of accounts) {
  test(`sign in as ${account.name}`, async ({ page }) => {
    const login = env[account.loginEnv];
    const password = env[account.passwordEnv];

    if (!login || !password) {
      throw new Error(`Set ${account.loginEnv} and ${account.passwordEnv}`);
    }
    await page.goto(`${baseURL}/login`);

    const viewInBrowser = page.getByText("View in Browser", { exact: true });
    const loginInput = page.locator('input[name="loginId"]');

    await expect(viewInBrowser.or(loginInput).first()).toBeVisible();

    if (await viewInBrowser.isVisible()) {
      await viewInBrowser.click();
    }

    await loginInput.fill(login);
    await page.locator('input[type="password"]').fill(password);
    await page.getByRole("button", { name: /^log in$/i }).click();

    await expect(page).not.toHaveURL(/\/login(?:[/?#]|$)/);
    await page.goto(townSquare);
    await expect(page.getByTestId("post_textbox")).toBeVisible();

    await mkdir(authDir, { recursive: true });
    await page
      .context()
      .storageState({ path: `${authDir}/${account.name}.json` });
  });
}
