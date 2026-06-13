import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ENDPOINTS } from './api';
import { ArrowRight, User as UserIcon, Lock, Mail, Phone, ArrowLeft, MapPin } from 'lucide-react';

interface RegisterProps {
  onRegister: (user: any) => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    userName: '',
    userPassword: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    street: '',
    streetNumber: '',
    locality: '',
    country: 'Vietnam'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (formData.userPassword.length < 6) {
        return setError("Mật khẩu phải có ít nhất 6 ký tự.");
      }
      if (formData.userPassword !== formData.confirmPassword) {
        return setError("Mật khẩu xác nhận không khớp.");
      }
    }
    if (step === 2) {
      if (!formData.email.includes('@')) {
        return setError("Email không hợp lệ (vui lòng bao gồm @).");
      }
      if (!/^0[0-9]{9}$/.test(formData.phoneNumber)) {
        return setError("Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0.");
      }
    }
    setError('');
    setStep(prev => prev + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        userName: formData.userName,
        userPassword: formData.userPassword,
        active: 1,
        userDetails: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          street: formData.street,
          streetNumber: formData.streetNumber,
          locality: formData.locality,
          country: formData.country
        },
        role: { id: 3 } // Default role: CUSTOMER
      };
      
      await axios.post(ENDPOINTS.register, payload);
      alert("Đăng ký thành công! Hãy đăng nhập.");
      navigate('/login');
    } catch (err: any) {
      const serverMsg = err.response?.data;
      if (typeof serverMsg === 'string' && serverMsg.includes("Đăng ký thất bại")) {
        setError(serverMsg);
      } else {
        setError("Đăng ký thất bại. Tên đăng nhập hoặc Email có thể đã tồn tại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page fade-in">
      <div className="auth-sidebar">
        <img 
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop" 
          alt="Luxury" 
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-20 left-20 text-white z-10">
          <h1 className="text-4xl font-serif mb-4">CTUS LUX</h1>
          <p className="text-sm tracking-widest uppercase opacity-70">Gia nhập cộng đồng thượng lưu</p>
        </div>
      </div>

      <div className="auth-content">
        <div className="mb-12">
          <Link to="/" className="lv-logo mb-12 block">CTUS LUX</Link>
          <h2 className="text-3xl font-serif mb-2">Tạo tài khoản</h2>
          <div className="flex gap-4 mt-6">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1 flex-1 transition-all duration-500 ${step >= i ? 'bg-black' : 'bg-neutral-100'}`} />
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-medium border border-red-100">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleNext} className="space-y-6">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block">Tên đăng nhập</label>
                <div className="relative">
                  <UserIcon className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                  <input type="text" name="userName" className="lv-input pl-8" value={formData.userName} onChange={handleChange} required />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block">Mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                  <input type="password" name="userPassword" className="lv-input pl-8" value={formData.userPassword} onChange={handleChange} required />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block">Xác nhận mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                  <input 
                    type="password" 
                    name="confirmPassword" 
                    className={`lv-input pl-8 ${formData.confirmPassword && formData.userPassword !== formData.confirmPassword ? 'border-red-500' : ''}`} 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                {formData.confirmPassword && formData.userPassword !== formData.confirmPassword && (
                  <p className="text-[10px] text-red-500 mt-2">Mật khẩu xác nhận không trùng khớp</p>
                )}
              </div>
              <button type="submit" className="luxury-btn w-full justify-between mt-4">Tiếp tục <ArrowRight className="w-4 h-4" /></button>
            </motion.form>
          ) : step === 2 ? (
            <motion.form key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleNext} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block">Họ của bạn</label>
                  <input type="text" name="firstName" placeholder="VD: Nguyễn" className="lv-input" value={formData.firstName} onChange={handleChange} required />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block">Tên của bạn</label>
                  <input type="text" name="lastName" placeholder="VD: Văn A" className="lv-input" value={formData.lastName} onChange={handleChange} required />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block">Địa chỉ Email</label>
                <div className="relative">
                  <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                  <input type="email" name="email" placeholder="email@example.com" className="lv-input pl-8" value={formData.email} onChange={handleChange} required />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block">Số điện thoại (10 số)</label>
                <div className="relative">
                  <Phone className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                  <input 
                    type="text" 
                    name="phoneNumber" 
                    placeholder="0xxxxxxxxx" 
                    className={`lv-input pl-8 ${formData.phoneNumber && !/^0[0-9]{9}$/.test(formData.phoneNumber) ? 'border-red-500' : ''}`} 
                    value={formData.phoneNumber} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                {formData.phoneNumber && !/^0[0-9]{9}$/.test(formData.phoneNumber) && (
                  <p className="text-[10px] text-red-500 mt-2">Số điện thoại phải có 10 số và bắt đầu bằng 0</p>
                )}
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(1)} className="luxury-btn luxury-btn-outline px-6"><ArrowLeft className="w-4 h-4" /></button>
                <button type="submit" className="luxury-btn flex-1 justify-between">Tiếp tục <ArrowRight className="w-4 h-4" /></button>
              </div>
            </motion.form>
          ) : (
            <motion.form key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block">Tên đường</label>
                  <input type="text" name="street" className="lv-input" value={formData.street} onChange={handleChange} required />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block">Số nhà</label>
                  <input type="text" name="streetNumber" className="lv-input" value={formData.streetNumber} onChange={handleChange} required />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block">Thành phố</label>
                <div className="relative">
                  <MapPin className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                  <input type="text" name="locality" className="lv-input pl-8" value={formData.locality} onChange={handleChange} required />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block">Quốc gia</label>
                <input type="text" name="country" className="lv-input" value={formData.country} onChange={handleChange} required />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(2)} className="luxury-btn luxury-btn-outline px-6"><ArrowLeft className="w-4 h-4" /></button>
                <button type="submit" disabled={loading} className="luxury-btn flex-1 justify-between">
                  {loading ? "Đang xử lý..." : "Hoàn tất đăng ký"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-12 text-center">
          <Link to="/login" className="text-sm text-neutral-500">
            Bạn đã có tài khoản? <span className="text-black font-bold border-b border-black ml-1">Đăng nhập</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
