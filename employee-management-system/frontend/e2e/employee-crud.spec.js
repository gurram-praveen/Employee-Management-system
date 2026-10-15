import { expect, test } from '@playwright/test';
import {
  apiBase,
  authHeaders,
  expectAuthenticationBoundaries,
  signIn,
} from './helpers.js';

test('employee create, edit, and delete persist through the REST API', async ({ page, request }) => {
  await expectAuthenticationBoundaries(request);
  await signIn(page);

  const suffix = `${Date.now()}`;
  const employeeId = `E2E_${suffix}`;
  const email = `e2e.${suffix}@example.test`;
  const originalName = `E2E Employee ${suffix}`;
  const updatedName = `E2E Updated ${suffix}`;
  let databaseId;

  try {
    await page.getByRole('link', { name: 'Add employee' }).click();
    await page.getByLabel('Employee ID').fill(employeeId);
    await page.getByLabel('Full Name').fill(originalName);
    await page.getByLabel('Email Address').fill(email);
    await page.getByLabel('Phone Number').fill('9876543210');
    await page.getByLabel('Department').selectOption({ label: 'Engineering' });
    await page.getByLabel('Designation').fill('E2E Engineer');
    await page.getByLabel('Date of Joining').fill('2020-01-15');
    await page.getByLabel('Salary').fill('65000');
    await page.getByLabel('Employment Status').selectOption('ACTIVE');
    await page.getByRole('button', { name: 'Add Employee' }).click();

    await expect(page.getByRole('link', { name: `View ${originalName}` })).toBeVisible();
    const listResponse = await request.get(`${apiBase}/employees?search=${encodeURIComponent(email)}&size=100`, {
      headers: authHeaders,
    });
    expect(listResponse.ok()).toBeTruthy();
    const match = (await listResponse.json()).content.find((employee) => employee.email === email);
    expect(match?.employeeId).toBe(employeeId);
    databaseId = match.id;

    await page.getByRole('link', { name: `Edit ${originalName}` }).click();
    await page.getByLabel('Full Name').fill(updatedName);
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.getByRole('link', { name: `View ${updatedName}` })).toBeVisible();

    const readBack = await request.get(`${apiBase}/employees/${databaseId}`, { headers: authHeaders });
    expect(readBack.ok()).toBeTruthy();
    expect((await readBack.json()).fullName).toBe(updatedName);

    await page.getByRole('button', { name: `Delete ${updatedName}` }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByRole('link', { name: `View ${updatedName}` })).toHaveCount(0);

    const deletedReadBack = await request.get(`${apiBase}/employees/${databaseId}`, { headers: authHeaders });
    expect(deletedReadBack.status()).toBe(404);
    databaseId = undefined;
  } finally {
    if (databaseId) {
      await request.delete(`${apiBase}/employees/${databaseId}`, { headers: authHeaders });
    }
  }
});
