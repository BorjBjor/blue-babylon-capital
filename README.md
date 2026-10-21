# Börstjänaren – enkel testsajt för GitHub Pages

Detta är en **fristående prototyp**. Den ska inte laddas upp i `blue-babylon-capital` eller ersätta filer på borstjanaren.se.

## Installera på GitHub Pages

1. På GitHub, skapa ett **nytt repository** med namnet `borstjanaren-test`. Välj gärna privat repository om din plan tillåter Pages där; annars tänk på att testet är offentligt.
2. Klicka `Add file` → `Upload files` och ladda upp **alla filer och mappar i ZIP-arkivet**, inklusive `index.html`, `admin.html`, `assets/`, `css/` och `js/`.
3. Välj `Settings` → `Pages` → `Build and deployment` → `Deploy from a branch`.
4. Ange `main`, mapp `/(root)`, och spara.
5. Sajten får normalt adressen `https://<ditt-github-namn>.github.io/borstjanaren-test/`.
6. Besök `admin.html`, logga in med **123 / 123** och prova att skapa, ändra, publicera och ta bort artiklar.

## Viktig skillnad: detta är ett demo-läge

**GitHub Pages kan inte köra en backend.** Inloggningen `123 / 123` i den här versionen är bara en demonstration i webbläsaren. Ändringar sparas enbart via webbläsarens `localStorage` och syns därför **inte på andra datorer eller för andra besökare**. De tre testartiklarna visas för alla.

Vill du publicera på riktigt (så att alla besökare ser dina nya artiklar) använder du i stället paketet **`borstjanaren-test-php.zip`** på en PHP-server eller en framtida Cloudflare-lösning med datalager.

Om du vill börja om i demosajten, öppna utvecklarverktygens lagring och radera `bt_demo_articles_v1`, eller rensa webbplatsdata för testadressen.

## Innehåll

- `index.html` – enda publika sidan, även för hela artiklar och kategoriarkiv.
- `admin.html` – inloggning och redaktion.
- `js/data.js` – tre ursprungliga testartiklar.
- `css/style.css` – utseendet.
- `assets/` – nyritad temporär ordmärkning och illustrationer.
- `articles.json` – exportvänlig kopia av startartiklarna.

**Logotyp:** `assets/logo.svg` är tills vidare en provisorisk, nyritad ordmärkning. Den ursprungliga logotypfilen gick inte att hämta som fristående asset för denna leverans. Byt in originalfilen när den finns.

Det är en design- och funktionstest, inte en säker inloggning för en offentlig sajt.
