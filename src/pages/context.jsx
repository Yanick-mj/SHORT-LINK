import { createContext, useState, useEffect, useContext } from "react";
import supabase from "@/db/supabase";
import { getCurrentUser, login, logout } from "@/db/apiAuth";

// ✅ Nouveau nom canonique
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // session initiale
    const initAuth = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };
    initAuth();

    // écouter login/logout/refresh
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // actions exposées
  const loginUser = async (credentials) => {
    const data = await login(credentials);
    setUser(data.user);
    return data;
  };

  const logoutUser = async () => {
    await logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ API d’export simple et cohérente
export const useAuth = () => useContext(AuthContext);
export { AuthContext };
export default AuthProvider;



