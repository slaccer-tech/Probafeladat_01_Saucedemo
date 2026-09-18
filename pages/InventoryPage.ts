import { Page, Locator, expect } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  readonly sortDropdown: Locator;
  readonly inventoryItems: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;
  readonly burgerMenuButton: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;
    // FONTOS: a saucedemo.com 2026 őszén kötőjelesre váltotta ezt az attribútumot
    // (korábban "product_sort_container" volt, jelenleg "product-sort-container" —
    // ezt élesben, DevTools-szal ellenőrizve erősítettük meg).
    // Fallback: a combobox ARIA role-ra hagyatkozunk, ami HTML-szabványon alapul,
    // így egy jövőbeli data-test-átnevezés esetén sem törik el azonnal a teszt.
    this.sortDropdown = page
      .locator('[data-test="product-sort-container"]')
      .or(page.getByRole('combobox'));
    this.inventoryItems = page.locator('.inventory_item');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.cartLink = page.locator('.shopping_cart_link');
    this.burgerMenuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('#logout_sidebar_link');
  }

  private toTestId(productName: string): string {
    return productName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  async addProductToCart(productName: string) {
    await this.page.getByTestId(`add-to-cart-${this.toTestId(productName)}`).click();
  }

  async removeProductFromCart(productName: string) {
    await this.page.getByTestId(`remove-${this.toTestId(productName)}`).click();
  }

  async getProductNames(): Promise<string[]> {
    return this.inventoryItems.locator('.inventory_item_name').allTextContents();
  }

  async getProductPrices(): Promise<number[]> {
    const priceTexts = await this.inventoryItems.locator('.inventory_item_price').allTextContents();
    return priceTexts.map((t) => parseFloat(t.replace('$', '')));
  }

  async sortBy(option: 'az' | 'za' | 'lohi' | 'hilo') {
    await this.sortDropdown.selectOption(option);
  }

  async expectCartBadgeCount(count: number) {
    if (count === 0) {
      await expect(this.cartBadge).toHaveCount(0);
    } else {
      await expect(this.cartBadge).toHaveText(String(count));
    }
  }

  async goToCart() {
    await this.cartLink.click();
  }

  async logout() {
    await this.burgerMenuButton.click();
    await this.logoutLink.click();
  }
}
