import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MessageCircle, Crown } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast'; // Corrected import
import ContactButton from '@/components/ContactButton'; // Import ContactButton

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
  users?: {
    nickname: string;
    role: string;
  };
}

const SubcategoryPage = () => {
  const { category, subcategory } = useParams();
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryTitles: Record<string, string> = {
    'automobiles': 'Автомобілі',
    'clothing': 'Одяг',
    'real-estate': 'Нерухомість',
    'other': 'Інше'
  };

  const subcategoryTitles: Record<string, Record<string, string>> = {
    'automobiles': {
      'sale': 'Продаж Автомобілі',
      'trucks': 'Продаж вантажівок',
      'vinyls': 'Продаж Вініли',
      'parts': 'Продаж Деталі',
      'numbers': 'Продаж Номера',
      'car-rental': 'Оренда автомобіля',
      'truck-rental': 'Оренда вантажівок'
    },
    'clothing': {
      'sale': 'Продаж одягу',
      'accessories': 'Продаж аксесуарів',
      'backpacks': 'Продаж рюкзаків'
    },
    'real-estate': {
      'business': 'Продаж бізнесу',
      'apartments': 'Продаж квартир',
      'houses': 'Продаж приватних будинків',
      'greenhouses': 'Оренда теплиць'
    },
    'other': {
      'misc': 'Різне'
    }
  };

  useEffect(() => {
    fetchAdvertisements();
  }, [category, subcategory]);

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      let { data, error } = await supabase
        .from('advertisements')
        .select(`
          *,
          users (nickname, role)
        `)
        .eq('category', category)
        .eq('subcategory', subcategory)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Sort manually to prioritize admin, then VIP, then regular posts
      data = (data || []).sort((a, b) => {
        // First sort by user role (admin first)
        const aRole = a.users?.role || 'user';
        const bRole = b.users?.role || 'user';
        
        if (aRole === 'admin' && bRole !== 'admin') return -1;
        if (bRole === 'admin' && aRole !== 'admin') return 1;
        
        // Then sort by VIP status
        if (a.is_vip && !b.is_vip) return -1;
        if (b.is_vip && !a.is_vip) return 1;
        
        // Finally sort by creation date (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setAdvertisements(data || []);
    } catch (error: any) {
      toast({
        title: 'Помилка завантаження оголошень: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const categoryTitle = categoryTitles[category || ''] || 'Категорія';
  const subcategoryTitle = subcategoryTitles[category || '']?.[subcategory || ''] || 'Підкатегорія';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link to="/categories">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
                <Button
                  variant="ghost"
                  className="mb-6 glow-on-hover"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Назад до категорій
                </Button>
              </motion.div>
            </Link>

            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  {subcategoryTitle}
                </span>
              </h1>
              <p className="text-muted-foreground">
                Категорія: {categoryTitle}
              </p>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse glass-card"> {/* Changed to glass-card */}
                    <CardContent className="p-6">
                      <div className="h-48 bg-background-secondary rounded-2xl mb-4"></div>
                      <div className="h-4 bg-background-secondary rounded mb-2"></div>
                      <div className="h-4 bg-background-secondary rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : advertisements.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {advertisements.map((ad, index) => (
                  <motion.div
                    key={ad.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Link to={`/advertisement/${ad.id}`}>
                      <Card className={`group glass-card hover:shadow-soft-lg transition-all duration-300 hover:scale-105 transform-gpu cursor-pointer ${
                        ad.is_vip 
                          ? 'border-yellow-400 shadow-yellow-400/20 bg-gradient-to-br from-yellow-50/5 to-yellow-100/10' 
                          : ad.users?.role === 'admin'
                          ? 'border-red-400 shadow-red-400/20 bg-gradient-to-br from-red-50/5 to-red-100/10'
                          : ''
                      } glow-on-hover`}> {/* Changed to glass-card */}
                        <CardContent className="p-0">
                          {/* Image */}
                          {ad.images && ad.images.length > 0 && (
                            <div className="relative overflow-hidden rounded-t-3xl">
                              <img
                                src={ad.images[0]}
                                alt={ad.title}
                                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Без+фото';
                                }}
                              />
                              <div className="absolute top-3 right-3 flex gap-2">
                                {ad.is_vip && (
                                  <Badge variant="vip" className="shadow-lg">
                                    <Crown className="w-3 h-3 mr-1" />
                                    VIP
                                  </Badge>
                                )}
                                {ad.users?.role === 'admin' && (
                                  <Badge variant="admin" className="shadow-lg">
                                    АДМІН
                                  </Badge>
                                )}
                              </div>
                              {ad.images.length > 1 && (
                                <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                                  +{ad.images.length - 1} фото
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="font-semibold text-lg group-hover:text-accent transition-colors line-clamp-2">
                                {ad.title}
                              </h3>
                              {ad.price && (
                                <div className="text-accent font-bold text-lg ml-2">
                                  {ad.price.toLocaleString('uk-UA')} ₴
                                </div>
                              )}
                            </div>
                            
                            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                              {ad.description}
                            </p>
                            
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Link to={`/profile/${ad.user_id}`} className="font-medium hover:text-accent transition-colors">
                                  {ad.users?.nickname}
                                </Link>
                                {ad.users?.role !== 'user' && (
                                  <Badge 
                                    variant={
                                      ad.users?.role === 'admin' ? 'admin' :
                                      ad.users?.role === 'vip' ? 'vip' : 'outline'
                                    }
                                    className="text-xs"
                                  >
                                    {ad.users?.role === 'vip' ? 'VIP' : 
                                     ad.users?.role === 'moderator' ? 'Модератор' : 
                                     ad.users?.role === 'admin' ? 'Адмін' : ''}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                {new Date(ad.created_at).toLocaleDateString('uk-UA')}
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }} className="flex-1">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="w-full text-xs rounded-2xl glow-on-hover"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                >
                                  Детальніше
                                </Button>
                              </motion.div>
                              {(ad.discord_contact || ad.telegram_contact || (ad.user_id && ad.users?.nickname)) && (
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }} className="flex-1">
                                  <ContactButton 
                                    userId={ad.user_id} 
                                    userName={ad.users?.nickname || 'Користувач'} 
                                    advertisementId={ad.id}
                                  />
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <h3 className="text-xl font-semibold mb-2">Поки що оголошень немає</h3>
                <p className="text-muted-foreground mb-6">
                  Станьте першим, хто розмістить оголошення в цій категорії
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
                  <Link to="/create-ad">
                    <Button className="btn-accent rounded-2xl glow-on-hover">
                      Створити оголошення
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SubcategoryPage;