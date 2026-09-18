import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { USERS } from '../fixtures/users';

test.describe('Bejelentkezés / kijelentkezés', () => {
  test('AC-01: Sikeres bejelentkezés érvényes adatokkal (happy path)', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.locator('.title')).toHaveText('Products');
  });

  test('AC-02: Helytelen jelszó esetén hibaüzenet jelenik meg, az adatok megmaradnak', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, 'rossz_jelszo');

    await loginPage.expectLoginError('Username and password do not match');
    await loginPage.expectCredentialsPreserved(USERS.standard.username, 'rossz_jelszo');
  });

  test('AC-03a: Felhasználónév hiányában hibaüzenet jelenik meg', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('', USERS.standard.password);

    await loginPage.expectLoginError('Username is required');
  });

  test('AC-03b: Jelszó hiányában hibaüzenet jelenik meg', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, '');

    await loginPage.expectLoginError('Password is required');
  });

  test('AC-04: Kijelentkezés visszaviszi a usert a Login oldalra', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await expect(page).toHaveURL(/inventory\.html/);

    await inventoryPage.logout();

    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(loginPage.loginButton).toBeVisible();
  });
});
