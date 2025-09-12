import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMessages } from '@/contexts/MessagesContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const MessagesButton = () => {
  const { unreadCount } = useMessages();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="relative">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full relative"
          asChild
        >
          <Link to="/messages">
            <MessageCircle className="w-5 h-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs rounded-full"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Link>
        </Button>
      </motion.div>
    </div>
  );
};

export default MessagesButton;