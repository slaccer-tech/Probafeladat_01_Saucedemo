import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { CHECKOUT_INFO, USERS } from '../fixtures/users';

test.describe('Speciális felhasználók (nem funkcionális / ismert hibák)', () => {
  test('AC-13: locked_out_user esetén speciális hibaüzenet jelenik meg', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.lockedOut.username, USERS.lockedOut.password);

    await loginPage.expectLoginError('Sorry, this user has been locked out.');
  });

  test('AC-14: performance_glitch_user bejelentkezése érzékelhetően lassabb, de ésszerű időn belül sikeres', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    const start = Date.now();
    await loginPage.login(USERS.performanceGlitch.username, USERS.performanceGlitch.password);
    await expect(page).toHaveURL(/inventory\.html/, { timeout: 10_000 });
    const elapsedMs = Date.now() - start;

    // A performance_glitch_user szándékosan lassú bejelentkezést szimulál
    // (a valóságban jellemzően kb. 5-8 mp). Az elvárás ezért NEM "1 mp-en belül",
    // hanem: érzékelhetően lassabb, mint egy standard_user, de ésszerű felső
    // időkorláton (itt: 10 mp) belül mégis sikeresen befejeződik.
    expect(elapsedMs).toBeGreaterThan(2000);
    expect(elapsedMs).toBeLessThan(10_000);
  });

  test('AC-15: problem_user esetén a Last Name mező nem tölthető ki a checkoutnál', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await loginPage.goto();
    await loginPage.login(USERS.problem.username, USERS.problem.password);

    const names = await inventoryPage.getProductNames();
    await inventoryPage.addProductToCart(names[0]);
    await inventoryPage.goToCart();
    await cartPage.goToCheckout();

    await checkoutPage.fillInformation(
      CHECKOUT_INFO.firstName,
      CHECKOUT_INFO.lastName,
      CHECKOUT_INFO.postalCode
    );

    // Ismert hiba: a Last Name mező értéke nem íródik be problem_user esetén,
    // ezért a checkout folyamat nem folytatható tovább érvényesen.
    await expect(checkoutPage.lastNameInput).not.toHaveValue(CHECKOUT_INFO.lastName);
  });

  test('AC-16: error_user esetén a rendelés nem fejeződik be sikeresen', async ({ page }) => {
    // Ismert hiba: az error_user checkout folyamata a Finish gomb után
    // nem jut el a "Thank you for your order!" oldalig.
    test.fail(true, 'Known bug: error_user checkout folyamata nem záródik le sikeresen.');

    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await loginPage.goto();
    await loginPage.login(USERS.error.username, USERS.error.password);

    const names = await inventoryPage.getProductNames();
    await inventoryPage.addProductToCart(names[0]);
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

  test('AC-17: visual_user esetén a vásárlás funkcionálisan végigvihető, vizuális hibák mellett', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await loginPage.goto();
    await loginPage.login(USERS.visual.username, USERS.visual.password);

    const names = await inventoryPage.getProductNames();
    await inventoryPage.addProductToCart(names[0]);
    await inventoryPage.goToCart();
    await cartPage.goToCheckout();

    await checkoutPage.fillInformation(
      CHECKOUT_INFO.firstName,
      CHECKOUT_INFO.lastName,
      CHECKOUT_INFO.postalCode
    );
    await checkoutPage.continueToOverview();
    await checkoutPage.finishOrder();

    // A funkcionalitás működik annak ellenére, hogy a megjelenés vizuálisan hibás lehet.
    await checkoutPage.expectOrderSuccess();
  });

  test('AC-17b: visual_user esetén a termékképek tartalmi helyessége - TUDATOSAN MANUÁLIS TESZT', async () => {
    // Tudatos döntés: a "megjelenik-e egy teljesen más/hibás kép (pl. véletlenszerű
    // kutyakép) egy adott terméknél" jellegű hibát nem automatizáljuk itt.
    //
    // Indoklás:
    // - Pixel-szintű képfelismerés flaky lenne (kompresszió, renderelési eltérések).
    // - Az src attribútum egyediségének ellenőrzése (amit korábban itt írtunk)
    //   TÉVES szignál: nem azt méri, hogy a kép TARTALMILAG helyes-e az adott
    //   termékhez, csak azt, hogy nincs két azonos fájlnév - egy egyedi, de rossz
    //   tartalmú kép (pl. kutya) simán átmenne rajta.
    // - Egzakt src-összehasonlítás egy standard_user-től vett alap-adathoz képest
    //   (név -> várt fájlnév) technikailag megoldható és nem flaky, de karbantartást
    //   igényel minden képváltozás esetén - ezért ezt a projekt jelenleg tudatosan
    //   exploratory/manuális tesztelésre bízza.
    //
    // -> Lásd a tesztelési dokumentáció "Manuális ellenőrzési pontok" szakaszát.
    test.skip();
  });

  test('AC-17c: visual_user esetén a checkout gomb a várt konténeren belül helyezkedjen el', async ({
    page,
  }) => {
    // Ismert, magas súlyosságú UI hiba: a Checkout gomb a visual_user felhasználónál
    // a vártnál teljesen máshol jelenik meg a kosár oldalon. A boundingBox()-szal
    // ellenőrizzük, hogy a gomb a kosár láblécének (.cart_footer) területén belül van-e,
    // anélkül hogy pixelre pontos koordinátákat kellene rögzítenünk.
    test.fail(true, 'Known bug: visual_user esetén a Checkout gomb rossz helyen jelenik meg.');

    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    await loginPage.goto();
    await loginPage.login(USERS.visual.username, USERS.visual.password);

    const names = await inventoryPage.getProductNames();
    await inventoryPage.addProductToCart(names[0]);
    await inventoryPage.goToCart();

    const buttonBox = await cartPage.checkoutButton.boundingBox();
    const containerBox = await page.locator('.cart_footer').boundingBox();

    expect(buttonBox, 'a checkout gombnak látszania kell').not.toBeNull();
    expect(containerBox, 'a kosár láblécének látszania kell').not.toBeNull();

    if (buttonBox && containerBox) {
      const tolerance = 5; // px, a lekerekítési/renderelési eltérésekre
      expect(buttonBox.y).toBeGreaterThanOrEqual(containerBox.y - tolerance);
      expect(buttonBox.y + buttonBox.height).toBeLessThanOrEqual(
        containerBox.y + containerBox.height + tolerance
      );
      expect(buttonBox.x).toBeGreaterThanOrEqual(containerBox.x - tolerance);
      expect(buttonBox.x + buttonBox.width).toBeLessThanOrEqual(
        containerBox.x + containerBox.width + tolerance
      );
    }
  });
});
