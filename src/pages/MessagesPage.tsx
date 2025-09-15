import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, User, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useMessages } from '@/contexts/MessagesContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

const MessagesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    conversations, 
    messages, 
    activeConversation, 
    setActiveConversation, 
    fetchMessages, 
    sendMessage, 
    markAsRead,
    loading 
  } = useMessages();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation);
      markAsRead(activeConversation);
    }
  }, [activeConversation, fetchMessages, markAsRead]); // Added fetchMessages and markAsRead to dependencies

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    const activeConv = conversations.find(c => c.id === activeConversation);
    if (!activeConv) return;

    const otherUserId = activeConv.user1_id === user?.id ? activeConv.user2_id : activeConv.user1_id;
    
    await sendMessage(otherUserId, newMessage);
    setNewMessage('');
  };

  const getOtherUser = (conversation: any) => {
    if (!user) return null;
    return conversation.user1_id === user.id ? conversation.other_user : 
           conversation.user1_id === conversation.other_user?.id ? conversation.other_user : null;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Увійдіть в акаунт</h1>
          <p className="text-muted-foreground">Для перегляду повідомлень потрібно увійти в акаунт</p>
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
            className="max-w-6xl mx-auto"
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

            <h1 className="text-3xl font-bold mb-8">
              <span className="bg-gradient-primary bg-clip-text text-transparent">Повідомлення</span>
            </h1>

            <Card className="glass-card overflow-hidden"> {/* Changed to glass-card */}
              <CardContent className="p-0 flex h-[calc(100vh-200px)]">
                {/* Conversations sidebar */}
                <div className="w-full md:w-1/3 border-r border-border/50 flex flex-col">
                  <div className="p-4 border-b border-border/50">
                    <h2 className="text-xl font-semibold">Розмови</h2>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto">
                    {loading ? (
                      <div className="p-4 space-y-3">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="animate-pulse p-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-background-secondary rounded-full"></div>
                              <div className="flex-1">
                                <div className="h-4 bg-background-secondary rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-background-secondary rounded w-1/2"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : conversations.length === 0 ? (
                      <div className="p-8 text-center">
                        <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Поки що немає розмов</h3>
                        <p className="text-muted-foreground">
                          Розмови з'являтимуться після того, як ви почнете спілкування з іншими користувачами
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border/50">
                        {conversations.map((conversation) => {
                          const otherUser = getOtherUser(conversation);
                          const unreadCount = conversation.user1_id === user.id 
                            ? conversation.user1_unread_count 
                            : conversation.user2_unread_count;
                          
                          return (
                            <motion.div
                              key={conversation.id}
                              whileHover={{ backgroundColor: 'hsl(var(--background-secondary))' }}
                              className={`p-4 cursor-pointer transition-colors ${
                                activeConversation === conversation.id ? 'bg-background-secondary' : ''
                              } glow-on-hover`}
                              onClick={() => setActiveConversation(conversation.id)}
                            >
                              <div className="flex items-center space-x-3">
                                <Avatar>
                                  <AvatarFallback>
                                    <User className="w-5 h-5" />
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h3 className="font-medium truncate">
                                      {otherUser?.nickname || 'Невідомий користувач'}
                                    </h3>
                                    {conversation.last_message && (
                                      <span className="text-xs text-muted-foreground">
                                        {format(new Date(conversation.last_message.created_at), 'HH:mm', { locale: uk })}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground truncate">
                                    {conversation.last_message?.content || 'Почніть розмову'}
                                  </p>
                                </div>
                                {unreadCount > 0 && (
                                  <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0"></div>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Chat area */}
                <div className="flex-1 hidden md:flex flex-col">
                  {activeConversation ? (
                    <>
                      <div className="p-4 border-b border-border/50">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>
                              <User className="w-5 h-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">
                              {getOtherUser(conversations.find(c => c.id === activeConversation))?.nickname || 'Невідомий користувач'}
                            </h3>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.filter(m => m.conversation_id === activeConversation).map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 shadow-sm ${
                              message.sender_id === user.id 
                                ? 'bg-accent text-accent-foreground rounded-t-xl rounded-bl-xl rounded-br-md' 
                                : 'bg-background-secondary text-foreground rounded-t-xl rounded-br-xl rounded-bl-md'
                            }`}>
                              <p className="whitespace-pre-wrap">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                message.sender_id === user.id ? 'text-accent-foreground/70' : 'text-muted-foreground'
                              }`}>
                                {format(new Date(message.created_at), 'HH:mm', { locale: uk })}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                      
                      <div className="p-4 border-t border-border/50">
                        <form onSubmit={handleSendMessage} className="flex space-x-2">
                          <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Написати повідомлення..."
                            className="flex-1 rounded-2xl focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                          />
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
                            <Button type="submit" className="btn-accent rounded-2xl glow-on-hover">
                              <Send className="w-4 h-4" />
                            </Button>
                          </motion.div>
                        </form>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                      <MessageCircle className="w-16 h-16 text-muted-foreground mb-4" />
                      <h3 className="text-xl font-medium mb-2">Виберіть розмову</h3>
                      <p className="text-muted-foreground max-w-md">
                        Оберіть розмову зі списку, щоб переглянути повідомлення або почати нову
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MessagesPage;