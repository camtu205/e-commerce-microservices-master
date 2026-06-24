import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Minus, ShoppingBag, Clock, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import axios from 'axios';
import { ENDPOINTS } from './api';

interface Message {
  id?: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'TEXT' | 'PRODUCT';
  productId?: number;
  productName?: string;
  productImage?: string;
}

const SUGGESTIONS = [
  "Phí giao hàng thế nào?",
  "Chính sách đổi trả?",
  "Tìm áo dưới 500k",
  "Tìm sản phẩm mới nhất"
];

interface ChatWidgetProps {
  user: any;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [conversation, setConversation] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const stompClient = useRef<Client | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && isOpen) {
      initChat();
      setUnreadCount(0); // Clear unread count when opened
    }
    return () => disconnect();
  }, [user, isOpen]);

  useEffect(() => {
    const handleOpenChat = (e: any) => {
      const product = e.detail;
      setIsOpen(true);
      setIsMinimized(false);
      
      // We need to wait for connection to be ready before sending
      if (stompClient.current?.connected) {
        sendMessage(`Tôi quan tâm đến sản phẩm này: ${product.productName}`, 'PRODUCT', product);
      } else {
        // Retry once after a short delay if not connected yet
        setTimeout(() => {
          if (stompClient.current?.connected) {
            sendMessage(`Tôi quan tâm đến sản phẩm này: ${product.productName}`, 'PRODUCT', product);
          }
        }, 2000);
      }
    };

    window.addEventListener('openChat', handleOpenChat);
    return () => window.removeEventListener('openChat', handleOpenChat);
  }, [user, conversation, connected]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isMinimized]);

  const initChat = async () => {
    try {
      const convResp = await axios.get(ENDPOINTS.customerConversation(user.id), {
        params: { customerName: user.userName }
      });
      setConversation(convResp.data);

      const historyResp = await axios.get(ENDPOINTS.chatHistory(convResp.data.id));
      setMessages(historyResp.data);

      connect(convResp.data.id);
    } catch (err) {
      console.error("Failed to init chat", err);
    }
  };

  const connect = (_convId: number) => {
    const socket = new SockJS(ENDPOINTS.chatWS);
    stompClient.current = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        setConnected(true);
        stompClient.current?.subscribe(`/topic/messages.${user.id}`, (message) => {
          const newMessage = JSON.parse(message.body);
          setMessages(prev => [...prev, newMessage]);
          
          // Increment unread count if chat is closed and message is from shop
          if (!isOpen && Number(newMessage.senderId) !== Number(user.id)) {
            setUnreadCount(prev => prev + 1);
          }
        });
      },
      onDisconnect: () => setConnected(false),
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      reconnectDelay: 5000,
      debug: (str) => console.log(str)
    });
    stompClient.current.activate();
  };

  const disconnect = () => {
    if (stompClient.current) {
      stompClient.current.deactivate();
    }
  };

  const sendMessage = (text: string = inputText, type: 'TEXT' | 'PRODUCT' = 'TEXT', product: any = null) => {
    if ((!text.trim() && type === 'TEXT') || !conversation || !stompClient.current?.connected) return;

    const chatMessage: Message = {
      conversationId: conversation.id,
      senderId: user.id,
      senderName: user.userName,
      content: text,
      timestamp: new Date().toISOString(),
      type: type,
      productId: product?.id,
      productName: product?.productName,
      productImage: product?.image
    };

    console.log("Sending message:", chatMessage);
    stompClient.current.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify(chatMessage)
    });

    setInputText('');
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-chat flex flex-col items-end">
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-6 w-[400px] h-[600px] bg-[#0c0e14]/95 backdrop-blur-2xl rounded-[2.5rem] shadow-chat-popup overflow-hidden border border-white/10 flex flex-col text-white"
          >
            {/* Header */}
            <div className="p-7 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white font-serif italic text-xl border border-white/10 shadow-lg">
                  L
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-widest uppercase">Luxury Support</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse shadow-[0_0_8px_#4ade80]' : 'bg-white/20'}`} />
                    <span className="text-[10px] opacity-50 uppercase tracking-[0.2em] font-bold">
                      {connected ? 'Trực tuyến' : 'Đang kết nối...'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    if (connected) {
                      const msg: Message = {
                        conversationId: conversation?.id,
                        senderId: user.id,
                        senderName: user.userName,
                        content: "🆘 [YÊU CẦU GẶP NHÂN VIÊN TƯ VẤN TRỰC TIẾP]",
                        timestamp: new Date().toISOString(),
                        type: 'TEXT'
                      };
                      stompClient.current?.publish({
                        destination: '/app/chat.sendMessage',
                        body: JSON.stringify(msg)
                      });
                      alert("Yêu cầu đã được gửi! Nhân viên sẽ hỗ trợ bạn ngay.");
                    }
                  }}
                  className="px-3 h-10 flex items-center gap-2 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest"
                  title="Gặp nhân viên"
                >
                  <User size={14} />
                  <span className="hidden sm:inline">Gặp nhân viên</span>
                </button>
                <button onClick={() => setIsMinimized(true)} className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all">
                  <Minus size={20} />
                </button>
                <button onClick={() => setIsOpen(false)} className="w-10 h-10 flex items-center justify-center hover:bg-rose-500/20 hover:text-rose-500 rounded-xl transition-all">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-black/20 no-scrollbar">
              {messages.length === 0 && (
                <div className="text-center py-20 opacity-20">
                  <MessageSquare size={48} className="mx-auto mb-4" />
                  <p className="text-xs font-bold uppercase tracking-[0.3em]">Bắt đầu cuộc hội thoại</p>
                </div>
              )}
              {messages.map((msg, i) => {
                const isMe = Number(msg.senderId) === Number(user.id);
                return (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] space-y-2`}>
                      <div className={`relative rounded-2xl px-6 py-4 shadow-xl text-sm transition-all duration-300 ${
                        isMe 
                          ? 'bg-white text-black rounded-tr-none hover:shadow-white/5' 
                          : msg.senderId === 0 
                            ? 'bg-gradient-to-br from-[#1a1c23] to-[#2a2d37] text-white rounded-tl-none border border-rose-500/30' 
                            : 'bg-[#2a2d37] text-white rounded-tl-none border border-white/5 hover:bg-[#323642]'
                      }`}>
                        {msg.senderId === 0 && (
                          <div className="absolute -top-6 left-0 flex items-center gap-2">
                             <div className="w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center">
                               <MessageSquare size={8} className="text-white" />
                             </div>
                             <span className="text-[8px] font-bold uppercase tracking-widest text-rose-500">AI Assistant</span>
                          </div>
                        )}
                        {msg.type === 'PRODUCT' ? (
                          <div className="space-y-4 min-w-[220px]">
                            <div className={`flex items-center gap-2 pb-2 border-b ${isMe ? 'border-black/10' : 'border-white/10'}`}>
                              <ShoppingBag size={14} />
                              <span className="text-[10px] font-bold uppercase tracking-widest">Sản phẩm quan tâm</span>
                            </div>
                            <img src={`${import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8900/api'}/catalog/products/images/${msg.productImage}`} className="w-full h-40 object-cover rounded-xl shadow-lg" alt="" />
                            <p className="font-bold text-xs">{msg.productName}</p>
                            <button className={`w-full py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                                isMe ? 'bg-black text-white' : 'bg-white text-black'
                            }`}>
                              Xem chi tiết
                            </button>
                          </div>
                        ) : (
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>
                      <div className={`flex items-center gap-2 px-1 opacity-30 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <Clock size={10} />
                        <span className="text-[9px] uppercase font-bold tracking-widest">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Quick Suggestions */}
            <div className="px-8 py-4 flex gap-2 overflow-x-auto no-scrollbar bg-black/10 border-t border-white/5">
              {SUGGESTIONS.map((text, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(text)}
                  className="whitespace-nowrap px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  {text}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-8 bg-white/5 border-t border-white/10">
              <form 
                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                className="relative"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="w-full bg-white/10 border border-white/10 rounded-2xl py-5 pl-8 pr-20 text-sm text-white focus:outline-none focus:border-white/30 transition-all shadow-inner"
                />
                <button 
                  type="submit"
                  disabled={!inputText.trim() || !connected}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white text-black px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all disabled:opacity-30"
                >
                  Gửi
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-4">
        {isMinimized && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={() => setIsMinimized(false)}
            className="bg-white px-6 py-4 rounded-2xl shadow-xl border border-neutral-100 flex items-center gap-3 hover:bg-neutral-50 transition-all"
          >
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Tiếp tục trò chuyện</span>
          </motion.button>
        )}
        
        <button
          onClick={() => {
            if (isOpen && isMinimized) setIsMinimized(false);
            else setIsOpen(!isOpen);
          }}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
            isOpen ? 'bg-rose-500 text-white rotate-90' : 'bg-black text-white hover:scale-110'
          }`}
        >
          {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
          {unreadCount > 0 && !isOpen && (
             <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold border-2 border-white">
               {unreadCount}
             </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatWidget;
