import React from 'react';
import { useNavigate } from 'react-router-dom';
import { insertClick } from '@/db/apiClicks';
import { Download, Copy, Trash, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { useState } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LinkIcon } from 'lucide-react';


const LinkCard = ({urls, onDelete}) => {
  const navigate = useNavigate();
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('success');

  const handleCopyClick = async () => {
    try {
      const shortUrl = `https://short.in/${urls?.custom_url ? urls?.custom_url : urls?.short_url}`;
      await navigator.clipboard.writeText(shortUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset après 2 secondes
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  const handleDownloadClick = async () => {
    try {
      setIsDownloading(true);

      // Créer un canvas pour le QR code
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Télécharger l'image
        const link = document.createElement('a');
        link.download = `qr-${urls.title || 'link'}.png`;
        link.href = canvas.toDataURL();
        link.click();

        setIsDownloading(false);
      };

      img.src = urls?.qr;
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      setIsDownloading(false);
    }
  };

  const handleDeleteClick = async () => {
    try {
      setIsDeleting(true);
      setAlertMessage(null); // Clear previous alerts

      if (onDelete) {
        await onDelete(urls.id);
        setAlertType('success');
        setAlertMessage('Lien supprimé avec succès !');
        setTimeout(() => setAlertMessage(null), 3000); // Hide after 3 seconds
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setAlertType('destructive');
      setAlertMessage('Erreur lors de la suppression du lien');
      setTimeout(() => setAlertMessage(null), 5000); // Hide after 5 seconds
      setIsDeleting(false);
    }
  };

  const handleTitleClick = async (e) => {
    e.preventDefault(); // Empêcher la navigation par défaut

    try {
      // Insérer le clic dans la base de données
      await insertClick(urls.id);

      // Naviguer vers la page de détails
      navigate(`/link/${urls.id}`);
    } catch (error) {
      console.error('Erreur lors de l\'insertion du clic:', error);
      // En cas d'erreur, naviguer quand même
      navigate(`/link/${urls.id}`);
    }
  };

  return (
    <div className='space-y-4'>
      {alertMessage && (
        <Alert className={alertType === 'destructive' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}>
          <AlertDescription className={alertType === 'destructive' ? 'text-red-700' : 'text-green-700'}>
            {alertMessage}
          </AlertDescription>
        </Alert>
      )}
      <div className='flex flex-col md:flex-row gap-4 sm:gap-6 lg:gap-8 border bg-gray-900 rounded-lg p-4 sm:p-6 lg:p-8'>
      <img
        src={urls?.qr}
        alt="qr code"
        className='h-24 sm:h-32 md:h-44 lg:h-52 object-contain ring-blue-500 self-center md:self-start'
        />
        <div className='flex flex-col gap-2 sm:gap-3 lg:gap-4 flex-1'>
          <span
            className='text-lg sm:text-xl lg:text-2xl font-bold hover:underline cursor-pointer break-words focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded'
            onClick={handleTitleClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTitleClick(e);
              }
            }}
            aria-label={`Voir les détails de ${urls.title}`}
          >
            {urls.title}
          </span>
          <div className='flex items-center'>
            <LinkIcon className='h-4 w-4 mr-2 flex-shrink-0' />
            <span
              className='text-sm sm:text-base lg:text-lg text-blue-400 hover:underline cursor-pointer break-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded'
              onClick={() => navigate(`/${urls?.custom_url ? urls?.custom_url : urls?.short_url}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/${urls?.custom_url ? urls?.custom_url : urls?.short_url}`);
                }
              }}
              aria-label={`Visiter le lien raccourci ${urls?.custom_url ? urls?.custom_url : urls?.short_url}`}
              >
              https://short.in/{urls?.custom_url ? urls?.custom_url : urls?.short_url}
            </span>
          </div>
          <span className='flex items-center text-xs sm:text-sm text-gray-500 break-all'>{urls?.original_url}</span>
          <span className='flex flex-1 items-end text-xs sm:text-sm text-gray-500'>{new Date(urls?.created_at).toLocaleDateString()}</span>
        </div>
        <div className='flex gap-2 sm:gap-3 lg:gap-4 flex-shrink-0'>
          <Button
            variant="ghost"
            onClick={handleCopyClick}
            disabled={isCopied}
            title="Copier le lien"
            aria-label={isCopied ? "Lien copié" : "Copier le lien"}
            className="focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            onClick={handleDownloadClick}
            disabled={isDownloading}
            title="Télécharger le QR code"
            aria-label={isDownloading ? "Téléchargement en cours" : "Télécharger le QR code"}
            className="focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <Download className={`h-4 w-4 ${isDownloading ? 'animate-pulse' : ''}`} />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                disabled={isDeleting}
                title="Supprimer le lien"
                aria-label={isDeleting ? "Suppression en cours" : "Supprimer le lien"}
                className="hover:text-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                <Trash className={`h-4 w-4 ${isDeleting ? 'animate-pulse' : ''}`} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action ne peut pas être annulée. Cela supprimera définitivement le lien "{urls.title}" et toutes ses statistiques.
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
      </div>
    </div>
  );
};

export default LinkCard;
