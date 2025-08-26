import supabase from "./supabase";

export async function getUrls(user_id) {
  const { data, error } = await supabase.from("url").select("*").eq("user_id", user_id).eq("user_id", user_id);
  if (error) throw new Error(error.message);
  return data;
}
