import supabase from "./supabase"
  // 1. Demande à Supabase d'authentifier avec email + password
  // 2. Si Supabase renvoie une erreur → on lève une exception
  // 3. Si OK → renvoyer les infos utilisateur + session

export async function login({email, password}) {
  const {data, error} = await supabase.auth.signInWithPassword ({
    email,
    password,
  });

  if (error) throw new Error(error.message)

    return data;
}

// 🔍 Fonction pour récupérer l'utilisateur courant
export async function getCurrentUser() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  return session?.user ?? null;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
  return true;
}


export async function signup({ name, email, password, profil_pic }) {
  // 1) upload image
  const fileExt = profil_pic.name.split('.').pop();
  const filePath = `dp-${name.split(" ").join("-")}-${Math.random().toString(36).slice(2)}.${fileExt}`;

  const { error: storageError } = await supabase
    .storage
    .from("profil_pic")
    .upload(filePath, profil_pic, { contentType: profil_pic.type });

  if (storageError) throw new Error(storageError.message);

  // 2) get public URL
  const { data: publicUrlData } = supabase
    .storage
    .from("profil_pic")
    .getPublicUrl(filePath);

  const publicUrl = publicUrlData.publicUrl;

  // 3) sign up with metadata
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        profil_pic: publicUrl,
      },
    },
  });

  if (error) throw new Error(error.message);
  return data; // { user, session }
}
