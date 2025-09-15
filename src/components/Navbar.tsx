import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Menu, X, User, LogOut, Plus, Settings, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { logoutUser, hasPermission } from '@/lib/auth';
import AuthModal from './AuthModal';
import { toast } from '@/hooks/use-toast';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Link } from 'react-router-dom';
import { useTheme } from 'next-themes';
import MessagesButton from './MessagesButton';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, setUser } = useAuth();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    toast({
      title: 'Ви вийшли з акаунту',
      variant: 'success',
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      toast({
        title: `Пошук: ${searchQuery}`,
        variant: 'info',
      });
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const menuItems = [
    {
      title: 'Автомобілі',
      items: [
        { title: 'Продаж Автомобілі', href: '/automobiles/sale' },
        { title: 'Продаж вантажівок', href: '/automobiles/trucks' },
        { title: 'Продаж Вініли', href: '/automobiles/vinyls' },
        { title: 'Продаж Деталі', href: '/automobiles/parts' },
        { title: 'Продаж Номера', href: '/automobiles/numbers' },
        { title: 'Оренда автомобіля', href: '/automobiles/car-rental' },
        { title: 'Оренда вантажівок', href: '/automobiles/truck-rental' },
      ]
    },
    {
      title: 'Одяг',
      items: [
        { title: 'Продаж одягу', href: '/clothing/sale' },
        { title: 'Продаж аксесуарів', href: '/clothing/accessories' },
        { title: 'Продаж рюкзаків', href: '/clothing/backpacks' },
      ]
    },
    {
      title: 'Нерухомість',
      items: [
        { title: 'Продаж бізнесу', href: '/real-estate/business' },
        { title: 'Продаж квартир', href: '/real-estate/apartments' },
        { title: 'Продаж приватних будинків', href: '/real-estate/houses' },
        { title: 'Оренда теплиць', href: '/real-estate/greenhouses' },
      ]
    },
    {
      title: 'Інше',
      items: [
        { title: 'Різне', href: '/other/misc' },
      ]
    }
  ];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/60 dark:bg-background/40 backdrop-blur-lg shadow-soft' : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/">
            <motion.div
              className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Skoropad
            </motion.div>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex items-center flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Пошук оголошень..."
                className="pl-10 border-0 bg-background-secondary/70 dark:bg-background-secondary/50 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              />
            </form>
          </div>

          {/* Desktop Navigation Menu */}
          <div className="hidden lg:flex items-center gap-6">
            <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
              <Link to="/categories" className="text-muted-foreground hover:text-accent transition-colors">
                Категорії
              </Link>
            </motion.div>
            <NavigationMenu>
              <NavigationMenuList>
                {menuItems.map((menu) => (
                  <NavigationMenuItem key={menu.title}>
                    <NavigationMenuTrigger className="text-muted-foreground hover:text-foreground bg-transparent hover:bg-background-secondary/50 transition-colors rounded-lg">
                      {menu.title}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="bg-card border border-border/50 rounded-2xl shadow-soft z-50">
                      <div className="grid w-[400px] gap-3 p-4">
                        {menu.items.map((item) => (
                          <NavigationMenuLink key={item.href} asChild>
                            <Link
                              to={item.href}
                              className="block select-none space-y-1 rounded-xl p-3 leading-none no-underline outline-none transition-colors hover:bg-accent/10 hover:text-accent focus:bg-accent/10 focus:text-accent"
                            >
                              <div className="text-sm font-medium leading-none">{item.title}</div>
                            </Link>
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>

            {/* Auth Section */}
            {user ? (
              <div className="flex items-center gap-4">
                <MessagesButton />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = '/create-ad'}
                    className="rounded-2xl glow-on-hover"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Створити оголошення
                  </Button>
                </motion.div>
                
                {hasPermission(user, ['admin', 'moderator']) && (
                  <Link to="/admin">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-2xl glow-on-hover"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Адмін панель
                      </Button>
                    </motion.div>
                  </Link>
                )}
                
                <span className="text-sm text-muted-foreground">
                  Привіт, <span className="font-medium text-foreground">{user.nickname}</span>
                  {user.role !== 'user' && (
                    <span className={`ml-1 px-2 py-1 text-xs rounded-full ${
                      user.role === 'admin' ? 'bg-red-600 text-white' :
                      user.role === 'vip' ? 'bg-yellow-500 text-black' :
                      'bg-accent text-accent-foreground'
                    }`}>
                      {user.role.toUpperCase()}
                    </span>
                  )}
                </span>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="rounded-full glow-on-hover"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </motion.div>
              </div>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
                <Button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="btn-accent rounded-2xl glow-on-hover"
                >
                  <User className="w-4 h-4 mr-2" />
                  Вхід
                </Button>
              </motion.div>
            )}
            
            {/* Theme Toggle */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full glow-on-hover"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center">
            {/* Theme Toggle for Mobile */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="lg:hidden mr-2 rounded-full glow-on-hover"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden glow-on-hover"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          className={`lg:hidden overflow-hidden ${isMenuOpen ? 'max-h-screen' : 'max-h-0'}`}
          animate={{
            maxHeight: isMenuOpen ? 1000 : 0,
            opacity: isMenuOpen ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="pt-4 pb-2 space-y-3">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Пошук оголошень..."
                className="pl-10 border-0 bg-background-secondary/70 dark:bg-background-secondary/50 backdrop-blur-sm rounded-2xl"
              />
            </form>

            {/* Mobile Auth */}
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-background-secondary rounded-2xl px-4 py-3">
                  <span className="text-sm">
                    {user.nickname}
                    {user.role !== 'user' && (
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        user.role === 'admin' ? 'bg-red-600 text-white' :
                        user.role === 'vip' ? 'bg-yellow-500 text-black' :
                        'bg-accent text-accent-foreground'
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                    )}
                  </span>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="glow-on-hover"
                    >
                      Вийти
                    </Button>
                  </motion.div>
                </div>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
                  <Button
                    onClick={() => {
                      setIsMenuOpen(false);
                      window.location.href = '/create-ad';
                    }}
                    className="w-full btn-accent rounded-2xl glow-on-hover"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Створити оголошення
                  </Button>
                </motion.div>
                
                {hasPermission(user, ['admin', 'moderator']) && (
                  <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
                      <Button
                        variant="outline"
                        className="w-full rounded-2xl glow-on-hover"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Адмін панель
                      </Button>
                    </motion.div>
                  </Link>
                )}
              </div>
            ) : (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
                <Button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full btn-accent rounded-2xl glow-on-hover"
                >
                  <User className="w-4 h-4 mr-2" />
                  Вхід
                </Button>
              </motion.div>
            )}

            <Link
              to="/categories"
              className="block rounded-2xl px-4 py-3 bg-background-secondary text-foreground hover:scale-105 transition-transform"
              onClick={() => setIsMenuOpen(false)}
            >
              Категорії
            </Link>
            
            {/* Mobile Categories */}
            <div className="space-y-2">
              {menuItems.map((menu) => (
                <div key={menu.title} className="space-y-1">
                  <div className="font-medium text-foreground px-4 py-2">
                    {menu.title}
                  </div>
                  {menu.items.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="block py-2 px-6 text-muted-foreground hover:text-foreground hover:bg-background-secondary rounded-xl transition-colors hover:scale-[1.02] transform-gpu"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </motion.nav>
  );
};

export default Navbar;