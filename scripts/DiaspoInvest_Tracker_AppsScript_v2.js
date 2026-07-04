/**
 * DiaspoInvest Tracker Dashboard — Apps Script v2
 * Mise a jour automatique des cours BRVM via diaspoinvest.fr/api/brvm-data
 *
 * INSTALLATION :
 * 1. Dans Google Sheets → Extensions → Apps Script
 * 2. Coller ce code entier, remplacer le code existant
 * 3. Sauvegarder (Ctrl+S)
 * 4. Executer setupDailyTrigger() UNE seule fois pour activer la mise a jour quotidienne
 * 5. Autoriser les permissions demandees
 *
 * SOURCE : diaspoinvest.fr/api/brvm-data (JSON scraper officiel, mis a jour lun-ven 18h UTC)
 * Avantage vs sikafinance direct : source controlee, pas de risque de changement de structure HTML
 */

// ─── Configuration ────────────────────────────────────────────────────────────
const SHEET_COURS   = "Cours Live";
const API_URL       = "https://diaspoinvest.fr/api/brvm-data";
const HEURE_MAJ     = 7; // 7h00 Paris (apres le scraper qui tourne a 18h UTC = 19h Paris)

// ─── Fonction principale ───────────────────────────────────────────────────────
function majCoursBRVM() {
  try {
    const data  = fetchBRVMData();
    const cours = extraireCoursDepuisJSON(data);
    const divs  = extraireDividendesDepuisJSON(data);
    mettreAJourSheet(cours, divs, data.genere_le);
    Logger.log("Mise a jour terminee — " + Object.keys(cours).length + " cours mis a jour");
  } catch (e) {
    Logger.log("ERREUR majCoursBRVM : " + e.message);
  }
}

// ─── Fetch JSON depuis l'API Vercel ──────────────────────────────────────────
function fetchBRVMData() {
  const response = UrlFetchApp.fetch(API_URL, {
    method: "GET",
    muteHttpExceptions: true,
    headers: { "Accept": "application/json" }
  });

  if (response.getResponseCode() !== 200) {
    throw new Error("API inaccessible (HTTP " + response.getResponseCode() + ")");
  }

  const data = JSON.parse(response.getContentText());

  if (!data || !data.actions || data.actions.length === 0) {
    throw new Error("JSON vide ou sans actions");
  }

  if (!data.fiable) {
    Logger.log("ATTENTION : donnees marquees non fiables dans le JSON (fiable=false)");
  }

  return data;
}

// ─── Extraction des cours depuis le JSON ─────────────────────────────────────
function extraireCoursDepuisJSON(data) {
  const cours = {};
  data.actions.forEach(function(action) {
    const code = (action.code || "").trim().toUpperCase();
    const prix = action.cours;
    if (code && prix && prix > 0) {
      cours[code] = prix;
    }
  });
  return cours;
}

// ─── Extraction des dividendes bruts depuis le JSON ──────────────────────────
function extraireDividendesDepuisJSON(data) {
  const divs = {};
  data.actions.forEach(function(action) {
    const code = (action.code || "").trim().toUpperCase();
    const div  = action.dividende_brut || action.dividende || 0;
    if (code && div > 0) {
      divs[code] = div;
    }
  });
  return divs;
}

// ─── Mise a jour du Google Sheet ──────────────────────────────────────────────
function mettreAJourSheet(cours, divs, dateGeneration) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_COURS);

  if (!sheet) {
    throw new Error("Feuille '" + SHEET_COURS + "' introuvable");
  }

  const lastRow    = sheet.getLastRow();
  if (lastRow < 4) return;

  // Colonne B = code action, Colonne D = cours, Colonne E = dividende brut
  const nbLignes   = lastRow - 3;
  const codeRange  = sheet.getRange(4, 2, nbLignes, 1).getValues(); // col B
  const coursRange = sheet.getRange(4, 4, nbLignes, 1).getValues(); // col D
  const divRange   = sheet.getRange(4, 5, nbLignes, 1).getValues(); // col E

  let majCours = 0;
  let majDivs  = 0;

  const newCours = coursRange.map(function(row, i) {
    const code = (codeRange[i][0] || "").toString().trim().toUpperCase();
    if (cours[code] !== undefined) {
      majCours++;
      return [cours[code]];
    }
    return row;
  });

  const newDivs = divRange.map(function(row, i) {
    const code = (codeRange[i][0] || "").toString().trim().toUpperCase();
    if (divs[code] !== undefined) {
      majDivs++;
      return [divs[code]];
    }
    return row;
  });

  sheet.getRange(4, 4, newCours.length, 1).setValues(newCours);
  sheet.getRange(4, 5, newDivs.length, 1).setValues(newDivs);

  // Horodatage — chercher la cellule qui contient "Derniere mise a jour"
  const now     = new Date();
  const dateStr = Utilities.formatDate(now, "Europe/Paris", "dd/MM/yyyy HH:mm");
  const srcDate = dateGeneration || "inconnue";

  // Mise a jour ligne 2 (horodatage)
  const rangeA2 = sheet.getRange("A2");
  rangeA2.setValue(
    "Derniere mise a jour : " + dateStr +
    " (source scraper : " + srcDate + ")  |  source : sikafinance.com  |  Recois le Top 5 actions BRVM chaque lundi : https://diaspoinvest.fr"
  );

  Logger.log(
    "Sheet mis a jour — " + dateStr +
    " | cours : " + majCours + " | divs : " + majDivs
  );
}

// ─── Configuration du declencheur automatique ─────────────────────────────────
/**
 * Executer UNE SEULE FOIS depuis Extensions > Apps Script > Executer
 * Cree un declencheur quotidien a l'heure definie dans HEURE_MAJ
 */
function setupDailyTrigger() {
  // Supprimer les anciens declencheurs DiaspoInvest
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === "majCoursBRVM") {
      ScriptApp.deleteTrigger(t);
    }
  });

  // Creer le nouveau declencheur quotidien
  ScriptApp.newTrigger("majCoursBRVM")
    .timeBased()
    .everyDays(1)
    .atHour(HEURE_MAJ)
    .inTimezone("Europe/Paris")
    .create();

  Logger.log("Declencheur quotidien cree — majCoursBRVM() a " + HEURE_MAJ + "h00 (Paris)");
  SpreadsheetApp.getUi().alert(
    "DiaspoInvest Tracker Dashboard",
    "Mise a jour automatique activee.\n" +
    "Les cours se mettront a jour chaque matin a " + HEURE_MAJ + "h00 (Paris).\n\n" +
    "Source : diaspoinvest.fr/api/brvm-data\n" +
    "(Scraper officiel BRVM, mis a jour lun-ven en soiree)",
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

// ─── Test manuel ──────────────────────────────────────────────────────────────
function testerMaintenant() {
  majCoursBRVM();
  SpreadsheetApp.getUi().alert(
    "DiaspoInvest",
    "Cours mis a jour depuis diaspoinvest.fr/api/brvm-data",
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}
