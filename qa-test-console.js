#!/usr/bin/env node

/**
 * 🧪 QA Test Console - Fonction d'Édition de Lien
 *
 * Test complet suivant les règles QA.mdc en mode console
 * - Tests de connectivité et accessibilité
 * - Vérification des composants critiques
 * - Tests de validation des données
 * - Capture de logs et preuves
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Configuration des tests
const TEST_CONFIG = {
  baseUrl: 'http://localhost:5173',
  timeout: 10000,
  screenshotDir: './qa-screenshots'
};

// Résultats des tests
const testResults = {
  passed: 0,
  failed: 0,
  errors: [],
  logs: []
};

// Créer le dossier de logs
if (!fs.existsSync(TEST_CONFIG.screenshotDir)) {
  fs.mkdirSync(TEST_CONFIG.screenshotDir, { recursive: true });
}

/**
 * Fonction utilitaire pour logger les erreurs
 */
function logError(testName, error) {
  const errorInfo = {
    test: testName,
    error: error.message,
    timestamp: new Date().toISOString()
  };

  testResults.errors.push(errorInfo);
  testResults.failed++;
  console.error(`❌ ${testName}: ${error.message}`);
}

/**
 * Fonction utilitaire pour marquer un test comme réussi
 */
function logSuccess(testName, details = '') {
  testResults.passed++;
  console.log(`✅ ${testName}: Réussi${details ? ` - ${details}` : ''}`);
}

/**
 * Fonction utilitaire pour logger des informations
 */
function logInfo(message) {
  testResults.logs.push({
    message,
    timestamp: new Date().toISOString()
  });
  console.log(`ℹ️ ${message}`);
}

/**
 * Test 1: Vérification de la connectivité de l'application
 */
async function testAppConnectivity() {
  try {
    console.log('\n🔍 Test de connectivité de l\'application');

    const response = await fetch(TEST_CONFIG.baseUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Vérifier que c'est bien une page React
    if (!html.includes('react') && !html.includes('vite')) {
      throw new Error('Page ne semble pas être une application React/Vite');
    }

    // Vérifier la présence d'éléments critiques
    if (!html.includes('<title>')) {
      throw new Error('Titre de page manquant');
    }

    logSuccess('Connectivité de l\'application', `Status: ${response.status}`);
    logInfo(`Taille de la page: ${html.length} caractères`);

  } catch (error) {
    logError('Connectivité de l\'application', error);
  }
}

/**
 * Test 2: Vérification des fichiers de composants critiques
 */
async function testCriticalComponents() {
  try {
    console.log('\n🔍 Test des composants critiques');

    const criticalFiles = [
      'src/components/edit-link-dialog.jsx',
      'src/components/link-card.jsx',
      'src/pages/link.jsx',
      'src/pages/dashboard.jsx',
      'src/db/apiUrls.js'
    ];

    for (const file of criticalFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`Fichier critique manquant: ${file}`);
      }

      const content = fs.readFileSync(file, 'utf8');

      // Vérifications spécifiques selon le fichier
      if (file.includes('edit-link-dialog')) {
        if (!content.includes('DialogTrigger')) {
          throw new Error('DialogTrigger manquant dans EditLinkDialog');
        }
        if (!content.includes('updateUrl')) {
          throw new Error('Fonction updateUrl non importée dans EditLinkDialog');
        }
      }

      if (file.includes('apiUrls')) {
        if (!content.includes('updated_at')) {
          throw new Error('Colonne updated_at non utilisée dans updateUrl');
        }
      }

      logSuccess(`Fichier ${file}`, `Taille: ${content.length} caractères`);
    }

  } catch (error) {
    logError('Composants critiques', error);
  }
}

/**
 * Test 3: Vérification de la configuration Supabase
 */
async function testSupabaseConfig() {
  try {
    console.log('\n🔍 Test de la configuration Supabase');

    // Vérifier le fichier de configuration Supabase
    const supabaseFile = 'src/db/supabase.js';
    if (!fs.existsSync(supabaseFile)) {
      throw new Error('Fichier de configuration Supabase manquant');
    }

    const content = fs.readFileSync(supabaseFile, 'utf8');

    // Vérifier les imports critiques
    if (!content.includes('createClient')) {
      throw new Error('Import createClient manquant');
    }

    if (!content.includes('VITE_SUPABASE_URL')) {
      throw new Error('Variable VITE_SUPABASE_URL non utilisée');
    }

    if (!content.includes('VITE_SUPABASE_KEY')) {
      throw new Error('Variable VITE_SUPABASE_KEY non utilisée');
    }

    // Vérifier le fichier .env.example
    if (fs.existsSync('.env.example')) {
      const envExample = fs.readFileSync('.env.example', 'utf8');
      if (!envExample.includes('VITE_SUPABASE_URL')) {
        throw new Error('VITE_SUPABASE_URL manquant dans .env.example');
      }
    }

    logSuccess('Configuration Supabase', 'Tous les éléments requis présents');

  } catch (error) {
    logError('Configuration Supabase', error);
  }
}

/**
 * Test 4: Vérification de la validation des formulaires
 */
async function testFormValidation() {
  try {
    console.log('\n🔍 Test de la validation des formulaires');

    const editDialogFile = 'src/components/edit-link-dialog.jsx';
    const content = fs.readFileSync(editDialogFile, 'utf8');

    // Vérifier la présence de yup
    if (!content.includes('yup')) {
      throw new Error('Validation yup manquante dans EditLinkDialog');
    }

    // Vérifier les champs de validation
    const requiredValidations = [
      'original_url',
      'title',
      'custom_url'
    ];

    for (const field of requiredValidations) {
      if (!content.includes(field)) {
        throw new Error(`Validation manquante pour le champ: ${field}`);
      }
    }

    // Vérifier la gestion des erreurs
    if (!content.includes('errors') || !content.includes('setErrors')) {
      throw new Error('Gestion des erreurs manquante');
    }

    logSuccess('Validation des formulaires', 'Tous les champs validés');

  } catch (error) {
    logError('Validation des formulaires', error);
  }
}

/**
 * Test 5: Vérification de l'accessibilité
 */
async function testAccessibility() {
  try {
    console.log('\n🔍 Test de l\'accessibilité');

    const criticalFiles = [
      'src/components/edit-link-dialog.jsx',
      'src/components/link-card.jsx'
    ];

    for (const file of criticalFiles) {
      const content = fs.readFileSync(file, 'utf8');

      // Vérifier les attributs d'accessibilité
      const accessibilityChecks = [
        'aria-label',
        'aria-describedby',
        'aria-invalid',
        'role=',
        'aria-live'
      ];

      let foundAccessibility = false;
      for (const check of accessibilityChecks) {
        if (content.includes(check)) {
          foundAccessibility = true;
          break;
        }
      }

      if (!foundAccessibility) {
        throw new Error(`Attributs d'accessibilité manquants dans ${file}`);
      }
    }

    logSuccess('Accessibilité', 'Attributs d\'accessibilité présents');

  } catch (error) {
    logError('Accessibilité', error);
  }
}

/**
 * Test 6: Vérification des tests de régression
 */
async function testRegression() {
  try {
    console.log('\n🔍 Test de régression');

    // Vérifier que les fonctionnalités existantes sont préservées
    const dashboardFile = 'src/pages/dashboard.jsx';
    const content = fs.readFileSync(dashboardFile, 'utf8');

    // Vérifier que les fonctionnalités de base sont présentes
    const requiredFeatures = [
      'getUrls',
      'deleteUrl',
      'CreateLinkDialog',
      'LinkCard'
    ];

    for (const feature of requiredFeatures) {
      if (!content.includes(feature)) {
        throw new Error(`Fonctionnalité de régression manquante: ${feature}`);
      }
    }

    // Vérifier que la nouvelle fonctionnalité d'édition est intégrée
    if (!content.includes('onEdit') || !content.includes('handleEditSuccess')) {
      throw new Error('Intégration de la fonction d\'édition manquante dans le dashboard');
    }

    logSuccess('Test de régression', 'Toutes les fonctionnalités préservées');

  } catch (error) {
    logError('Test de régression', error);
  }
}

/**
 * Test 7: Vérification de la performance
 */
async function testPerformance() {
  try {
    console.log('\n🔍 Test de performance');

    // Vérifier que l'application se build correctement
    try {
      const { stdout, stderr } = await execAsync('npm run build');

      if (stderr && stderr.includes('error')) {
        throw new Error(`Erreurs de build: ${stderr}`);
      }

      logSuccess('Performance - Build', 'Application se build sans erreur');
      logInfo(`Output build: ${stdout.length} caractères`);

    } catch (error) {
      throw new Error(`Build échoué: ${error.message}`);
    }

  } catch (error) {
    logError('Performance - Build', error);
  }
}

/**
 * Fonction principale de test
 */
async function runQATests() {
  console.log('🚀 Démarrage des tests QA Console - Fonction d\'édition de lien');
  console.log('📋 Suivant les règles QA.mdc');

  try {
    // Exécuter tous les tests
    await testAppConnectivity();
    await testCriticalComponents();
    await testSupabaseConfig();
    await testFormValidation();
    await testAccessibility();
    await testRegression();
    await testPerformance();

  } catch (error) {
    console.error('❌ Erreur fatale lors des tests QA:', error.message);
  }

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
  console.log(`ℹ️ Logs capturés: ${testResults.logs.length}`);

  if (testResults.errors.length > 0) {
    console.log('\n🚨 ERREURS DÉTECTÉES:');
    testResults.errors.forEach((error, index) => {
      console.log(`\n${index + 1}. ${error.test}`);
      console.log(`   Erreur: ${error.error}`);
      console.log(`   Timestamp: ${error.timestamp}`);
    });
  }

  // Sauvegarder le rapport dans un fichier
  const reportPath = path.join(TEST_CONFIG.screenshotDir, 'qa-console-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      passed: testResults.passed,
      failed: testResults.failed,
      total: testResults.passed + testResults.failed
    },
    errors: testResults.errors,
    logs: testResults.logs
  }, null, 2));

  console.log(`\n📄 Rapport détaillé sauvegardé: ${reportPath}`);

  // Déterminer le statut final
  if (testResults.failed === 0) {
    console.log('\n🎉 TOUS LES TESTS QA SONT PASSÉS !');
    console.log('✅ La fonction d\'édition de lien est prête pour la production');
    process.exit(0);
  } else {
    console.log('\n⚠️ CERTAINS TESTS QA ONT ÉCHOUÉ');
    console.log('❌ Des corrections sont nécessaires avant le déploiement');
    process.exit(1);
  }
}

// Exécuter les tests si le script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  runQATests().catch(error => {
    console.error('❌ Erreur fatale lors des tests QA:', error);
    process.exit(1);
  });
}

export { runQATests, testResults };
