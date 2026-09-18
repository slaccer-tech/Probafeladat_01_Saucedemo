# SauceDemo E2E tesztcsomag (Playwright + TypeScript)

E2E tesztek a [www.saucedemo.com](https://www.saucedemo.com) vásárlási folyamatára, a `vasarlasi-folyamat-elfogadasi-feltetelek.md` dokumentumban rögzített elfogadási feltételek (AC-01 – AC-17) alapján.

## Struktúra

```
saucedemo-playwright/
├── playwright.config.ts       # Playwright konfiguráció (data-test testId attribútum!)
├── package.json
├── tsconfig.json
├── fixtures/
│   └── users.ts                # Teszt felhasználók és checkout adatok
├── pages/                       # Page Object Model
│   ├── LoginPage.ts
│   ├── InventoryPage.ts
│   ├── CartPage.ts
│   └── CheckoutPage.ts
└── tests/
    ├── login.spec.ts            # AC-01, AC-02, AC-03, AC-04
    ├── sorting.spec.ts          # AC-05 (mind a 4 rendezési irány)
    ├── cart.spec.ts             # AC-06, AC-07, AC-08, AC-09
    ├── checkout.spec.ts         # AC-10, AC-11, AC-12
    └── special-users.spec.ts    # AC-13, AC-14, AC-15, AC-16, AC-17
```

## Telepítés és futtatás

```bash
npm install
npx playwright install chromium
npm test
```

> **Windows felhasználóknak:** a `--with-deps` kapcsoló egy Linux/CI-specifikus opció (rendszerszintű függőségeket telepít apt-tal), Windows-on nincs rá szükség és nem is támogatott — csak `npx playwright install chromium` kell.
>
> Ha a `--headed` vagy `--ui` mód "Target page, context or browser has been closed" hibával áll le közvetlenül indítás után, az tipikusan **vírusirtó/Windows Defender interferenciára** vagy **sérült böngésző-telepítésre** utal, nem a tesztkód hibája. Próbáld: `npx playwright uninstall --all && npx playwright install chromium`, illetve ellenőrizd a Windows Security védelmi előzményeit. A headless (alapértelmezett `npm test`) futtatás ettől függetlenül működik és ez a mérvadó a CI/automatizáláshoz.

Egyéb hasznos parancsok:

```bash
npm run test:headed   # látható böngészővel
npm run test:ui       # Playwright UI mód (interaktív debug)
npm run test:report   # HTML riport megnyitása futtatás után
```

## Fontos megjegyzések

- **`testIdAttribute: 'data-test'`** – a saucedemo.com a `data-test` attribútumot használja test-azonosítóként, ezért ezt külön be kell állítani a Playwright configban (nem az alapértelmezett `data-testid`).
- **AC-12 és AC-16 szándékosan bukó tesztek** (`test.fail()`): ezek olyan, a valós oldalon jelenleg **ismert hibákat** dokumentálnak (üres kosárral történő checkout, illetve az `error_user` hibás rendelés-lezárása), amelyeket a rendszer *jelenleg* nem kezel helyesen. A `test.fail()` jelöléssel ezek a tesztek "elvárt bukásként" futnak le, így nem törik meg a CI pipeline-t, mégis dokumentálják és folyamatosan visszaellenőrzik a hibát.
- A tesztek élő, publikus oldal ellen futnak (`https://www.saucedemo.com`) – hálózati problémák vagy az oldal esetleges frissítései befolyásolhatják az eredményt.