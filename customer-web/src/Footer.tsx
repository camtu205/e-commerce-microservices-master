import React from 'react';
import { Phone, Mail, MapPin, ArrowRight, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = ({ storeInfo }: any) => {
  if (!storeInfo) return null;

  return (
    <footer className="bg-black text-white pt-12 pb-8">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div className="flex flex-col gap-4">
            <h2 className="font-serif text-2xl tracking-[0.2em] uppercase">{storeInfo.storeName || 'CTUS LUX'}</h2>
            <p className="text-[11px] text-neutral-400 leading-relaxed uppercase tracking-widest opacity-80">
              {storeInfo.aboutUs || 'Hành trình di sản và sự tinh tế trong từng đường nét bản sắc.'}
            </p>
            <div className="flex gap-4 mt-4">
              {storeInfo.facebookUrl && (
                <a href={storeInfo.facebookUrl} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                  <Share2 size={14} />
                </a>
              )}
              {storeInfo.instagramUrl && (
                <a href={storeInfo.instagramUrl} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                  <Share2 size={14} />
                </a>
              )}
              {storeInfo.youtubeUrl && (
                <a href={storeInfo.youtubeUrl} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                  <Share2 size={14} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Khám phá</h3>
            <div className="flex flex-col gap-4">
              <Link to="/" className="text-[11px] text-neutral-400 hover:text-white transition-colors uppercase tracking-widest no-underline">Trang chủ</Link>
              <Link to="/new-collection" className="text-[11px] text-neutral-400 hover:text-white transition-colors uppercase tracking-widest no-underline">Bộ sưu tập mới</Link>
              <Link to="/orders" className="text-[11px] text-neutral-400 hover:text-white transition-colors uppercase tracking-widest no-underline">Đơn hàng của tôi</Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Liên hệ</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 text-[11px] text-neutral-400">
                <MapPin size={14} className="shrink-0" />
                <span>{storeInfo.address}</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                <Phone size={14} className="shrink-0" />
                <span>{storeInfo.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                <Mail size={14} className="shrink-0" />
                <span>{storeInfo.email}</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Bản tin</h3>
            <p className="text-[11px] text-neutral-400 tracking-widest">Đăng ký để nhận tin tức mới nhất về các bộ sưu tập độc quyền.</p>
            <div className="relative mt-2">
              <input 
                type="email" 
                placeholder="EMAIL CỦA BẠN" 
                className="w-full bg-transparent border-b border-white/20 py-3 text-[10px] uppercase tracking-widest focus:border-white outline-none transition-colors"
              />
              <button className="absolute right-0 top-1/2 -translate-y-1/2 hover:translate-x-1 transition-transform">
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[9px] uppercase tracking-[0.3em] font-medium opacity-40">
            {storeInfo.copyrightText || `© ${new Date().getFullYear()} CTUS LUX. ALL RIGHTS RESERVED.`}
          </p>
          <div className="flex gap-8 text-[9px] uppercase tracking-[0.3em] font-medium opacity-40">
            <a href="#" className="hover:opacity-100 transition-opacity">Chính sách bảo mật</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Điều khoản sử dụng</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
