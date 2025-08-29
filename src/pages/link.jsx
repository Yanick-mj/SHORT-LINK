import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Copy, Trash, Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BarLoader } from 'react-spinners';
import LocationStats from '@/components/location-stats';
import DeviceStats from '@/components/device-stats';
import { getUrlById, deleteUrl } from '@/db/apiUrls';
import { getClicks } from '@/db/apiClicks';
import { LinkIcon } from 'lucide-react';


const Link = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [urlData, setUrlData] = useState(null);
  const [clicksData, setClicksData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('success');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer les données de l'URL
        const url = await getUrlById(id);
        if (!url) {
          setError('Lien non trouvé');
          return;
        }
        setUrlData(url);

        // Récupérer les clics
        const clicks = await getClicks(id);
        setClicksData(clicks);

      } catch (err) {
        console.error('Erreur lors du chargement:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleCopyClick = async () => {
    try {
      const shortUrl = `https://short.in/${urlData?.custom_url ? urlData?.custom_url : urlData?.short_url}`;
      await navigator.clipboard.writeText(shortUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  const handleDownloadClick = async () => {
    try {
      setIsDownloading(true);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const link = document.createElement('a');
        link.download = `qr-${urlData.title || 'link'}.png`;
        link.href = canvas.toDataURL();
        link.click();

        setIsDownloading(false);
      };

      img.src = urlData?.qr;
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      setIsDownloading(false);
    }
  };

  const handleDeleteClick = async () => {
    try {
      setIsDeleting(true);
      setAlertMessage(null);

      await deleteUrl(id);
      setAlertType('success');
      setAlertMessage('Lien supprimé avec succès !');

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setAlertType('destructive');
      setAlertMessage('Erreur lors de la suppression du lien');
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <BarLoader width="200px" color="#3B82F6" />
          <p className="text-gray-600">Chargement des détails...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
      {alertMessage && (
        <Alert className={alertType === 'destructive' ? 'border-red-500 bg-red-50 mb-4' : 'border-green-500 bg-green-50 mb-4'}>
          <AlertDescription className={alertType === 'destructive' ? 'text-red-700' : 'text-green-700'}>
            {alertMessage}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6 sm:space-y-8 md:space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Colonne gauche - Détails du lien */}
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Informations du lien */}
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-bold ">{urlData?.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 lg:space-y-4 p-4 sm:p-6 lg:p-8">
                <div>
                  <p className="text-lg text-blue-600 break-all">
                    https://short.in/{urlData?.custom_url ? urlData?.custom_url : urlData?.short_url}
                  </p>
                </div>

                <div className="flex items-center">
                  <LinkIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <p className="text-sm break-all">{urlData?.original_url}</p>
                </div>

                {urlData?.custom_url && (
                  <div>
                    <p className="text-sm ">{urlData?.custom_url}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500">{new Date(urlData?.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
                <div className='flex gap-2 '>
                  <Button
                    variant="ghost"
                    onClick={handleCopyClick}
                    disabled={isCopied}
                    title="Copier le lien"
                  >
                    {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleDownloadClick}
                    disabled={isDownloading}
                    title="Télécharger le QR code"
                  >
                    <Download className={`h-4 w-4 ${isDownloading ? 'animate-pulse' : ''}`} />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        disabled={isDeleting}
                        title="Supprimer le lien"
                        className="hover:text-red-700"
                      >
                        <Trash className={`h-4 w-4 ${isDeleting ? 'animate-pulse' : ''}`} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action ne peut pas être annulée. Cela supprimera définitivement le lien "{urlData?.title}" et toutes ses statistiques.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteClick}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <div>
                  <img
                    src={urlData?.qr}
                    alt="QR Code"
                    className=" w-full object-contain border rounded-lg"
                  />
                </div>
              </CardContent>
            </Card>
          </div>


          {/* Colonne droite - Statistiques */}
          <div>
            {/* Total des clics */}
            <Card className='mb-4'>
              <CardHeader>
                <CardTitle >Total des clics</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="text-4xl font-bold text-blue-600">
                  {clicksData.length}
                </div>
              </CardContent>
            </Card>

            {/* Statistiques de localisation */}
            <Card>
              <CardHeader>
                <CardTitle>Location stats</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <LocationStats clicksData={clicksData} />
              </CardContent>
            {/* Statistiques des appareils */}
              <CardHeader>
                <CardTitle>Device stats</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <DeviceStats clicksData={clicksData} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Link;
