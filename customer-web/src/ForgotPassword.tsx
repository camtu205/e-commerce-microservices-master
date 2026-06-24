import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Mail, Lock, CheckCircle2, ChevronLeft } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8900/api';

const ForgotPassword = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(0); // 0: Username, 1: Confirm Email, 2: OTP & New Password, 3: Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFindUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/accounts/find-email?username=${username}`);
      setEmail(response.data.fullEmail);
      setMaskedEmail(response.data.maskedEmail);
      setStep(1);
    } catch (err: any) {
      const errorData = err.response?.data;
      setError(typeof errorData === 'string' ? errorData : (errorData?.message || "Tên đăng nhập không tồn tại."));
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_BASE_URL}/accounts/forgot-password`, { email });
      setStep(2);
    } catch (err: any) {
      const errorData = err.response?.data;
      setError(typeof errorData === 'string' ? errorData : (errorData?.message || "Không thể gửi email lúc này."));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_BASE_URL}/accounts/reset-password`, { otp, newPassword });
      setStep(3);
    } catch (err: any) {
      const errorData = err.response?.data;
      setError(typeof errorData === 'string' ? errorData : (errorData?.message || "Mã OTP không hợp lệ hoặc đã hết hạn."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page fade-in">
      <div className="auth-sidebar">
        <img 
          src="https://images.unsplash.com/photo-1596706421941-8636b0429737?q=80&w=2070&auto=format&fit=crop" 
          alt="Luxury Reset" 
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="auth-content">
        <div className="mb-12">
          <Link to="/" className="lv-logo mb-12 block">CTUS LUX</Link>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold opacity-50 hover:opacity-100 mb-6">
            <ChevronLeft size={14} /> Quay lại
          </button>
          <h2 className="text-3xl font-serif mb-2">Khôi phục mật khẩu</h2>
          <p className="text-sm text-neutral-500 mb-8">
            {step === 0 && "Nhập tên đăng nhập của bạn để tìm tài khoản."}
            {step === 1 && "Chúng tôi sẽ gửi mã OTP đến email đã đăng ký của bạn."}
            {step === 2 && "Vui lòng nhập mã OTP đã gửi đến email của bạn."}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-medium border border-red-100">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.form 
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleFindUser} 
              className="space-y-8"
            >
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block">Tên đăng nhập</label>
                <div className="relative">
                  <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                  <input 
                    type="text" 
                    className="lv-input pl-8"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Nhập username"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="luxury-btn w-full justify-between"
              >
                {loading ? "Đang tìm..." : "Tiếp tục"} 
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.form>
          )}

          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="p-6 bg-neutral-50 border border-neutral-100 text-center">
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-50 mb-2">Email đã đăng ký</p>
                <p className="text-lg font-medium">{maskedEmail}</p>
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={handleSendOtp} 
                  disabled={loading}
                  className="luxury-btn w-full justify-center"
                >
                  {loading ? "Đang gửi..." : "Đồng ý gửi mã OTP"} 
                </button>
                <button 
                  onClick={() => setStep(0)} 
                  className="text-[10px] uppercase tracking-widest font-bold opacity-50 hover:opacity-100"
                >
                  Không phải tài khoản của tôi?
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.form 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleResetPassword} 
              className="space-y-8"
            >
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block">Mã OTP (6 chữ số)</label>
                <input 
                  type="text" 
                  className="lv-input text-center text-xl tracking-[1em]"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block">Mật khẩu mới</label>
                <div className="relative">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                  <input 
                    type="password" 
                    className="lv-input pl-8"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="luxury-btn w-full justify-between"
              >
                {loading ? "Đang cập nhật..." : "Đổi mật khẩu"} 
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.form>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-serif mb-4">Hoàn tất!</h3>
              <p className="text-sm text-neutral-500 mb-8">Mật khẩu của bạn đã được thay đổi thành công. Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.</p>
              <Link to="/login" className="luxury-btn inline-flex">Đăng nhập ngay</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ForgotPassword;
