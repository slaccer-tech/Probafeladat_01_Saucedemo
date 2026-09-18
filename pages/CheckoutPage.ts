import { Page, Locator, expect } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;

  // Checkout: Your Information (step one)
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly errorMessage: Locator;

  // Checkout: Overview (step two)
  readonly itemTotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;

  // Checkout: Complete
  readonly completeHeader: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.firstNameInput = page.locator('#first-name');
    this.lastNameInput = page.locator('#last-name');
    this.postalCodeInput = page.locator('#postal-code');
    this.continueButton = page.getByTestId('continue');
    this.errorMessage = page.getByTestId('error');

    this.itemTotalLabel = page.locator('.summary_subtotal_label');
    this.taxLabel = page.locator('.summary_tax_label');
    this.totalLabel = page.locator('.summary_total_label');
    this.finishButton = page.getByTestId('finish');

    this.completeHeader = page.getByTestId('complete-header');
    this.backHomeButton = page.getByTestId('back-to-products');
  }

  async fillInformation(firstName: string, lastName: string, postalCode: string) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  async continueToOverview() {
    await this.continueButton.click();
  }

  async finishOrder() {
    await this.finishButton.click();
  }

  private parseAmount(text: string): number {
    return parseFloat(text.replace(/[^0-9.]/g, ''));
  }

  async getItemTotalAmount(): Promise<number> {
    return this.parseAmount((await this.itemTotalLabel.textContent()) ?? '0');
  }

  async getTaxAmount(): Promise<number> {
    return this.parseAmount((await this.taxLabel.textContent()) ?? '0');
  }

  async getTotalAmount(): Promise<number> {
    return this.parseAmount((await this.totalLabel.textContent()) ?? '0');
  }

  async expectValidationError(expectedText: string | RegExp) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expectedText);
  }

  async expectOrderSuccess() {
    await expect(this.completeHeader).toBeVisible();
    await expect(this.completeHeader).toHaveText(/Thank you for your order!/i);
  }
}
