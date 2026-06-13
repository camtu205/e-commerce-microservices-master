import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ENDPOINTS } from './api';
import { ArrowRight, User as UserIcon, Lock } from 'lucide-react';

interface LoginProps {
  onLogin: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const resp = await axios.post(ENDPOINTS.login, { 
        userName: username, 
        userPassword: password 
      });
      localStorage.setItem('user', JSON.stringify(resp.data));
      onLogin(resp.data);
      navigate('/');
    } catch (err: any) {
      setError("Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page fade-in">
      <div className="auth-sidebar">
        <img 
          src="https://images.unsplash.com/photo-1548036627-19fefb0179af?q=80&w=2070&auto=format&fit=crop" 
          alt="Luxury" 
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-20 left-20 text-white z-10">
          <h1 className="text-4xl font-serif mb-4">CTUS LUX</h1>
          <p className="text-sm tracking-widest uppercase opacity-70">Thế giới tinh hoa chờ đón bạn</p>
        </div>
      </div>

      <div className="auth-content">
        <div className="mb-12">
          <Link to="/" className="lv-logo mb-12 block">CTUS LUX</Link>
          <h2 className="text-3xl font-serif mb-2">Đăng nhập</h2>
          <p className="text-sm text-neutral-500 mb-8">Chào mừng bạn quay lại với không gian mua sắm đẳng cấp.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block">Tên đăng nhập</label>
            <div className="relative">
              <UserIcon className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
              <input 
                type="text" 
                className="lv-input pl-8"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
              <input 
                type="password" 
                className="lv-input pl-8"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Link to="/forgot-password" size="sm" className="text-[10px] uppercase tracking-widest font-bold opacity-40 hover:opacity-100 transition-opacity">Quên mật khẩu?</Link>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="luxury-btn w-full justify-between"
          >
            {loading ? "Đang xác thực..." : "Đăng nhập"} 
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-12 pt-10 border-t border-neutral-100">
          <p className="text-sm text-neutral-500">
            Bạn chưa có tài khoản?{' '}
            <Link to="/register" className="text-black font-bold border-b border-black ml-1">Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
