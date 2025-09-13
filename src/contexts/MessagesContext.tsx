import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  advertisement_id: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
  conversation_id: string;
}

interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  advertisement_id: string | null;
  last_message_id: string | null;
  user1_unread_count: number;
  user2_unread_count: number;
  created_at: string;
  updated_at: string;
  last_message?: Message;
  other_user?: {
    id: string;
    nickname: string;
    role: string;
  };
}

interface MessagesContextType {
  conversations: Conversation[];
  messages: Message[];
  unreadCount: number;
  loading: boolean;
  activeConversation: string | null;
  setActiveConversation: (id: string | null) => void;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (receiverId: string, content: string, advertisementId?: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
};

export const MessagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
      const unsubscribe = subscribeToNewMessages();
      return () => unsubscribe();
    }
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          last_message:messages!conversations_last_message_id_fkey(*),
          advertisement:advertisements(*)
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const conversationsWithUsers = await Promise.all(
        (data || []).map(async (conv) => {
          const otherUserId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;
          
          const { data: otherUser } = await supabase
            .from('users')
            .select('id, nickname, role')
            .eq('id', otherUserId)
            .single();
          
          return {
            ...conv,
            other_user: otherUser || null
          };
        })
      );

      setConversations(conversationsWithUsers);
      
      const totalUnread = conversationsWithUsers.reduce((sum, conv) => {
        if (conv.user1_id === user.id) {
          return sum + conv.user1_unread_count;
        } else {
          return sum + conv.user2_unread_count;
        }
      }, 0);
      
      setUnreadCount(totalUnread);
    } catch (error: any) {
      toast({
        title: 'Помилка завантаження розмов: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      setMessages(data || []);
    } catch (error: any) {
      toast({
        title: 'Помилка завантаження повідомлень: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  const sendMessage = async (receiverId: string, content: string, advertisementId?: string) => {
    if (!user) {
      toast({ title: 'Ви не авторизовані', variant: 'destructive' });
      return;
    }
    try {
      const { data: newMessageData, error } = await supabase.rpc('send_message', {
        p_receiver_id: receiverId,
        p_content: content,
        p_advertisement_id: advertisementId
      });

      if (error) throw error;
      
      // Optimistically add the new message to the active conversation's messages
      if (activeConversation === newMessageData.conversation_id) {
        setMessages(prevMessages => [...prevMessages, newMessageData]);
      }
      
      // Refresh conversations to update last message and unread counts
      await fetchConversations();
      
      toast({
        title: 'Повідомлення надіслано',
        variant: 'success',
      });
    } catch (error: any) {
      toast({
        title: 'Помилка надсилання повідомлення: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  const markAsRead = async (conversationId: string) => {
    try {
      const { error } = await supabase.rpc('mark_conversation_as_read', {
        p_conversation_id: conversationId
      });

      if (error) throw error;
      
      // Refresh conversations to update unread counts
      await fetchConversations();
    } catch (error: any) {
      toast({
        title: 'Помилка позначення повідомлень як прочитаних: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  const subscribeToNewMessages = () => {
    if (!user) return () => {};
    
    const channel = supabase.channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          
          toast({
            title: 'Нове повідомлення',
            description: newMessage.content,
            action: {
              label: 'Переглянути',
              onClick: () => {
                setActiveConversation(newMessage.conversation_id);
                // The useEffect in MessagesPage will handle fetching messages and marking as read
              }
            }
          });
          
          // If the new message belongs to the currently active conversation, add it to messages state
          if (activeConversation === newMessage.conversation_id) {
            setMessages(prevMessages => [...prevMessages, newMessage]);
            markAsRead(newMessage.conversation_id); 
          }
          
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return (
    <MessagesContext.Provider
      value={{
        conversations,
        messages,
        unreadCount,
        loading,
        activeConversation,
        setActiveConversation,
        fetchConversations,
        fetchMessages,
        sendMessage,
        markAsRead
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
};