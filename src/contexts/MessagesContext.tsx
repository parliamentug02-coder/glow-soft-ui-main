import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast'; // Corrected import

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
      subscribeToNewMessages();
    }
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch conversations with last message and other user info
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

      // Fetch other user info for each conversation
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
      
      // Calculate unread count
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
    try {
      const { data, error } = await supabase.rpc('send_message', {
        p_receiver_id: receiverId,
        p_content: content,
        p_advertisement_id: advertisementId
      });

      if (error) throw error;
      
      // Refresh conversations
      await fetchConversations();
      
      // If we're in the active conversation, refresh messages
      if (activeConversation) {
        await fetchMessages(activeConversation);
      }
      
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
    if (!user) return;
    
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
          // New message received
          toast({
            title: 'Нове повідомлення',
            description: payload.new.content,
            action: {
              label: 'Переглянути',
              onClick: () => {
                // Find the conversation and set it as active
                const conversationId = payload.new.conversation_id;
                setActiveConversation(conversationId);
                fetchMessages(conversationId);
              }
            }
          });
          
          // Refresh conversations
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