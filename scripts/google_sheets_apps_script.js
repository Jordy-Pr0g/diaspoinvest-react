/**
 * DiaspoInvest — Apps Script Google Sheets
 * ==========================================
 * Colle ce code dans Extensions > Apps Script de ton Google Sheets Tracker.
 *
 * FONCTIONNEMENT :
 *   - Lit les données BRVM depuis https://diaspoinvest.fr/api/brvm-data
 *   - Met à jour la colonne "Cours Live" dans l'onglet "BRVM Data"
 *   - Déclencher automatiquement : lun-ven à 19h (après le scraper 18h UTC)
 *
 * SETUP :
 *   1. Ouvrir le Google Sheets Tracker
 *   2. Extensions > Apps Script > coller ce code
 *   3. Enregistrer
 *   4. Exécutions > Déclencheurs > Ajouter un déclencheur
 *      - Fonction : majCoursLive
 *      - Type : Basé sur le temps > Toutes les heures ou Heure précise (19h)
 *      - Jours : lundi au vendredi
 */

// ─── CONFIGURATION ────────────────────────────────────────────────────────────
const API_URL         = "https://diaspoinvest.fr/api/brvm-data";
const SHEET_BRVM      = "BRVM Data";   // nom de l'onglet avec les cours
const COL_TICKER      = 1;            // colonne A : code action (ex: "SNTS")
const COL_COURS_LIVE  = 4;            // colonne D : Cours Live (à adapter si différent)
const COL_LAST_UPDATE = 5;            // colonne E : date de dernière mise à jour
const ROW_START       = 2;            // première ligne de données (après en-tête)

// ─── FONCTION PRINCIPALE ──────────────────────────────────────────────────────
function majCoursLive() {
  try {
    // 1. Récupérer les données BRVM
    const response = UrlFetchApp.fetch(API_URL, {
      method: "GET",
      muteHttpExceptions: true,
      headers: { "Accept": "application/json" }
    });

    if (response.getResponseCode() !== 200) {
      console.error("API erreur : " + response.getResponseCode());
      return;
    }

    const data = JSON.parse(response.getContentText());
    const stocks = data.stocks || [];

    if (stocks.length === 0) {
      console.warn("Aucune donnée reçue de l'API.");
      return;
    }

    // 2. Construire un index ticker → cours
    const coursMap = {};
    stocks.forEach(stock => {
      // Gérer les deux formats possibles (ticker ou symbol)
      const ticker = (stock.ticker || stock.symbol || "").trim().toUpperCase();
      const cours  = parseFloat(stock.last_price || stock.cours || 0);
      if (ticker && cours > 0) {
        coursMap[ticker] = cours;
      }
    });

    // 3. Ouvrir l'onglet BRVM Data
    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_BRVM);

    if (!sheet) {
      console.error("Onglet '" + SHEET_BRVM + "' introuvable.");
      return;
    }

    // 4. Lire les tickers existants dans le sheet
    const lastRow = sheet.getLastRow();
    if (lastRow < ROW_START) return;

    const tickers = sheet.getRange(ROW_START, COL_TICKER, lastRow - ROW_START + 1, 1)
                         .getValues()
                         .map(r => (r[0] || "").toString().trim().toUpperCase());

    // 5. Mettre à jour les cours
    const now = new Date();
    let updated = 0;
    let notFound = [];

    tickers.forEach((ticker, i) => {
      if (!ticker) return;
      const row = ROW_START + i;

      if (coursMap[ticker] !== undefined) {
        sheet.getRange(row, COL_COURS_LIVE).setValue(coursMap[ticker]);
        sheet.getRange(row, COL_LAST_UPDATE).setValue(now);
        updated++;
      } else {
        notFound.push(ticker);
      }
    });

    // 6. Log dans l'onglet (optionnel)
    logMAJ(ss, updated, notFound, data.date || "N/A");

    console.log(`MAJ terminée : ${updated} cours mis à jour. Non trouvés : ${notFound.join(", ") || "aucun"}`);

  } catch (e) {
    console.error("Erreur majCoursLive : " + e.message);
  }
}

// ─── LOG ──────────────────────────────────────────────────────────────────────
function logMAJ(ss, updated, notFound, dateData) {
  let logSheet = ss.getSheetByName("Logs MAJ");

  // Créer l'onglet Logs s'il n'existe pas
  if (!logSheet) {
    logSheet = ss.insertSheet("Logs MAJ");
    logSheet.appendRow(["Date MAJ", "Cours mis à jour", "Non trouvés", "Date données BRVM"]);
    logSheet.getRange(1, 1, 1, 4).setFontWeight("bold");
  }

  logSheet.appendRow([
    new Date(),
    updated,
    notFound.join(", ") || "aucun",
    dateData
  ]);

  // Garder seulement les 100 dernières lignes de log
  const lastRow = logSheet.getLastRow();
  if (lastRow > 101) {
    logSheet.deleteRows(2, lastRow - 101);
  }
}

// ─── FONCTION MANUELLE (pour tester) ─────────────────────────────────────────
function testerAPI() {
  const response = UrlFetchApp.fetch(API_URL);
  const data = JSON.parse(response.getContentText());
  console.log("Nombre d'actions : " + (data.stocks || []).length);
  console.log("Date données : " + data.date);
  console.log("Exemple : " + JSON.stringify((data.stocks || [])[0]));
}

// ─── MENU PERSONNALISÉ (optionnel) ───────────────────────────────────────────
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("DiaspoInvest")
    .addItem("Mettre à jour les cours BRVM", "majCoursLive")
    .addItem("Tester l'API", "testerAPI")
    .addToUi();
}
