import { expect, test, type Locator, type Page } from '@playwright/test';
import { authDir, baseURL } from '../test-env';

const team = 'qa-playground';
const townSquare = `${baseURL}/${team}/channels/town-square`;
const testedUser = 'studyuser312';
const targetUser = 'zhanyl.turtemirova1';

const memberRole = /^Member(?:\s+)?$/i;
const teamAdminRole = /^Team Admin(?:\s+)?$/i;
const anyTeamRole = /^(?:Member|Team Admin)(?:\s+)?$/i;

async function openTeamMembers(
  page: Page,
  username: string,
  menuLabel: RegExp,
) {
  await page.goto(townSquare);
  await page.getByText(team, { exact: true }).click();
  await page.getByText(menuLabel).click();

  const dialog = page.getByRole('dialog', {
    name: `${team} Members`,
    exact: true,
  });

  await dialog.getByRole('textbox', { name: 'Search users' }).fill(username);
  await expect(dialog.getByText(/^1 member of \d+ total$/)).toBeVisible();
  await expect(dialog.getByRole('button', {
    name: `@${username}`,
    exact: true,
  })).toBeVisible();

  return dialog.getByRole('region', { name: 'scrollable content' });
}

function roleButton(members: Locator, role: RegExp) {
  return members.getByRole('button', { name: role });
}

test('team member management follows promotion and revocation', async ({
  browser,
}) => {
  test.setTimeout(60_000);

  const adminContext = await browser.newContext({
    storageState: `${authDir}/admin.json`,
  });
  const memberContext = await browser.newContext({
    storageState: `${authDir}/member.json`,
  });

  adminContext.setDefaultTimeout(5_000);
  memberContext.setDefaultTimeout(5_000);

  try {
    const adminPage = await adminContext.newPage();
    const memberPage = await memberContext.newPage();

    await test.step('Member can see the target user but cannot manage roles', async () => {
      const members = await openTeamMembers(
        memberPage, targetUser, /^view members$/i,
      );
      await expect(roleButton(members, anyTeamRole)).toBeHidden();
    });

    const adminMembers = await openTeamMembers(
      adminPage, testedUser, /^manage members$/i,
    );
    await expect(roleButton(adminMembers, memberRole)).toBeVisible();

    try {
      await test.step('System Admin promotes the test user to Team Admin', async () => {
        await roleButton(adminMembers, memberRole).click();
        await adminPage.getByText('Make Team Admin', { exact: true }).click();
        await expect(roleButton(adminMembers, teamAdminRole)).toBeVisible();
      });

      await test.step('Team Admin can open the target user’s role menu', async () => {
        const members = await openTeamMembers(
          memberPage, targetUser, /^manage members$/i,
        );
        await roleButton(members, memberRole).click();
        await expect(
          memberPage.getByText('Make Team Admin', { exact: true }),
        ).toBeVisible();
      });
    } finally {
      await test.step('System Admin restores the Member role', async () => {
        const members = await openTeamMembers(
          adminPage, testedUser, /^manage members$/i,
        );
        const teamAdmin = roleButton(members, teamAdminRole);

        if (await teamAdmin.isVisible()) {
          await teamAdmin.click();
          await adminPage.getByText('Make Team Member', { exact: true }).click();
        }

        await expect(roleButton(members, memberRole)).toBeVisible();
      });
    }

    await test.step('Role management is unavailable again after revocation', async () => {
      const members = await openTeamMembers(
        memberPage, targetUser, /^view members$/i,
      );
      await expect(roleButton(members, anyTeamRole)).toBeHidden();
    });
  } finally {
    await Promise.all([adminContext.close(), memberContext.close()]);
  }
});