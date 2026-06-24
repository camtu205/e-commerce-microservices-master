import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User as UserIcon, Search, Menu as MenuIcon, X, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  user: any;
  cartCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categories: any[];
  brands: any[];
  notifications: any[];
  unreadCount: number;
  onMarkAsRead: (id: number) => void;
  onMarkAllRead: () => void;
}

const getAvatarUrl = (avatar: string | undefined, userName: string) => {
  if (!avatar) return `https://ui-avatars.com/api/?name=${userName}&background=random`;
  if (avatar.startsWith("http") || avatar.startsWith("data:")) return avatar;
  const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8900/api';
  return `${API_BASE_URL}/accounts/images/${avatar}`;
};

const Header: React.FC<HeaderProps> = ({ user, cartCount, searchQuery, setSearchQuery, categories, brands, notifications, unreadCount, onMarkAsRead, onMarkAllRead }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isBrandsOpen, setIsBrandsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAllNotificationsModalOpen, setIsAllNotificationsModalOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isAuthPage) return null;

  // LV style header: transparent on home when not scrolled, white otherwise
  const headerBg = isHome && !isScrolled ? 'bg-transparent' : 'bg-white';
  const textColor = isHome && !isScrolled ? 'text-white' : 'text-black';
  const borderColor = isHome && !isScrolled ? 'border-transparent' : 'border-neutral-100';

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 h-80px z-header flex items-center justify-between px-8 lg:px-12 transition-all duration-500 border-b ${headerBg} ${textColor} ${borderColor}`}>
        {/* Left: Menu & Search */}
        <div className="flex items-center gap-8 flex-1">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="flex items-center gap-3 group"
          >
            <MenuIcon size={18} strokeWidth={1} />
            <span className="text-[10px] uppercase font-serif tracking-[0.2em] font-bold hidden md:block">Menu</span>
          </button>
          <div className="flex items-center gap-4 relative">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="flex items-center gap-3 hover:opacity-50 transition-opacity"
            >
              <Search className="w-4 h-4" />
              <span className="text-[10px] uppercase font-serif tracking-[0.2em] font-bold hidden md:block">
                {isSearchOpen ? 'Đóng' : 'Tìm kiếm'}
              </span>
            </button>
            
            <AnimatePresence>
              {isSearchOpen && (
                <motion.div 
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 200, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <input 
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Bạn đang tìm gì?..."
                    className="bg-transparent border-b border-black/20 outline-none py-1 px-2 text-[11px] w-full font-medium"
                    style={{ borderBottomColor: isHome && !isScrolled ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center: Logo */}
        <div className="flex justify-center flex-1">
          <Link to="/" className={`text-xl lg:text-[24px] font-serif tracking-[0.5em] uppercase transition-all hover:opacity-70 no-underline ${textColor}`}>CAM TU</Link>
        </div>

        {/* Right: Icons */}
        <div className="flex items-center justify-end gap-6 flex-1">
          <button className="text-[10px] uppercase font-serif tracking-[0.2em] font-bold hover:opacity-50 transition-opacity hidden xl:block">
            Liên hệ
          </button>
          
          <Link to={user ? "/profile" : "/login"} className="flex items-center gap-3 hover:opacity-70 transition-all group no-underline">
            {user ? (
              <>
                <span className="text-[10px] uppercase font-serif tracking-[0.2em] font-bold hidden md:block">
                  {user.userDetails?.lastName || user.userName}
                </span>
                <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-100 group-hover:border-black transition-all flex-shrink-0">
                  <img 
                    src={getAvatarUrl(user.userDetails?.avatar, user.userName)} 
                    alt={user.userName}
                    className="w-full h-full object-cover transition-all"
                  />
                </div>
              </>
            ) : (
              <>
                <span className="text-[10px] uppercase font-serif tracking-[0.2em] font-bold hidden md:block">Tài khoản</span>
                <UserIcon className="w-5 h-5" strokeWidth={1.5} />
              </>
            )}
          </Link>

          <div className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative hover:opacity-50 transition-opacity"
            >
              <Bell className="w-5 h-5" strokeWidth={1.5} />
              {unreadCount > 0 && (
                <span 
                  className="absolute bg-rose-500 text-white text-[8px] rounded-full flex items-center justify-center font-bold border border-white"
                  style={{
                    top: '-4px',
                    right: '-4px',
                    width: '14px',
                    height: '14px',
                    minWidth: '14px',
                    lineHeight: '1',
                    padding: 0
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {isNotificationsOpen && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsNotificationsOpen(false)}
                    className="fixed inset-0 z-40"
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-80 bg-white border border-neutral-100 shadow-2xl rounded-2xl overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-neutral-50 flex justify-between items-center bg-neutral-50/50">
                      <h3 className="text-[10px] uppercase tracking-widest font-bold">Thông báo</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={onMarkAllRead}
                          className="text-[9px] uppercase tracking-tighter text-neutral-400 hover:text-black font-bold"
                        >
                          Đánh dấu đã đọc tất cả
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div 
                            key={n.id} 
                            onClick={() => {
                              onMarkAsRead(n.id);
                              if (n.link) window.location.href = n.link;
                              setIsNotificationsOpen(false);
                            }}
                            className={`p-4 border-b border-neutral-50 cursor-pointer hover:bg-neutral-50 transition-colors ${!n.isRead ? 'bg-neutral-50/30' : ''}`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${n.type === 'ORDER' ? 'bg-blue-50 text-blue-500' : n.type === 'PROMOTION' ? 'bg-pink-50 text-pink-500' : 'bg-neutral-100 text-neutral-500'}`}>
                                {n.type}
                              </span>
                              <span className="text-[8px] text-neutral-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h4 className={`text-[11px] mb-1 ${!n.isRead ? 'font-bold' : 'font-medium'}`}>{n.title}</h4>
                            <p className="text-[10px] text-neutral-500 line-clamp-2 leading-relaxed">{n.content}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-12 text-center">
                          <Bell className="w-8 h-8 text-neutral-200 mx-auto mb-3" strokeWidth={1} />
                          <p className="text-[10px] text-neutral-400 uppercase tracking-widest">Không có thông báo nào</p>
                        </div>
                      )}
                    </div>
                    <div className="p-3 text-center border-t border-neutral-50">
                      <button 
                        onClick={() => {
                          setIsNotificationsOpen(false);
                          setIsAllNotificationsModalOpen(true);
                        }}
                        className="text-[9px] uppercase tracking-widest font-bold opacity-30 hover:opacity-100 transition-opacity"
                      >
                        Xem tất cả
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <Link to="/cart" className="relative hover:opacity-50 transition-opacity flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
            {cartCount > 0 && (
              <span 
                className="absolute bg-rose-500 text-white text-[8px] rounded-full flex items-center justify-center font-bold border border-white"
                style={{
                  top: '-4px',
                  right: '-4px',
                  width: '14px',
                  height: '14px',
                  minWidth: '14px',
                  lineHeight: '1',
                  padding: 0
                }}
              >
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/40 z-modal backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 left-0 bottom-0 w-full max-w-[400px] bg-white z-menu p-12 shadow-2xl flex flex-col"
            >
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 text-black hover:opacity-50 transition-opacity mb-16"
              >
                <X className="w-5 h-5" strokeWidth={1} />
                <span className="text-[10px] uppercase tracking-widest">Close</span>
              </button>

              <nav className="flex flex-col gap-6">
                {[
                  { name: 'TRANG CHỦ', path: '/' },
                  { name: 'BỘ SƯU TẬP MỚI', path: '/new-collection' },
                  ...(categories || []).map((cat: any) => ({
                    name: cat.name.toUpperCase(),
                    path: `/category/${cat.name}`
                  })),
                  { 
                    name: 'THƯƠNG HIỆU', 
                    path: '#',
                    isDropdown: true,
                    items: (brands || []).map((b: any) => ({ name: b.name, path: `/brand/${b.name}` }))
                  },
                  { name: 'LỊCH SỬ ĐƠN HÀNG', path: '/orders' },
                  { name: 'TÀI KHOẢN CỦA TÔI', path: '/profile' }
                ].map((item: any, idx) => (
                  <div key={idx}>
                    {item.isDropdown ? (
                      <div>
                        <button 
                          onClick={() => setIsBrandsOpen(!isBrandsOpen)}
                          className="menu-link w-full text-left flex justify-between items-center"
                        >
                          <span>{item.name}</span>
                          <motion.div animate={{ rotate: isBrandsOpen ? 180 : 0 }}>
                            <Search size={14} className="rotate-90 opacity-40" /> 
                          </motion.div>
                        </button>
                        <AnimatePresence>
                          {isBrandsOpen && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden bg-neutral-50/50 rounded-lg mt-2"
                            >
                              <div className="flex flex-col py-2">
                                {item.items.map((sub: any, sIdx: number) => (
                                  <Link 
                                    key={sIdx}
                                    to={sub.path}
                                    onClick={() => { setIsMenuOpen(false); setIsBrandsOpen(false); }}
                                    className="px-6 py-3 text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all no-underline text-neutral-600"
                                  >
                                    {sub.name}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link 
                        to={item.path} 
                        onClick={() => setIsMenuOpen(false)}
                        className="menu-link"
                      >
                        <span>{item.name}</span>
                        <div className="menu-dot" />
                      </Link>
                    )}
                  </div>
                ))}
              </nav>

              <div className="mt-12 pt-12 border-t border-neutral-100">
                <div className="flex flex-col gap-4">
                  <Link to="/profile" className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black no-underline transition-colors">Dịch vụ khách hàng</Link>
                  <Link to="/orders" className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black no-underline transition-colors">Theo dõi đơn hàng</Link>
                </div>
              </div>

              <div className="mt-auto pt-20">
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-30 mb-4">CTUS LUX HERITAGE</p>
                <p className="text-[11px] text-neutral-400 leading-relaxed italic">"Phong cách là cách để nói bạn là ai mà không cần phải nói."</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* All Notifications Modal */}
      <AnimatePresence>
        {isAllNotificationsModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAllNotificationsModalOpen(false)}
              className="fixed inset-0 bg-black/40 z-[999] backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white/95 backdrop-blur-md border border-neutral-100 shadow-2xl rounded-2xl overflow-hidden z-[1000] max-h-[80vh] flex flex-col"
            >
              <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                <div>
                  <h3 className="text-xl font-serif uppercase tracking-wider">Tất cả thông báo</h3>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-1">Lịch sử thông báo của bạn</p>
                </div>
                <div className="flex items-center gap-4">
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => {
                        onMarkAllRead();
                      }}
                      className="text-[10px] uppercase tracking-widest text-rose-500 hover:opacity-75 font-bold"
                    >
                      Đọc tất cả ({unreadCount})
                    </button>
                  )}
                  <button 
                    onClick={() => setIsAllNotificationsModalOpen(false)}
                    className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => {
                        onMarkAsRead(n.id);
                        if (n.link) window.location.href = n.link;
                        setIsAllNotificationsModalOpen(false);
                      }}
                      className={`p-5 border border-neutral-100 rounded-xl cursor-pointer hover:border-rose-300 hover:bg-rose-50/10 transition-all ${!n.isRead ? 'bg-rose-50/20 border-rose-200/50' : 'bg-white'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[9px] font-bold px-3 py-1 rounded-full ${n.type === 'ORDER' ? 'bg-blue-50 text-blue-500' : n.type === 'PROMOTION' ? 'bg-pink-50 text-pink-500' : 'bg-neutral-100 text-neutral-500'}`}>
                          {n.type}
                        </span>
                        <span className="text-[10px] text-neutral-400">{new Date(n.createdAt).toLocaleString('vi-VN')}</span>
                      </div>
                      <h4 className={`text-sm mb-1.5 ${!n.isRead ? 'font-bold' : 'font-medium'}`}>{n.title}</h4>
                      <p className="text-xs text-neutral-500 leading-relaxed">{n.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center">
                    <Bell className="w-12 h-12 text-neutral-200 mx-auto mb-4" strokeWidth={1} />
                    <p className="text-xs text-neutral-400 uppercase tracking-widest">Không có thông báo nào</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
