import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MessageCircle, Crown, Shield, User as UserIcon } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast'; // Corrected import
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/auth';

interface UserProfile {
  id: string;
  nickname: string;
  role: 'user' | 'vip' | 'moderator' | 'admin';
  is_banned: boolean;
  created_at: string;
}

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
  category: string;
  subcategory: string;
}

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfileAndAds();
  }, [userId]);

  const fetchUserProfileAndAds = async () => {
    try {
      setLoading(true);
      // Fetch user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;
      setProfile(userData);

      // Fetch user's advertisements
      const { data: adsData, error: adsError } = await supabase
        .from('advertisements')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (adsError) throw adsError;
      setAdvertisements(adsData || []);

    } catch (error: any) {
      toast({
        title: 'Помилка завантаження профілю: ' + error.message,
        variant: 'destructive',
      });
      setProfile(null);
      setAdvertisements([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-24 pb-16">
          <div className="container mx-auto px-6">
            <div className="animate-pulse">
              <div className="h-8 bg-background-secondary rounded mb-8"></div>
              <div className="h-48 bg-background-secondary rounded mb-8"></div>
              <div className="h-4 bg-background-secondary rounded mb-4"></div>
              <div className="h-4 bg-background-secondary rounded w-2/3"></div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-24 pb-16">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Користувача не знайдено</h1>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
              <Button className="btn-accent rounded-2xl glow-on-hover" onClick={() => navigate(-1)}>
                Повернутися
              </Button>
            </motion.div>
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
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="mb-6 glow-on-hover"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </Button>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
              <Card className="glass-card mb-8"> {/* Changed to glass-card */}
                <CardContent className="p-8 flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-shrink-0">
                    <UserIcon className="w-24 h-24 text-muted-foreground" />
                  </div>
                  <div className="text-center md:text-left flex-grow">
                    <h1 className="text-3xl font-bold mb-2 flex items-center justify-center md:justify-start gap-2">
                      {profile.nickname}
                      {profile.role === 'vip' && <Badge variant="vip" className="shadow-md">VIP</Badge>}
                      {profile.role === 'moderator' && <Badge variant="secondary" className="shadow-md">Модератор</Badge>}
                      {profile.role === 'admin' && <Badge variant="admin" className="shadow-md">Адмін</Badge>}
                    </h1>
                    <p className="text-muted-foreground mb-2">
                      Зареєстрований: {new Date(profile.created_at).toLocaleDateString('uk-UA')}
                    </p>
                    {profile.is_banned && (
                      <Badge variant="destructive" className="shadow-md">
                        Заблокований
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <h2 className="text-2xl font-bold mb-6">Оголошення користувача</h2>

            {advertisements.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {advertisements.map((ad, index) => (
                  <motion.div
                    key={ad.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Link to={`/advertisement/${ad.id}`}>
                      <Card className={`group hover:shadow-soft-lg transition-all duration-300 hover:scale-105 transform-gpu cursor-pointer rounded-3xl ${
                        ad.is_vip 
                          ? 'border-yellow-400 shadow-yellow-400/20 bg-gradient-to-br from-yellow-50/5 to-yellow-100/10' 
                          : profile.role === 'admin'
                          ? 'border-red-400 shadow-red-400/20 bg-gradient-to-br from-red-50/5 to-red-100/10'
                          : ''
                      } glow-on-hover`}>
                        <CardContent className="p-0">
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
                                {profile.role === 'admin' && (
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
                            
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {new Date(ad.created_at).toLocaleDateString('uk-UA')}
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
                className="text-center py-8"
              >
                <h3 className="text-xl font-semibold mb-2">Цей користувач ще не має оголошень</h3>
                <p className="text-muted-foreground">
                  Запропонуйте йому створити перше оголошення!
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default UserProfilePage;