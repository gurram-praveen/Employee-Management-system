import { expect, test } from '@playwright/test';
import {
  apiBase,
  authHeaders,
  departmentByName,
  expectAuthenticationBoundaries,
  signIn,
} from './helpers.js';

test('department create, rename, and delete persist through the REST API', async ({ page, request }) => {
  await expectAuthenticationBoundaries(request);
  await signIn(page);
  await page.getByRole('link', { name: 'Departments' }).click();

  const suffix = `${Date.now()}`;
  const originalName = `E2E Department ${suffix}`;
  const updatedName = `E2E Updated Department ${suffix}`;
  let departmentId;

  try {
    await page.getByLabel('New department').fill(originalName);
    await page.getByRole('button', { name: 'Add department' }).click();
    await expect(page.getByRole('row').filter({ hasText: originalName })).toBeVisible();

    let persisted = await departmentByName(request, originalName);
    expect(persisted).toBeTruthy();
    departmentId = persisted.id;

    const departmentRow = page.getByRole('row').filter({ hasText: originalName });
    await departmentRow.getByRole('button', { name: 'Edit' }).click();
    await page.getByLabel('Department name').fill(updatedName);
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByRole('row').filter({ hasText: updatedName })).toBeVisible();

    persisted = await departmentByName(request, updatedName);
    expect(persisted?.id).toBe(departmentId);

    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('row').filter({ hasText: updatedName }).getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByRole('row').filter({ hasText: updatedName })).toHaveCount(0);
    expect(await departmentByName(request, updatedName)).toBeUndefined();
    departmentId = undefined;
  } finally {
    if (departmentId) {
      await request.delete(`${apiBase}/departments/${departmentId}`, { headers: authHeaders });
    }
  }
});
