import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { CHECKOUT_INFO, USERS } from '../fixtures/users';

const PRODUCT_1 = 'Sauce Labs Backpack';

test.describe('Checkout', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
  });

  test('AC-10: Sikeres vásárlás a teljes checkout folyamat végigvitelével (happy path)', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await inventoryPage.addProductToCart(PRODUCT_1);
    await inventoryPage.goToCart();
    await cartPage.goToCheckout();

    await checkoutPage.fillInformation(
      CHECKOUT_INFO.firstName,
      CHECKOUT_INFO.lastName,
      CHECKOUT_INFO.postalCode
    );
    await checkoutPage.continueToOverview();
    await checkoutPage.finishOrder();

    await checkoutPage.expectOrderSuccess();
  });

  test('AC-11a: Hiányzó First Name esetén hibaüzenet jelenik meg, a kosár tartalma megmarad', async ({
    page,
  }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await inventoryPage.addProductToCart(PRODUCT_1);
    await inventoryPage.goToCart();
    await cartPage.goToCheckout();

    await checkoutPage.fillInformation('', CHECKOUT_INFO.lastName, CHECKOUT_INFO.postalCode);
    await checkoutPage.continueToOverview();

    await checkoutPage.expectValidationError('First Name is required');
    await page.goto('/inventory.html');
    await inventoryPage.expectCartBadgeCount(1);
  });

  test('AC-11b: Hiányzó Last Name esetén hibaüzenet jelenik meg', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await inventoryPage.addProductToCart(PRODUCT_1);
    await inventoryPage.goToCart();
    await cartPage.goToCheckout();

    await checkoutPage.fillInformation(CHECKOUT_INFO.firstName, '', CHECKOUT_INFO.postalCode);
    await checkoutPage.continueToOverview();

    await checkoutPage.expectValidationError('Last Name is required');
  });

  test('AC-11c: Hiányzó Postal Code esetén hibaüzenet jelenik meg', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await inventoryPage.addProductToCart(PRODUCT_1);
    await inventoryPage.goToCart();
    await cartPage.goToCheckout();

    await checkoutPage.fillInformation(CHECKOUT_INFO.firstName, CHECKOUT_INFO.lastName, '');
    await checkoutPage.continueToOverview();

    await checkoutPage.expectValidationError('Postal Code is required');
  });

  test('AC-12: Üres kosárral a rendelés NEM fejeződhetne be sikeresen', async ({ page }) => {
    // Ismert, dokumentált hiba a saucedemo.com-on: a rendszer jelenleg engedi
    // az üres kosárral történő "rendelés" leadását. Ez a teszt a HELYES,
    // elvárt viselkedést dokumentálja, ezért a jelenlegi állapot mellett
    // szándékosan elbukik (test.fail), amíg a hiba nincs javítva.
    test.fail(true, 'Known bug: saucedemo.com engedi az üres kosárral történő checkoutot.');

    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await page.goto('/cart.html');
    await cartPage.goToCheckout();
    await checkoutPage.fillInformation(
      CHECKOUT_INFO.firstName,
      CHECKOUT_INFO.lastName,
      CHECKOUT_INFO.postalCode
    );
    await checkoutPage.continueToOverview();
    await checkoutPage.finishOrder();

    await expect(checkoutPage.completeHeader).not.toBeVisible();
  });
});
