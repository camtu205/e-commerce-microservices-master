import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Package, X, Star, Send } from 'lucide-react';
import { ENDPOINTS } from './api';
import type { Order } from './api';

interface OrderHistoryProps {
  user: any;
  onBack: () => void;
  getImgUrl: (img: string | undefined) => string;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ user, onBack, getImgUrl }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const resp = await axios.get(ENDPOINTS.userOrders(user.userName));
        const sortedOrders = resp.data.sort((a: any, b: any) => {
          return new Date(b.orderedDate).getTime() - new Date(a.orderedDate).getTime();
        });
        setOrders(sortedOrders);
      } catch (e) {
        console.error("Failed to fetch orders", e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PAID': return { color: '#10b981', text: 'Đã thanh toán', bg: '#10b98110' };
      case 'PENDING': return { color: '#f59e0b', text: 'Chờ xử lý', bg: '#f59e0b10' };
      case 'SHIPPED': return { color: '#3b82f6', text: 'Đang giao', bg: '#3b82f610' };
      case 'DELIVERED': return { color: '#8b5cf6', text: 'Đã giao hàng', bg: '#8b5cf610' };
      case 'COMPLETED': return { color: '#059669', text: 'Hoàn thành', bg: '#05966910' };
      case 'CANCELLED': return { color: '#ef4444', text: 'Đã hủy', bg: '#ef444410' };
      default: return { color: '#6b7280', text: status, bg: '#6b728010' };
    }
  };

  const filteredOrders = activeTab === 'ALL' 
    ? orders 
    : orders.filter(o => o.status === activeTab);

  const tabs = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'PENDING', label: 'Chờ xử lý' },
    { id: 'PAID', label: 'Đã thanh toán' },
    { id: 'SHIPPED', label: 'Đang giao' },
    { id: 'DELIVERED', label: 'Đã giao' },
    { id: 'COMPLETED', label: 'Hoàn thành' },
    { id: 'CANCELLED', label: 'Đã hủy' }
  ];

  return (
    <div className="min-h-screen pb-32">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-5xl mx-auto px-6 py-12"
      >
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-opacity mb-10"
        >
          <ChevronLeft size={16} /> Quay lại trang chủ
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2 tracking-tight">Lịch sử <span className="text-[var(--primary)]">mua hàng</span></h1>
            <p className="text-neutral-400 text-sm font-medium">Theo dõi các đơn hàng cao cấp của bạn.</p>
          </div>
          <div className="bg-white px-6 py-4 rounded-2xl border border-neutral-100 shadow-sm">
            <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Tổng đơn hàng</div>
            <div className="text-2xl font-bold tracking-tight">{orders.length}</div>
          </div>
        </div>

        <div className="flex bg-neutral-100 p-1.5 rounded-2xl mb-10 border border-black/5 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-black text-white shadow-lg' : 'hover:bg-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 opacity-10">
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mb-4" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-neutral-100 shadow-sm">
            <Package size={48} className="mx-auto mb-6 opacity-5" />
            <p className="opacity-40 text-sm font-bold uppercase tracking-widest">Không có đơn hàng nào</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map(order => {
              const info = getStatusInfo(order.status);
              return (
                <div 
                  key={order.id}
                  className="bg-white rounded-3xl p-8 shadow-sm border border-neutral-100 group"
                >
                  <div className="flex flex-wrap justify-between items-center gap-6 mb-8 pb-6 border-b border-neutral-50">
                    <div className="flex gap-8">
                      <div>
                        <p className="text-[8px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Mã đơn hàng</p>
                        <p className="font-bold text-base tracking-tight">#ORD-{order.id}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Ngày đặt</p>
                        <p className="font-bold text-base tracking-tight">{new Date(order.orderedDate).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                    <div className="px-4 py-2 rounded-full flex items-center gap-2 border" style={{ background: info.bg, borderColor: `${info.color}20` }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: info.color }} />
                      <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: info.color }}>{info.text}</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-8">
                    {order.items.slice(0, 2).map((item, idx) => (
                      <div key={idx} className="flex gap-6 items-start p-5 mb-3 bg-neutral-50/40 border border-neutral-100 rounded-2xl transition-all duration-300">
                        <div className="item-image-container !w-32 !h-40 overflow-hidden rounded-xl bg-neutral-50 flex-shrink-0 border border-neutral-100">
                          <img src={getImgUrl(item.product?.image || item.image)} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="item-info-main flex-1 py-2">
                          <h4 className="font-bold text-sm tracking-tight text-neutral-800 truncate-text">{item.product?.productName || item.productName || 'Sản phẩm'}</h4>
                          <div className="flex gap-3 mt-2">
                            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">SL: {item.quantity}</p>
                            {item.selectedSize && <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">• Size: {item.selectedSize}</p>}
                            {item.selectedColor && <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">• Màu: {item.selectedColor}</p>}
                          </div>
                        </div>
                        <div className="item-price-area text-right pt-2 pl-4">
                          <p className="font-bold text-base text-black">{(Number(item.product?.price || item.price || 0) * item.quantity).toLocaleString()} ₫</p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest pl-20 italic">... và {order.items.length - 2} sản phẩm khác</p>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-neutral-50">
                    <div>
                      <p className="text-[8px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Tổng cộng</p>
                      <p className="text-3xl font-bold text-red-600 tracking-tighter">{order.total.toLocaleString()} ₫</p>
                    </div>
                    <div className="flex gap-3">
                      {(order.status === 'DELIVERED' || order.status === 'COMPLETED') && (
                        <button 
                          onClick={() => setReviewOrder(order)}
                          className="px-8 py-4 bg-white text-black border border-neutral-200 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-neutral-50 transition-all"
                        >
                          Đánh giá
                        </button>
                      )}
                      <button 
                        onClick={() => navigate(`/order/${order.id}`)}
                        className="px-8 py-4 bg-black text-white rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-[var(--primary)] shadow-lg transition-all"
                      >
                        Chi tiết đơn hàng
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <AnimatePresence>
          {reviewOrder && (
            <ReviewModal 
              order={reviewOrder} 
              user={user} 
              onClose={() => setReviewOrder(null)} 
              getImgUrl={getImgUrl}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const ReviewModal: React.FC<{ order: Order, user: any, onClose: () => void, getImgUrl: (img: string | undefined) => string }> = ({ order, user, onClose, getImgUrl }) => {
  const [reviews, setReviews] = useState<any[]>(order.items.map(item => ({
    productId: (item.product as any)?.productId || (item as any)?.productId || item.product?.id,
    productName: item.product?.productName || item.productName,
    image: item.product?.image || item.image,
    rating: 5,
    content: ''
  })));
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      for (const r of reviews) {
        if (r.content.trim()) {
          await axios.post(ENDPOINTS.reviews, {
            productId: r.productId,
            userId: user.id,
            userName: user.fullName || user.userName,
            rating: r.rating,
            content: r.content,
            orderId: order.id
          });
        }
      }
      alert("Cảm ơn bạn đã đánh giá sản phẩm!");
      onClose();
    } catch (e: any) {
      alert(e.response?.data || "Lỗi khi gửi đánh giá");
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-8 border-b border-neutral-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Đánh giá <span className="text-[var(--primary)]">sản phẩm</span></h2>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Đơn hàng #ORD-{order.id}</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-neutral-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
          {reviews.map((r, idx) => (
            <div key={idx} className="space-y-6 pb-8 border-b border-neutral-50 last:border-0 last:pb-0">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-2xl bg-neutral-50 overflow-hidden flex-shrink-0 border border-neutral-100">
                  <img src={getImgUrl(r.image)} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate">{r.productName}</h4>
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        key={star} 
                        onClick={() => {
                          const newReviews = [...reviews];
                          newReviews[idx] = { ...newReviews[idx], rating: star };
                          setReviews(newReviews);
                        }}
                      >
                        <Star 
                          size={24} 
                          fill={star <= r.rating ? "black" : "none"} 
                          className={star <= r.rating ? "transition-all" : "opacity-20 transition-all"}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Nội dung nhận xét</label>
                <textarea 
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                  className="w-full bg-transparent border-b border-neutral-200 py-2 focus:border-black outline-none transition-all resize-none text-sm font-medium"
                  rows={3}
                  value={r.content}
                  onChange={(e) => {
                    const newReviews = [...reviews];
                    newReviews[idx] = { ...newReviews[idx], content: e.target.value };
                    setReviews(newReviews);
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 bg-neutral-50 border-t border-neutral-100">
          <button 
            disabled={submitting}
            onClick={handleSubmit}
            className="w-full py-5 bg-black text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all shadow-xl disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {submitting ? 'Đang gửi...' : <><Send size={12} /> Gửi tất cả đánh giá</>}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default OrderHistory;
