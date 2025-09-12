import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MessageCircle, Crown, Shield, Edit, Trash2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission, initializeUserContext } from '@/lib/auth';
import EditAdModal from '@/components/EditAdModal';

interface Advertisement {
  id: string;
  title: string;
  description: string;
  images: string[];
  discord_contact?: string;
  telegram_contact?: string;
  is_vip: boolean;
  created_at: string;
  price?: number;
  user_id: string;
  category: string;
  subcategory: string;
  users?: {
    nickname: string;
    role: string;
  };
}

const AdvertisementPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [advertisement, setAdvertisement] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const initAndFetch = async () => {
      if (user) {
        await initializeUserContext();
      }
      fetchAdvertisement();
    };
    initAndFetch();
  }, [id, user]);

  const fetchAdvertisement = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('advertisements')
        .select(`
          *,
          users (nickname, role)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setAdvertisement(data);
    } catch (error: any) {
      toast.error('Помилка завантаження оголошення: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!advertisement || !user) return;
    
    if (!confirm('Ви впевнені, що хочете видалити це оголошення?')) return;

    try {
      const { error } = await supabase
        .from('advertisements')
        .delete()
        .eq('id', advertisement.id);

      if (error) throw error;

      toast.success('Оголошення видалено успішно');
      navigate('/');
    } catch (error: any) {
      toast.error('Помилка видалення: ' + error.message);
    }
  };

  const canEdit = user && (user.id === advertisement?.user_id || hasPermission(user, ['admin', 'moderator']));

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-24 pb-16">
          <div className="container mx-auto px-6">
            <div className="animate-pulse">
              <div className="h-8 bg-background-secondary rounded mb-8"></div>
              <div className="h-96 bg-background-secondary rounded mb-8"></div>
              <div className="h-4 bg-background-secondary rounded mb-4"></div>
              <div className="h-4 bg-background-secondary rounded w-2/3"></div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (!advertisement) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-24 pb-16">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Оголошення не знайдено</h1>
            <Link to="/categories">
              <Button className="btn-accent">Повернутися до категорій</Button>
            </Link>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="mb-6 hover:scale-105 transition-transform"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>

            <Card className={`overflow-hidden ${advertisement.is_vip ? 'border-accent shadow-accent/20' : ''}`}>
              <CardContent className="p-0">
                {/* Image Gallery */}
                {advertisement.images && advertisement.images.length > 0 && (
                  <div className="relative">
                    <Carousel className="w-full">
                      <CarouselContent>
                        {advertisement.images.map((image, index) => (
                          <CarouselItem key={index}>
                            <div className="relative h-96 md:h-[500px]">
                              <img
                                src={image}
                                alt={`${advertisement.title} - зображення ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://via.placeholder.com/800x600?text=Помилка+завантаження';
                                }}
                              />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      {advertisement.images.length > 1 && (
                        <>
                          <CarouselPrevious className="left-4" />
                          <CarouselNext className="right-4" />
                        </>
                      )}
                    </Carousel>
                    
                    {/* Badges */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      {advertisement.is_vip && (
                        <Badge variant="vip" className="shadow-lg">
                          <Crown className="w-3 h-3 mr-1" />
                          VIP
                        </Badge>
                      )}
                      {advertisement.users?.role === 'admin' && (
                        <Badge variant="admin" className="shadow-lg">
                          <Shield className="w-3 h-3 mr-1" />
                          АДМІН
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="p-8">
                  {/* Header */}
                  <div className="mb-6">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                      {advertisement.title}
                    </h1>
                    
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{advertisement.users?.nickname}</span>
                          {advertisement.users?.role !== 'user' && (
                            <Badge 
                              variant={
                                advertisement.users?.role === 'admin' ? 'admin' :
                                advertisement.users?.role === 'vip' ? 'vip' : 'outline'
                              }
                            >
                              {advertisement.users?.role === 'vip' ? 'VIP' : 
                               advertisement.users?.role === 'moderator' ? 'Модератор' : 
                               advertisement.users?.role === 'admin' ? 'Адмін' : ''}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(advertisement.created_at).toLocaleDateString('uk-UA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>

                      {canEdit && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditModalOpen(true)}
                            className="hover:scale-105 transition-transform"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Редагувати
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                            className="hover:scale-105 transition-transform"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Видалити
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Price */}
                  {advertisement.price && (
                    <div className="mb-6">
                      <div className="text-3xl font-bold text-accent">
                        {advertisement.price.toLocaleString('uk-UA')} грн
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Опис</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {advertisement.description}
                    </p>
                  </div>
                  
                  {/* Contact */}
                  <div className="border-t pt-6">
                    <h2 className="text-xl font-semibold mb-4">Контакти</h2>
                    <div className="flex flex-wrap gap-4">
                      {advertisement.discord_contact && (
                        <Button 
                          size="lg" 
                          variant="outline" 
                          className="hover:scale-105 transition-transform"
                          onClick={() => {
                            navigator.clipboard.writeText(advertisement.discord_contact!);
                            toast.success('Discord скопійовано в буфер обміну');
                          }}
                        >
                          <MessageCircle className="w-5 h-5 mr-2" />
                          Discord: {advertisement.discord_contact}
                        </Button>
                      )}
                      {advertisement.telegram_contact && (
                        <Button 
                          size="lg" 
                          className="btn-accent hover:scale-105 transition-transform"
                          onClick={() => window.open(`https://t.me/${advertisement.telegram_contact?.replace('@', '')}`, '_blank')}
                        >
                          <MessageCircle className="w-5 h-5 mr-2" />
                          Telegram: {advertisement.telegram_contact}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />

      <EditAdModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        advertisement={advertisement}
        onSuccess={() => {
          fetchAdvertisement();
          setIsEditModalOpen(false);
        }}
      />
    </div>
  );
};

export default AdvertisementPage;