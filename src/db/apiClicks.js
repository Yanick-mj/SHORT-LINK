import supabase from "./supabase";
import {
  getCachedLocation,
  detectDevice,
  detectBrowser,
  detectOS
} from "@/lib/geolocation";

export async function getClicks(url_id) {
  const { data, error } = await supabase
    .from("clicks")
    .select("*")
    .eq("url_id", url_id)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

// Récupère les compteurs de clics pour une liste d'URL en une seule requête
export async function getClicksCounts(urlIds) {
  if (!Array.isArray(urlIds) || urlIds.length === 0) return {};

  const { data, error } = await supabase
    .from("clicks")
    .select("url_id")
    .in("url_id", urlIds);

  if (error) throw new Error(error.message);

  const counts = {};
  for (const row of data || []) {
    counts[row.url_id] = (counts[row.url_id] || 0) + 1;
  }
  return counts;
}

/**
 * Insertion asynchrone non-bloquante avec géolocalisation
 * Conforme front-end.mdc : performance, UX, robustesse
 */
export async function insertClick(url_id) {
  try {
    // 1. Détection immédiate des données disponibles
    const device = detectDevice();
    const browser = detectBrowser();
    const os = detectOS();

    // 2. Insertion immédiate (non-bloquante)
    const clickData = {
      url_id: url_id,
      devise: device,
      browser: browser,
      os: os,
      city: 'Loading...', // Placeholder
      country: 'Loading...',
      referrer: document.referrer || 'Direct',
      user_agent: navigator.userAgent,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("clicks")
      .insert(clickData)
      .select();

    if (error) throw new Error(error.message);

    // 3. Mise à jour asynchrone de la géolocalisation (non-bloquante)
    if (data && data[0]) {
      updateLocationAsync(data[0].id);
    }

    return data;
  } catch (error) {
    console.error('Erreur lors de l\'insertion du clic:', error);
    throw error;
  }
}

/**
 * Mise à jour asynchrone de la géolocalisation
 * Non-bloquante, avec fallback robuste
 */
const updateLocationAsync = async (clickId) => {
  try {
    console.log('🌍 Mise à jour géolocalisation pour clic:', clickId);

    // Récupération avec cache et timeout
    const location = await getCachedLocation();

    // Mise à jour en base
    const { error } = await supabase
      .from("clicks")
      .update({
        city: location.city,
        country: location.country,
        region: location.region,
        timezone: location.timezone
      })
      .eq('id', clickId);

    if (error) {
      console.error('Erreur mise à jour géolocalisation:', error);
    } else {
      console.log('✅ Géolocalisation mise à jour:', location);
    }
  } catch (error) {
    console.warn('⚠️ Échec géolocalisation, données par défaut conservées:', error.message);

    // Fallback : marquer comme échec
    try {
      await supabase
        .from("clicks")
        .update({
          city: 'Unknown',
          country: 'Unknown'
        })
        .eq('id', clickId);
    } catch (fallbackError) {
      console.error('Erreur fallback géolocalisation:', fallbackError);
    }
  }
};

/**
 * Insertion avec géolocalisation synchrone (pour tests)
 * @deprecated Utiliser insertClick() pour la production
 */
export async function insertClickWithLocation(url_id) {
  try {
    const location = await getCachedLocation();
    const device = detectDevice();
    const browser = detectBrowser();
    const os = detectOS();

    const { data, error } = await supabase
      .from("clicks")
      .insert({
        url_id: url_id,
        devise: device,
        browser: browser,
        os: os,
        city: location.city,
        country: location.country,
        region: location.region,
        timezone: location.timezone,
        referrer: document.referrer || 'Direct',
        user_agent: navigator.userAgent
      })
      .select();

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Erreur insertion avec géolocalisation:', error);
    throw error;
  }
}
