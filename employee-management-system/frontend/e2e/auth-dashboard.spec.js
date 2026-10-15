import { expect, test } from '@playwright/test';
import {
  apiBase,
  authHeaders,
  departmentByName,
  expectAuthenticationBoundaries,
  signIn,
} from './helpers.js';

test('authentication protects employee data and department writes persist', async ({ page, request }) => {
  await expectAuthenticationBoundaries(request);
  await signIn(page);

  await expect(page.getByRole('heading', { name: 'Employee Management System' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Employee directory' })).toBeVisible();

  const departmentName = `E2E Auth ${Date.now()}`;
  let departmentId;
  try {
    const createResponse = await request.post(`${apiBase}/departments`, {
      headers: authHeaders,
      data: { name: departmentName },
    });
    expect(createResponse.status()).toBe(201);
    departmentId = (await createResponse.json()).id;

    const persistedDepartment = await departmentByName(request, departmentName);
    expect(persistedDepartment?.id).toBe(departmentId);
    expect(persistedDepartment?.employeeCount).toBe(0);
  } finally {
    if (departmentId) {
      await request.delete(`${apiBase}/departments/${departmentId}`, { headers: authHeaders });
    }
  }
});
