import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, User, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerUser, loginUser } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast'; // Corrected import

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = isLogin 
        ? await loginUser(nickname, password)
        : await registerUser(nickname, password);

      if (result.error) {
        toast({
          title: result.error,
          variant: 'destructive',
        });
      } else {
        setUser(result.user);
        toast({
          title: isLogin ? 'Успішний вхід!' : 'Реєстрація успішна!',
          variant: 'success',
        });
        onClose();
        setNickname('');
        setPassword('');
      }
    } catch (error) {
      toast({
        title: 'Щось пішло не так',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="glass-card w-full max-w-md mx-4 transform-gpu" // Changed to glass-card
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {isLogin ? 'Вхід' : 'Реєстрація'}
          </h2>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={{ duration: 0.2 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-all duration-300 glow-on-hover"
            >
              <X className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nickname">Нікнейм</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="pl-10 rounded-2xl focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                placeholder="Введіть нікнейм"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 rounded-2xl focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                placeholder="Введіть пароль"
                required
              />
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
            <Button
              type="submit"
              className="w-full btn-accent rounded-2xl transform-gpu transition-all duration-300 hover:shadow-glow glow-on-hover"
              disabled={loading}
            >
              {loading ? 'Завантаження...' : (isLogin ? 'Увійти' : 'Зареєструватися')}
            </Button>
          </motion.div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground">
            {isLogin ? 'Немає акаунту?' : 'Вже є акаунт?'}
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-accent hover:text-accent-light transition-all duration-300 glow-on-hover"
            >
              {isLogin ? 'Зареєструватися' : 'Увійти'}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthModal;