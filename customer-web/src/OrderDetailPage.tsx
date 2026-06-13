import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Package, Clock, CreditCard, Truck, MapPin, ShieldCheck, ShoppingBag, Download } from 'lucide-react';
import { ENDPOINTS } from './api';
import type { Order } from './api';

interface OrderDetailPageProps {
  user: any;
  getImgUrl: (img: string | undefined) => string;
}

const OrderDetailPage: React.FC<OrderDetailPageProps> = ({ user, getImgUrl }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        console.log("Fetching order detail for ID:", id);
        const resp = await axios.get(ENDPOINTS.orderDetail(id!));
        console.log("Order Data Received:", resp.data);
        setOrder(resp.data);
      } catch (e) {
        console.warn("Dedicated detail endpoint failed, trying fallback...", e);
        try {
          const resp = await axios.get(ENDPOINTS.userOrders(user.userName));
          const foundOrder = resp.data.find((o: Order) => o.id === Number(id));
          if (foundOrder) {
            console.log("Order found via fallback:", foundOrder);
            setOrder(foundOrder);
          } else {
            setOrder(null);
          }
        } catch (fallbackError) {
          console.error("Fallback also failed", fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };
    if (id && user) fetchOrderDetail();
  }, [id, user]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PAID': return { color: '#10b981', text: 'Đã thanh toán', bg: '#10b98110', icon: ShieldCheck };
      case 'PENDING': return { color: '#f59e0b', text: 'Đang xử lý', bg: '#f59e0b10', icon: Clock };
      case 'SHIPPED': return { color: '#3b82f6', text: 'Đang giao hàng', bg: '#3b82f610', icon: Truck };
      case 'CANCELLED': return { color: '#ef4444', text: 'Đã hủy', bg: '#ef444410', icon: AlertCircle };
      default: return { color: '#6b7280', text: status, bg: '#6b728010', icon: Package };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-header">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin opacity-10" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-header px-6">
        <ShoppingBag size={64} className="opacity-10 mb-8" />
        <h2 className="text-2xl font-serif mb-4 uppercase tracking-widest">Không tìm thấy đơn hàng</h2>
        <button onClick={() => navigate('/orders')} className="luxury-btn">Quay lại lịch sử</button>
      </div>
    );
  }

  const info = getStatusInfo(order.status);
  const StatusIcon = info.icon;

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-40">
      <div className="bg-white border-b border-neutral-100 sticky top-header z-30">
        <div className="container max-w-6xl py-8">
          <button 
            onClick={() => navigate('/orders')}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-opacity mb-6"
          >
            <ChevronLeft size={16} /> Quay lại lịch sử
          </button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-4xl font-serif mb-2 tracking-tight">Chi tiết đơn hàng</h1>
              <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                <span>Mã đơn: #ORD-{order.id}</span>
                <span className="opacity-20">|</span>
                <span>Ngày đặt: {new Date(order.orderedDate).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 px-6 py-3 rounded-full border border-neutral-100 bg-white shadow-sm">
              <StatusIcon size={16} style={{ color: info.color }} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: info.color }}>
                {info.text}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mt-12 grid lg:grid-cols-3 gap-12">
        {/* Left Column: Products */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[32px] p-10 shadow-sm border border-neutral-100">
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] mb-10 pb-6 border-b border-neutral-50 flex justify-between">
              Sản phẩm đã chọn
              <span className="opacity-40">{order.items.length} món</span>
            </h3>
            
            <div className="divide-y divide-neutral-50">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => {
                  const productName = item.product?.productName || item.productName || 'Sản phẩm';
                  const price = item.product?.price || item.price || 0;
                  return (
                    <div key={idx} className="flex gap-8 py-8 first:pt-0 last:pb-0 group">
                      <div className="w-32 h-40 bg-neutral-50 rounded-2xl overflow-hidden flex-shrink-0 border border-neutral-100">
                        <img 
                          src={getImgUrl(item.product?.image || item.image)} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                          alt="" 
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-2">
                        <div>
                          <h4 className="text-xl font-medium tracking-tight mb-3">{productName}</h4>
                          <div className="flex flex-wrap gap-4">
                            <div className="px-4 py-1.5 bg-neutral-50 rounded-full text-[10px] font-bold uppercase tracking-widest text-neutral-400 border border-neutral-100">
                              Số lượng: {item.quantity}
                            </div>
                            {item.selectedSize && (
                              <div className="px-4 py-1.5 bg-neutral-50 rounded-full text-[10px] font-bold uppercase tracking-widest text-neutral-400 border border-neutral-100">
                                Size: {item.selectedSize}
                              </div>
                            )}
                            {item.selectedColor && (
                              <div className="px-4 py-1.5 bg-neutral-50 rounded-full text-[10px] font-bold uppercase tracking-widest text-neutral-400 border border-neutral-100">
                                Màu: {item.selectedColor}
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-xl font-bold">{(Number(price) * item.quantity).toLocaleString()} ₫</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-20 text-center opacity-40 italic">
                  Không tìm thấy chi tiết sản phẩm trong đơn hàng này.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Info & Summary */}
        <div className="space-y-8">
          {/* Shipping & Payment */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-neutral-100">
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] mb-8">Thông tin vận chuyển</h3>
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-neutral-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-neutral-100">
                  <MapPin size={18} className="opacity-40" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Địa chỉ giao hàng</p>
                  <p className="text-sm font-medium leading-relaxed">
                    {user.userDetails?.firstName} {user.userDetails?.lastName}<br />
                    {user.userDetails?.streetNumber} {user.userDetails?.street}<br />
                    {user.userDetails?.locality}, {user.userDetails?.country}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start pt-6 border-t border-neutral-50">
                <div className="w-10 h-10 bg-neutral-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-neutral-100">
                  <CreditCard size={18} className="opacity-40" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Phương thức thanh toán</p>
                  <p className="text-sm font-medium">{order.paymentMethod || 'Tiền mặt (COD)'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-neutral-900 text-white rounded-[32px] p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
            
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] mb-10 text-white/40">Tổng quát hóa đơn</h3>
            <div className="space-y-4 mb-10">
              <div className="flex justify-between text-sm">
                <span className="opacity-40">Tạm tính</span>
                <span className="font-medium">{order.total.toLocaleString()} ₫</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-40">Phí vận chuyển</span>
                <span className="font-medium text-green-400 uppercase text-[10px] tracking-widest">Miễn phí</span>
              </div>
              <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                <span className="text-[11px] font-bold uppercase tracking-widest">Tổng thanh toán</span>
                <p className="text-4xl font-serif text-[var(--primary)] tracking-tighter">{order.total.toLocaleString()} ₫</p>
              </div>
            </div>

            <button className="w-full bg-white text-black py-5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[var(--primary)] hover:text-white transition-all">
              <Download size={16} /> Tải hóa đơn (PDF)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
