import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useMessages } from '@/contexts/MessagesContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

interface ContactButtonProps {
  userId: string;
  userName: string;
  advertisementId?: string;
}

const ContactButton: React.FC<ContactButtonProps> = ({ userId, userName, advertisementId }) => {
  const { sendMessage } = useMessages();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleSendMessage = async () => {
    if (!user) {
      toast.error('Увійдіть в акаунт для відправки повідомлень');
      return;
    }

    if (!message.trim()) {
      toast.error('Введіть повідомлення');
      return;
    }

    try {
      await sendMessage(userId, message, advertisementId);
      setIsOpen(false);
      setMessage('');
      toast.success('Повідомлення надіслано');
    } catch (error: any) {
      toast.error('Помилка надсилання повідомлення: ' + error.message);
    }
  };

  if (!user) {
    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
        <Button 
          className="btn-accent"
          onClick={() => toast.info('Увійдіть в акаунт для відправки повідомлень')}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Написати
        </Button>
      </motion.div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
          <Button className="btn-accent">
            <MessageCircle className="w-4 h-4 mr-2" />
            Написати {userName}
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-3xl">
        <DialogHeader>
          <DialogTitle>Написати {userName}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="Ваше повідомлення..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[120px] rounded-2xl"
          />
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
            <Button 
              onClick={handleSendMessage} 
              className="w-full btn-accent rounded-2xl"
              disabled={!message.trim()}
            >
              <Send className="w-4 h-4 mr-2" />
              Надіслати
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactButton;