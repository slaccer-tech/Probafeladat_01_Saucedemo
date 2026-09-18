import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { USERS } from '../fixtures/users';

test.describe('Termékrendezés', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
  

  // Explicit ellenőrzés: ha a bejelentkezés nem sikerül, itt bukjon el
    // egyértelmű hibával, ne a dropdown keresésénél, ahol a hibaüzenet félrevezető.
    await expect(page).toHaveURL(/inventory\.html/, { timeout: 10_000 });
  });

  test('AC-05a: Rendezés név szerint emelkedő sorrendben (A-Z)', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.sortBy('az');

    const names = await inventoryPage.getProductNames();
    const expected = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(expected);
  });

  test('AC-05b: Rendezés név szerint csökkenő sorrendben (Z-A)', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.sortBy('za');

    const names = await inventoryPage.getProductNames();
    const expected = [...names].sort((a, b) => b.localeCompare(a));
    expect(names).toEqual(expected);
  });

  test('AC-05c: Rendezés ár szerint emelkedő sorrendben (low to high)', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.sortBy('lohi');

    const prices = await inventoryPage.getProductPrices();
    const expected = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(expected);
  });

  test('AC-05d: Rendezés ár szerint csökkenő sorrendben (high to low)', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.sortBy('hilo');

    const prices = await inventoryPage.getProductPrices();
    const expected = [...prices].sort((a, b) => b - a);
    expect(prices).toEqual(expected);
  });
});
