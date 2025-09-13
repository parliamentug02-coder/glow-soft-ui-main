import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Users, FileText, Star, TrendingUp } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { toast } from '@/hooks/use-toast'; // Corrected import
import { Database } from '@/integrations/supabase/types'; // Import Database type

type Advertisement = Database['public']['Tables']['advertisements']['Row'] & {
  users?: { nickname: string; role: string } | null;
};

const Index = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAds: 0,
    vipAds: 0,
    recentAds: 0
  });
  const [popularAds, setPopularAds] = useState<Advertisement[]>([]);
  const [popularAdsLoading, setPopularAdsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchPopularAds();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch users count
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Fetch total ads count
      const { count: adsCount } = await supabase
        .from('advertisements')
        .select('*', { count: 'exact', head: true });

      // Fetch VIP ads count
      const { count: vipCount } = await supabase
        .from('advertisements')
        .select('*', { count: 'exact', head: true })
        .eq('is_vip', true);

      // Fetch recent ads (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: recentCount } = await supabase
        .from('advertisements')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      setStats({
        totalUsers: usersCount || 0,
        totalAds: adsCount || 0,
        vipAds: vipCount || 0,
        recentAds: recentCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchPopularAds = async () => {
    try {
      setPopularAdsLoading(true);
      let { data, error } = await supabase
        .from('advertisements')
        .select(`
          *,
          users (nickname, role)
        `)
        .order('is_vip', { ascending: false }) // Prioritize VIP ads
        .order('created_at', { ascending: false }) // Then by newest
        .limit(8); // Fetch a reasonable number for the home page

      if (error) throw error;

      setPopularAds(data || []);
    } catch (error: any) {
      toast({
        title: 'Помилка завантаження популярних оголошень: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setPopularAdsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <Hero />

      {/* About Section */}
      <section className="py-16 bg-background-secondary">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Про <span className="bg-gradient-primary bg-clip-text text-transparent">Skoropad</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ваш надійний партнер у світі онлайн оголошень та торгівлі
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ 
                y: -5, 
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-card rounded-3xl p-6 shadow-soft border border-border/50 hover:shadow-soft-lg hover:border-accent/20 transition-all duration-300 transform-gpu"
            >
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-accent" />
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Користувачі</h3>
              <p className="text-muted-foreground text-sm">
                Зареєстровані користувачі
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ 
                y: -5, 
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-card rounded-3xl p-6 shadow-soft border border-border/50 hover:shadow-soft-lg hover:border-accent/20 transition-all duration-300 transform-gpu"
            >
              <div className="flex items-center justify-between mb-4">
                <FileText className="w-8 h-8 text-primary" />
                <div className="text-2xl font-bold">{stats.totalAds}</div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Оголошення</h3>
              <p className="text-muted-foreground text-sm">
                Всього оголошень
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ 
                y: -5, 
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-card rounded-3xl p-6 shadow-soft border border-border/50 hover:shadow-soft-lg hover:border-accent/20 transition-all duration-300 transform-gpu"
            >
              <div className="flex items-center justify-between mb-4">
                <Star className="w-8 h-8 text-yellow-500" />
                <div className="text-2xl font-bold">{stats.vipAds}</div>
              </div>
              <h3 className="text-lg font-semibold mb-2">VIP оголошення</h3>
              <p className="text-muted-foreground text-sm">
                Преміум оголошення
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ 
                y: -5, 
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-card rounded-3xl p-6 shadow-soft border border-border/50 hover:shadow-soft-lg hover:border-accent/20 transition-all duration-300 transform-gpu"
            >
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <div className="text-2xl font-bold">{stats.recentAds}</div>
              </div>
              <h3 className="text-lg font-semibold mb-2">За тиждень</h3>
              <p className="text-muted-foreground text-sm">
                Нових оголошень
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products Section (now dynamic) */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Популярні <span className="bg-gradient-accent bg-clip-text text-transparent">оголошення</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ознайомтеся з нашими найкращими пропозиціями
            </p>
          </motion.div>

          {popularAdsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-background-secondary rounded-3xl h-80 w-full"></div>
                </div>
              ))}
            </div>
          ) : popularAds.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {popularAds.map((ad, index) => (
                <ProductCard
                  key={ad.id}
                  id={ad.id}
                  name={ad.title}
                  description={ad.description}
                  price={ad.price || 0} // Default to 0 if price is null
                  image={ad.images?.[0] || 'https://via.placeholder.com/400x300?text=Без+фото'} // Placeholder if no image
                  isNew={false} // Not directly from DB, can be added if needed
                  isOnSale={false} // Not directly from DB, can be added if needed
                  index={index}
                />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <h3 className="text-xl font-semibold mb-2">Поки що немає популярних оголошень</h3>
              <p className="text-muted-foreground">
                Створіть перше оголошення, щоб воно з'явилося тут!
              </p>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;