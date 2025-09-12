import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, User, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerUser, loginUser } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

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
        toast.error(result.error);
      } else {
        setUser(result.user);
        toast.success(isLogin ? 'Успішний вхід!' : 'Реєстрація успішна!');
        onClose();
        setNickname('');
        setPassword('');
      }
    } catch (error) {
      toast.error('Щось пішло не так');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-card rounded-3xl p-8 shadow-soft-lg border border-border/50 w-full max-w-md mx-4 transform-gpu"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {isLogin ? 'Вхід' : 'Реєстрація'}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
          >
            <X className="w-5 h-5" />
          </Button>
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

          <Button
            type="submit"
            className="w-full btn-accent rounded-2xl transform-gpu transition-all duration-300 hover:shadow-glow"
            disabled={loading}
          >
            {loading ? 'Завантаження...' : (isLogin ? 'Увійти' : 'Зареєструватися')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground">
            {isLogin ? 'Немає акаунту?' : 'Вже є акаунт?'}
          </p>
          <Button
            variant="link"
            onClick={() => setIsLogin(!isLogin)}
            className="text-accent hover:text-accent-light transition-all duration-300 hover:scale-105"
          >
            {isLogin ? 'Зареєструватися' : 'Увійти'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthModal;