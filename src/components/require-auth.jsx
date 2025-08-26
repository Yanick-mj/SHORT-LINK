import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/pages/context';
import { BarLoader } from 'react-spinners';

function RequireAuth({ children }) {
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/auth');
        }
    }, [loading, user, navigate]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <BarLoader width={"100%"} color="#36d7b7" />
            </div>
        );
    }

    if (!user) {
        return null; // Ne rien afficher pendant la redirection
    }

    return children; // Afficher le contenu protégé si l'utilisateur est connecté
}

export default RequireAuth;
