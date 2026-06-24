import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
import { Plus, CheckCircle2, X, ChevronLeft, ChevronRight, ArrowRight, Camera } from 'lucide-react';
import { ENDPOINTS } from './api';
import type { Product, CartItem } from './api';
import ChatWidget from './ChatWidget';
import Login from './Login';
import Register from './Register';
import ProductDetail from './ProductDetail';
import Checkout from './Checkout';
import OrderHistory from './OrderHistory';
import CartPage from './CartPage';
import Header from './Header';
import OrderDetailPage from './OrderDetailPage';
import Footer from './Footer';
import ForgotPassword from './ForgotPassword';

const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8900/api';

const getAvatarUrl = (avatar: string | undefined, userName: string) => {
  if (!avatar) return `https://ui-avatars.com/api/?name=${userName}&background=random`;
  if (avatar.startsWith("http") || avatar.startsWith("data:")) return avatar;
  return `${API_BASE_URL}/accounts/images/${avatar}`;
};

const ProfileComponent = ({ user, setUser, navigate, setToast }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...user });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tiers, setTiers] = useState<any[]>([]);
  const [nextTier, setNextTier] = useState<any>(null);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Mật khẩu mới phải từ 6 ký tự trở lên.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Mật khẩu mới và mật khẩu xác nhận không trùng khớp.");
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordError("Mật khẩu mới không được trùng với mật khẩu hiện tại.");
      return;
    }

    setPasswordLoading(true);
    try {
      await axios.put(ENDPOINTS.changePassword(user.id), {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setToast("Đổi mật khẩu thành công!");
      setIsChangingPassword(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err: any) {
      const errorData = err.response?.data;
      setPasswordError(
        typeof errorData === 'string'
          ? errorData
          : (errorData?.error || errorData?.message || "Lỗi khi đổi mật khẩu.")
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  useEffect(() => {
    const fetchMembershipData = async () => {
      try {
        const [userRes, tierRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/accounts/users/${user.id}`),
          axios.get(`${API_BASE_URL}/accounts/membership-tiers`)
        ]);
        setUser(userRes.data);
        setEditForm(userRes.data);
        setTiers(tierRes.data.sort((a: any, b: any) => a.tierOrder - b.tierOrder));
      } catch (err) {
        console.error("Lỗi lấy thông tin hạng:", err);
      }
    };
    if (user) fetchMembershipData();
  }, [user?.id]);

  useEffect(() => {
    if (tiers.length > 0 && user?.userDetails?.membershipTier) {
      const currentTierOrder = user.userDetails.membershipTier.tierOrder;
      const next = tiers.find(t => t.tierOrder > currentTierOrder);
      setNextTier(next);
    } else if (tiers.length > 0 && !user?.userDetails?.membershipTier) {
      setNextTier(tiers[0]);
    }
  }, [tiers, user?.userDetails?.membershipTier]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API_BASE_URL}/accounts/users/${user.id}`, editForm);
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setIsEditing(false);
      setToast("Cập nhật thông tin thành công!");
    } catch (err) {
      alert("Lỗi cập nhật thông tin.");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await axios.post(`${API_BASE_URL}/accounts/images/upload`, formData);
        const filename = res.data;
        const updatedForm = {
          ...editForm,
          userDetails: { ...editForm.userDetails, avatar: filename }
        };
        setEditForm(updatedForm);
        setToast("Đã tải ảnh lên thành công!");
      } catch (err) {
        alert("Lỗi tải ảnh lên.");
      } finally {
        setUploading(false);
      }
    }
  };

  const totalSpending = user?.userDetails?.totalSpending || 0;
  const progress = nextTier ? Math.min(100, (totalSpending / nextTier.minSpending) * 100) : 100;

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="pt-header container py-20 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h2 className="text-4xl font-serif mb-2">Hồ sơ của tôi</h2>
          <p className="text-sm text-neutral-400">Quản lý thông tin cá nhân và hạng thành viên</p>
        </div>

        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="grid md:grid-cols-3 gap-12 fade-in">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="w-40 h-40 rounded-full overflow-hidden border-2 border-neutral-100 shadow-sm bg-neutral-50">
                  <img src={getAvatarUrl(editForm.userDetails?.avatar, user.userName)} className="w-full h-full object-cover" alt="Avatar Preview" />
                </div>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 w-11 h-11 bg-black text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-neutral-800 transition-all shadow-xl border-4 border-white">
                  {uploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Camera size={18} />}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
              </div>
            </div>
            <div className="md:col-span-2 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block">Họ</label>
                  <input type="text" className="lv-input" value={editForm.userDetails?.firstName} onChange={e => setEditForm({ ...editForm, userDetails: { ...editForm.userDetails, firstName: e.target.value } })} />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block">Tên</label>
                  <input type="text" className="lv-input" value={editForm.userDetails?.lastName} onChange={e => setEditForm({ ...editForm, userDetails: { ...editForm.userDetails, lastName: e.target.value } })} />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block">Số điện thoại</label>
                  <input type="text" className="lv-input" value={editForm.userDetails?.phoneNumber} onChange={e => setEditForm({ ...editForm, userDetails: { ...editForm.userDetails, phoneNumber: e.target.value } })} />
                </div>
              </div>
              <div className="flex gap-4 pt-12">
                <button type="button" onClick={() => setIsEditing(false)} className="luxury-btn luxury-btn-outline flex-1 py-3 text-[10px]">Hủy bỏ</button>
                <button type="submit" className="luxury-btn flex-1 py-3 text-[10px]">Lưu thông tin</button>
              </div>
            </div>
          </form>
        ) : isChangingPassword ? (
          <form onSubmit={handleChangePasswordSubmit} className="max-w-md mx-auto space-y-6 fade-in border border-neutral-100 p-8 bg-white rounded-2xl shadow-sm">
            <h3 className="text-2xl font-serif mb-6 text-center">Đổi mật khẩu tài khoản</h3>
            {passwordError && (
              <div className="p-4 bg-red-50 text-red-600 text-xs font-medium border border-red-100 mb-6">
                {passwordError}
              </div>
            )}
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block">Mật khẩu hiện tại</label>
              <input
                type="password"
                className="lv-input"
                value={passwordForm.currentPassword}
                onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block">Mật khẩu mới</label>
              <input
                type="password"
                className="lv-input"
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                className="lv-input"
                value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                required
              />
            </div>
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordError('');
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="luxury-btn luxury-btn-outline flex-1 py-3 text-[10px]"
                disabled={passwordLoading}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="luxury-btn flex-1 py-3 text-[10px] justify-center font-bold"
                disabled={passwordLoading}
              >
                {passwordLoading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col">
            {/* 1. Basic Info Section - Moved to Top */}
            <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
              <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-neutral-100 shadow-sm relative group shrink-0">
                <img src={getAvatarUrl(user.userDetails?.avatar, user.userName)} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => setIsEditing(true)}>
                  <Camera className="text-white" size={20} />
                </div>
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-3xl font-bold mb-1 tracking-tight">{user.userName}</h3>
                <p className="text-sm text-neutral-400 font-medium">{user.userDetails?.email}</p>
                <button onClick={() => setIsEditing(true)} className="mt-4 text-[10px] uppercase tracking-widest font-bold text-neutral-400 hover:text-black transition-colors flex items-center gap-2">
                  Chỉnh sửa thông tin <Plus size={12} />
                </button>
              </div>
            </div>

            {/* 2. Membership Card Section - Smaller & Refined */}
            <div className="my-12">
              {(() => {
                const tier = user.userDetails?.membershipTier?.tierName?.toLowerCase() || '';
                let config = {
                  bg: 'linear-gradient(135deg, #2c1810 0%, #4a2c2a 100%)', // Bronze default
                  icon: <div className="w-10 h-10 rounded-full bg-orange-800/40 border border-orange-500/30 flex items-center justify-center shadow-lg"><div className="w-5 h-5 rounded-full bg-orange-400" /></div>,
                  accent: '#fb923c'
                };

                if (tier.includes('silver')) {
                  config = {
                    bg: 'linear-gradient(135deg, #374151 0%, #111827 100%)',
                    icon: <div className="w-10 h-10 rounded-full bg-gray-400/20 border border-gray-300/30 flex items-center justify-center shadow-lg"><div className="w-5 h-5 rounded-full bg-gray-200" /></div>,
                    accent: '#e5e7eb'
                  };
                } else if (tier.includes('gold')) {
                  config = {
                    bg: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)',
                    icon: <div className="w-10 h-10 rounded-full bg-yellow-400/20 border border-yellow-200/30 flex items-center justify-center shadow-lg"><div className="w-5 h-5 rounded-full bg-yellow-400" /></div>,
                    accent: '#facc15'
                  };
                } else if (tier.includes('platinum')) {
                  config = {
                    bg: 'linear-gradient(135deg, #111827 0%, #312e81 100%)',
                    icon: <div className="w-10 h-10 rounded-full bg-indigo-400/20 border border-indigo-200/30 flex items-center justify-center shadow-lg"><div className="w-5 h-5 rounded-full bg-indigo-300" /></div>,
                    accent: '#a5b4fc'
                  };
                }

                return (
                  <div className="w-full max-w-md">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={{
                        background: config.bg,
                        minHeight: '260px',
                        borderRadius: '40px',
                        overflow: 'hidden',
                        position: 'relative',
                        color: 'white',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                      }}
                    >
                      {/* Decorative Gloss */}
                      <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '50%', filter: 'blur(40px)', transform: 'translate(40%, -40%)' }} />

                      <div style={{ padding: '40px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', zIndex: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <p style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.4em', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', fontWeight: 'bold' }}>Thẻ Thành Viên</p>
                            <h3 style={{ fontSize: '20px', fontFamily: 'serif', letterSpacing: '0.15em', textTransform: 'uppercase', lineHeight: '1.2' }}>
                              {user.userDetails?.membershipTier?.tierName || 'Standard Member'}
                            </h3>
                          </div>
                          {config.icon}
                        </div>

                        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
                              <div>
                                <p style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', marginBottom: '4px' }}>Tổng chi tiêu</p>
                                <p style={{ fontSize: '24px', fontWeight: '500', letterSpacing: '-0.02em' }}>{totalSpending.toLocaleString()} ₫</p>
                              </div>
                              {nextTier && (
                                <div style={{ textAlign: 'right' }}>
                                  <p style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', marginBottom: '4px' }}>Mục tiêu: {nextTier.tierName}</p>
                                  <p style={{ fontSize: '10px', fontWeight: 'bold' }}>Còn {(nextTier.minSpending - totalSpending).toLocaleString()} ₫</p>
                                </div>
                              )}
                            </div>
                            {nextTier && (
                              <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progress}%` }}
                                  transition={{ duration: 1.5, ease: "easeOut" }}
                                  style={{ height: '100%', backgroundColor: config.accent, boxShadow: `0 0 10px ${config.accent}80` }}
                                />
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.7)' }}>
                              <CheckCircle2 size={12} style={{ opacity: 0.6 }} /> Giảm {user.userDetails?.membershipTier?.discountPercent || 0}%
                            </div>
                            {user.userDetails?.membershipTier?.freeShipping && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.7)' }}>
                                <CheckCircle2 size={12} style={{ opacity: 0.6 }} /> Freeship
                              </div>
                            )}
                            {user.userDetails?.membershipTier?.priorityFlashSale && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.7)' }}>
                                <CheckCircle2 size={12} style={{ opacity: 0.6 }} /> Priority
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Watermark Name */}
                      <div style={{ position: 'absolute', bottom: '32px', right: '40px', opacity: 0.03, pointerEvents: 'none', userSelect: 'none' }}>
                        <p style={{ fontSize: '48px', fontFamily: 'serif', fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '-0.05em' }}>{user.userName}</p>
                      </div>
                    </motion.div>
                  </div>
                );
              })()}
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-neutral-100 pt-12">
              <div className="space-y-6">
                <h4 className="text-xs uppercase tracking-widest font-bold border-b border-neutral-100 pb-4">Thông tin cá nhân</h4>
                <div className="space-y-4">
                  <div><p className="text-[10px] uppercase opacity-40 mb-1">Họ & Tên</p><p className="font-medium">{user.userDetails?.firstName} {user.userDetails?.lastName}</p></div>
                  <div><p className="text-[10px] uppercase opacity-40 mb-1">Email liên hệ</p><p className="font-medium">{user.userDetails?.email}</p></div>
                </div>
              </div>
              <div className="space-y-6">
                <h4 className="text-xs uppercase tracking-widest font-bold border-b border-neutral-100 pb-4">Bảo mật & Cài đặt</h4>
                <div className="flex flex-col gap-4">
                  <button onClick={() => setIsEditing(true)} className="flex items-center justify-between p-4 bg-white border border-neutral-100 rounded-xl hover:border-black transition-all text-left">
                    <div><p className="text-xs font-bold mb-0.5">Chỉnh sửa thông tin</p><p className="text-[10px] opacity-40">Cập nhật tên, số điện thoại, ảnh đại diện</p></div>
                    <ArrowRight size={16} />
                  </button>
                  <button onClick={() => setIsChangingPassword(true)} className="flex items-center justify-between p-4 bg-white border border-neutral-100 rounded-xl hover:border-black transition-all text-left">
                    <div><p className="text-xs font-bold mb-0.5">Đổi mật khẩu</p><p className="text-[10px] opacity-40">Cập nhật mật khẩu mới cho tài khoản</p></div>
                    <ArrowRight size={16} />
                  </button>
                  <button onClick={() => { localStorage.removeItem('user'); setUser(null); navigate('/'); }} className="flex items-center justify-between p-4 bg-red-50/50 border border-red-100 rounded-xl hover:bg-red-50 transition-all text-left">
                    <div><p className="text-xs font-bold text-red-600 mb-0.5">Đăng xuất</p><p className="text-[10px] text-red-600 opacity-40">Kết thúc phiên làm việc hiện tại</p></div>
                    <ArrowRight size={16} className="text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FlashSaleItemComponent = ({ item, navigate, getImgUrl }: any) => {
  const progress = (item.initialQuantity - item.availableQuantity) / item.initialQuantity * 100;
  const discount = Math.round((1 - item.flashPrice / item.product.price) * 100);
  const isSoldOut = item.availableQuantity <= 0;

  return (
    <div
      className={`group relative bg-white border border-neutral-100 overflow-hidden hover:shadow-lg transition-all duration-500 cursor-pointer flex flex-col h-full ${isSoldOut ? 'opacity-70' : ''}`}
      onClick={() => navigate(`/product/${item.product.id}?flashSaleItemId=${item.id}`)}
    >
      <div className="relative aspect-[1/1] overflow-hidden bg-neutral-50 flex-shrink-0">
        <img src={getImgUrl(item.product.image)} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-700" alt="" />
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-rose-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-sm">
            -{discount}%
          </div>
        )}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-serif italic text-lg tracking-widest">Sold Out</span>
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-[10px] uppercase tracking-wider font-bold mb-1 line-clamp-1 opacity-70 min-h-[1.2em]">{item.product.productName}</h3>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-rose-600 font-bold text-sm">{Number(item.flashPrice).toLocaleString()} ₫</span>
          <span className="text-neutral-400 text-[10px] line-through">{Number(item.product.price).toLocaleString()} ₫</span>
        </div>

        <div className="mt-auto space-y-1.5">
          <div className="flex justify-between text-[8px] uppercase tracking-tighter">
            <span className="opacity-50">Đã bán {item.initialQuantity - item.availableQuantity}</span>
            <span className="font-bold">{Math.round(progress)}%</span>
          </div>
          <div className="h-1 w-full bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-600 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const FlashSaleSection = ({ flashSales, navigate, getImgUrl, onRefresh }: any) => {
  const activeSale = flashSales.find((fs: any) => fs.status === 'Active' || fs.status === 'Upcoming');

  useEffect(() => {
    if (activeSale && activeSale.status === 'Upcoming') {
      const timeToStart = new Date(activeSale.startTime).getTime() - new Date().getTime();
      if (timeToStart > 0 && timeToStart < 3600000) { // If starting within 1 hour
        const timer = setTimeout(onRefresh, timeToStart + 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [activeSale, onRefresh]);

  if (!activeSale) return null;

  return (
    <section className="container py-20 border-b border-neutral-100 bg-neutral-50/30">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-[1px] bg-rose-600" />
            <span className="text-rose-600 text-[9px] uppercase font-bold tracking-[0.3em]">Flash Deal</span>
          </div>
          <h2 className="text-4xl font-serif">{activeSale.title}</h2>
        </div>
        <CountdownTimer
          targetDate={activeSale.status === 'Upcoming' ? activeSale.startTime : activeSale.endTime}
          status={activeSale.status}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {activeSale.items.map((item: any) => (
          <FlashSaleItemComponent key={item.id} item={item} navigate={navigate} getImgUrl={getImgUrl} />
        ))}
      </div>
    </section>
  );
};

const CountdownTimer = ({ targetDate, status }: { targetDate: string, status: string }) => {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const update = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ h: 0, m: 0, s: 0 });
      } else {
        setTimeLeft({
          h: Math.floor(diff / (1000 * 60 * 60)),
          m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((diff % (1000 * 60)) / 1000)
        });
      }
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex flex-col items-start md:items-end gap-3">
      <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-40">
        {status === 'Upcoming' ? 'Chương trình bắt đầu sau' : 'Kết thúc sau'}
      </span>
      <div className="flex gap-4">
        {[
          { label: 'Giờ', val: timeLeft.h },
          { label: 'Phút', val: timeLeft.m },
          { label: 'Giây', val: timeLeft.s }
        ].map((t, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="text-3xl font-serif bg-neutral-50 w-16 h-16 flex items-center justify-center rounded-sm border border-neutral-100 shadow-sm">
              {String(t.val).padStart(2, '0')}
            </div>
            <span className="text-[8px] uppercase tracking-widest mt-2 opacity-40 font-bold">{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const App = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [selectedCartIds, setSelectedCartIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('selectedCartIds');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [user, setUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [banners, setBanners] = useState<any[]>([]);
  const [flashSales, setFlashSales] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [storeInfo, setStoreInfo] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeBanner, setActiveBanner] = useState(0);
  const isSubmittingRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000); // Polling every minute
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const [notifResp, countResp] = await Promise.all([
        axios.get(ENDPOINTS.userNotifications(user.id)),
        axios.get(ENDPOINTS.unreadNotificationsCount(user.id))
      ]);
      setNotifications(notifResp.data);
      setUnreadCount(countResp.data);
    } catch (e) { console.error("Failed to fetch notifications", e); }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await axios.post(ENDPOINTS.markNotificationRead(id));
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) { console.error(e); }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await axios.post(ENDPOINTS.markAllNotificationsRead(user.id));
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (user?.userDetails?.membershipTier?.tierName) {
      const lastTier = localStorage.getItem('lastTier');
      if (lastTier && lastTier !== user.userDetails.membershipTier.tierName) {
        setToast(`Chúc mừng! Bạn đã thăng hạng lên ${user.userDetails.membershipTier.tierName}! 🎉`);
      }
      localStorage.setItem('lastTier', user.userDetails.membershipTier.tierName);
    }
  }, [user?.userDetails?.membershipTier?.tierName]);

  useEffect(() => {
    localStorage.setItem('selectedCartIds', JSON.stringify(selectedCartIds));
  }, [selectedCartIds]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const responseCode = params.get('vnp_ResponseCode');
    if (responseCode) {
      if (responseCode === '00') {
        const callbackUrl = `${API_BASE_URL}/shop/vnpay-callback${window.location.search}`;
        axios.get(callbackUrl)
          .then(() => {
            setPaymentStatus('success');
            setCart([]);
            setSelectedCartIds([]);
            window.history.replaceState({}, document.title, "/");
            setTimeout(() => {
              setPaymentStatus(null);
              navigate('/');
            }, 5000);
          })
          .catch(() => setPaymentStatus('failed'));
      } else {
        setPaymentStatus('failed');
        window.history.replaceState({}, document.title, "/");
        setTimeout(() => setPaymentStatus(null), 3000);
      }
    }
  }, []);

  const refreshUser = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/accounts/users?name=${user.userName}`);
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (err) {
      console.error("Failed to refresh user", err);
    }
  };

  const fetchData = async () => {
    try {
      const [prodResp, catResp, brandListResp, bannerResp, flashResp, collectionResp, storeResp] = await Promise.all([
        axios.get(ENDPOINTS.products),
        axios.get(ENDPOINTS.categories),
        axios.get(ENDPOINTS.brands).catch(() => ({ data: [] })),
        axios.get(ENDPOINTS.banners).catch(() => ({ data: [] })),
        axios.get(ENDPOINTS.flashSales).catch(() => ({ data: [] })),
        axios.get(ENDPOINTS.collections).catch(() => ({ data: [] })),
        axios.get(ENDPOINTS.storeInfo).catch(() => ({ data: null }))
      ]);
      setProducts(prodResp.data);
      setCategories(catResp.data);
      setBrands(brandListResp.data);
      setBanners(bannerResp.data);
      setFlashSales(flashResp.data);
      setCollections(collectionResp.data);
      setStoreInfo(storeResp.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(() => {
        setActiveBanner(prev => (prev + 1) % banners.length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [banners.length]);

  const nextBanner = () => {
    if (banners.length > 0) setActiveBanner(prev => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    if (banners.length > 0) setActiveBanner(prev => (prev - 1 + banners.length) % banners.length);
  };

  const getImgUrl = (img: string | undefined) => {
    if (!img) return "https://images.unsplash.com/photo-1548036627-19fefb0179af?q=80&w=2070&auto=format&fit=crop";
    if (img.startsWith("http")) return img;
    return `${API_BASE_URL}/catalog/products/images/${img}`;
  };

  const addToCart = (p: Product, quantity: number = 1, size?: string, color?: string, flashSaleItem?: any) => {
    let targetIndex = -1;
    setCart(prev => {
      const existingIndex = prev.findIndex(i =>
        i.product.id === p.id &&
        i.selectedSize === size &&
        i.selectedColor === color &&
        i.flashSaleItemId === flashSaleItem?.id
      );

      if (existingIndex > -1) {
        const existingItem = prev[existingIndex];
        const newTotalQty = existingItem.quantity + quantity;

        const maxQty = flashSaleItem ? flashSaleItem.availableQuantity : p.availability;
        if (newTotalQty > maxQty) {
          alert(`Sản phẩm này chỉ còn ${maxQty} cái.`);
          return prev;
        }

        const newCart = [...prev];
        newCart[existingIndex] = { ...existingItem, quantity: newTotalQty };
        targetIndex = existingIndex;
        return newCart;
      }

      const maxQty = flashSaleItem ? flashSaleItem.availableQuantity : p.availability;
      if (quantity > maxQty) {
        alert(`Sản phẩm này chỉ còn ${maxQty} cái.`);
        return prev;
      }

      targetIndex = prev.length;
      return [...prev, {
        product: p,
        quantity,
        selectedSize: size,
        selectedColor: color,
        flashSaleItemId: flashSaleItem?.id,
        flashPrice: flashSaleItem?.flashPrice
      }];
    });

    // Cập nhật selectedCartIds dựa trên index
    setTimeout(() => {
      setSelectedCartIds(prev => {
        if (targetIndex !== -1 && !prev.includes(targetIndex)) {
          return [...prev, targetIndex];
        }
        return prev;
      });
    }, 0);

    setToast(`Đã thêm ${p.productName} vào túi thành công.`);
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart(prev => prev.map((item, i) => {
      if (i === index) {
        const newQty = item.quantity + delta;
        if (newQty < 1) return item;
        if (newQty > item.product.availability) {
          alert(`Chỉ còn ${item.product.availability} cái trong kho.`);
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
    setSelectedCartIds(prev => {
      return prev
        .filter(i => i !== index)
        .map(i => (i > index ? i - 1 : i));
    });
  };

  const toggleSelectItem = (index: number) => {
    setSelectedCartIds(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };

  const selectedItems = cart.filter((_, i) => selectedCartIds.includes(i));
  const totalPrice = selectedItems.reduce((t, i) => t + (i.flashPrice || i.product.price) * i.quantity, 0);

  const handleCheckout = async (payload: any) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    try {
      const res = await axios.post(ENDPOINTS.orders, payload);
      const order = res.data;

      // Clear cart items that were selected for this order immediately
      setCart(prev => prev.filter((_, i) => !selectedCartIds.includes(i)));
      setSelectedCartIds([]);

      if (payload.paymentMethod === 'VNPAY') {
        const vnpayRes = await axios.get(`${ENDPOINTS.orders}/${order.id}/vnpay-url`);
        if (vnpayRes.data.url) {
          window.location.href = vnpayRes.data.url;
          return;
        }
      }

      navigate('/orders');
    } catch (e) {
      throw e;
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const Home = () => (
    <div>
      <section className="hero-slider group">
        <AnimatePresence mode="wait">
          {banners.length > 0 ? (
            banners.map((banner, index) => index === activeBanner && (
              <motion.div
                key={banner.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                className="hero-slide"
              >
                <img src={banner.imageUrl} className="hero-image" alt={banner.title} />
                <div className="absolute inset-0 bg-black/10" />
                <div className="hero-content">
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-[10px] uppercase tracking-[0.4em] mb-4 font-bold"
                  >
                    {banner.subtitle || "CAM TU"}
                  </motion.p>
                  <motion.h1
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-6xl lg:text-8xl font-serif mb-10 leading-tight"
                  >
                    {banner.title || "Vẻ Đẹp Vĩnh Cửu"}
                  </motion.h1>
                  {banner.linkUrl && (
                    <motion.button
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.9 }}
                      onClick={() => navigate(banner.linkUrl)}
                      className="luxury-btn luxury-btn-outline text-white border-white hover:bg-white hover:text-black"
                    >
                      Khám phá ngay <ArrowRight size={16} />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="hero-slide">
              <img src="https://images.unsplash.com/photo-1548036627-19fefb0179af?q=80&w=2070&auto=format&fit=crop" className="hero-image" alt="Default" />
              <div className="hero-content">
                <p className="text-[10px] uppercase tracking-[0.4em] mb-4 font-bold">CAM TU</p>
                <h1 className="text-6xl lg:text-8xl font-serif mb-10 leading-tight">Vẻ Đẹp Vĩnh Cửu</h1>
              </div>
            </div>
          )}
        </AnimatePresence>

        {banners.length > 1 && (
          <>
            <button
              onClick={prevBanner}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full text-white/20 hover:text-white transition-all duration-700 hidden md:flex"
            >
              <ChevronLeft size={32} strokeWidth={0.5} />
            </button>
            <button
              onClick={nextBanner}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full text-white/20 hover:text-white transition-all duration-700 hidden md:flex"
            >
              <ChevronRight size={32} strokeWidth={0.5} />
            </button>

            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex gap-3">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveBanner(i)}
                  className={`h-[2px] transition-all duration-500 ${i === activeBanner ? 'w-12 bg-white' : 'w-4 bg-white/30'}`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      <FlashSaleSection
        flashSales={flashSales}
        navigate={navigate}
        getImgUrl={getImgUrl}
        onRefresh={fetchData}
      />

      {/* Collection Banner Section */}
      {collections.length > 0 && (
        <section className="container py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-[500px] lg:h-[70vh] group overflow-hidden cursor-pointer rounded-xl shadow-2xl"
            onClick={() => navigate('/new-collection')}
          >
            <img
              src={collections[0].bannerUrl}
              alt={collections[0].name}
              className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-700 group-hover:opacity-80" />

            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center text-white text-center p-12 pb-20">
              <motion.span
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 0.8 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-[10px] uppercase tracking-[0.6em] font-bold mb-6"
              >
                The New Collection
              </motion.span>
              <motion.h2
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="text-5xl lg:text-7xl font-serif mb-10 tracking-widest uppercase"
              >
                {collections[0].name}
              </motion.h2>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
              >
                <button className="luxury-btn luxury-btn-outline !border-white !text-white hover:!bg-white hover:!text-black">
                  Khám phá bộ sưu tập <ArrowRight size={16} />
                </button>
              </motion.div>
            </div>
          </motion.div>
        </section>
      )}

      <section className="container py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif uppercase tracking-widest mb-4">Danh mục gợi ý</h2>
          <div className="flex justify-center gap-8 border-b border-neutral-100 pb-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`nav-link ${!selectedCategory ? 'border-b border-black' : 'opacity-40'}`}
            >
              Tất cả
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`nav-link ${selectedCategory === cat.name ? 'border-b border-black' : 'opacity-40'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="product-grid">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="product-card-luxury reveal"
              onClick={() => navigate(`/product/${p.id}`)}
            >
              <div className="img-container">
                <img src={getImgUrl(p.image)} alt={p.productName} />
              </div>
              <div className="product-info">
                <h3 className="product-name">{p.productName}</h3>
                <p className="product-price">{Number(p.price).toLocaleString()} ₫</p>
                <span className="product-sales">Đã bán {p.salesCount || 0}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Header
        user={user}
        cartCount={cart.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categories={categories}
        brands={brands}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllRead={handleMarkAllRead}
      />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onLogin={setUser} />} />
          <Route path="/register" element={<Register onRegister={setUser} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/cart" element={
            <div className="pt-header">
              <CartPage
                cart={cart}
                selectedCartIds={selectedCartIds}
                onUpdateQuantity={updateQuantity}
                onRemoveFromCart={removeFromCart}
                onToggleSelectItem={toggleSelectItem}
                onCheckout={() => user ? navigate('/checkout') : navigate('/login')}
                onBack={() => navigate('/')}
                getImgUrl={getImgUrl}
              />
            </div>
          } />
          <Route path="/checkout" element={
            user ? (
              <div className="pt-header">
                <Checkout
                  user={user}
                  items={selectedItems}
                  total={totalPrice}
                  onBack={() => navigate('/cart')}
                  onConfirm={handleCheckout}
                  refreshUser={refreshUser}
                />
              </div>
            ) : <Navigate to="/login" />
          } />
          <Route path="/orders" element={
            user ? (
              <div className="pt-header">
                <OrderHistory user={user} onBack={() => navigate('/')} getImgUrl={getImgUrl} />
              </div>
            ) : <Navigate to="/login" />
          } />
          <Route path="/order/:id" element={
            user ? (
              <div className="pt-header">
                <OrderDetailPage user={user} getImgUrl={getImgUrl} />
              </div>
            ) : <Navigate to="/login" />
          } />
          <Route path="/profile" element={<ProfileComponent user={user} setUser={setUser} navigate={navigate} setToast={setToast} />} />
          <Route path="/product/:id" element={
            <div className="pt-header">
              <ProductDetailComponent
                products={products}
                cartCount={cart.length}
                getImgUrl={getImgUrl}
                addToCart={addToCart}
                user={user}
                flashSales={flashSales}
              />
            </div>
          } />
          <Route path="/new-collection" element={<NewCollectionPage collections={collections} getImgUrl={getImgUrl} />} />
          <Route path="/category/:name" element={<CategoryPage products={products} getImgUrl={getImgUrl} />} />
          <Route path="/brand/:name" element={<BrandPage products={products} getImgUrl={getImgUrl} brands={brands} />} />
        </Routes>
      </main>

      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10000,
            backgroundColor: 'black',
            color: 'white',
            padding: '16px 32px',
            borderRadius: '50px',
            fontSize: '12px',
            fontWeight: 'bold',
            letterSpacing: '0.2em',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.2)',
            whiteSpace: 'nowrap'
          }}
        >
          <CheckCircle2 size={18} color="white" />
          {toast.toUpperCase()}
        </div>
      )}

      <AnimatePresence>
        {paymentStatus && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white p-12 max-w-sm w-full text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${paymentStatus === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {paymentStatus === 'success' ? <CheckCircle2 size={32} /> : <X size={32} />}
              </div>
              <h2 className="text-2xl font-serif mb-4 uppercase tracking-widest">
                {paymentStatus === 'success' ? "Thành công" : "Thất bại"}
              </h2>
              <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
                {paymentStatus === 'success'
                  ? "Đơn hàng của bạn đã được ghi nhận."
                  : "Giao dịch không thành công. Vui lòng thử lại."}
              </p>
              <button onClick={() => setPaymentStatus(null)} className="luxury-btn w-full">Đã hiểu</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ChatWidget user={user} />
      <Footer storeInfo={storeInfo} />
    </div>
  );
};

const ProductDetailComponent = ({ products, cartCount, getImgUrl, addToCart, user, flashSales }: any) => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const product = products.find((p: any) => p.id === Number(id));

  const queryParams = new URLSearchParams(location.search);
  const flashSaleItemId = queryParams.get('flashSaleItemId');

  let flashSaleItem: any = null;
  if (flashSaleItemId) {
    flashSales.forEach((fs: any) => {
      const found = fs.items?.find((i: any) => i.id === Number(flashSaleItemId));
      if (found) {
        flashSaleItem = { ...found, status: fs.status };
      }
    });
  }
  if (!product) return <div className="text-center py-40">Sản phẩm không tồn tại</div>;

  return (
    <ProductDetail
      product={product}
      cartCount={cartCount}
      onClose={() => navigate('/')}
      onOpenCart={() => navigate('/cart')}
      getImgUrl={getImgUrl}
      onAddToCart={addToCart}
      flashSaleItem={flashSaleItem}
      user={user}
      onBuyNow={(p: any, q: number, s?: string, c?: string, fs?: any) => {
        addToCart(p, q, s, c, fs);
        if (!user) navigate('/login');
        else navigate('/checkout');
      }}
    />
  );
};

const NewCollectionPage = ({ collections, getImgUrl }: any) => {
  const navigate = useNavigate();
  const collection = collections[0];

  if (!collection) return (
    <div className="pt-header min-h-screen flex items-center justify-center">
      <p className="text-sm uppercase tracking-widest opacity-30">Chưa có bộ sưu tập mới</p>
    </div>
  );

  return (
    <div className="pt-header min-h-screen pb-20 bg-white">
      {/* Premium Banner */}
      <section className="relative h-[60vh] lg:h-[75vh] mb-20 overflow-hidden">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          src={collection.bannerUrl}
          className="w-full h-full object-cover"
          alt={collection.name}
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-center"
          >
            <span className="text-[10px] uppercase tracking-[0.8em] font-bold mb-6 block opacity-70">Exclusively Curated</span>
            <h1 className="text-6xl lg:text-9xl font-serif tracking-[0.2em] uppercase mb-8 leading-none">{collection.name}</h1>
            <div className="flex items-center justify-center gap-8">
              <div className="w-16 h-[1px] bg-white/30" />
              <p className="text-xs uppercase tracking-widest font-light">Spring Summer 2026</p>
              <div className="w-16 h-[1px] bg-white/30" />
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-50">
          <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent" />
          <span className="text-[8px] uppercase tracking-[0.4em] text-white">Scroll</span>
        </div>
      </section>

      <div className="container">
        <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-100 pb-10">
          <div>
            <h2 className="text-sm uppercase tracking-[0.4em] font-bold mb-4">Danh mục bộ sưu tập</h2>
            <div className="flex items-center gap-4 text-neutral-400 text-[10px] uppercase tracking-widest">
              <span>{collection.products?.length || 0} Pieces</span>
              <span className="w-1 h-1 bg-neutral-300 rounded-full" />
              <span>Limited Edition</span>
            </div>
          </div>
          <div className="mt-8 md:mt-0 flex gap-4">
            {/* Filter buttons could go here */}
          </div>
        </div>

        <div className="product-grid">
          {collection.products?.map((p: any) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              onClick={() => navigate(`/product/${p.id}`)}
              className="group cursor-pointer"
            >
              <div className="aspect-[4/5] bg-neutral-50 mb-4 overflow-hidden relative">
                <img
                  src={getImgUrl(p.image)}
                  alt={p.productName}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                <button className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-bold uppercase tracking-widest px-6 py-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                  Xem chi tiết
                </button>
              </div>
              <h3 className="text-[10px] uppercase font-bold tracking-widest mb-1">{p.productName}</h3>
              <p className="text-xs font-medium text-neutral-500">{Number(p.price).toLocaleString()} ₫</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BrandPage = ({ products, getImgUrl, brands }: any) => {
  const { name } = useParams();
  const navigate = useNavigate();

  const brand = (brands || []).find((b: any) => b.name === name);
  const filtered = products.filter((p: any) => {
    if (brand && p.brandId === brand.id) return true;
    return p.brand?.name === name;
  });

  return (
    <div className="pt-header min-h-screen pb-20 bg-white">
      <section className="container py-20">
        <div className="text-center mb-24">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] uppercase tracking-[0.5em] font-bold opacity-40 block mb-6"
          >
            Heritage Brands
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl lg:text-7xl font-serif tracking-[0.2em] uppercase"
          >
            {name}
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="w-20 h-[1px] bg-black mx-auto mt-10 opacity-20"
          />
        </div>

        {filtered.length > 0 ? (
          <div className="product-grid">
            {filtered.map((p: any) => (
              <div
                key={p.id}
                className="product-card-luxury reveal"
                onClick={() => navigate(`/product/${p.id}`)}
              >
                <div className="img-container">
                  <img src={getImgUrl(p.image)} alt={p.productName} />
                </div>
                <div className="product-info">
                  <h3 className="product-name">{p.productName}</h3>
                  <p className="product-price">{Number(p.price).toLocaleString()} ₫</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-neutral-400 uppercase tracking-widest text-xs">Không tìm thấy sản phẩm nào của thương hiệu này.</p>
          </div>
        )}
      </section>
    </div>
  );
};

const CategoryPage = ({ products, getImgUrl }: any) => {
  const { name } = useParams();
  const navigate = useNavigate();
  const filtered = products.filter((p: any) => p.category === name);

  return (
    <div className="pt-header min-h-screen pb-20 bg-white">
      <section className="container py-20">
        <div className="text-center mb-24">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] uppercase tracking-[0.5em] font-bold opacity-40 block mb-6"
          >
            Maison Collection
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl lg:text-7xl font-serif tracking-[0.2em] uppercase"
          >
            {name}
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="w-20 h-[1px] bg-black mx-auto mt-10 opacity-20"
          />
        </div>

        {filtered.length > 0 ? (
          <div className="product-grid">
            {filtered.map((p: any) => (
              <div
                key={p.id}
                className="product-card-luxury reveal"
                onClick={() => navigate(`/product/${p.id}`)}
              >
                <div className="img-container">
                  <img src={getImgUrl(p.image)} alt={p.productName} />
                </div>
                <div className="product-info">
                  <h3 className="product-name">{p.productName}</h3>
                  <p className="product-price">{Number(p.price).toLocaleString()} ₫</p>
                  <span className="product-sales">Đã bán {p.salesCount || 0}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-40 opacity-20">
            <p className="text-xs uppercase tracking-[0.3em]">Hiện chưa có sản phẩm nào trong danh mục này</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default App;
