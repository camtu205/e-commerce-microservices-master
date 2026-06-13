import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ChevronLeft, ArrowRight, ShoppingBag } from 'lucide-react';
import type { CartItem } from './api';

interface CartPageProps {
  cart: CartItem[];
  selectedCartIds: number[];
  onUpdateQuantity: (index: number, delta: number) => void;
  onRemoveFromCart: (index: number) => void;
  onToggleSelectItem: (index: number) => void;
  onCheckout: () => void;
  onBack: () => void;
  getImgUrl: (img: string | undefined) => string;
}

const CartPage: React.FC<CartPageProps> = ({ 
  cart, 
  selectedCartIds, 
  onUpdateQuantity, 
  onRemoveFromCart, 
  onToggleSelectItem, 
  onCheckout,
  onBack,
  getImgUrl 
}) => {
  const selectedItems = cart.filter((_, idx) => selectedCartIds.includes(idx));
  const totalPrice = selectedItems.reduce((t, i) => t + (i.flashPrice || i.product.price) * i.quantity, 0);

  return (
    <div className="container py-20 min-h-screen">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity mb-12"
      >
        <ChevronLeft size={16} /> Quay lại mua sắm
      </button>

      <div className="flex flex-col lg:flex-row gap-20">
        <div className="flex-1">
          <h1 className="text-4xl font-serif mb-12 tracking-tight">Túi mua sắm của bạn</h1>

          {cart.length === 0 ? (
            <div className="py-20 text-center border-y border-neutral-100">
              <ShoppingBag size={48} className="mx-auto mb-6 opacity-10" />
              <p className="text-neutral-400 mb-8">Bạn hiện chưa có sản phẩm nào trong túi.</p>
              <button onClick={onBack} className="luxury-btn">Khám phá bộ sưu tập</button>
            </div>
          ) : (
            <div className="space-y-0 border-t border-neutral-100">
              {cart.map((item, idx) => (
                <div key={idx} className="flex items-center gap-8 py-8 border-b border-neutral-100">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 accent-black cursor-pointer"
                    checked={selectedCartIds.includes(idx)}
                    onChange={() => onToggleSelectItem(idx)}
                  />
                  
                  <div className="w-32 h-40 bg-[#f8f8f8] flex-shrink-0">
                    <img src={getImgUrl(item.product.image)} alt="" className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">{item.product.category}</p>
                      <h4 className="text-lg font-medium">{item.product.productName}</h4>
                      
                      <div className="flex gap-4 pt-2">
                        {item.selectedSize && (
                          <p className="text-[10px] uppercase tracking-widest font-bold">
                            Size: <span className="opacity-50">{item.selectedSize}</span>
                          </p>
                        )}
                        {item.selectedColor && (
                          <p className="text-[10px] uppercase tracking-widest font-bold">
                            Màu: <span className="opacity-50">{item.selectedColor}</span>
                          </p>
                        )}
                      </div>

                      {item.flashPrice ? (
                        <div className="flex items-center gap-2 pt-2">
                          <p className="text-sm text-rose-600 font-bold">Giá Flash Sale: {Number(item.flashPrice).toLocaleString()} ₫</p>
                          <p className="text-xs text-neutral-400 line-through">{Number(item.product.price).toLocaleString()} ₫</p>
                        </div>
                      ) : (
                        <p className="text-sm opacity-60 pt-2">Đơn giá: {Number(item.product.price).toLocaleString()} ₫</p>
                      )}
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center border border-neutral-200">
                        <button onClick={() => onUpdateQuantity(idx, -1)} className="w-10 h-10 flex items-center justify-center hover:bg-neutral-50"><Minus size={14} /></button>
                        <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(idx, 1)} className="w-10 h-10 flex items-center justify-center hover:bg-neutral-50"><Plus size={14} /></button>
                      </div>
                      
                      <div className="text-right min-w-[120px]">
                        <p className="text-lg font-medium">{( (item.flashPrice || Number(item.product.price)) * item.quantity).toLocaleString()} ₫</p>
                        <button 
                          onClick={() => onRemoveFromCart(idx)} 
                          className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-red-500 hover:text-red-700 transition-colors mt-2"
                        >
                          <Trash2 size={12} /> Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="w-full lg:w-[400px]">
            <div className="bg-[#f6f6f6] p-10 sticky top-32">
              <h3 className="text-xs uppercase tracking-widest font-bold mb-8">Tóm tắt đơn hàng</h3>
              <div className="space-y-6 mb-10">
                <div className="flex justify-between text-sm">
                  <span className="opacity-60">Sản phẩm ({selectedItems.length})</span>
                  <span>{totalPrice.toLocaleString()} ₫</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-60">Vận chuyển</span>
                  <span className="uppercase text-[10px] font-bold tracking-widest">Miễn phí</span>
                </div>
                <div className="pt-6 border-t border-neutral-200 flex justify-between items-end">
                  <span className="text-sm uppercase tracking-widest font-bold">Tổng cộng</span>
                  <p className="text-2xl font-serif">{totalPrice.toLocaleString()} ₫</p>
                </div>
              </div>

              <button 
                onClick={onCheckout}
                disabled={selectedItems.length === 0}
                className="luxury-btn w-full justify-between"
              >
                Thanh toán
                <ArrowRight size={18} />
              </button>
              <p className="text-center mt-6 text-[10px] uppercase tracking-widest opacity-20">Sản phẩm chính hãng từ CTUS LUX</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
