import supabase from "./supabase";

export async function getUrls(user_id) {
  const { data, error } = await supabase
    .from("urls")
    .select("*")
    .eq("user_id", user_id)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

// Fonction pour récupérer une URL par son short_code
export async function getUrlByShortCode(shortCode) {
  const { data, error } = await supabase
    .from("urls")
    .select("*")
    .or(`short_url.eq.${shortCode},custom_url.eq.${shortCode}`)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Aucun résultat trouvé
      return null;
    }
    throw new Error(error.message);
  }

  return data;
}

// Fonction pour créer une nouvelle URL
export async function createUrl({ original_url, title, custom_url, user_id }) {
  try {
    // Générer un short_url si custom_url n'est pas fourni
    let short_url = custom_url;
    if (!custom_url) {
      short_url = generateShortUrl();
    }

    const { data, error } = await supabase
      .from("urls")
      .insert({
        original_url,
        title,
        short_url,
        custom_url: custom_url || null,
        user_id
      })
      .select();

    if (error) throw new Error(error.message);
    return data[0];
  } catch (error) {
    console.error('Erreur lors de la création:', error);
    throw error;
  }
}

// Fonction pour générer un short_url aléatoire
function generateShortUrl() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}



// Fonction pour supprimer une URL
export async function deleteUrl(url_id) {
  const { error } = await supabase
    .from("urls")
    .delete()
    .eq("id", url_id);

  if (error) throw new Error(error.message);
  return true;
}

// Fonction pour récupérer une URL par son ID
export async function getUrlById(url_id) {
  const { data, error } = await supabase
    .from("urls")
    .select("*")
    .eq("id", url_id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(error.message);
  }

  return data;
}
