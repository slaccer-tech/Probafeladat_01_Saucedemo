import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { CHECKOUT_INFO, USERS } from '../fixtures/users';

const PRODUCT_1 = 'Sauce Labs Backpack';
const PRODUCT_2 = 'Sauce Labs Bike Light';
const PRODUCT_3 = 'Sauce Labs Bolt T-Shirt';

test.describe('Kosár', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
  });

  test('AC-06: A kosár/Overview végösszege megegyezik a kosárba tett termékek árának összegével', async ({
    page,
  }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    const names = await inventoryPage.getProductNames();
    const prices = await inventoryPage.getProductPrices();

    await inventoryPage.addProductToCart(names[0]);
    await inventoryPage.addProductToCart(names[1]);
    await inventoryPage.addProductToCart(names[2]);
    const expectedSubtotal = prices[0] + prices[1] + prices[2];

    await inventoryPage.goToCart();
    await cartPage.goToCheckout();
    await checkoutPage.fillInformation(
      CHECKOUT_INFO.firstName,
      CHECKOUT_INFO.lastName,
      CHECKOUT_INFO.postalCode
    );
    await checkoutPage.continueToOverview();

    const itemTotal = await checkoutPage.getItemTotalAmount();
    const tax = await checkoutPage.getTaxAmount();
    const total = await checkoutPage.getTotalAmount();

    expect(itemTotal).toBeCloseTo(expectedSubtotal, 2);
    expect(total).toBeCloseTo(itemTotal + tax, 2);
  });

  test('AC-07: Termék eltávolítása a kosárból frissíti a badge-t és a tartalmat', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.addProductToCart(PRODUCT_1);
    await inventoryPage.expectCartBadgeCount(1);

    await inventoryPage.removeProductFromCart(PRODUCT_1);
    await inventoryPage.expectCartBadgeCount(0);
  });

  test('AC-08: A kosár badge mindig a helyes darabszámot mutatja', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.addProductToCart(PRODUCT_1);
    await inventoryPage.expectCartBadgeCount(1);

    await inventoryPage.addProductToCart(PRODUCT_2);
    await inventoryPage.expectCartBadgeCount(2);

    await inventoryPage.addProductToCart(PRODUCT_3);
    await inventoryPage.expectCartBadgeCount(3);
  });

  test('AC-09: "Continue Shopping" visszavisz a terméklistára, a kosár tartalma megmarad', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    await inventoryPage.addProductToCart(PRODUCT_1);
    await inventoryPage.goToCart();
    await cartPage.continueShopping();

    await expect(page).toHaveURL(/inventory\.html/);
    await inventoryPage.expectCartBadgeCount(1);
  });
});
