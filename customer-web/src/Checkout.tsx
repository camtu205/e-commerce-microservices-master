import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ChevronLeft, CreditCard, Truck, MapPin, ShieldCheck, CheckCircle2, ArrowRight, Tag, X, AlertTriangle, Award, QrCode } from 'lucide-react';
import type { CartItem, Address } from './api';

const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8900/api';

interface CheckoutProps {
  user: any;
  items: CartItem[];
  total: number;
  onBack: () => void;
  onConfirm: (payload: any) => Promise<void>;
  refreshUser: () => Promise<void>; // Added to refresh user data after adding address
}

const Checkout: React.FC<CheckoutProps> = ({ user, items, total, onBack, onConfirm, refreshUser }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('VNPAY');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [errorModal, setErrorModal] = useState<{show: boolean, title: string, message: string}>({show: false, title: '', message: ''});
  
  // Address States
  const [addresses, setAddresses] = useState<Address[]>(user.userDetails?.addresses || []);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(
    user.userDetails?.addresses?.find((a: Address) => a.isDefault) || user.userDetails?.addresses?.[0] || null
  );
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    recipientName: `${user.userDetails?.firstName || ''} ${user.userDetails?.lastName || ''}`.trim(),
    phoneNumber: user.userDetails?.phoneNumber || '',
    street: '',
    streetNumber: '',
    zipCode: '',
    locality: '',
    country: 'Việt Nam',
    isDefault: false
  });

  // Vietnamese Administrative Divisions states
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string>('');
  const [selectedWardCode, setSelectedWardCode] = useState<string>('');

  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>('');
  const [detailAddress, setDetailAddress] = useState<string>('');

  const formatAddress = (addr: Address) => {
    if (!addr) return '';
    const parts = [];
    if (addr.streetNumber) parts.push(addr.streetNumber);
    if (addr.street) parts.push(addr.street);
    if (addr.locality) parts.push(addr.locality);
    if (addr.country) parts.push(addr.country);
    return parts.filter(Boolean).join(', ');
  };

  // Load provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await axios.get('https://provinces.open-api.vn/api/');
        setProvinces(res.data);
      } catch (err) {
        console.error("Failed to fetch provinces", err);
      }
    };
    fetchProvinces();
  }, []);

  // Load districts when province code changes
  useEffect(() => {
    if (!selectedProvinceCode) {
      setDistricts([]);
      setWards([]);
      setSelectedDistrictCode('');
      setSelectedWardCode('');
      setSelectedDistrict('');
      setSelectedWard('');
      return;
    }
    const fetchDistricts = async () => {
      try {
        const res = await axios.get(`https://provinces.open-api.vn/api/p/${selectedProvinceCode}?depth=2`);
        setDistricts(res.data.districts || []);
      } catch (err) {
        console.error("Failed to fetch districts", err);
      }
    };
    fetchDistricts();
  }, [selectedProvinceCode]);

  // Load wards when district code changes
  useEffect(() => {
    if (!selectedDistrictCode) {
      setWards([]);
      setSelectedWardCode('');
      setSelectedWard('');
      return;
    }
    const fetchWards = async () => {
      try {
        const res = await axios.get(`https://provinces.open-api.vn/api/d/${selectedDistrictCode}?depth=2`);
        setWards(res.data.wards || []);
      } catch (err) {
        console.error("Failed to fetch wards", err);
      }
    };
    fetchWards();
  }, [selectedDistrictCode]);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedProvinceCode(code);
    const provinceObj = provinces.find(p => String(p.code) === code);
    setSelectedProvince(provinceObj ? provinceObj.name : '');
    
    // Clear child selections (Rule 3)
    setSelectedDistrictCode('');
    setSelectedDistrict('');
    setSelectedWardCode('');
    setSelectedWard('');
    setDistricts([]);
    setWards([]);
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedDistrictCode(code);
    const districtObj = districts.find(d => String(d.code) === code);
    setSelectedDistrict(districtObj ? districtObj.name : '');

    // Clear child selections (Rule 3)
    setSelectedWardCode('');
    setSelectedWard('');
    setWards([]);
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedWardCode(code);
    const wardObj = wards.find(w => String(w.code) === code);
    setSelectedWard(wardObj ? wardObj.name : '');
  };

  useEffect(() => {
    setAddresses(user.userDetails?.addresses || []);
    if (!selectedAddress && user.userDetails?.addresses?.length > 0) {
      const def = user.userDetails.addresses.find((a: any) => a.isDefault) || user.userDetails.addresses[0];
      setSelectedAddress(def);
    }
  }, [user]);

  const handleAddAddress = async () => {
    if (
      !newAddress.recipientName || 
      !newAddress.phoneNumber || 
      !selectedProvince || 
      !selectedDistrict || 
      !selectedWard || 
      !detailAddress
    ) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc!");
      return;
    }
    setIsAddingAddress(true);
    const addressToSave = {
      ...newAddress,
      country: selectedProvince,
      locality: selectedDistrict,
      street: selectedWard,
      streetNumber: detailAddress
    };
    try {
      // Use the standard gateway URL
      await axios.post(`${API_BASE_URL}/accounts/users/${user.id}/addresses`, addressToSave);
      await refreshUser();
      setShowAddressModal(false);
      setNewAddress({
        recipientName: `${user.userDetails?.firstName || ''} ${user.userDetails?.lastName || ''}`.trim(),
        phoneNumber: user.userDetails?.phoneNumber || '',
        street: '',
        streetNumber: '',
        zipCode: '',
        locality: '',
        country: 'Việt Nam',
        isDefault: false
      });
      // Reset dropdown states
      setSelectedProvinceCode('');
      setSelectedDistrictCode('');
      setSelectedWardCode('');
      setSelectedProvince('');
      setSelectedDistrict('');
      setSelectedWard('');
      setDetailAddress('');
    } catch (err) {
      console.error("Failed to add address", err);
      alert("Lỗi khi thêm địa chỉ mới.");
    } finally {
      setIsAddingAddress(false);
    }
  };

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/catalog/promotions`);
        const data = Array.isArray(res.data) ? res.data : [];
        const normalized = data.map((p: any) => ({
          ...p,
          applicableProducts: p.applicableProducts ? p.applicableProducts.split(',') : ['ALL']
        }));
        setAvailableCoupons(normalized.filter((p: any) => 
          new Date(p.validUntil) >= new Date(new Date().setHours(0,0,0,0)) &&
          (p.isUnlimited || p.usageLimit > 0)
        ));
      } catch (err) { console.error("Failed to fetch promos", err); }
    };
    fetchPromos();
  }, []);

  const shipFee = user.userDetails?.membershipTier?.freeShipping ? 0 : 15;
  const subTotal = total;
  
  // Membership Discount
  const membershipDiscountPercent = user.userDetails?.membershipTier?.discountPercent || 0;
  const membershipDiscountAmount = (subTotal * membershipDiscountPercent) / 100;

  // Coupon Discount
  let couponDiscountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.applicableProducts?.includes('ALL')) {
      couponDiscountAmount = (subTotal * appliedCoupon.discount) / 100;
    } else {
      const applicableItems = items.filter(item => 
        appliedCoupon.applicableProducts?.includes(item.product.id?.toString())
      );
      const applicableTotal = applicableItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      couponDiscountAmount = (applicableTotal * appliedCoupon.discount) / 100;
    }
  }

  const finalTotal = subTotal + shipFee - couponDiscountAmount - membershipDiscountAmount;

  const handleApplyCoupon = () => {
    setCouponError('');
    try {
      const codeToMatch = couponCode.trim().toUpperCase();
      const promo = availableCoupons.find((p: any) => p.code.toUpperCase() === codeToMatch);
      
      if (!promo) {
        setCouponError('Mã giảm giá không tồn tại.');
        return;
      }

      // Check date
      if (new Date(promo.validUntil) < new Date(new Date().setHours(0,0,0,0))) {
        setCouponError('Mã giảm giá đã hết hạn.');
        return;
      }

      // Check limit
      if (!promo.isUnlimited && promo.usageLimit <= 0) {
        setCouponError('Mã giảm giá đã hết lượt sử dụng.');
        return;
      }

      // Check if any product in cart is applicable
      if (!promo.applicableProducts?.includes('ALL')) {
        const hasApplicableProduct = items.some(item => 
          promo.applicableProducts?.includes(item.product.id?.toString())
        );
        if (!hasApplicableProduct) {
          setCouponError('Mã không áp dụng cho các sản phẩm trong giỏ hàng.');
          return;
        }
      }

      setAppliedCoupon(promo);
      setCouponCode('');
    } catch (err) {
      setCouponError('Lỗi kiểm tra mã.');
    }
  };

  const handleConfirm = async () => {
    if (loading) return;
    setLoading(true);

    if (!selectedAddress || !selectedAddress.recipientName || !selectedAddress.phoneNumber) {
      alert("Vui lòng chọn hoặc thêm địa chỉ nhận hàng trước khi thanh toán!");
      setLoading(false);
      return;
    }

    // Rule 5: Check Flash Sale again at checkout
    for (const item of items) {
      if (item.flashSaleItemId) {
        try {
          // Reserve flash sale stock/validate limit
          await axios.post(`${API_BASE_URL}/catalog/flash-sales/purchase/${item.flashSaleItemId}`, null, {
            params: { userId: user.userName, quantity: item.quantity }
          });
        } catch (err: any) {
          let errMsg = err.response?.data || "Sản phẩm Flash Sale đã hết hoặc hết thời gian.";
          let errTitle = "Giới hạn mua hàng";

          if (errMsg.includes("User purchase limit reached")) {
            errMsg = `Bạn đã đạt giới hạn mua sản phẩm này. Mỗi khách hàng chỉ được mua tối đa số lượng quy định trong chương trình Flash Sale.`;
          } else if (errMsg.includes("Flash Sale is not active") || errMsg.includes("not found")) {
            errTitle = "Hết khung giờ Flash Sale";
            errMsg = `Chương trình Flash Sale cho sản phẩm này đã kết thúc hoặc không còn hiệu lực. Giá sản phẩm đã được cập nhật về giá gốc. Vui lòng kiểm tra lại đơn hàng.`;
            
            // Revert price in the UI if possible, or just force them to check again
            // For now, we'll just stop and let them see the message.
          }

          setErrorModal({
            show: true,
            title: errTitle,
            message: errMsg,
            type: errMsg.includes("Flash Sale") ? 'EXPIRED' : 'LIMIT'
          } as any);
          setLoading(false);
          return; // Stop checkout
        }
      }
    }

    // Correct payload for Order microservice
    const payload = {
      status: "PENDING",
      total: finalTotal.toString(),
      orderedDate: new Date().toISOString().split('T')[0],
      items: items.map(i => ({
        quantity: i.quantity,
        subTotal: ((i.flashPrice || i.product.price) * i.quantity).toString(),
        product: { 
          id: i.product.id,
          productName: i.product.productName, 
          price: (i.flashPrice || i.product.price).toString(),
          image: i.product.image 
        },
        selectedSize: i.selectedSize,
        selectedColor: i.selectedColor
      })),
      user: { 
        id: user.id,
        userName: user.userName 
      },
      paymentMethod: paymentMethod,
      shippingRecipientName: selectedAddress.recipientName,
      shippingPhoneNumber: selectedAddress.phoneNumber,
      shippingAddress: formatAddress(selectedAddress)
    };

    try {
      await onConfirm(payload);
      if (paymentMethod !== 'VNPAY') {
        setSuccess(true);
      }
    } catch (error: any) {
      console.error("Order error details:", error);
      const errorMessage = error.response?.data || error.message || "Unknown error occurred";
      alert("Đặt hàng thất bại! \nChi tiết lỗi: " + errorMessage);
    } finally {
      if (paymentMethod !== 'VNPAY') {
        setLoading(false);
      }
    }
  };
  const handleCloseErrorModal = () => {
    if ((errorModal as any).type === 'EXPIRED') {
      try {
        // Explicitly clean up localStorage cart
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const cartData = JSON.parse(savedCart);
          const updatedCart = cartData.map((item: any) => {
            if (item.flashSaleItemId) {
              const { flashPrice, flashSaleItemId, ...rest } = item;
              return rest;
            }
            return item;
          });
          localStorage.setItem('cart', JSON.stringify(updatedCart));
        }
      } catch (e) { console.error(e); }
      
      window.location.reload(); 
    }
    setErrorModal({ ...errorModal, show: false });
  };


  if (success) {
    return (
      <div className="fixed inset-0 bg-white z-[300] flex items-center justify-center p-6 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-5xl font-bold mb-4 tracking-tighter">Đặt hàng <span className="text-green-500">Thành công!</span></h2>
          <p className="text-neutral-500 mb-12 max-w-sm mx-auto font-medium leading-relaxed">Cảm ơn bạn đã lựa chọn phong cách CTUS LUX. Tuyệt phẩm của bạn đang được chuẩn bị chu đáo.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-black text-white px-12 py-6 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-[var(--primary)] shadow-2xl transition-all active:scale-95"
          >
            Quay lại trang chủ
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      <nav className="sticky top-0 w-full z-50 glass py-5 px-10 flex justify-between items-center transition-all">
        <button onClick={onBack} className="flex items-center gap-3 font-bold text-[10px] uppercase tracking-[0.3em] hover:text-[var(--primary)] transition-colors">
          <ChevronLeft className="w-5 h-5" /> Quay lại
        </button>
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-30">Xác nhận thanh toán</span>
        <div className="w-20" />
      </nav>

      <div className="container max-w-7xl grid lg:grid-cols-3 gap-10 mt-10">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-neutral-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100"><MapPin className="w-5 h-5 text-neutral-400" /></div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight">Địa chỉ nhận hàng</h3>
                  <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Thông tin giao hàng chính thức</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddressModal(true)}
                className="text-[10px] font-bold uppercase tracking-widest text-[var(--primary)] hover:underline"
              >
                {addresses.length > 0 ? "Thay đổi" : "Thêm địa chỉ"}
              </button>
            </div>

            {selectedAddress ? (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100">
                  <p className="text-[8px] uppercase font-bold text-neutral-400 mb-2 tracking-widest">Người nhận</p>
                  <p className="font-bold text-base leading-normal">{selectedAddress.recipientName}</p>
                </div>
                <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100">
                  <p className="text-[8px] uppercase font-bold text-neutral-400 mb-2 tracking-widest">Số điện thoại</p>
                  <p className="font-bold text-base leading-normal">{selectedAddress.phoneNumber}</p>
                </div>
                <div className="md:col-span-2 p-6 bg-neutral-50 rounded-2xl border border-neutral-100">
                  <p className="text-[8px] uppercase font-bold text-neutral-400 mb-2 tracking-widest">Địa chỉ chi tiết</p>
                  <p className="font-bold text-base leading-relaxed">
                    {formatAddress(selectedAddress)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-10 border-2 border-dashed border-neutral-100 rounded-3xl text-center">
                <p className="text-neutral-400 text-sm mb-4">Bạn chưa có địa chỉ nhận hàng nào.</p>
                <button 
                  onClick={() => setShowAddressModal(true)}
                  className="bg-black text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest"
                >
                  Thêm địa chỉ ngay
                </button>
              </div>
            )}
          </section>

          {/* Payment Method */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-neutral-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100"><CreditCard className="w-5 h-5 text-neutral-400" /></div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">Phương thức thanh toán</h3>
                <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">An toàn & Bảo mật</p>
              </div>
            </div>
            <div className="grid gap-4">
              {[
                { id: 'VNPAY', icon: QrCode, title: 'Thanh toán VNPay', desc: 'QR-Code, Ví điện tử hoặc App Ngân hàng (Khuyên dùng)' },
                { id: 'COD', icon: Truck, title: 'Thanh toán khi nhận hàng', desc: 'Trả tiền mặt trực tiếp khi nhận và kiểm tra hàng' },
                { id: 'CARD', icon: CreditCard, title: 'Thẻ Quốc tế / ATM', desc: 'Thanh toán qua Visa, Mastercard hoặc Thẻ nội địa' }
              ].map(method => (
                <div 
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`relative flex items-center justify-between p-6 rounded-2xl border-2 cursor-pointer transition-all duration-500 ${
                    paymentMethod === method.id 
                    ? 'border-black bg-selected-payment shadow-2xl scale-[1.02]' 
                    : 'border-neutral-100 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center transition-colors bg-neutral-50">
                      <method.icon className={`w-6 h-6 ${paymentMethod === method.id ? 'text-black' : 'text-neutral-300'}`} />
                    </div>
                    <div>
                      <p className="font-bold text-lg tracking-tight text-black">
                        {method.title}
                      </p>
                      <p className="text-[11px] font-medium opacity-60 text-neutral-500">
                        {method.desc}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    paymentMethod === method.id ? 'border-[var(--primary)] bg-[var(--primary)]' : 'border-neutral-200'
                  }`}>
                    {paymentMethod === method.id && <CheckCircle2 size={14} className="text-black" />}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <section className="bg-white rounded-3xl p-8 shadow-xl border border-neutral-100 sticky top-32">
            <h3 className="text-xl font-bold mb-6 tracking-tight">Tóm tắt đơn hàng</h3>
            <div className="space-y-4 mb-8 max-h-[30vh] overflow-y-auto pr-2 no-scrollbar">
              {items.map((i, idx) => (
                <div key={idx} className="flex gap-6 items-start py-4 border-b border-neutral-100 last:border-b-0 group">
                  <div className="w-32 h-40 bg-neutral-50 rounded-xl overflow-hidden flex-shrink-0 border border-neutral-100">
                    <img src={i.product.image ? `${API_BASE_URL}/catalog/products/images/${i.product.image}` : '/hero.png'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                  </div>
                  <div className="flex-1 py-2">
                    <p className="text-[13px] font-bold leading-tight mb-2 line-clamp-2">{i.product.productName}</p>
                    <div className="flex gap-2 text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-2">
                      <span>SL: {i.quantity}</span>
                      {i.selectedSize && <span>• Size: {i.selectedSize}</span>}
                      {i.selectedColor && <span>• Màu: {i.selectedColor}</span>}
                    </div>
                    <p className="text-[13px] font-bold text-red-600">{((i.flashPrice || i.product.price) * i.quantity).toLocaleString()} ₫</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 mb-8">
              <p className="text-[9px] uppercase font-bold text-neutral-400 tracking-widest mb-2">Ưu đãi giảm giá</p>
              {!appliedCoupon ? (
                <div className="space-y-3">
                  {availableCoupons.length > 0 ? (
                    <div className="grid gap-2">
                      <p className="text-[10px] text-neutral-400 font-medium mb-1">Chọn mã giảm giá khả dụng:</p>
                      <select 
                        className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-black transition-all appearance-none cursor-pointer"
                        value=""
                        onChange={(e) => {
                          const promo = availableCoupons.find(p => p.code === e.target.value);
                          if (promo) {
                            setAppliedCoupon(promo);
                            setCouponError('');
                          }
                        }}
                      >
                        <option value="" disabled>-- Nhấn để chọn mã giảm giá --</option>
                        {availableCoupons.map(promo => (
                          <option key={promo.id} value={promo.code}>
                            {promo.code} - Giảm {promo.discount}% ({promo.title})
                          </option>
                        ))}
                      </select>
                      <div className="relative">
                        <div className="absolute right-4 top-[-28px] pointer-events-none opacity-30">↓</div>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-dashed border-neutral-200">
                        <input 
                          type="text" 
                          placeholder="Hoặc nhập mã khác..." 
                          className="flex-1 bg-white border border-neutral-200 rounded-xl px-4 py-3 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-black transition-all"
                          value={couponCode}
                          onChange={e => setCouponCode(e.target.value)}
                        />
                        <button 
                          onClick={handleApplyCoupon}
                          className="bg-black text-white px-6 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-[var(--primary)] active:scale-95 transition-all"
                        >
                          Áp dụng
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] opacity-40 italic">Hiện không có mã giảm giá nào khả dụng.</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between bg-black text-white p-4 rounded-xl shadow-lg">
                  <div className="flex items-center gap-3">
                    <Tag className="w-4 h-4 text-[var(--primary)]" />
                    <div>
                      <p className="text-[10px] font-bold tracking-widest uppercase">{appliedCoupon.code}</p>
                      <p className="text-[8px] font-bold text-[var(--primary)] uppercase tracking-widest">Giảm {appliedCoupon.discount}%</p>
                    </div>
                  </div>
                  <button onClick={() => setAppliedCoupon(null)} className="p-1.5 hover:bg-white/10 rounded-lg transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              {couponError && <p className="text-[8px] text-red-500 font-bold ml-2">{couponError}</p>}
            </div>

            <div className="space-y-3 pt-6 border-t border-neutral-50 mb-8 text-[13px]">
              <div className="flex justify-between font-medium text-neutral-400"><span>Tạm tính</span><span className="text-black font-bold">{subTotal.toLocaleString()} ₫</span></div>
              <div className="flex justify-between font-medium text-neutral-400">
                <span>Giao hàng</span>
                <span className="text-black font-bold">
                  {shipFee === 0 ? <span className="text-emerald-500">Miễn phí</span> : `${shipFee.toLocaleString()} ₫`}
                </span>
              </div>
              
              {membershipDiscountAmount > 0 && (
                <div className="flex justify-between text-black font-medium">
                  <span className="flex items-center gap-1">
                    <Award size={14} className="text-amber-500" />
                    Ưu đãi hạng {user.userDetails?.membershipTier?.tierName} (-{membershipDiscountPercent}%)
                  </span>
                  <span className="font-bold">-{membershipDiscountAmount.toLocaleString()} ₫</span>
                </div>
              )}

              {couponDiscountAmount > 0 && (
                <div className="flex justify-between text-rose-600 font-bold uppercase text-[11px] tracking-widest">
                  <span>Mã giảm giá</span>
                  <span>-{couponDiscountAmount.toLocaleString()} ₫</span>
                </div>
              )}
              <div className="flex justify-between items-end pt-4">
                <span className="font-bold text-base">Tổng tiền</span>
                <span className="text-3xl font-bold text-red-600 tracking-tighter">{finalTotal.toLocaleString()} ₫</span>
              </div>
            </div>

            <button 
              onClick={handleConfirm}
              disabled={loading}
              className="w-full bg-black text-white py-5 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-[var(--primary)] transition-all shadow-xl active:scale-95 disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Đặt hàng & Thanh toán"}
              <ArrowRight size={18} />
            </button>

            <div className="mt-6 flex items-center justify-center gap-2 opacity-20 text-[7px] uppercase font-bold tracking-[0.4em]">
              <ShieldCheck size={14} /> Secure Checkout Guaranteed
            </div>
          </section>
        </div>
      </div>
      {/* Address Management Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            onClick={() => setShowAddressModal(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-10 border-b border-neutral-100 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tighter">Địa chỉ <span className="text-[var(--primary)]">Giao hàng</span></h2>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.2em] mt-1">Quản lý danh sách nhận hàng của bạn</p>
              </div>
              <button onClick={() => setShowAddressModal(false)} className="p-4 hover:bg-neutral-50 rounded-2xl transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-8 no-scrollbar">
              {/* List existing addresses */}
              {addresses.length > 0 && (
                <div className="space-y-4">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Địa chỉ của tôi</p>
                  <div className="grid gap-4">
                    {addresses.map((addr) => (
                      <div 
                        key={addr.id}
                        onClick={() => {
                          setSelectedAddress(addr);
                          setShowAddressModal(false);
                        }}
                        className={`p-6 rounded-[24px] border-2 cursor-pointer transition-all ${
                          selectedAddress?.id === addr.id 
                          ? 'border-black bg-neutral-50 shadow-inner' 
                          : 'border-neutral-100 hover:border-neutral-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-bold text-lg">{addr.recipientName}</span>
                              <span className="text-neutral-300">|</span>
                              <span className="text-neutral-500 font-medium">{addr.phoneNumber}</span>
                              {addr.isDefault && (
                                <span className="bg-red-50 text-red-600 text-[8px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ml-2">Mặc định</span>
                              )}
                            </div>
                            <p className="text-sm text-neutral-600 leading-relaxed">
                              {formatAddress(addr)}
                            </p>
                          </div>
                          {selectedAddress?.id === addr.id && <CheckCircle2 className="text-black w-6 h-6" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Address Form */}
              <div className="bg-neutral-50 rounded-[32px] p-8 border border-neutral-100">
                <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-6">Thêm địa chỉ mới</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest ml-1">Tên người nhận *</label>
                    <input 
                      type="text" 
                      placeholder="Ví dụ: Nguyễn Văn A"
                      className="w-full bg-white border border-neutral-200 rounded-2xl px-6 py-5 text-sm font-medium focus:border-black outline-none transition-all"
                      value={newAddress.recipientName}
                      onChange={e => setNewAddress({...newAddress, recipientName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest ml-1">Số điện thoại *</label>
                    <input 
                      type="text" 
                      placeholder="0xxxxxxxxx"
                      className="w-full bg-white border border-neutral-200 rounded-2xl px-6 py-5 text-sm font-medium focus:border-black outline-none transition-all"
                      value={newAddress.phoneNumber}
                      onChange={e => setNewAddress({...newAddress, phoneNumber: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest ml-1">Tỉnh/Thành phố *</label>
                    <select
                      className="w-full bg-white border border-neutral-200 rounded-2xl px-6 py-5 text-sm font-medium focus:border-black outline-none transition-all cursor-pointer"
                      value={selectedProvinceCode}
                      onChange={handleProvinceChange}
                    >
                      <option value="">-- Chọn Tỉnh/Thành phố --</option>
                      {provinces.map(p => (
                        <option key={p.code} value={p.code}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest ml-1">Quận/Huyện *</label>
                    <select
                      className="w-full bg-white border border-neutral-200 rounded-2xl px-6 py-5 text-sm font-medium focus:border-black outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      value={selectedDistrictCode}
                      onChange={handleDistrictChange}
                      disabled={!selectedProvinceCode}
                    >
                      <option value="">-- Chọn Quận/Huyện --</option>
                      {districts.map(d => (
                        <option key={d.code} value={d.code}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest ml-1">Phường/Xã *</label>
                    <select
                      className="w-full bg-white border border-neutral-200 rounded-2xl px-6 py-5 text-sm font-medium focus:border-black outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      value={selectedWardCode}
                      onChange={handleWardChange}
                      disabled={!selectedDistrictCode}
                    >
                      <option value="">-- Chọn Phường/Xã --</option>
                      {wards.map(w => (
                        <option key={w.code} value={w.code}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest ml-1">Địa chỉ chi tiết *</label>
                    <input 
                      type="text" 
                      placeholder="Số nhà, tên đường, căn hộ..."
                      className="w-full bg-white border border-neutral-200 rounded-2xl px-6 py-5 text-sm font-medium focus:border-black outline-none transition-all"
                      value={detailAddress}
                      onChange={e => setDetailAddress(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-3 mt-6 ml-1">
                  <input 
                    type="checkbox" 
                    id="isDefault" 
                    className="w-4 h-4 accent-black" 
                    checked={newAddress.isDefault}
                    onChange={e => setNewAddress({...newAddress, isDefault: e.target.checked})}
                  />
                  <label htmlFor="isDefault" className="text-[10px] font-bold uppercase tracking-widest cursor-pointer select-none">Đặt làm địa chỉ mặc định</label>
                </div>

                <button 
                  onClick={handleAddAddress}
                  disabled={isAddingAddress}
                  className="w-full bg-black text-white py-5 rounded-[20px] font-bold uppercase tracking-[0.2em] text-[10px] mt-8 hover:bg-[var(--primary)] transition-all shadow-xl disabled:opacity-50"
                >
                  {isAddingAddress ? "Đang lưu..." : "Lưu địa chỉ mới"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      {/* Error Modal */}
      {errorModal.show && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <div className="bg-white p-10 max-w-md w-full shadow-2xl border border-neutral-100 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-8">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-2xl font-serif mb-4 uppercase tracking-widest text-center">{errorModal.title}</h2>
            <p className="text-sm text-neutral-500 mb-10 leading-relaxed text-center">
              {errorModal.message}
            </p>
            <button 
              onClick={handleCloseErrorModal} 
              className="luxury-btn w-full py-4"
            >
              Tôi đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
