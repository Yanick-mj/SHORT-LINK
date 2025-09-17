/**
 * Service de géolocalisation avec cache et fallback robuste
 * Conforme aux règles front-end.mdc : performance, simplicité, robustesse
 */

// Cache pour éviter les appels répétés (conformité front-end.mdc)
const locationCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Récupère la géolocalisation via IP-API (gratuite, fiable)
 * @returns {Promise<{city: string, country: string, region?: string}>}
 */
export const getLocationFromIP = async () => {
  try {
    // Timeout de 3s maximum (conformité front-end.mdc)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch('http://ip-api.com/json/', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Validation des données (robustesse)
    if (data.status === 'fail') {
      throw new Error(data.message || 'Géolocalisation échouée');
    }

    return {
      city: data.city || 'Unknown',
      country: data.country || 'Unknown',
      region: data.regionName || 'Unknown',
      timezone: data.timezone || 'Unknown'
    };

  } catch (error) {
    console.warn('Erreur géolocalisation IP-API:', error.message);
    return {
      city: 'Unknown',
      country: 'Unknown',
      region: 'Unknown',
      timezone: 'Unknown'
    };
  }
};

/**
 * Cache intelligent pour éviter les appels répétés
 * @param {string} cacheKey - Clé de cache (par défaut 'default')
 * @returns {Promise<{city: string, country: string, region?: string}>}
 */
export const getCachedLocation = async (cacheKey = 'default') => {
  const now = Date.now();
  const cached = locationCache.get(cacheKey);

  // Vérifier si le cache est valide
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    console.log('📍 Géolocalisation depuis le cache');
    return cached.data;
  }

  // Récupérer depuis l'API
  console.log('🌍 Récupération géolocalisation depuis IP-API');
  const location = await getLocationFromIP();

  // Mettre en cache
  locationCache.set(cacheKey, {
    data: location,
    timestamp: now
  });

  return location;
};

/**
 * Détection d'appareil améliorée (conformité front-end.mdc)
 * @returns {string} Type d'appareil
 */
export const detectDevice = () => {
  const userAgent = navigator.userAgent;

  if (/Android/i.test(userAgent)) {
    return 'android';
  } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
    return 'iphone';
  } else if (/Windows/i.test(userAgent)) {
    return 'windows';
  } else if (/Mac/i.test(userAgent)) {
    return 'mac';
  } else if (/Linux/i.test(userAgent)) {
    return 'linux';
  }

  return 'desktop';
};

/**
 * Détection de navigateur
 * @returns {string} Nom du navigateur
 */
export const detectBrowser = () => {
  const userAgent = navigator.userAgent;

  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';

  return 'Unknown';
};

/**
 * Détection d'OS
 * @returns {string} Système d'exploitation
 */
export const detectOS = () => {
  const userAgent = navigator.userAgent;

  if (/Windows/i.test(userAgent)) return 'Windows';
  if (/Mac/i.test(userAgent)) return 'macOS';
  if (/Linux/i.test(userAgent)) return 'Linux';
  if (/Android/i.test(userAgent)) return 'Android';
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'iOS';

  return 'Unknown';
};

/**
 * Nettoyage du cache (utile pour les tests)
 */
export const clearLocationCache = () => {
  locationCache.clear();
  console.log('🗑️ Cache de géolocalisation vidé');
};

/**
 * Statistiques du cache (debug)
 */
export const getCacheStats = () => {
  return {
    size: locationCache.size,
    entries: Array.from(locationCache.keys())
  };
};
