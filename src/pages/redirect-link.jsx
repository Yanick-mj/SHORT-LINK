import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BarLoader } from 'react-spinners';
import { getUrlByShortCode } from '@/db/apiUrls';
import { insertClick } from '@/db/apiClicks';

const RedirectLink = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [urlData, setUrlData] = useState(null);

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer l'URL originale par le short_code
        const url = await getUrlByShortCode(id);

        if (!url) {
          setError('Lien non trouvé');
          return;
        }

        setUrlData(url);

        // Insérer un clic dans la base de données
        try {
          await insertClick(url.id);
        } catch (clickError) {
          console.error('Erreur lors de l\'enregistrement du clic:', clickError);
          // Continuer même si l'enregistrement du clic échoue
        }

        // Rediriger vers l'URL originale sans polluer l'historique (permet de revenir au dashboard)
        window.location.replace(url.original_url);

      } catch (err) {
        console.error('Erreur lors de la redirection:', err);
        setError('Erreur lors de la redirection');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      handleRedirect();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <BarLoader width="200px" color="#3B82F6" />
          <p className="text-gray-600">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Lien non trouvé</h1>
          <p className="text-gray-600 mb-6">
            {error === 'Lien non trouvé'
              ? 'Le lien que vous recherchez n\'existe pas ou a été supprimé.'
              : 'Une erreur est survenue lors de la redirection.'
            }
          </p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <BarLoader width="200px" color="#3B82F6" />
        <p className="text-gray-600">Redirection vers {urlData?.original_url}</p>
      </div>
    </div>
  );
};

export default RedirectLink;
