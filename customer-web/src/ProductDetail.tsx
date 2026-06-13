import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Star, Plus, ThumbsUp, Send, User, MessageSquare } from 'lucide-react';
import type { Product, Review } from './api';
import { ENDPOINTS } from './api';
import axios from 'axios';

interface ProductDetailProps {
  product: Product;
  cartCount: number;
  onClose: () => void;
  onAddToCart: (p: Product, quantity: number, size?: string, color?: string) => void;
  onBuyNow: (p: Product, quantity: number, size?: string, color?: string) => void;
  onOpenCart: () => void;
  getImgUrl: (img: string | undefined) => string;
  flashSaleItem?: any;
  user?: any;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ 
  product, 
  onClose, 
  onAddToCart, 
  onBuyNow, 
  getImgUrl,
  flashSaleItem,
  user
}) => {
  const [activeImg, setActiveImg] = React.useState(product.image);
  const [selectedSize, setSelectedSize] = React.useState<string | null>(null);
  const [selectedColor, setSelectedColor] = React.useState<string | null>(null);
  const [quantity, setQuantity] = React.useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, content: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  
  const images = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);
  const sizes = product.sizes ? product.sizes.split(',').map(s => s.trim()) : [];
  const colors = product.colors ? product.colors.split(',').map(c => c.trim()) : [];

  useEffect(() => {
    fetchReviews();
  }, [product.id]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${ENDPOINTS.reviews}/product/${product.id}`);
      setReviews(response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const selectedVariant = product.variants?.find(v => v.size === selectedSize && v.color === selectedColor);
  const isOutOfStock = selectedSize && selectedColor && (!selectedVariant || selectedVariant.stock <= 0);
  const maxAvailable = selectedVariant ? selectedVariant.stock : (product.variants && product.variants.length > 0 ? 0 : product.availability || 0);

  const handleAddToCart = () => {
    if (sizes.length > 0 && !selectedSize) {
      alert("Vui lòng chọn kích cỡ");
      return;
    }
    if (colors.length > 0 && !selectedColor) {
      alert("Vui lòng chọn màu sắc");
      return;
    }
    if (isOutOfStock) {
      alert("Xin lỗi, sự kết hợp Màu & Size này đã hết hàng.");
      return;
    }
    if (quantity > maxAvailable) {
      alert(`Chỉ còn ${maxAvailable} sản phẩm trong kho.`);
      return;
    }
    onAddToCart(product, quantity, selectedSize || undefined, selectedColor || undefined, flashSaleItem);
  };

  const handleBuyNow = () => {
    if (sizes.length > 0 && !selectedSize) {
      alert("Vui lòng chọn kích cỡ");
      return;
    }
    if (colors.length > 0 && !selectedColor) {
      alert("Vui lòng chọn màu sắc");
      return;
    }
    if (isOutOfStock) {
      alert("Xin lỗi, sự kết hợp Màu & Size này đã hết hàng.");
      return;
    }
    if (quantity > maxAvailable) {
      alert(`Chỉ còn ${maxAvailable} sản phẩm trong kho.`);
      return;
    }
    onBuyNow(product, quantity, selectedSize || undefined, selectedColor || undefined, flashSaleItem);
  };



  const incrementQty = () => {
    if (quantity < maxAvailable) setQuantity(q => q + 1);
    else alert(`Đã đạt giới hạn tồn kho (${maxAvailable}) của biến thể này.`);
  };

  const handleSubmitReview = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập để gửi đánh giá.");
      return;
    }
    if (!newReview.content.trim()) {
      alert("Vui lòng nhập nội dung đánh giá.");
      return;
    }

    setSubmittingReview(true);
    try {
      const reviewData: Review = {
        productId: product.id!,
        userId: user.id,
        userName: user.fullName || user.userName,
        rating: newReview.rating,
        content: newReview.content
      };
      await axios.post(ENDPOINTS.reviews, reviewData);
      setNewReview({ rating: 5, content: '' });
      setShowReviewForm(false);
      fetchReviews();
      alert("Cảm ơn bạn đã đánh giá!");
    } catch (error: any) {
      alert(error.response?.data || "Không thể gửi đánh giá. Chỉ người đã mua hàng mới có thể đánh giá sản phẩm này.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const markUseful = async (reviewId: number) => {
    try {
      await axios.post(`${ENDPOINTS.reviews}/${reviewId}/useful`);
      fetchReviews();
    } catch (error) {
      console.error("Error marking useful:", error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="bg-white pt-[80px]"
    >
      <div className="lv-detail-container">
        {/* Left Side: Product Image Display */}
        <div className="lv-detail-image-section">
          <button onClick={onClose} className="back-btn-luxury">
            <ChevronLeft size={14} /> Quay lại
          </button>
          
          <div className="w-full h-full flex items-center justify-center p-6 lg:p-12">
            <motion.img 
              key={activeImg}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              src={getImgUrl(activeImg)} 
              className="lv-product-main-img" 
              alt={product.productName} 
            />
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4">
              {images.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImg(img)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${activeImg === img ? 'bg-black w-6' : 'bg-black/20'}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Sophisticated Info */}
        <div className="lv-detail-info-section">
          {(() => {
            const currentCount = reviews.length;
            const currentAverage = reviews.length > 0 
              ? Math.round((reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length) * 10) / 10 
              : product.averageRating || 0;
            
            return (
              <div className="max-w-[460px] w-full space-y-12">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-30">REF. {product.id}00{product.id}</p>
                    <div className="flex items-center gap-1">
                      <Star size={10} fill="black" />
                      <span className="text-[10px] font-bold tracking-widest">{currentAverage} / 5</span>
                      <span className="text-[10px] opacity-40">({currentCount})</span>
                    </div>
                  </div>
              <h1 className="text-4xl lg:text-5xl font-serif leading-tight tracking-tight">{product.productName}</h1>
              {flashSaleItem ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold text-rose-600">{Number(flashSaleItem.flashPrice).toLocaleString()} ₫</span>
                    <span className="text-lg text-neutral-400 line-through">{Number(product.price).toLocaleString()} ₫</span>
                    <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-1">FLASH SALE</span>
                  </div>
                </div>
              ) : (
                <p className="text-xl font-medium">{Number(product.price).toLocaleString()} ₫</p>
              )}
            </div>

            <div className="space-y-8">
              {sizes.length > 0 && (
                <div className="space-y-4">
                  <div className="border-b border-neutral-100 pb-4 flex justify-between items-center cursor-pointer">
                    <span className="text-[11px] uppercase tracking-widest font-bold">Kích cỡ: {selectedSize || 'Chọn'}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map(s => (
                      <button 
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-4 py-2 text-[10px] border transition-all ${selectedSize === s ? 'border-black bg-black text-white' : 'border-neutral-200 hover:border-black'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {colors.length > 0 && (
                <div className="space-y-4">
                  <div className="border-b border-neutral-100 pb-4 flex justify-between items-center cursor-pointer">
                    <span className="text-[11px] uppercase tracking-widest font-bold">Màu sắc: {selectedColor || 'Chọn'}</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {colors.map(c => (
                      <button 
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`px-6 py-2 text-[10px] uppercase tracking-widest border transition-all ${selectedColor === c ? 'border-black bg-black text-white' : 'border-neutral-200 hover:border-black'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="border-b border-neutral-100 pb-4 flex justify-between items-center">
                  <span className="text-[11px] uppercase tracking-widest font-bold">Số lượng</span>
                  <div className="flex items-center gap-6 border border-neutral-200 px-4 py-2 rounded-full">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="opacity-40">-</button>
                    <span className="text-sm font-medium w-4 text-center">{quantity}</span>
                    <button onClick={incrementQty} className="opacity-40">+</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {isOutOfStock ? (
                <div className="bg-rose-50 text-rose-600 p-4 text-[10px] uppercase tracking-widest font-bold text-center border border-rose-100 rounded">
                  Hết hàng cho lựa chọn này
                </div>
              ) : (
                <>
                  <button 
                    onClick={handleBuyNow}
                    className="btn-buy-now hover:bg-neutral-800 shadow-lg"
                  >
                    Mua ngay
                  </button>
                  <button 
                    onClick={handleAddToCart}
                    className="btn-buy-now bg-white text-black border border-black hover:bg-black hover:text-white"
                  >
                    Thêm vào túi
                  </button>
                  <button 
                    onClick={() => {
                      const event = new CustomEvent('openChat', { detail: product });
                      window.dispatchEvent(event);
                    }}
                    className="w-full py-4 text-[10px] uppercase tracking-[0.2em] font-bold border border-neutral-100 hover:border-black flex items-center justify-center gap-3 transition-all"
                  >
                    <MessageSquare size={14} /> Chat với shop
                  </button>
                </>
              )}
            </div>

            {/* Product Description */}
            <div className="pt-10 border-t border-neutral-100">
              <p className="text-sm leading-relaxed text-neutral-500 font-light italic">
                {product.discription || "Một kiệt tác từ CTUS LUX, mang đậm dấu ấn di sản và phong cách hiện đại."}
              </p>
            </div>

            {/* REVIEWS SECTION */}
            <div className="pt-16 border-t border-neutral-100 space-y-12">
              <div className="flex justify-between items-end">
                <div className="space-y-2">
                  <h3 className="text-xl font-serif">Đánh giá & Nhận xét</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          size={12} 
                          fill={star <= Math.round(currentAverage) ? "black" : "none"} 
                          className={star <= Math.round(currentAverage) ? "" : "opacity-20"}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-bold tracking-widest uppercase opacity-40">
                      {currentCount} Nhận xét
                    </span>
                  </div>
                </div>
                {user && (
                  <button 
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="text-[10px] uppercase tracking-widest font-bold border-b border-black pb-1 hover:opacity-50 transition-all"
                  >
                    {showReviewForm ? 'Hủy bỏ' : 'Viết đánh giá'}
                  </button>
                )}
              </div>

              {showReviewForm && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="bg-neutral-50 p-8 rounded-2xl space-y-6"
                >
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Đánh giá của bạn</label>
                    <div className="flex gap-4">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => setNewReview({ ...newReview, rating: star })}>
                          <Star 
                            size={24} 
                            fill={star <= newReview.rating ? "black" : "none"} 
                            className={star <= newReview.rating ? "" : "opacity-20"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Nội dung nhận xét</label>
                    <textarea 
                      className="w-full bg-transparent border-b border-neutral-200 py-2 focus:border-black outline-none transition-all resize-none text-sm"
                      rows={3}
                      placeholder="Chia sẻ trải nghiệm của bạn..."
                      value={newReview.content}
                      onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                    />
                  </div>
                  <button 
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                    className="w-full bg-black text-white py-4 text-[10px] uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 disabled:opacity-30"
                  >
                    {submittingReview ? 'Đang gửi...' : <><Send size={12} /> Gửi đánh giá</>}
                  </button>
                </motion.div>
              )}

              <div className="space-y-12">
                {loadingReviews ? (
                  <div className="py-12 text-center opacity-40 text-xs uppercase tracking-widest">Đang tải đánh giá...</div>
                ) : reviews.length === 0 ? (
                  <div className="py-12 text-center opacity-40 text-xs uppercase tracking-widest">Chưa có đánh giá nào cho sản phẩm này.</div>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="space-y-4 group">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
                            <User size={14} className="opacity-40" />
                          </div>
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider">{rev.userName}</p>
                            <p className="text-[9px] opacity-40">{new Date(rev.createdAt!).toLocaleDateString('vi-VN')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                              key={star} 
                              size={10} 
                              fill={star <= rev.rating ? "black" : "none"} 
                              className={star <= rev.rating ? "" : "opacity-20"}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-neutral-600 pl-11">{rev.content}</p>
                      {rev.reply && (
                        <div className="ml-11 bg-neutral-50 p-4 rounded-xl border-l-2 border-black">
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2">Phản hồi từ shop</p>
                          <p className="text-sm text-neutral-600">{rev.reply}</p>
                        </div>
                      )}
                      <div className="pl-11 flex gap-4">
                        <button 
                          onClick={() => markUseful(rev.id!)}
                          className="flex items-center gap-2 text-[10px] uppercase font-bold opacity-30 hover:opacity-100 transition-all"
                        >
                          <ThumbsUp size={12} /> Hữu ích ({rev.isUseful || 0})
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
              </div>
            );
          })()}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetail;
