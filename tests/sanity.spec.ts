import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:4200/');

  await expect(page.locator('app-menu')).toBeVisible();
  await expect(page.locator('app-results')).toBeVisible();

  await page.locator('input').first().click();
  await page.getByRole('option', { name: 'Charmander' }).click();
  await page.getByRole('button', { name: 'Calculate' }).click();

  await expect(page.locator('app-opponent-card')).toBeVisible();
  await expect(page.locator('app-pokemon-card > .pokemon-card').first()).toBeVisible();
});
