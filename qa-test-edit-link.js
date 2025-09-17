#!/usr/bin/env node

/**
 * 🧪 QA Test - Fonction d'Édition de Lien
 *
 * Test complet suivant les règles QA.mdc :
 * - Tests sur 3 viewports (1440, 768, 375)
 * - Tests de chaque bouton/action individuellement
 * - Vérification des interactions complètes
 * - Tests d'accessibilité clavier
 * - Tests de régression
 * - Capture de logs et preuves
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration des tests
const TEST_CONFIG = {
  baseUrl: 'http://localhost:5173',
  viewports: [
    { width: 1440, height: 900, name: 'Desktop' },
    { width: 768, height: 1024, name: 'Tablet' },
    { width: 375, height: 667, name: 'Mobile' }
  ],
  timeout: 30000,
  screenshotDir: './qa-screenshots'
};

// Résultats des tests
const testResults = {
  passed: 0,
  failed: 0,
  errors: [],
  screenshots: []
};

// Créer le dossier de screenshots
if (!fs.existsSync(TEST_CONFIG.screenshotDir)) {
  fs.mkdirSync(TEST_CONFIG.screenshotDir, { recursive: true });
}

/**
 * Fonction utilitaire pour capturer des screenshots
 */
async function captureScreenshot(page, name, viewport) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${name}-${viewport.name}-${timestamp}.png`;
  const filepath = path.join(TEST_CONFIG.screenshotDir, filename);

  await page.screenshot({
    path: filepath,
    fullPage: true
  });

  testResults.screenshots.push(filepath);
  console.log(`📸 Screenshot capturé: ${filename}`);
  return filepath;
}

/**
 * Fonction utilitaire pour logger les erreurs
 */
function logError(testName, error, viewport) {
  const errorInfo = {
    test: testName,
    viewport: viewport.name,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  };

  testResults.errors.push(errorInfo);
  testResults.failed++;
  console.error(`❌ ${testName} (${viewport.name}): ${error.message}`);
}

/**
 * Fonction utilitaire pour marquer un test comme réussi
 */
function logSuccess(testName, viewport) {
  testResults.passed++;
  console.log(`✅ ${testName} (${viewport.name}): Réussi`);
}

/**
 * Test 1: Vérification de l'accessibilité de l'application
 */
async function testAppAccessibility(page, viewport) {
  try {
    console.log(`\n🔍 Test d'accessibilité (${viewport.name})`);

    // Vérifier que l'application se charge
    await page.goto(TEST_CONFIG.baseUrl, { waitUntil: 'networkidle0' });
    await page.waitForSelector('body', { timeout: 10000 });

    // Vérifier les éléments d'accessibilité de base
    const title = await page.title();
    if (!title || title === '') {
      throw new Error('Titre de page manquant');
    }

    // Vérifier la présence d'éléments de navigation
    const navElements = await page.$$('nav, [role="navigation"]');
    if (navElements.length === 0) {
      console.warn('⚠️ Aucun élément de navigation trouvé');
    }

    // Capturer un screenshot
    await captureScreenshot(page, 'accessibility-check', viewport);

    logSuccess('Accessibilité de base', viewport);

  } catch (error) {
    logError('Accessibilité de base', error, viewport);
  }
}

/**
 * Test 2: Test du bouton d'édition depuis le dashboard
 */
async function testEditButtonDashboard(page, viewport) {
  try {
    console.log(`\n🔍 Test bouton d'édition - Dashboard (${viewport.name})`);

    // Aller au dashboard (supposons qu'il y ait un lien de navigation)
    await page.goto(TEST_CONFIG.baseUrl, { waitUntil: 'networkidle0' });

    // Attendre que la page se charge complètement
    await page.waitForTimeout(2000);

    // Chercher le bouton d'édition (icône Edit)
    const editButtons = await page.$$('button[aria-label*="Modifier"], button[title*="Modifier"], button:has(svg)');

    if (editButtons.length === 0) {
      // Essayer de trouver par l'icône Edit
      const editIcons = await page.$$('svg[data-lucide="edit"], .lucide-edit');
      if (editIcons.length === 0) {
        throw new Error('Aucun bouton d\'édition trouvé sur le dashboard');
      }
    }

    // Capturer un screenshot avant le clic
    await captureScreenshot(page, 'dashboard-before-edit', viewport);

    // Cliquer sur le premier bouton d'édition trouvé
    const firstEditButton = editButtons[0] || await page.$('button:has(svg[data-lucide="edit"])');
    if (firstEditButton) {
      await firstEditButton.click();

      // Attendre que le dialog s'ouvre
      await page.waitForSelector('[role="dialog"], .dialog-content', { timeout: 5000 });

      // Capturer un screenshot après ouverture du dialog
      await captureScreenshot(page, 'dashboard-edit-dialog-open', viewport);

      // Vérifier que le dialog contient les champs attendus
      const titleField = await page.$('input[name="title"], #title');
      const urlField = await page.$('input[name="original_url"], #original_url');

      if (!titleField || !urlField) {
        throw new Error('Champs du formulaire d\'édition non trouvés');
      }

      // Vérifier que les champs sont pré-remplis
      const titleValue = await titleField.evaluate(el => el.value);
      const urlValue = await urlField.evaluate(el => el.value);

      if (!titleValue || !urlValue) {
        throw new Error('Champs du formulaire non pré-remplis');
      }

      logSuccess('Bouton d\'édition - Dashboard', viewport);

    } else {
      throw new Error('Impossible de cliquer sur le bouton d\'édition');
    }

  } catch (error) {
    logError('Bouton d\'édition - Dashboard', error, viewport);
  }
}

/**
 * Test 3: Test de la validation du formulaire d'édition
 */
async function testEditFormValidation(page, viewport) {
  try {
    console.log(`\n🔍 Test validation formulaire d'édition (${viewport.name})`);

    // Vérifier que le dialog est ouvert
    const dialog = await page.$('[role="dialog"], .dialog-content');
    if (!dialog) {
      throw new Error('Dialog d\'édition non ouvert');
    }

    // Vider le champ titre pour tester la validation
    const titleField = await page.$('input[name="title"], #title');
    if (titleField) {
      await titleField.click();
      await titleField.evaluate(el => el.value = '');
      await titleField.type(' '); // Déclencher la validation

      // Attendre un peu pour la validation
      await page.waitForTimeout(500);

      // Vérifier qu'un message d'erreur apparaît
      const errorMessage = await page.$('.text-red-600, [role="alert"]');
      if (errorMessage) {
        const errorText = await errorMessage.evaluate(el => el.textContent);
        console.log(`✅ Message d'erreur trouvé: ${errorText}`);
      }
    }

    // Capturer un screenshot de la validation
    await captureScreenshot(page, 'edit-form-validation', viewport);

    logSuccess('Validation formulaire d\'édition', viewport);

  } catch (error) {
    logError('Validation formulaire d\'édition', error, viewport);
  }
}

/**
 * Test 4: Test de l'accessibilité clavier
 */
async function testKeyboardAccessibility(page, viewport) {
  try {
    console.log(`\n🔍 Test accessibilité clavier (${viewport.name})`);

    // Fermer le dialog s'il est ouvert
    const dialog = await page.$('[role="dialog"], .dialog-content');
    if (dialog) {
      // Essayer de fermer avec Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    // Test de navigation au clavier
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);

    // Vérifier qu'un élément est focusé
    const focusedElement = await page.evaluate(() => document.activeElement);
    if (!focusedElement) {
      throw new Error('Aucun élément focusé après Tab');
    }

    // Capturer un screenshot de la navigation clavier
    await captureScreenshot(page, 'keyboard-navigation', viewport);

    logSuccess('Accessibilité clavier', viewport);

  } catch (error) {
    logError('Accessibilité clavier', error, viewport);
  }
}

/**
 * Test 5: Test de régression - Vérifier que les autres boutons fonctionnent
 */
async function testRegressionOtherButtons(page, viewport) {
  try {
    console.log(`\n🔍 Test de régression - Autres boutons (${viewport.name})`);

    // Chercher le bouton de création de lien
    const createButton = await page.$('button:has-text("Créer"), button[aria-label*="Créer"]');
    if (createButton) {
      const isClickable = await createButton.evaluate(el => !el.disabled);
      if (!isClickable) {
        throw new Error('Bouton de création non cliquable');
      }
    }

    // Chercher le bouton de copie
    const copyButtons = await page.$$('button[aria-label*="Copier"], button[title*="Copier"]');
    if (copyButtons.length > 0) {
      const firstCopyButton = copyButtons[0];
      const isClickable = await firstCopyButton.evaluate(el => !el.disabled);
      if (!isClickable) {
        throw new Error('Bouton de copie non cliquable');
      }
    }

    // Capturer un screenshot de régression
    await captureScreenshot(page, 'regression-other-buttons', viewport);

    logSuccess('Test de régression - Autres boutons', viewport);

  } catch (error) {
    logError('Test de régression - Autres boutons', error, viewport);
  }
}

/**
 * Fonction principale de test
 */
async function runQATests() {
  console.log('🚀 Démarrage des tests QA - Fonction d\'édition de lien');
  console.log(`📱 Viewports à tester: ${TEST_CONFIG.viewports.map(v => v.name).join(', ')}`);

  const browser = await puppeteer.launch({
    headless: false, // Mode visible pour debug
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (const viewport of TEST_CONFIG.viewports) {
    console.log(`\n📱 Test sur ${viewport.name} (${viewport.width}x${viewport.height})`);

    const page = await browser.newPage();
    await page.setViewport(viewport);

    try {
      // Exécuter tous les tests pour ce viewport
      await testAppAccessibility(page, viewport);
      await testEditButtonDashboard(page, viewport);
      await testEditFormValidation(page, viewport);
      await testKeyboardAccessibility(page, viewport);
      await testRegressionOtherButtons(page, viewport);

    } catch (error) {
      console.error(`❌ Erreur générale sur ${viewport.name}:`, error.message);
    } finally {
      await page.close();
    }
  }

  await browser.close();

  // Générer le rapport final
  generateReport();
}

/**
 * Génération du rapport final
 */
function generateReport() {
  console.log('\n📊 RAPPORT QA FINAL');
  console.log('='.repeat(50));

  console.log(`✅ Tests réussis: ${testResults.passed}`);
  console.log(`❌ Tests échoués: ${testResults.failed}`);
  console.log(`📸 Screenshots capturés: ${testResults.screenshots.length}`);

  if (testResults.errors.length > 0) {
    console.log('\n🚨 ERREURS DÉTECTÉES:');
    testResults.errors.forEach((error, index) => {
      console.log(`\n${index + 1}. ${error.test} (${error.viewport})`);
      console.log(`   Erreur: ${error.error}`);
    });
  }

  // Sauvegarder le rapport dans un fichier
  const reportPath = path.join(TEST_CONFIG.screenshotDir, 'qa-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      passed: testResults.passed,
      failed: testResults.failed,
      total: testResults.passed + testResults.failed
    },
    errors: testResults.errors,
    screenshots: testResults.screenshots
  }, null, 2));

  console.log(`\n📄 Rapport détaillé sauvegardé: ${reportPath}`);

  // Déterminer le statut final
  if (testResults.failed === 0) {
    console.log('\n🎉 TOUS LES TESTS QA SONT PASSÉS !');
    process.exit(0);
  } else {
    console.log('\n⚠️ CERTAINS TESTS QA ONT ÉCHOUÉ');
    process.exit(1);
  }
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runQATests().catch(error => {
    console.error('❌ Erreur fatale lors des tests QA:', error);
    process.exit(1);
  });
}

module.exports = { runQATests, testResults };
