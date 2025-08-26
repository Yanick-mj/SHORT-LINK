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





// import { createContext, useState, useEffect, useContext } from "react";
// import supabase from "@/db/supabase";
// import { getCurrentUser, login } from "../db/apiAuth";
// import { AuthContext } from "@/pages/context";


// const AuthContext = createContext();

// const UrlProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Vérifie la session existante au démarrage
//     const initAuth = async () => {
//       const currentUser = await getCurrentUser();
//       setUser(currentUser);
//       setLoading(false);
//     };
//     initAuth();

//     // Écoute les changements (login/logout)
//     const { data: subscription } = supabase.auth.onAuthStateChange(
//       (event, session) => {
//         setUser(session?.user ?? null);
//       }
//     );

//     return () => subscription.subscription.unsubscribe();
//   }, []);

//   // Expose login/logout pratiques via le contexte
//   const loginUser = async (credentials) => {
//     const data = await login(credentials);
//     setUser(data.user);
//   };

//   // const logoutUser = async () => {
//   //   await logout();
//   //   setUser(null);
//   // };

//   return (
//     <AuthContext.Provider value={{ user, loading, loginUser}}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);

// export { AuthContext };
// export default AuthProvider;

// // 1. Crée un "contexte" React (permet de partager des données globales entre composants)
// // 2. Provider qui englobe l'app et rend le contexte disponible aux enfants
