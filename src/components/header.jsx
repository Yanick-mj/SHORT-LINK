import React, { useCallback } from 'react';
import { Link, Navigate, useNavigate} from 'react-router-dom';
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LinkIcon, LogOut } from "lucide-react";
import { AuthContext } from "@/pages/context";





const Header = () => {

  const navigate = useNavigate();
  const { user, logoutUser } = React.useContext(AuthContext);

  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  // Optimiser le handler de navigation avec useCallback
  const handleLoginClick = useCallback(() => {
    navigate("/auth");
  }, [navigate]);

  const handleLogout = async () => {
    if (isLoggingOut) return; // Éviter les clics multiples

    setIsLoggingOut(true);

    // Utiliser requestAnimationFrame pour éviter les reflows forcés
    requestAnimationFrame(async () => {
      try {
        // Animation de sortie
        document.body.classList.add('logout-transition');

        // Attendre l'animation avec requestAnimationFrame
        await new Promise(resolve => {
          requestAnimationFrame(() => {
            setTimeout(resolve, 200);
          });
        });

        // Déconnexion
        await logoutUser();

        // Animation d'entrée et navigation
        document.body.classList.remove('logout-transition');
        document.body.classList.add('page-transition');

        // Navigation différée pour éviter le blocage
        requestAnimationFrame(() => {
          navigate('/', { replace: true });
        });

        // Nettoyage après transition
        setTimeout(() => {
          document.body.classList.remove('page-transition');
        }, 300);
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        document.body.classList.remove('logout-transition', 'page-transition');
      } finally {
        setIsLoggingOut(false);
      }
    });
  };

  return (
      <nav className='py-4 flex justify-between items-center '>
        <Link to="/">
          <img src="/logo.png" className="h-16" alt="trimrr logo" />
        </Link>

        <div>
          {!user? (
            <Button onClick={handleLoginClick} > Login</Button>
          ) :(
              <DropdownMenu >
                <DropdownMenuTrigger className="rounded-full overflow-hidden">
                  <Avatar>
                    <AvatarImage src={user?.user_metadata?.profil_pic} className="object-contain"/>
                    <AvatarFallback>{user?.user_metadata?.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>{user?.user_metadata?.name}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer">
                      <Link to="/dashboard" className="flex">
                        <LinkIcon className="mr-2 h-4 w-4" />
                        <span>My Links </span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-500 cursor-pointer"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      aria-label="Se déconnecter"
                    >
                      <LogOut className="mr-2 h-4 w-4" aria-hidden="true"/>
                      <span>{isLoggingOut ? 'Déconnexion...' : 'Logout'}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
            )
          }
        </div>
      </nav>
  )
};

export default Header;
