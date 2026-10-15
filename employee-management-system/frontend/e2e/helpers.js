import { expect } from '@playwright/test';

export const apiBase = process.env.E2E_API_BASE_URL || 'http://localhost:8080/api';
export const adminUsername = process.env.ADMIN_USERNAME || 'admin';
export const adminPassword = process.env.ADMIN_PASSWORD || 'change-me';
export const authHeaders = {
  Authorization: `Basic ${Buffer.from(`${adminUsername}:${adminPassword}`).toString('base64')}`,
};

export async function expectAuthenticationBoundaries(request) {
  const anonymous = await request.get(`${apiBase}/employees?page=0&size=1`);
  expect(anonymous.status()).toBe(401);

  const invalidLogin = await request.post(`${apiBase}/auth/login`, {
    data: { username: adminUsername, password: 'invalid-e2e-password' },
  });
  expect(invalidLogin.status()).toBe(401);
}

export async function signIn(page) {
  await page.goto('/login');
  await page.getByLabel('Username').fill(adminUsername);
  await page.locator('input[autocomplete="current-password"]').fill(adminPassword);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/employees$/);
}

export async function departmentByName(request, name) {
  const response = await request.get(`${apiBase}/departments`, { headers: authHeaders });
  expect(response.ok()).toBeTruthy();
  const departments = await response.json();
  return departments.find((department) => department.name === name);
}
