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
import { Plus } from 'lucide-react';
import { createUrl } from '@/db/apiUrls';
import { useAuth } from '@/pages/context';
import * as yup from 'yup';

const CreateLinkDialog = ({ onSuccess, open: externalOpen, onOpenChange: externalOnOpenChange, prefilledUrl }) => {
  const { user } = useAuth();
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    original_url: '',
    title: '',
    custom_url: ''
  });
  const [errors, setErrors] = useState({});

  const schema = yup.object({
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

  // Utiliser l'état externe si fourni, sinon utiliser l'état interne
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    try {
      await schema.validateAt(name, { ...formData, [name]: value });
      setErrors(prev => ({ ...prev, [name]: '' }));
    } catch (validationErr) {
      setErrors(prev => ({ ...prev, [name]: validationErr.message }));
    }
  };

  const validateForm = async () => {
    try {
      await schema.validate(formData, { abortEarly: false });
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

    const ok = await validateForm();
    if (!ok) return;

    try {
      setLoading(true);

      await createUrl({
        original_url: formData.original_url.trim(),
        title: formData.title.trim(),
        custom_url: formData.custom_url.trim() || null,
        user_id: user.id
      });

      // Reset form
      setFormData({
        original_url: '',
        title: '',
        custom_url: ''
      });
      setErrors({});
      setOpen(false);

      // Notify parent component
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setErrors({ submit: error.message || 'Erreur lors de la création' });
    } finally {
      setLoading(false);
    }
  };

  // Effet pour pré-remplir l'URL quand le dialogue s'ouvre
  useEffect(() => {
    if (open && prefilledUrl) {
      setFormData(prev => ({
        ...prev,
        original_url: prefilledUrl
      }));
    }
  }, [open, prefilledUrl]);

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset form when dialog closes
      setFormData({
        original_url: '',
        title: '',
        custom_url: ''
      });
      setErrors({});
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className='flex items-center' variant="destructive">
          <Plus className="h-4 w-4 mr-2 " />
          Create links
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create new link</DialogTitle>
          <DialogDescription>
            Raccourcissez votre URL et personnalisez-la selon vos besoins.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="original_url">URL originale *</Label>
            <Input
              id="original_url"
              name="original_url"
              type="url"
              placeholder="https://example.com/very-long-url"
              value={formData.original_url}
              onChange={handleInputChange}
              aria-invalid={!!errors.original_url}
              aria-describedby={errors.original_url ? 'error-original_url' : undefined}
              className={errors.original_url ? 'border-red-500' : ''}
            />
            {errors.original_url && (
              <p id="error-original_url" className="text-sm text-red-500">{errors.original_url}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              name="title"
              placeholder="Mon lien personnalisé"
              value={formData.title}
              onChange={handleInputChange}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'error-title' : undefined}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p id="error-title" className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom_url">URL personnalisée (optionnel)</Label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">short.in/</span>
              <Input
                id="custom_url"
                name="custom_url"
                placeholder="mon-lien"
                value={formData.custom_url}
                onChange={handleInputChange}
                aria-invalid={!!errors.custom_url}
                aria-describedby={errors.custom_url ? 'error-custom_url' : undefined}
                className={errors.custom_url ? 'border-red-500' : ''}
              />
            </div>
            {errors.custom_url && (
              <p id="error-custom_url" className="text-sm text-red-500">{errors.custom_url}</p>
            )}
            <p className="text-xs text-gray-500">
              Laissez vide pour générer automatiquement
            </p>
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <DialogFooter className='sm:justify-start'>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Création...' : 'Créer le lien'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateLinkDialog;
