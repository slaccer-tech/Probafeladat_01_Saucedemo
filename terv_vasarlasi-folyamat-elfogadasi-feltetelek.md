# Vásárlási folyamat – User Story és Elfogadási Feltételek

**Tesztelt rendszer:** [saucedemo.com](https://www.saucedemo.com)
**Verzió:** véglegesített, 2. iteráció

---

## User Story

**Mint** regisztrált vásárló,
**szeretném** a kosaramat megtölteni és befejezni a rendelést,
**hogy** megkaphassam a rendelt terméket és visszaigazolást kapjak róla.

---

## 1. Bejelentkezés

### AC-01 – Sikeres bejelentkezés (happy path)
- **Given** a bejelentkezési oldalon vagyunk
- **When** megadjuk a felhasználónevet (`standard_user`) és a jelszót (`secret_sauce`)
- **Then** a user sikeresen bejelentkezik, és a termékoldalra (`/inventory.html`) kerül

### AC-02 – Helytelen felhasználónév/jelszó bejelentkezéskor (negatív)
- **Given** bejelentkezéskor a felhasználónevet vagy a jelszót hibásan adjuk meg
- **When** a Login gombot megnyomjuk
- **Then** hibaüzenet jelenik meg, és a beírt felhasználónév/jelszó nem törlődik

### AC-03 – Felhasználónév/jelszó hiánya (negatív)
- **Given** bejelentkezéskor a felhasználónevet vagy a jelszót nem adjuk meg
- **When** a Login gombot megnyomjuk
- **Then** hibaüzenet jelenik meg

### AC-04 – Kijelentkezés
- **Given** a user be van jelentkezve
- **When** a hamburger menüben a Logout-ra kattint
- **Then** visszakerül a Login oldalra

---

## 2. Termékkezelés és rendezés

### AC-05 – Rendezés helyessége ár és név szerint (happy path)
- **Given** a `standard_user` bejelentkezett
- **When** a termékeket rendezi
  - ár szerint csökkenő sorrendben (Price high to low)
  - ár szerint emelkedő sorrendben (Price low to high)
  - név szerint csökkenő sorrendben (Name Z to A)
  - név szerint emelkedő sorrendben (Name A to Z)
- **Then** a termékek minden esetben a választott szempontnak megfelelően rendeződnek

---

## 3. Kosár

### AC-06 – A kosár összegének helyessége (happy path)
- **Given** a kosárban több, mint 1 termék van
- **When** a vásárlás összefoglaló (Overview) oldalára érünk
- **Then** a végösszeg (Total) megegyezik a kosárba tett termékek árának összegével (+ adó)

### AC-07 – Kosár tartalmának módosítása / termék eltávolítása (happy path)
- **Given** van termék a kosárban
- **When** a user eltávolítja (Remove gomb) akár a terméklistából, akár a kosár oldalról
- **Then** a kosár badge (számláló) frissül, és a termék eltűnik a kosárból

### AC-08 – Kosár badge (számláló) helyessége (happy path)
- **Given** a user termékeket ad a kosárhoz
- **When** több terméket helyez a kosárba
- **Then** a kosár ikonon lévő szám mindig pontosan tükrözi a kosárban lévő tételek számát

### AC-09 – "Continue Shopping" gomb működése a kosár oldalon (happy path)
- **Given** a user a kosár oldalon van
- **When** a "Continue Shopping" gombra kattint
- **Then** visszakerül a terméklistára, és a kosár tartalma megmarad

---

## 4. Checkout

### AC-10 – Sikeres vásárlás (happy path)
- **Given** a `standard_user` bejelentkezett, és van 1 termék a kosárban
- **When** végigmegy a pénztárfolyamaton (a kosár tartalmazza a korábban kiválasztott terméket → Checkout: Your Information → név és irányítószám megadása → Continue → Overview → Finish)
- **Then** megjelenik a **"Thank you for your order!"** felirat a rendelés-visszaigazoló oldalon

### AC-11 – Checkoutnál a kötelező mezők kitöltése (negatív)
- **Given** a user nem adja meg az adatait, vagy csak valamelyik adatát a Checkoutnál
- **When** megpróbálja folytatni a rendelést
- **Then** hibaüzenet jelenik meg, és a rendszer nem engedi tovább a folyamatot
- **And** a kosár tartalma megmarad

### AC-12 – Üres kosárral checkout (negatív)
- **Given** a user bejelentkezett, de a kosár üres
- **When** megpróbálja végigvinni a checkout folyamatot
- **Then** a rendszernek meg kellene akadályoznia a rendelés véglegesítését

> ⚠️ **Megjegyzés:** ez egy ismert, dokumentált hiba a saucedemo.com-on — a rendszer jelenleg engedi az üres kosárral történő "rendelés" leadását. Ez a teszteset tehát várhatóan **hibát fog jelezni (failing test)**, amíg a hiba nincs javítva. Érdemes ezt tudatosan `@known-bug` vagy hasonló taggel megjelölni az automatizált tesztben.

---

## 5. Nem funkcionális tesztek (speciális felhasználók)

### AC-13 – Locked out user (nem funkcionális)
- **Given** bejelentkezéskor a `locked_out_user` felhasználónevet és jelszót adjuk meg
- **When** a Login gombra kattintunk
- **Then** speciális hibaüzenet jelenik meg: *"Sorry, this user has been locked out."*

### AC-14 – Teljesítményteszt (performance_glitch_user)
- **Given** bejelentkezéskor a `performance_glitch_user` felhasználónevet és jelszót adjuk meg
- **When** megnyomjuk a Login gombot
- **Then** a bejelentkezés érzékelhetően lassabb, mint egy `standard_user` esetén (jellemzően több másodperces, kb. 5–8 mp-es késleltetéssel jár)
- **And** a bejelentkezés egy ésszerű felső időkorláton (pl. 10 mp) belül mégis sikeresen megtörténik

### AC-15 – problem_user – hibás termékkezelés
- **Given** a `problem_user` bejelentkezett
- **When** böngészi a termékoldalt, termékeket próbál kosárba tenni/eltávolítani, illetve a Checkoutnál kitölti az adatokat
- **Then** a rendszer több ismert hibát mutat:
  - helytelen/duplikált termékképek jelennek meg
  - a rendezés funkció nem működik
  - egyes termékek nem távolíthatók el a kosárból
  - a Checkout: Your Information oldalon a Last Name mező nem tölthető ki, ami megakadályozza a vásárlás folytatását

### AC-16 – error_user – hibás rendelés-lezárás
- **Given** az `error_user` bejelentkezett, és van termék a kosarában
- **When** végigmegy a Checkout folyamaton, és a Finish gombra kattint
- **Then** a rendelés nem fejeződik be sikeresen (a "Thank you for your order!" oldal nem jelenik meg helyesen)
- **And** a termékrendezés funkció szintén hibásan működik ennél a usernél

### AC-17 – visual_user – vizuális hibák  (nem funkcionális)
- **Given** a `visual_user` bejelentkezett
- **When** böngészi a termékoldalt és a kosarat, majd végigviszi a vásárlást
- **Then** a vásárlási folyamat **funkcionálisan végigvihető**
- **And** ugyanakkor vizuális hibák észlelhetők (pl. elcsúszott/elforgatott ikonok, helytelen szövegigazítás, hibás árak megjelenítése, rossz termékkép rendezés után)

**Megjegyzés:** A termékkép tartalmi helyessége (pl. teljesen más kép megjelenése) tudatosan manuális/exploratory tesztelés tárgya, mivel automatizálva csak flaky vagy jelentős karbantartást igénylő módon lenne ellenőrizhető.

---

## Változásnapló

| Verzió | Változás |
|--------|----------|
| 2. iteráció | Javítva: elgépelések, a nem létező PDF-letöltési feltétel törölve, `locked_out_user` felhasználónév javítva, teljesítményteszt logikája megfordítva a valós `performance_glitch_user` viselkedésnek megfelelően |
| 2. iteráció | Hozzáadva: AC-15 (problem_user), AC-16 (error_user), AC-17 (visual_user) |
