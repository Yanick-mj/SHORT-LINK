import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit } from 'lucide-react';
import { updateUrl } from '@/db/apiUrls';
import { useAuth } from '@/pages/context';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { logger } from '@/lib/logger';
import * as yup from 'yup';

// Schema de validation (réutilisé de CreateLinkDialog)
const validationSchema = yup.object({
  original_url: yup
    .string()
    .required('URL originale est requise')
    .url('URL invalide'),
  title: yup
    .string()
    .trim()
    .required('Titre est requis')
    .max(120, 'Titre trop long (120 caractères max)'),
  custom_url: yup
    .string()
    .trim()
    .matches(/^[a-zA-Z0-9-]*$/, 'URL personnalisée invalide (lettres, chiffres, tirets uniquement)'),
});

const EditLinkDialog = ({
  link,
  onSuccess,
  open,
  onOpenChange,
  children
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    original_url: '',
    title: '',
    custom_url: ''
  });
  const [errors, setErrors] = useState({});
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('success');

  // Pré-remplir le formulaire avec les données du lien
  useEffect(() => {
    if (link && open) {
      setFormData({
        original_url: link.original_url || '',
        title: link.title || '',
        custom_url: link.custom_url || ''
      });
      setErrors({});
      setAlertMessage(null);
    }
  }, [link, open]);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validation en temps réel
    try {
      await validationSchema.validateAt(name, { ...formData, [name]: value });
      setErrors(prev => ({ ...prev, [name]: '' }));
    } catch (validationErr) {
      setErrors(prev => ({ ...prev, [name]: validationErr.message }));
    }
  };

  const validateForm = async () => {
    try {
      await validationSchema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      const newErrors = {};
      if (err.inner) {
        err.inner.forEach((e) => {
          if (e.path && !newErrors[e.path]) newErrors[e.path] = e.message;
        });
      } else if (err.path) {
        newErrors[err.path] = err.message;
      }
      setErrors(newErrors);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Early return si utilisateur non authentifié
    if (!user || !user.id) {
      setAlertType('destructive');
      setAlertMessage('Utilisateur non authentifié');
      return;
    }

    const isValid = await validateForm();
    if (!isValid) return;

    try {
      setLoading(true);
      setAlertMessage(null);

      await updateUrl({
        id: link.id,
        original_url: formData.original_url.trim(),
        title: formData.title.trim(),
        custom_url: formData.custom_url.trim() || null,
        user_id: user.id
      });

      setAlertType('success');
      setAlertMessage('Lien modifié avec succès !');

      // Notifier le composant parent après un court délai
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        onOpenChange(false);
      }, 1500);

    } catch (error) {
      logger.error('Erreur lors de la modification:', error);
      setAlertType('destructive');

      // Messages d'erreur plus spécifiques
      let errorMessage = 'Erreur lors de la modification';
      if (error.message.includes('Supabase')) {
        errorMessage = 'Erreur de connexion à la base de données';
      } else if (error.message.includes('non trouvé')) {
        errorMessage = 'Lien non trouvé ou accès non autorisé';
      } else if (error.message.includes('déjà utilisée')) {
        errorMessage = 'Cette URL personnalisée est déjà utilisée';
      } else if (error.message.includes('permissions RLS')) {
        errorMessage = 'Erreur de permissions - contactez l\'administrateur';
      } else if (error.message.includes('Aucune donnée retournée')) {
        errorMessage = 'Impossible de sauvegarder les modifications - vérifiez vos permissions';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setAlertMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    if (link) {
      setFormData({
        original_url: link.original_url || '',
        title: link.title || '',
        custom_url: link.custom_url || ''
      });
    }
    setErrors({});
    setAlertMessage(null);
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      handleCancel();
    } else {
      onOpenChange(newOpen);
    }
  };

  if (!link) return null;

  // Vérifier que l'utilisateur est authentifié et que le lien lui appartient
  if (!user || !user.id) {
    return (
      <div className="p-4 text-center text-red-600">
        Utilisateur non authentifié
      </div>
    );
  }

  if (link.user_id && link.user_id !== user.id) {
    return (
      <div className="p-4 text-center text-red-600">
        Accès non autorisé à ce lien
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Modifier le lien
          </DialogTitle>
          <DialogDescription>
            Modifiez les informations de votre lien raccourci.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Message d'alerte */}
          {alertMessage && (
            <Alert
              variant={alertType === 'destructive' ? 'destructive' : 'default'}
              aria-live="polite"
              role="status"
            >
              {alertType === 'destructive' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <AlertDescription>{alertMessage}</AlertDescription>
            </Alert>
          )}

          {/* Champ URL originale */}
          <div className="space-y-2">
            <Label htmlFor="original_url" className="text-sm font-medium">
              URL originale *
            </Label>
            <Input
              id="original_url"
              name="original_url"
              type="url"
              value={formData.original_url}
              onChange={handleInputChange}
              placeholder="https://example.com"
              aria-invalid={errors.original_url ? 'true' : 'false'}
              aria-describedby={errors.original_url ? 'original_url-error' : undefined}
              className="transition-colors duration-200"
              disabled={loading}
            />
            {errors.original_url && (
              <p
                id="original_url-error"
                className="text-sm text-red-600"
                role="alert"
                aria-live="polite"
              >
                {errors.original_url}
              </p>
            )}
          </div>

          {/* Champ Titre */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Titre *
            </Label>
            <Input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Titre descriptif"
              maxLength={120}
              aria-invalid={errors.title ? 'true' : 'false'}
              aria-describedby={errors.title ? 'title-error' : undefined}
              className="transition-colors duration-200"
              disabled={loading}
            />
            {errors.title && (
              <p
                id="title-error"
                className="text-sm text-red-600"
                role="alert"
                aria-live="polite"
              >
                {errors.title}
              </p>
            )}
          </div>

          {/* Champ URL personnalisée */}
          <div className="space-y-2">
            <Label htmlFor="custom_url" className="text-sm font-medium">
              URL personnalisée
            </Label>
            <Input
              id="custom_url"
              name="custom_url"
              type="text"
              value={formData.custom_url}
              onChange={handleInputChange}
              placeholder="mon-lien-personnalise"
              aria-invalid={errors.custom_url ? 'true' : 'false'}
              aria-describedby={errors.custom_url ? 'custom_url-error' : undefined}
              className="transition-colors duration-200"
              disabled={loading}
            />
            {errors.custom_url && (
              <p
                id="custom_url-error"
                className="text-sm text-red-600"
                role="alert"
                aria-live="polite"
              >
                {errors.custom_url}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Laissez vide pour générer automatiquement
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="min-h-[44px] min-w-[44px] transition-colors duration-200"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="min-h-[44px] min-w-[44px] transition-colors duration-200"
              aria-busy={loading}
            >
              {loading ? 'Modification...' : 'Sauvegarder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditLinkDialog;
