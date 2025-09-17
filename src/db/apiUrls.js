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

// Fonction pour mettre à jour une URL
export async function updateUrl({ id, original_url, title, custom_url, user_id }) {
  try {
    // Validation des paramètres d'entrée
    if (!id || !user_id) {
      throw new Error('ID du lien et ID utilisateur requis');
    }

    // Vérifier que l'URL personnalisée n'est pas déjà utilisée par un autre lien
    if (custom_url && custom_url.trim()) {
      const { data: existingUrl, error: checkError } = await supabase
        .from("urls")
        .select("id")
        .eq("custom_url", custom_url.trim())
        .neq("id", id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(checkError.message);
      }

      if (existingUrl) {
        throw new Error('Cette URL personnalisée est déjà utilisée');
      }
    }

    // Vérifier d'abord que le lien existe et appartient à l'utilisateur
    console.log('🔍 Vérification du lien:', { id, user_id });

    const { data: existingLink, error: checkLinkError } = await supabase
      .from("urls")
      .select("id, user_id, title, original_url")
      .eq("id", id)
      .eq("user_id", user_id)
      .single();

    console.log('🔍 Résultat vérification:', { existingLink, checkLinkError });

    if (checkLinkError) {
      console.error('❌ Erreur lors de la vérification du lien:', checkLinkError);
      if (checkLinkError.code === 'PGRST116') {
        throw new Error('Lien non trouvé ou accès non autorisé');
      }
      throw new Error(`Erreur de vérification: ${checkLinkError.message}`);
    }

    if (!existingLink) {
      console.error('❌ Lien non trouvé:', { id, user_id });
      throw new Error('Lien non trouvé ou accès non autorisé');
    }

    console.log('✅ Lien trouvé et vérifié:', existingLink);

    // Mettre à jour le lien
    const updateData = {
      original_url: original_url.trim(),
      title: title.trim(),
      custom_url: custom_url && custom_url.trim() ? custom_url.trim() : null,
      updated_at: new Date().toISOString()
    };

    console.log('🔄 Tentative de mise à jour:', { id, user_id, updateData });

    const { data, error } = await supabase
      .from("urls")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user_id) // Double sécurité
      .select();

    console.log('🔄 Résultat mise à jour:', { data, error });

    if (error) {
      console.error('❌ Erreur Supabase updateUrl:', error);
      throw new Error(`Erreur Supabase: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.error('❌ Aucune donnée retournée par updateUrl:', {
        id,
        user_id,
        data,
        updateData,
        existingLink
      });

      // Essayer de comprendre pourquoi la mise à jour a échoué
      const { data: checkAfterUpdate } = await supabase
        .from("urls")
        .select("id, user_id, title, original_url, updated_at")
        .eq("id", id)
        .single();

      console.log('🔍 État du lien après tentative de mise à jour:', checkAfterUpdate);

      throw new Error('Aucune donnée retournée lors de la mise à jour - vérifiez les permissions RLS');
    }

    return data[0];
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    throw error;
  }
}
