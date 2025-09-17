import supabase from "./supabase";

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

// Fonction pour insérer un nouveau clic
export async function insertClick(url_id) {
  try {
    // Détecter le type d'appareil
    const userAgent = navigator.userAgent;
    let devise = 'desktop';

    if (/Android/i.test(userAgent)) {
      devise = 'android';
    } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
      devise = 'iphone';
    } else if (/Windows/i.test(userAgent)) {
      devise = 'windows';
    } else if (/Mac/i.test(userAgent)) {
      devise = 'mac';
    }

    // Insérer le clic avec les informations disponibles
    const { data, error } = await supabase
      .from("clicks")
      .insert({
        url_id: url_id,
        devise: devise,
        city: null, // À remplir plus tard si nécessaire
        country: null // À remplir plus tard si nécessaire
      })
      .select();

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Erreur lors de l\'insertion du clic:', error);
    throw error;
  }
}
