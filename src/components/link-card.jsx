import React from 'react';
import { useNavigate } from 'react-router-dom';
import { insertClick } from '@/db/apiClicks';
import { Copy, Trash, Check } from 'lucide-react';
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
import { CheckCircle, AlertCircle } from 'lucide-react';
import { LinkIcon } from 'lucide-react';
import { getShortLink } from '@/lib/utils';
import { logger } from '@/lib/logger';
import ShortLinkButton from '@/components/short-link-button';


const LinkCard = ({urls, onDelete}) => {
  const navigate = useNavigate();
  const [isCopied, setIsCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('success');

  const handleCopyClick = async () => {
    try {
      const shortUrl = getShortLink(urls);
      await navigator.clipboard.writeText(shortUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset après 2 secondes
    } catch {
      logger.error('Erreur lors de la copie du shortlink');
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
        // Focus management: focus sur le prochain élément ou le conteneur parent
        setTimeout(() => {
          const nextFocusable = document.querySelector('[data-focusable="true"]');
          if (nextFocusable) nextFocusable.focus();
        }, 100);
      }
    } catch (error) {
      logger.error('Erreur lors de la suppression:', error);
      setAlertType('destructive');
      setAlertMessage('Erreur lors de la suppression du lien');
      setTimeout(() => setAlertMessage(null), 5000); // Hide after 5 seconds
      setIsDeleting(false);
    }
  };

  const handleTitleClick = async () => {
    if (isOpening) return;
    setIsOpening(true);
    try {
      await insertClick(urls.id);
    } catch (error) {
      logger.error("Erreur lors de l'insertion du clic:", error);
    } finally {
      navigate(`/link/${urls.id}`);
      setIsOpening(false);
    }
  };

  return (
    <div className='space-y-4'>
      {alertMessage && (
        <Alert
          variant={alertType === 'destructive' ? 'destructive' : 'default'}
          className={alertType === 'destructive' ? '' : 'border-green-500 bg-green-50'}
          aria-live="polite"
          role="status"
        >
          {alertType === 'destructive' ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          <AlertDescription
            className={alertType === 'destructive' ? '' : 'text-green-700'}
          >
            {alertMessage}
          </AlertDescription>
        </Alert>
      )}
      <div className='flex flex-col md:flex-row gap-4 sm:gap-6 lg:gap-8 border bg-gray-900 rounded-lg p-4 sm:p-6 lg:p-8'>
        <div className='flex flex-col gap-2 sm:gap-3 lg:gap-4 flex-1'>
          <button
            type="button"
            className='text-left text-lg sm:text-xl lg:text-2xl font-bold hover:underline cursor-pointer break-words focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded disabled:opacity-60 transition-colors duration-200'
            onClick={handleTitleClick}
            aria-label={`Voir les détails de ${urls?.title || 'lien'}`}
            disabled={isOpening}
            aria-busy={isOpening}
          >
            {urls?.title || 'Lien sans titre'}
          </button>
          <div className='flex items-center'>
            <LinkIcon className='h-4 w-4 mr-2 flex-shrink-0' />
            <ShortLinkButton link={urls} />
          </div>
          <span
            className='flex items-center text-xs sm:text-sm text-gray-500 break-all truncate max-w-full'
            title={urls?.original_url}
          >
            {urls?.original_url}
          </span>
          <span className='flex flex-1 items-end text-xs sm:text-sm text-gray-500'>{new Date(urls?.created_at).toLocaleDateString()}</span>
        </div>
        <div className='flex gap-2 sm:gap-3 lg:gap-4 flex-shrink-0 min-h-[44px] items-center'>
          <Button
            variant="ghost"
            onClick={handleCopyClick}
            disabled={isCopied}
            title="Copier le lien"
            aria-label={isCopied ? "Lien copié" : "Copier le lien"}
            className="focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors duration-200 min-h-[44px] min-w-[44px]"
          >
            {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                disabled={isDeleting}
                title="Supprimer le lien"
                aria-label={isDeleting ? "Suppression en cours" : "Supprimer le lien"}
                className="hover:text-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none transition-colors duration-200 min-h-[44px] min-w-[44px]"
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
