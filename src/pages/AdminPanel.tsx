import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Ban, Shield, Crown, Trash2, Eye, Users, FileText, BarChart3, Download } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { hasPermission } from '@/lib/auth';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [advertisements, setAdvertisements] = useState([]);
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAds: 0,
    vipUsers: 0,
    bannedUsers: 0
  });

  useEffect(() => {
    if (!user || !hasPermission(user, ['admin', 'moderator'])) {
      navigate('/');
      return;
    }
    
    // Ensure user context is set for RLS
    const initAndFetch = async () => {
      const { initializeUserContext } = await import('@/lib/auth');
      await initializeUserContext();
      fetchData();
    };
    
    initAndFetch();
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Fetch advertisements
      const { data: adsData } = await supabase
        .from('advertisements')
        .select(`
          *,
          users (nickname, role)
        `)
        .order('created_at', { ascending: false });

      // Fetch logs (admin only)
      if (user?.role === 'admin') {
        const { data: logsData } = await supabase
          .from('admin_logs')
          .select(`
            *,
            users!admin_logs_admin_id_fkey (nickname),
            target_user:users!admin_logs_target_user_id_fkey (nickname)
          `)
          .order('created_at', { ascending: false })
          .limit(50);
        
        setLogs(logsData || []);
      }

      setUsers(usersData || []);
      setAdvertisements(adsData || []);

      // Calculate stats
      if (usersData) {
        setStats({
          totalUsers: usersData.length,
          totalAds: adsData?.length || 0,
          vipUsers: usersData.filter(u => u.role === 'vip').length,
          bannedUsers: usersData.filter(u => u.is_banned).length
        });
      }
    } catch (error: any) {
      toast.error('Помилка завантаження даних: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const logAction = async (action: string, targetUserId?: string, details?: any) => {
    try {
      await supabase
        .from('admin_logs')
        .insert([{
          admin_id: user?.id,
          action,
          target_user_id: targetUserId || null,
          details: details || {}
        }]);
    } catch (error) {
      console.error('Failed to log action:', error);
    }
  };

  const handleUserAction = async (targetUserId: string, action: string, newRole?: string) => {
    try {
      let updateData = {};
      
      if (action === 'ban') {
        updateData = { is_banned: true };
      } else if (action === 'unban') {
        updateData = { is_banned: false };
      } else if (action === 'role' && newRole) {
        updateData = { role: newRole };
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', targetUserId);

      if (error) throw error;

      // Log the action
      await logAction(`${action}${newRole ? `_${newRole}` : ''}`, targetUserId, { action, newRole });

      toast.success('Дію виконано успішно');
      fetchData();
    } catch (error: any) {
      toast.error('Помилка виконання дії: ' + error.message);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (!confirm('Ви впевнені, що хочете видалити це оголошення?')) return;

    try {
      const { error } = await supabase
        .from('advertisements')
        .delete()
        .eq('id', adId);

      if (error) throw error;

      // Log the action
      await logAction('delete_advertisement', undefined, { advertisement_id: adId });

      toast.success('Оголошення видалено');
      fetchData();
    } catch (error: any) {
      toast.error('Помилка видалення оголошення: ' + error.message);
    }
  };

  const handlePromoteAd = async (adId: string, isVip: boolean) => {
    try {
      const { error } = await supabase
        .from('advertisements')
        .update({ is_vip: !isVip })
        .eq('id', adId);

      if (error) throw error;

      await logAction(isVip ? 'demote_advertisement' : 'promote_advertisement', undefined, { advertisement_id: adId });
      
      toast.success(isVip ? 'VIP статус знято' : 'Надано VIP статус');
      fetchData();
    } catch (error: any) {
      toast.error('Помилка зміни статусу: ' + error.message);
    }
  };

  const exportData = async () => {
    try {
      const data = {
        users: users.map(u => ({ ...u, password_hash: undefined })),
        advertisements: advertisements,
        logs: logs,
        timestamp: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skoropad-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Дані експортовано успішно');
    } catch (error: any) {
      toast.error('Помилка експорту: ' + error.message);
    }
  };

  const filteredAds = advertisements.filter(ad =>
    ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ad.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ad.users?.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user || !hasPermission(user, ['admin', 'moderator'])) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Доступ заборонено</h1>
          <p className="text-muted-foreground">У вас немає прав для доступу до адмін панелі</p>
        </div>
        <Footer />
      </div>
    );
  }

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
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-6 hover:scale-105 transition-transform"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>

            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold">
                Адмін <span className="bg-gradient-primary bg-clip-text text-transparent">панель</span>
              </h1>
              <Badge variant="outline" className="text-sm">
                {user.role === 'admin' ? 'Адміністратор' : 'Модератор'}
              </Badge>
            </div>

            <div className="flex justify-between items-center mb-6">
              <div></div>
              {user.role === 'admin' && (
                <Button onClick={exportData} variant="outline" className="hover:scale-105 transition-transform">
                  <Download className="w-4 h-4 mr-2" />
                  Експорт даних
                </Button>
              )}
            </div>

            <Tabs defaultValue="stats" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="stats" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Статистика
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Користувачі
                </TabsTrigger>
                <TabsTrigger value="ads" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Оголошення
                </TabsTrigger>
                {user.role === 'admin' && (
                  <TabsTrigger value="logs" className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Логи
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="stats" className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="hover:scale-105 transition-transform">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Користувачі</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalUsers}</div>
                      <p className="text-xs text-muted-foreground">Всього зареєстровано</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:scale-105 transition-transform">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Оголошення</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalAds}</div>
                      <p className="text-xs text-muted-foreground">Всього створено</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:scale-105 transition-transform">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">VIP користувачі</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-accent">{stats.vipUsers}</div>
                      <p className="text-xs text-muted-foreground">Активні VIP</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:scale-105 transition-transform">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Заблоковані</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-destructive">{stats.bannedUsers}</div>
                      <p className="text-xs text-muted-foreground">Заблоковані користувачі</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="users" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Управління користувачами</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {users.map((targetUser) => (
                        <motion.div 
                          key={targetUser.id} 
                          className="flex items-center justify-between p-4 border rounded-2xl hover:shadow-md transition-shadow"
                          whileHover={{ scale: 1.01 }}
                        >
                          <div>
                            <p className="font-medium flex items-center gap-2">
                              {targetUser.nickname}
                              {targetUser.role === 'vip' && <Badge className="bg-accent">VIP</Badge>}
                              {targetUser.role === 'moderator' && <Badge variant="secondary">Модератор</Badge>}
                              {targetUser.role === 'admin' && <Badge variant="destructive">Адмін</Badge>}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Статус: {targetUser.is_banned ? 'Заблокований' : 'Активний'} | 
                              Дата реєстрації: {new Date(targetUser.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {user.role === 'admin' && targetUser.role !== 'admin' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUserAction(targetUser.id, 'role', 'vip')}
                                  disabled={targetUser.role === 'vip'}
                                  className="hover:scale-105 transition-transform"
                                >
                                  <Crown className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUserAction(targetUser.id, 'role', 'moderator')}
                                  disabled={targetUser.role === 'moderator'}
                                  className="hover:scale-105 transition-transform"
                                >
                                  <Shield className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            {targetUser.role !== 'admin' && (
                              <Button
                                size="sm"
                                variant={targetUser.is_banned ? "default" : "destructive"}
                                onClick={() => handleUserAction(
                                  targetUser.id, 
                                  targetUser.is_banned ? 'unban' : 'ban'
                                )}
                                className="hover:scale-105 transition-transform"
                              >
                                <Ban className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ads" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Управління оголошеннями</CardTitle>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Пошук оголошень..."
                        className="pl-10 rounded-2xl"
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredAds.map((ad) => (
                        <motion.div 
                          key={ad.id} 
                          className="flex items-start justify-between p-4 border rounded-2xl hover:shadow-md transition-shadow"
                          whileHover={{ scale: 1.01 }}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-medium">{ad.title}</p>
                              {ad.is_vip && <Badge className="bg-accent">VIP</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              Автор: {ad.users?.nickname} | 
                              Категорія: {ad.category}/{ad.subcategory}
                            </p>
                            <p className="text-sm text-muted-foreground mb-2">
                              {ad.description.substring(0, 150)}...
                            </p>
                            <div className="flex gap-2 text-xs text-muted-foreground">
                              {ad.discord_contact && <span>Discord: {ad.discord_contact}</span>}
                              {ad.telegram_contact && <span>Telegram: {ad.telegram_contact}</span>}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant={ad.is_vip ? "outline" : "default"}
                              onClick={() => handlePromoteAd(ad.id, ad.is_vip)}
                              className="hover:scale-105 transition-transform"
                            >
                              <Crown className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteAd(ad.id)}
                              className="hover:scale-105 transition-transform"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {user.role === 'admin' && (
                <TabsContent value="logs" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Логи дій</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {logs.map((log) => (
                          <motion.div 
                            key={log.id} 
                            className="p-4 border rounded-2xl hover:shadow-md transition-shadow"
                            whileHover={{ scale: 1.01 }}
                          >
                            <p className="font-medium">
                              {log.users?.nickname} виконав дію: <Badge variant="outline">{log.action}</Badge>
                            </p>
                            {log.target_user && (
                              <p className="text-sm text-muted-foreground">
                                Цільовий користувач: {log.target_user.nickname}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {new Date(log.created_at).toLocaleString()}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AdminPanel;