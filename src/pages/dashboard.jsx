import React, { useState, useEffect, useMemo } from 'react';
import { BarLoader } from 'react-spinners';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/pages/context';
import { getUrls, deleteUrl } from '@/db/apiUrls';
import { getClicksCounts } from '@/db/apiClicks';
import { logger } from '@/lib/logger';
import LinkCard from '@/components/link-card';
import CreateLinkDialog from '@/components/create-link-dialog';
import { useSearchParams } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [urlsData, setUrlsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const [shouldOpenDialog, setShouldOpenDialog] = useState(false);
  const [prefilledUrl, setPrefilledUrl] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fonction fetchData principale
  const fetchData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // 1. Récupérer toutes les URLs de l'utilisateur
      const urls = await getUrls(user.id);

      // 2. Récupérer les compteurs de clics groupés (évite N+1)
      const counts = await getClicksCounts(urls.map((u) => u.id));
      const urlsWithClicks = urls.map((url) => ({
        ...url,
        totalClicks: counts[url.id] || 0,
      }));

      setUrlsData(urlsWithClicks);

    } catch (err) {
      logger.error('Erreur lors du chargement des données:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    fetchData();
  }, [user]);

  // Vérifier les paramètres URL pour ouvrir le dialogue de création
  useEffect(() => {
    const urlParam = searchParams.get('url');
    if (urlParam) {
      setPrefilledUrl(decodeURIComponent(urlParam));
      setShouldOpenDialog(true);
      // Nettoyer l'URL pour éviter de rouvrir le dialogue à chaque re-render
      const newUrl = new URL(window.location);
      newUrl.searchParams.delete('url');
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);



  // Fonction pour supprimer une URL
  const handleDeleteUrl = async (urlId) => {
    try {
      await deleteUrl(urlId);
      // Recharger les données après suppression
      fetchData();
    } catch (error) {
      logger.error('Erreur lors de la suppression:', error);
    }
  };

  // Fonction pour recharger les données après création
  const handleCreateSuccess = () => {
    fetchData();
    setShouldOpenDialog(false);
    setPrefilledUrl('');
    setSuccessMessage('Lien créé avec succès');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Fonction pour recharger les données après modification
  const handleEditSuccess = () => {
    fetchData();
    setSuccessMessage('Lien modifié avec succès');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Calculer les statistiques avec useMemo pour optimiser les performances
  const { totalUrls, totalClicks } = useMemo(() => {
    const totalUrls = urlsData.length;
    const totalClicks = urlsData.reduce((sum, url) => sum + url.totalClicks, 0);
    return { totalUrls, totalClicks };
  }, [urlsData]);

  // Filtrer les URLs selon la recherche avec useMemo
  const filteredUrls = useMemo(() => {
    return urlsData.filter(url =>
      url.original_url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      url.short_code?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [urlsData, searchQuery]);

  // Gestion des erreurs
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Erreur :</strong> {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
      {/* Succès */}
      {successMessage && (
        <Alert className="mb-4 border-green-500 bg-green-50" role="status" aria-live="polite">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}
      {/* Loading */}
      {loading && (
        <div className="mb-6">
          <BarLoader width={"100%"} color="#36d7b7" />
        </div>
      )}

      {/* Statistiques */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 xl:gap-10 mb-6 sm:mb-8 lg:mb-10 xl:mb-12'>
        <Card className="p-4 sm:p-6 lg:p-8 xl:p-10">
          <CardHeader className="pb-2 sm:pb-3 lg:pb-4 xl:pb-5">
            <CardTitle className="text-lg sm:text-xl lg:text-2xl xl:text-3xl">Links created</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-blue-600">{totalUrls}</div>
          </CardContent>
        </Card>
        <Card className="p-4 sm:p-6 lg:p-8 xl:p-10">
          <CardHeader className="pb-2 sm:pb-3 lg:pb-4 xl:pb-5">
            <CardTitle className="text-lg sm:text-xl lg:text-2xl xl:text-3xl">Total clicks</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-green-600">{totalClicks}</div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 xl:gap-8 mb-6 sm:mb-8 lg:mb-10 xl:mb-12'>
        <div className='flex'>
          <h1 className='text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold'>My links</h1>
        </div>
        <div className='flex justify-end items-center'>
          <CreateLinkDialog
            onSuccess={handleCreateSuccess}
            open={shouldOpenDialog}
            onOpenChange={setShouldOpenDialog}
            prefilledUrl={prefilledUrl}
          />
        </div>
      </div>

      {/* Barre de recherche */}
      <div className='relative mb-6 sm:mb-8 lg:mb-10'>
        <Input
          type="text"
          placeholder='filter links'
          className='w-full p-3 sm:p-4 text-base sm:text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Rechercher dans mes liens"
        />
        <Filter className='absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
      </div>

      {/* Liste des URLs */}
      <div className='space-y-4 sm:space-y-6 lg:space-y-8 xl:space-y-10'>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='border bg-gray-100 rounded-lg p-6 animate-pulse'>
              <div className='h-5 w-1/3 bg-gray-300 rounded mb-3'></div>
              <div className='h-4 w-2/3 bg-gray-200 rounded mb-2'></div>
              <div className='h-4 w-1/4 bg-gray-200 rounded'></div>
            </div>
          ))
        ) : filteredUrls.length === 0 ? (
          <div className='text-center py-8 sm:py-12 lg:py-16 xl:py-20 text-gray-500 text-lg sm:text-xl xl:text-2xl'>
            {searchQuery ? 'Aucun lien trouvé' : 'Aucun lien créé pour le moment'}
          </div>
        ) : (
          filteredUrls.map((url) => (
            <div key={url.id} className='flex-1'>
              <LinkCard urls={url} onDelete={handleDeleteUrl} onEdit={handleEditSuccess} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
