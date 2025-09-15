import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast'; // Corrected import
import { useAuth } from '@/contexts/AuthContext';

interface Advertisement {
  id: string;
  title: string;
  description: string;
  images: string[];
  discord_contact?: string;
  telegram_contact?: string;
  price?: number;
  category: string;
  subcategory: string;
  user_id: string;
}

interface EditAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  advertisement: Advertisement | null;
  onSuccess: () => void;
}

const EditAdModal: React.FC<EditAdModalProps> = ({ isOpen, onClose, advertisement, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState<boolean[]>([]);
  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    title: '',
    description: '',
    discord_contact: '',
    telegram_contact: '',
    price: ''
  });

  const categories = {
    'automobiles': {
      name: 'Автомобілі',
      subcategories: [
        { value: 'sale', name: 'Продаж Автомобілі' },
        { value: 'trucks', name: 'Продаж вантажівок' },
        { value: 'vinyls', name: 'Продаж Вініли' },
        { value: 'parts', name: 'Продаж Деталі' },
        { value: 'numbers', name: 'Продаж Номера' },
        { value: 'car-rental', name: 'Оренда автомобіля' },
        { value: 'truck-rental', name: 'Оренда вантажівок' }
      ]
    },
    'clothing': {
      name: 'Одяг',
      subcategories: [
        { value: 'sale', name: 'Продаж одягу' },
        { value: 'accessories', name: 'Продаж аксесуарів' },
        { value: 'backpacks', name: 'Продаж рюкзаків' }
      ]
    },
    'real-estate': {
      name: 'Нерухомість',
      subcategories: [
        { value: 'business', name: 'Продаж бізнесу' },
        { value: 'apartments', name: 'Продаж квартир' },
        { value: 'houses', name: 'Продаж приватних будинків' },
        { value: 'greenhouses', name: 'Оренда теплиць' }
      ]
    },
    'other': {
      name: 'Інше',
      subcategories: [
        { value: 'misc', name: 'Різне' }
      ]
    }
  };

  useEffect(() => {
    if (advertisement && isOpen) {
      setFormData({
        category: advertisement.category,
        subcategory: advertisement.subcategory,
        title: advertisement.title,
        description: advertisement.description,
        discord_contact: advertisement.discord_contact || '',
        telegram_contact: advertisement.telegram_contact || '',
        price: advertisement.price?.toString() || ''
      });
      setImages(advertisement.images || []);
    }
  }, [advertisement, isOpen]);

  const handleFileUpload = async (file: File) => {
    if (images.length >= 10) {
      toast({
        title: 'Максимум 10 зображень',
        variant: 'destructive',
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Можна завантажувати лише зображення',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Розмір файлу не повинен перевищувати 5MB',
        variant: 'destructive',
      });
      return;
    }

    const newUploadingImages = [...uploadingImages];
    newUploadingImages.push(true);
    setUploadingImages(newUploadingImages);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('advertisement-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('advertisement-images')
        .getPublicUrl(fileName);

      setImages([...images, publicUrl]);
      toast({
        title: 'Зображення завантажено успішно!',
        variant: 'success',
      });
    } catch (error: any) {
      toast({
        title: 'Помилка завантаження: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      const newUploadingImages = [...uploadingImages];
      newUploadingImages.pop();
      setUploadingImages(newUploadingImages);
    }
  };

  const handleImageAdd = () => {
    if (images.length < 10) {
      const imageUrl = prompt('Введіть URL зображення:');
      if (imageUrl && imageUrl.trim()) {
        setImages([...images, imageUrl.trim()]);
      }
    } else {
      toast({
        title: 'Максимум 10 зображень',
        variant: 'destructive',
      });
    }
  };

  const handleImageRemove = async (index: number) => {
    const imageUrl = images[index];
    if (imageUrl.includes('supabase.co/storage')) {
      try {
        const urlParts = imageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        await supabase.storage
          .from('advertisement-images')
          .remove([fileName]);
      } catch (error) {
        console.warn('Failed to delete image from storage:', error);
      }
    }
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !advertisement) return;

    if (!formData.category || !formData.subcategory || !formData.title || !formData.description) {
      toast({
        title: 'Заповніть всі обов\'язкові поля',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.discord_contact && !formData.telegram_contact) {
      toast({
        title: 'Вкажіть хоча б один контакт (Discord або Telegram)',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('advertisements')
        .update({
          category: formData.category,
          subcategory: formData.subcategory,
          title: formData.title,
          description: formData.description,
          images: images,
          discord_contact: formData.discord_contact || null,
          telegram_contact: formData.telegram_contact || null,
          price: formData.price ? parseFloat(formData.price) : null
        })
        .eq('id', advertisement.id);

      if (error) throw error;

      toast({
        title: 'Оголошення оновлено успішно!',
        variant: 'success',
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Помилка при оновленні оголошення: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-card"> {/* Changed to glass-card */}
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Редагувати оголошення</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">Категорія *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value, subcategory: '' })}
              >
                <SelectTrigger className="rounded-2xl focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background">
                  <SelectValue placeholder="Оберіть категорію" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl shadow-soft">
                  {Object.entries(categories).map(([key, cat]) => (
                    <SelectItem key={key} value={key}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategory">Підкатегорія *</Label>
              <Select
                value={formData.subcategory}
                onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
                disabled={!formData.category}
              >
                <SelectTrigger className="rounded-2xl focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background">
                  <SelectValue placeholder="Оберіть підкатегорію" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl shadow-soft">
                  {formData.category && categories[formData.category as keyof typeof categories]?.subcategories.map((sub) => (
                    <SelectItem key={sub.value} value={sub.value}>{sub.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Назва оголошення *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="rounded-2xl focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              placeholder="Введіть назву оголошення"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Опис оголошення *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="rounded-2xl min-h-32 focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              placeholder="Детальний опис вашого оголошення"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Ціна (грн)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="rounded-2xl focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              placeholder="Вкажіть ціну (необов'язково)"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="discord">Discord контакт</Label>
              <Input
                id="discord"
                value={formData.discord_contact}
                onChange={(e) => setFormData({ ...formData, discord_contact: e.target.value })}
                className="rounded-2xl focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                placeholder="username#1234"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telegram">Telegram контакт</Label>
              <Input
                id="telegram"
                value={formData.telegram_contact}
                onChange={(e) => setFormData({ ...formData, telegram_contact: e.target.value })}
                className="rounded-2xl focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                placeholder="@username"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label>Зображення (до 10 штук)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Зображення ${index + 1}`}
                    className="w-full h-24 object-cover rounded-xl border"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/150x100?text=Помилка';
                    }}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 glow-on-hover"
                    onClick={() => handleImageRemove(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              
              {uploadingImages.map((_, index) => (
                <div key={`uploading-${index}`} className="relative">
                  <div className="w-full h-24 bg-muted rounded-xl border animate-pulse flex items-center justify-center">
                    <Upload className="w-6 h-6 text-muted-foreground animate-spin" />
                  </div>
                </div>
              ))}
              
              {(images.length + uploadingImages.length) < 10 && (
                <>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file);
                          e.target.value = '';
                        }
                      }}
                    />
                    <div className="h-24 rounded-xl border-dashed border-2 border-border hover:border-accent flex flex-col items-center justify-center hover:scale-105 transition-transform bg-background hover:bg-muted glow-on-hover">
                      <Upload className="w-5 h-5 mb-1 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Завантажити</span>
                    </div>
                  </label>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="h-24 rounded-xl border-dashed hover:scale-105 transition-transform flex flex-col glow-on-hover"
                    onClick={handleImageAdd}
                  >
                    <Plus className="w-5 h-5 mb-1" />
                    <span className="text-xs">URL</span>
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-2xl hover:scale-105 transition-transform glow-on-hover">
              Скасувати
            </Button>
            <Button
              type="submit"
              className="btn-accent rounded-2xl hover:shadow-glow glow-on-hover"
              disabled={loading}
            >
              {loading ? 'Збереження...' : 'Зберегти зміни'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAdModal;