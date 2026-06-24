import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, User, MessageSquare, ShoppingBag, Clock } from 'lucide-react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import axios from 'axios';

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

interface Conversation {
  id: number;
  customerId: number;
  customerName: string;
  lastMessage: string;
  updatedAt: string;
}

const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8900/api';
const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws').replace(/\/api$/, '');

const ENDPOINTS = {
  chatHistory: (id: number) => `${API_BASE_URL}/chat/history/${id}`,
  conversations: `${API_BASE_URL}/chat/conversations`,
  chatWS: `${WS_BASE_URL}/ws-chat`
};

const AdminChat: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [connected, setConnected] = useState(false);
  const stompClient = useRef<Client | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeConvIdRef = useRef<number | null>(null);
  const [unreadConversations, setUnreadConversations] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchConversations();
    
    // Chỉ kết nối nếu chưa có client hoặc client chưa active
    if (!stompClient.current || !stompClient.current.active) {
      connect();
    }
    
    return () => {
      // Không ngắt kết nối ngay lập tức để tránh lỗi Re-render trong StrictMode
      // Chúng ta sẽ để Heartbeat và Timeout tự xử lý hoặc chỉ ngắt khi thực sự rời trang
    };
  }, []);

  useEffect(() => {
    if (activeConv) {
      activeConvIdRef.current = activeConv.id;
      fetchHistory(activeConv.id);
      // Xóa unread khi click vào conversation
      setUnreadConversations(prev => {
        const next = new Set(prev);
        next.delete(activeConv.id);
        return next;
      });
    } else {
      activeConvIdRef.current = null;
    }
  }, [activeConv]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchConversations = async () => {
    try {
      console.log("--- ADMIN CHAT: Dang tai danh sach cuoc hoi thoai...");
      // Thêm timestamp để tránh cache trình duyệt
      const res = await axios.get(`${ENDPOINTS.conversations}?t=${Date.now()}`);
      setConversations(res.data);
      console.log("--- ADMIN CHAT: Da tai xong", res.data.length, "cuoc hoi thoai");
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    }
  };

  const fetchHistory = async (id: number) => {
    try {
      const res = await axios.get(ENDPOINTS.chatHistory(id));
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  const connect = () => {
    const socket = new SockJS(ENDPOINTS.chatWS);
    stompClient.current = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        setConnected(true);
        console.log("--- ADMIN CHAT: Da ket noi thanh cong!");
        
        stompClient.current?.subscribe('/topic/admin-messages', (message) => {
          console.log("--- ADMIN CHAT: DA NHAN TIN NHAN RAW TU SERVER:", message.body);
          try {
            const newMessage = JSON.parse(message.body);
            console.log("--- ADMIN CHAT: Parse JSON thanh cong:", newMessage);
            
            // Nếu là yêu cầu gặp nhân viên, phát âm thanh cảnh báo hoặc thông báo mạnh
            if (newMessage.content && newMessage.content.includes("[YÊU CẦU GẶP NHÂN VIÊN]")) {
                // Thử phát âm thanh (nếu trình duyệt cho phép)
                try {
                  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                  audio.play();
                } catch(e) {}
                alert(`CẢNH BÁO: Khách hàng ${newMessage.senderName} đang cần gặp nhân viên tư vấn gấp!`);
            }
            
            // Update message list if it's the active conversation
            console.log("--- ADMIN CHAT: Dang kiem tra conversation ID:", newMessage.conversationId, "(", typeof newMessage.conversationId, ") vs", activeConvIdRef.current, "(", typeof activeConvIdRef.current, ")");
            if (Number(newMessage.conversationId) === Number(activeConvIdRef.current)) {
                console.log("--- ADMIN CHAT: Khop conversation dang mo. Dang cap nhat danh sach tin nhan...");
                setMessages(prev => [...prev, newMessage]);
            }

            // Update conversation list locally for the sidebar
            setConversations(prev => {
                return prev.map(conv => {
                    if (Number(conv.id) === Number(newMessage.conversationId)) {
                        return {
                            ...conv,
                            lastMessage: newMessage.content,
                            updatedAt: newMessage.timestamp
                        };
                    }
                    return conv;
                }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
            });

            // Mark as unread if not the active conversation
            if (Number(newMessage.conversationId) !== Number(activeConvIdRef.current)) {
                console.log("--- ADMIN CHAT: Chua doc. Dang danh dau unread cho conversation:", newMessage.conversationId);
                setUnreadConversations(prev => {
                    const next = new Set(prev);
                    next.add(newMessage.conversationId);
                    return next;
                });
            }

            // Also refresh from server just in case
            fetchConversations();
          } catch (e) {
            console.error("--- ADMIN CHAT: LOI KHI XU LY TIN NHAN:", e);
          }
        });
        
        console.log("--- ADMIN CHAT: Da dang ky nhan tin nhan tai /topic/admin-messages");
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
    if (stompClient.current) stompClient.current.deactivate();
  };

  const sendMessage = () => {
    if (!inputText.trim() || !activeConv || !stompClient.current?.connected) return;

    const chatMessage: Message = {
      conversationId: activeConv.id,
      senderId: 0, // Admin
      senderName: 'Shop Admin',
      content: inputText,
      timestamp: new Date().toISOString(),
      type: 'TEXT'
    };

    stompClient.current.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify(chatMessage)
    });

    setInputText('');
  };

  return (
    <div className="flex h-[calc(100vh-180px)] bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden">
      {/* Sidebar - Conversation List */}
      <div className="w-80 border-r border-white/10 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold mb-4">Tin nhắn</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
            <input 
              type="text" 
              placeholder="Tìm khách hàng..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-white/20"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => setActiveConv(conv)}
              className={`w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-all border-b border-white/5 ${activeConv?.id === conv.id ? 'bg-white/10' : ''}`}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-500 to-orange-400 flex items-center justify-center text-white font-bold">
                {conv.customerName.charAt(0)}
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-bold text-sm truncate ${activeConv?.id === conv.id ? 'text-white' : 'text-white/80'}`}>{conv.customerName}</span>
                  <span className="text-[10px] opacity-40 uppercase font-mono">
                    {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-xs truncate flex-1 ${activeConv?.id === conv.id ? 'text-white/80' : 'text-white/40'}`}>{conv.lastMessage}</p>
                  {/* Indicator cho tin nhắn mới */}
                  {unreadConversations.has(conv.id) && (
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)] animate-pulse" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeConv ? (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <User size={20} />
              </div>
              <div>
                <h3 className="font-bold">{activeConv.customerName}</h3>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-white/20'}`} />
                  <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">
                    {connected ? 'Trực tuyến' : 'Đang kết nối...'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 chat-container-bg">
            {messages.map((msg, i) => {
              const isMe = msg.senderId === 0;
              return (
                <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`} style={{ marginBottom: '1.5rem' }}>
                  <div className={`max-w-[75%] space-y-1`}>
                    <div 
                      className={`rounded-2xl px-6 py-4 shadow-xl transition-all duration-300 ${isMe ? 'admin-msg-bubble' : 'customer-msg-bubble'}`}
                      style={{
                        borderTopRightRadius: isMe ? '0' : '1.5rem',
                        borderTopLeftRadius: isMe ? '1.5rem' : '0',
                        fontSize: '14px',
                        lineHeight: '1.6'
                      }}
                    >
                      {msg.type === 'PRODUCT' ? (
                        <div className="space-y-4 min-w-[240px]">
                          <div className={`flex items-center gap-2 pb-2 border-b ${isMe ? 'border-white/20' : 'border-white/10'}`}>
                            <ShoppingBag size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-widest chat-text-white">Sản phẩm quan tâm</span>
                          </div>
                          <img src={`${API_BASE_URL}/catalog/products/images/${msg.productImage}`} className="w-full h-40 object-cover rounded-xl" alt="" />
                          <p className="font-bold text-sm chat-text-white">{msg.productName}</p>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed chat-text-white">{msg.content}</p>
                      )}
                    </div>
                    <div className={`flex items-center gap-2 px-1 opacity-40 ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <Clock size={10} className="chat-text-white" />
                      <span className="text-[10px] uppercase font-bold tracking-widest chat-text-white">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <div className="p-8 chat-input-bg border-t border-white/10">
            <form 
              onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
              className="relative"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Nhập tin nhắn phản hồi cho khách hàng..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-8 pr-20 text-sm focus:outline-none focus:border-indigo-500 transition-all shadow-inner chat-text-white"
              />
              <button 
                type="submit"
                disabled={!inputText.trim() || !connected}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white text-black px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all disabled:opacity-30"
              >
                Gửi đi
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-center p-20 opacity-30">
          <div className="space-y-6">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto">
              <MessageSquare size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-serif italic mb-2 uppercase tracking-[0.2em]">Chọn một cuộc hội thoại</h2>
              <p className="text-sm uppercase tracking-widest">Hãy chọn khách hàng từ danh sách bên trái để bắt đầu hỗ trợ</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChat;
