import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Search, 
  Plus, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle2,
  Edit2,
  Trash2,
  UserPlus,
  Tags,
  LogOut,
  X,
  Award,
  User,
  Image as ImageIcon,
  FileText,
  CreditCard,
  Percent,
  Zap,
  Star,
  ShieldCheck,
  MessageSquare,
  CheckCircle,
  Eye,
  BarChart3,
  ChevronRight,
  AlertTriangle,
  Bell,
  Settings
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import AdminChat from './AdminChat';

// --- Configuration ---
const API_BASE_URL = 'http://localhost:8900/api';
const ENDPOINTS = {
  products: `${API_BASE_URL}/catalog/products`,
  adminProducts: `${API_BASE_URL}/catalog/admin/products`,
  categories: `${API_BASE_URL}/catalog/categories`,
  adminCategories: `${API_BASE_URL}/catalog/admin/categories`,
  brands: `${API_BASE_URL}/brand/brands`,
  adminBrands: `${API_BASE_URL}/brand/admin/brands`,
  orders: `${API_BASE_URL}/shop/order`,
  users: `${API_BASE_URL}/accounts/users`,
  customers: `${API_BASE_URL}/accounts/customers`,
  staff: `${API_BASE_URL}/accounts/staff`,
  login: `${API_BASE_URL}/accounts/login`,
  promotions: `${API_BASE_URL}/catalog/promotions`,
  adminPromotions: `${API_BASE_URL}/catalog/promotions/admin`,
  banners: `${API_BASE_URL}/catalog/banners`,
  adminBanners: `${API_BASE_URL}/catalog/admin/banners`,
  flashSales: `${API_BASE_URL}/catalog/flash-sales`,
  flashSaleItems: `${API_BASE_URL}/catalog/flash-sales/items`,
  membershipTiers: `${API_BASE_URL}/accounts/membership-tiers`,
  adminMembershipTiers: `${API_BASE_URL}/accounts/membership-tiers/admin`,
  adminReviews: `${API_BASE_URL}/catalog/admin/reviews`,
  adminCollections: `${API_BASE_URL}/catalog/collections`,
  adminStoreInfo: `${API_BASE_URL}/catalog/store-info`,
  notifications: `${API_BASE_URL}/accounts/notifications`,
  createNotification: `${API_BASE_URL}/accounts/notifications/create`,
  faqs: `${API_BASE_URL}/chat/admin/faqs`,
  activityLogs: `${API_BASE_URL}/accounts/activity-logs`
};

// --- Types ---
interface ActivityLog {
  id?: number;
  username: string;
  action: string;
  operation: string;
  timestamp: string;
  details?: string;
  ipAddress?: string;
}
interface MembershipTier {
  id?: number;
  tierName: string;
  minSpending: number;
  maxSpending?: number;
  description?: string;
  discountPercent?: number;
  freeShipping?: boolean;
  priorityFlashSale?: boolean;
  rewardMultiplier?: number;
  active: boolean;
  tierOrder: number;
}
interface Category {
  id?: number;
  name: string;
  description: string;
}

interface Brand {
  id?: number;
  name?: string;
  description?: string;
  image?: string;
}

interface Product {
  id?: number;
  productName: string;
  price: number;
  category: string;
  availability: number;
  discription: string;
  description?: string;
  image?: string;
  images?: string[];
  sizes?: string;
  colors?: string;
  brand?: Brand;
  active?: number;
  salesCount?: number;
  variants?: ProductVariant[];
  averageRating?: number;
  reviewCount?: number;
  brandId?: number;
}

interface ProductVariant {
  id?: number;
  color: string;
  size: string;
  stock: number;
}

interface Order {
  id: number;
  orderedDate: any;
  status: string;
  total: number;
  user?: any;
  items?: any[];
  shippingRecipientName?: string;
}

interface UserRole {
  id: number;
  roleName: string;
}

interface User {
  id: number;
  userName: string;
  active: number | boolean;
  role?: any;
  userDetails?: any;
}

interface Banner {
  id?: number;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  linkUrl?: string;
  orderIndex: number;
  isActive: boolean;
}

interface Review {
  id: number;
  productId: number;
  product?: Product;
  userId: number;
  userName: string;
  rating: number;
  content: string;
  createdAt: string;
  status: string;
  reply?: string;
  isUseful: number;
}

interface FlashSaleItem {
  id?: number;
  product: Product;
  flashPrice: number;
  initialQuantity: number;
  availableQuantity: number;
  maxPerUser?: number;
}

interface FlashSale {
  id?: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: string;
  items?: FlashSaleItem[];
}

interface Collection {
  id?: number;
  name: string;
  brandId?: number;
  bannerUrl: string;
  products?: Product[];
}

interface StoreInfo {
  id?: number;
  storeName: string;
  address: string;
  phone: string;
  email: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  copyrightText: string;
  aboutUs: string;
}

interface FAQ {
  id?: number;
  keyword: string;
  answer: string;
}

// --- Mock Data ---
const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: "Electronics", description: "Gadgets and devices" },
  { id: 2, name: "Clothing", description: "Apparel and fashion" },
];
const MOCK_BRANDS: Brand[] = [
  { id: 1, name: "Apple", description: "Think Different" },
  { id: 2, name: "Samsung", description: "Better World" },
];
const MOCK_PRODUCTS: Product[] = [
  { id: 1, productName: "Pro Wireless Mouse", price: 89.99, category: "Electronics", availability: 45, discription: "Gaming grade wireless mouse", image: "https://images.unsplash.com/photo-1527443224154-c4a014a8363f?w=200&q=80" },
];
const MOCK_ORDERS: Order[] = [];
const MOCK_USERS: User[] = [
  { 
    id: 1, 
    userName: "admin", 
    active: 1, 
    role: { id: 1, roleName: 'ADMIN' },
    userDetails: { firstName: 'Quản', lastName: 'Trị Viên', email: 'admin@shop.com', phoneNumber: '0123' }
  },
  { 
    id: 2, 
    userName: "customer_test", 
    active: 1, 
    role: { id: 3, roleName: 'CUSTOMER' },
    userDetails: { firstName: 'Nguyễn', lastName: 'Văn A', email: 'vana@gmail.com', phoneNumber: '0987654321', locality: 'Hà Nội', country: 'Việt Nam' }
  },
];

const MOCK_PROMOTIONS: any[] = [
  { id: 1, title: 'Khai trương hồng phát', code: 'HELLO2026', discount: 15, validUntil: '2026-12-31', isUnlimited: true, applicableProducts: ['ALL'] },
  { id: 2, title: 'Black Friday Luxury', code: 'BF2026', discount: 30, validUntil: '2026-11-30', usageLimit: 50, isUnlimited: false, applicableProducts: ['ALL'] }
];

// --- Components ---
const DEFAULT_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80";

const formatImageUrl = (image?: string, isBrand = false) => {
  if (!image) return DEFAULT_PRODUCT_IMAGE;
  if (image.startsWith('http') || image.startsWith('data:')) return image;
  
  if (isBrand) {
    return `http://localhost:8900/api/brand/brands/images/${image}`;
  }
  return `http://localhost:8900/api/catalog/products/images/${image}`;
};

const SidebarItem = ({ icon: Icon, text, active, onClick, collapsed }: any) => (
  <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
    <Icon size={20} />
    {!collapsed && <span className="nav-text">{text}</span>}
  </button>
);

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, onClick }: any) => (
  <div 
    className={`stat-card glass fade-in ${onClick ? 'clickable' : ''}`} 
    style={{ borderColor: `${color}40`, cursor: onClick ? 'pointer' : 'default' }}
    onClick={onClick}
  >
    <div className="stat-header">
      <div className="stat-icon" style={{ background: `${color}20`, color }}>
        <Icon size={20} />
      </div>
      {trend && (
        <div className={`stat-trend ${trend}`}>
          {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trendValue}
        </div>
      )}
    </div>
    <div className="stat-value">{value}</div>
    <div className="stat-title">{title}</div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const s = status ? status.toLowerCase() : 'pending';
  
  let classStatus = 'pending';
  let Icon = Clock;

  if (s.includes('paid') || s.includes('completed') || s.includes('delivered')) {
    classStatus = 'completed';
    Icon = CheckCircle2;
  } else if (s.includes('processing') || s.includes('shipped')) {
    classStatus = 'processing';
    Icon = TrendingUp;
  } else if (s.includes('cancelled') || s.includes('refunded')) {
    classStatus = 'cancelled';
    Icon = X;
  }

  return (
    <span className={`status-badge status-${classStatus}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <Icon size={12} />
      <span style={{ textTransform: 'capitalize' }}>{s.replace(/_/g, ' ')}</span>
    </span>
  );
};

const getRoleId = (role: any): number => {
  if (!role) return 3; // Mặc định là CUSTOMER nếu không có role
  if (typeof role === 'number') return role;
  if (typeof role === 'string') {
    const r = role.toUpperCase();
    if (r === 'ADMIN' || r === '1') return 1;
    if (r === 'STAFF' || r === '2') return 2;
    return 3;
  }
  if (typeof role === 'object') {
    // Ưu tiên lấy ID
    const rid = role.id || role.role_id || role.roleId;
    if (rid == 1) return 1;
    if (rid == 2) return 2;
    if (rid == 3) return 3;

    // Nếu không có ID, lấy theo tên
    const name = (role.roleName || role.role_name || role.name || '').toUpperCase();
    if (name.includes('ADMIN')) return 1;
    if (name.includes('STAFF')) return 2;
  }
  return 3; // Mặc định là khách hàng cho các trường hợp khác
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [loginLoading, setLoginLoading] = React.useState(false);
  const [loginForm, setLoginForm] = React.useState({ username: '', password: '' });

  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [activityLogs, setActivityLogs] = React.useState<ActivityLog[]>([]);
  const [activityLogsSearch, setActivityLogsSearch] = React.useState('');
  const [activityLogsFilter, setActivityLogsFilter] = React.useState('ALL');

  const logActivity = async (action: string, operation: string, details?: string) => {
    try {
      const savedUser = localStorage.getItem('user');
      const username = savedUser ? JSON.parse(savedUser).userName : (currentUser ? currentUser.userName : 'Anonymous');
      await axios.post(ENDPOINTS.activityLogs, {
        username,
        action,
        operation,
        details: details || ''
      });
      fetchActivityLogs();
    } catch (err) {
      console.error("Failed to log activity:", err);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const res = await axios.get(ENDPOINTS.activityLogs);
      setActivityLogs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch activity logs:", err);
    }
  };

  const [collapsed] = React.useState(false);
  const [products, setProducts] = React.useState<Product[]>(MOCK_PRODUCTS);
  const [categories, setCategories] = React.useState<Category[]>(MOCK_CATEGORIES);
  const [brands, setBrands] = React.useState<Brand[]>(MOCK_BRANDS);
  const [orders, setOrders] = React.useState<Order[]>(MOCK_ORDERS);
  const [users, setUsers] = React.useState<User[]>(MOCK_USERS);
  const [customersList, setCustomersList] = React.useState<User[]>([]);
  const [staffList, setStaffList] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [, setError] = React.useState<string | null>(null);

  const [adminNotifications, setAdminNotifications] = React.useState<any[]>([]);
  const [unreadAdminCount, setUnreadAdminCount] = React.useState(0);

  // Brand Modals
  const [showBrandModal, setShowBrandModal] = React.useState(false);
  const [editingBrand, setEditingBrand] = React.useState<Brand | null>(null);
  const [brandForm, setBrandForm] = useState<Brand>({ name: '', description: '', image: '' });

  // Modals state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Product>({ productName: '', price: 0, category: '', availability: 0, discription: '', image: '', images: [], sizes: '', colors: '' });

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState<Category>({ name: '', description: '' });

  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState<any>({ 
    userName: '', 
    password: '', 
    role: 'STAFF', 
    firstName: '', 
    lastName: '', 
    email: '', 
    phoneNumber: '' 
  });

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [orderStatusForm, setOrderStatusForm] = useState('');

  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [newOrderForm, setNewOrderForm] = useState<any>({ 
    userId: '', 
    customerName: '',
    shippingRecipientName: '',
    shippingPhoneNumber: '',
    shippingAddress: '',
    items: [], 
    status: 'PENDING' 
  });
  const [selectedProduct, setSelectedProduct] = useState({ productId: 0, quantity: 1, size: '', color: '' });

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<User | null>(null);
  const [customerForm, setCustomerForm] = useState({ 
    userName: '', 
    password: '', 
    role: 'CUSTOMER', 
    firstName: '', 
    lastName: '', 
    email: '', 
    phoneNumber: '',
    locality: ''
  });

  const [currentInvoiceOrder, setCurrentInvoiceOrder] = useState<Order | null>(null);
  const [lastTab, setLastTab] = useState('orders');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  const [orderSort, setOrderSort] = useState<'newest' | 'oldest'>('newest');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [showProductDetailModal, setShowProductDetailModal] = React.useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = React.useState<Product | null>(null);
  const [productModalStep, setProductModalStep] = React.useState(1);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);

  const [promotions, setPromotions] = useState<any[]>(MOCK_PROMOTIONS);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<any>(null);
  const [promotionForm, setPromotionForm] = useState<any>({ 
    title: '', 
    code: '', 
    discount: 0, 
    validUntil: '', 
    usageLimit: 100, 
    isUnlimited: true, 
    applicableProducts: ['ALL'] 
  });

  const [banners, setBanners] = useState<Banner[]>([]);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerForm, setBannerForm] = useState<Banner>({ 
    imageUrl: '', 
    title: '', 
    subtitle: '', 
    linkUrl: '', 
    orderIndex: 0, 
    isActive: true 
  });

  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [showFlashSaleModal, setShowFlashSaleModal] = useState(false);
  const [editingFlashSale, setEditingFlashSale] = useState<FlashSale | null>(null);
  const [flashSaleForm, setFlashSaleForm] = useState<FlashSale>({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    status: 'Upcoming'
  });

  const [showFlashItemModal, setShowFlashItemModal] = useState(false);
  const [selectedFlashSaleId, setSelectedFlashSaleId] = useState<number | null>(null);
  const [flashItemForm, setFlashItemForm] = useState({
    productId: 0,
    flashPrice: 0,
    initialQuantity: 10,
    maxPerUser: 1
  });

  const [membershipTiers, setMembershipTiers] = useState<MembershipTier[]>([]);
  const [showTierModal, setShowTierModal] = useState(false);
  const [editingTier, setEditingTier] = useState<MembershipTier | null>(null);
  const [tierForm, setTierForm] = useState<MembershipTier>({
    tierName: '',
    minSpending: 0,
    maxSpending: undefined,
    description: '',
    discountPercent: 0,
    freeShipping: false,
    priorityFlashSale: false,
    rewardMultiplier: 1,
    active: true,
    tierOrder: 0
  });

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<any>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');

  const [collections, setCollections] = useState<Collection[]>([]);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [collectionForm, setCollectionForm] = useState<Collection>({ name: '', bannerUrl: '', products: [] });

  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    storeName: 'CTUS LUX Heritage', address: '', phone: '', email: '',
    facebookUrl: '', instagramUrl: '', youtubeUrl: '', copyrightText: '', aboutUs: ''
  });

  const [notificationForm, setNotificationForm] = useState({
    userId: 'ALL',
    title: '',
    content: '',
    type: 'SYSTEM',
    link: ''
  });
  const [isSendingNotif, setIsSendingNotif] = useState(false);

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [faqForm, setFaqForm] = useState<FAQ>({ keyword: '', answer: '' });

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      setCurrentUser(JSON.parse(saved));
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) fetchData();
  }, [isLoggedIn]);

  useEffect(() => {
    if (reviewStats) {
      console.log("Review Stats updated state:", reviewStats);
    }
  }, [reviewStats]);

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      fetchAdminNotifications();
      const interval = setInterval(fetchAdminNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, currentUser]);

  const fetchAdminNotifications = async () => {
    if (!currentUser) return;
    try {
      const [notifResp, countResp] = await Promise.all([
        axios.get(`${ENDPOINTS.notifications}/user/${currentUser.id}`),
        axios.get(`${ENDPOINTS.notifications}/unread-count/${currentUser.id}`)
      ]);
      setAdminNotifications(notifResp.data);
      setUnreadAdminCount(countResp.data);
    } catch (e) { console.error("Failed to fetch admin notifications", e); }
  };

  const handleMarkAdminAsRead = async (id: number) => {
    try {
      await axios.post(`${ENDPOINTS.notifications}/mark-as-read/${id}`);
      setAdminNotifications(adminNotifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadAdminCount(prev => Math.max(0, prev - 1));
    } catch (e) { console.error(e); }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, catRes, brandRes, orderRes, userRes, custRes, staffRes, promoRes, bannerRes, flashRes, tierRes, reviewRes, statRes, collectionRes, storeRes, faqRes, logRes] = await Promise.all([
        axios.get(ENDPOINTS.products).catch(() => ({ data: MOCK_PRODUCTS, warning: true })),
        axios.get(ENDPOINTS.categories).catch(() => ({ data: MOCK_CATEGORIES, warning: true })),
        axios.get(ENDPOINTS.brands).catch(() => ({ data: MOCK_BRANDS, warning: true })),
        axios.get(ENDPOINTS.orders).catch(() => ({ data: [], warning: true })),
        axios.get(ENDPOINTS.users).catch(() => ({ data: MOCK_USERS, warning: true })),
        axios.get(ENDPOINTS.customers).catch(() => ({ data: [], warning: true })),
        axios.get(ENDPOINTS.staff).catch(() => ({ data: [], warning: true })),
        axios.get(ENDPOINTS.promotions).catch(() => ({ data: [], warning: true })),
        axios.get(ENDPOINTS.adminBanners).catch(() => ({ data: [], warning: true })),
        axios.get(ENDPOINTS.flashSales).catch(() => ({ data: [], warning: true })),
        axios.get(ENDPOINTS.adminMembershipTiers).catch(() => ({ data: [], warning: true })),
        axios.get(ENDPOINTS.adminReviews).catch(err => { console.error("Reviews API Error:", err); return { data: [], warning: true }; }),
        axios.get(`${ENDPOINTS.adminReviews}/stats`).catch(err => { console.error("Stats API Error:", err); return { data: null, warning: true }; }),
        axios.get(ENDPOINTS.adminCollections).catch(() => ({ data: [] })),
        axios.get(ENDPOINTS.adminStoreInfo).catch(() => ({ data: null })),
        axios.get(ENDPOINTS.faqs).catch(() => ({ data: [] })),
        axios.get(ENDPOINTS.activityLogs).catch(() => ({ data: [] }))
      ]);
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
      setCategories(Array.isArray(catRes.data) ? catRes.data : []);
      setBrands(Array.isArray(brandRes.data) ? brandRes.data : []);
      setOrders(Array.isArray(orderRes.data) ? orderRes.data : []);
      setUsers(Array.isArray(userRes.data) ? userRes.data : []);
      setCustomersList(Array.isArray(custRes.data) ? custRes.data : []);
      setStaffList(Array.isArray(staffRes.data) ? staffRes.data : []);
      setBanners(Array.isArray(bannerRes.data) ? bannerRes.data : []);
      setFlashSales(Array.isArray(flashRes.data) ? flashRes.data : []);
      setMembershipTiers(Array.isArray(tierRes.data) ? tierRes.data : []);
      setReviews(Array.isArray(reviewRes.data) ? reviewRes.data : []);
      setReviewStats(statRes.data);
      setCollections(Array.isArray(collectionRes.data) ? collectionRes.data : []);
      if (storeRes.data) setStoreInfo(storeRes.data);
      setFaqs(Array.isArray(faqRes.data) ? faqRes.data : []);
      setActivityLogs(Array.isArray(logRes.data) ? logRes.data : []);

      console.log("Review Stats received:", statRes.data);
      
      const pData = Array.isArray(promoRes.data) ? promoRes.data : [];
      setPromotions(pData.map((p: any) => ({
        ...p,
        applicableProducts: p.applicableProducts ? p.applicableProducts.split(',') : ['ALL']
      })));
      
      if ((prodRes as any).warning || (catRes as any).warning || (promoRes as any).warning) {
        setError("Chế độ Demo: Một số kết nối Backend hạn chế.");
      }
      
      if ((prodRes as any).warning || (catRes as any).warning || (brandRes as any).warning || (orderRes as any).warning || (userRes as any).warning) {
        setError("Chế độ Demo: Kết nối Backend hạn chế.");
      }
    } catch (err) {
      setError("Lỗi kết nối.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setProductForm(prev => ({ 
            ...prev, 
            images: [...(prev.images || []), result],
            // Set main image if not exists
            image: prev.image || result
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeProductImage = (index: number) => {
    setProductForm(prev => {
      const newImages = [...(prev.images || [])];
      newImages.splice(index, 1);
      return {
        ...prev,
        images: newImages,
        image: index === 0 ? (newImages[0] || '') : prev.image
      };
    });
  };

  const handleBrandImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBrandForm(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await axios.post(ENDPOINTS.login, { userName: loginForm.username, userPassword: loginForm.password });
      setCurrentUser(res.data);
      setIsLoggedIn(true);
      localStorage.setItem('user', JSON.stringify(res.data));
      setTimeout(() => logActivity("Đăng nhập hệ thống", "LOGIN", `Tài khoản ${res.data.userName} đăng nhập thành công`), 100);
    } catch (err) {
      alert("Đăng nhập thất bại. Kiểm tra tài khoản/mật khẩu.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    logActivity("Đăng xuất khỏi hệ thống", "LOGOUT", `Tài khoản đăng xuất`).then(() => {
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      setCurrentUser(null);
    }).catch(() => {
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      setCurrentUser(null);
    });
  };

  // --- Membership Tier Logic ---
  const handleOpenAddTier = () => {
    setEditingTier(null);
    setTierForm({ tierName: '', minSpending: 0, description: '', discountPercent: 0, freeShipping: false, priorityFlashSale: false, rewardMultiplier: 1, active: true, tierOrder: membershipTiers.length });
    setShowTierModal(true);
  };

  const handleOpenEditTier = (tier: MembershipTier) => {
    setEditingTier(tier);
    setTierForm(tier);
    setShowTierModal(true);
  };

  const handleDeleteTier = async (id: number) => {
    if (!window.confirm("Xóa hạng thành viên này?")) return;
    try {
      const tier = membershipTiers.find(t => t.id === id);
      await axios.delete(`${ENDPOINTS.membershipTiers}/${id}`);
      logActivity(`Xóa hạng thành viên: ${tier?.tierName || id}`, "DELETE_TIER", `Hạng ID: ${id}`);
      fetchData();
    } catch (err) { alert("Lỗi xóa hạng."); }
  };

  const handleTierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(ENDPOINTS.membershipTiers, tierForm);
      logActivity(
        `${editingTier ? 'Cập nhật' : 'Thêm'} hạng thành viên: ${tierForm.tierName}`,
        "SAVE_TIER",
        `Chi tiêu tối thiểu: ${tierForm.minSpending.toLocaleString()} ₫, Giảm giá: ${tierForm.discountPercent}%`
      );
      setShowTierModal(false);
      fetchData();
    } catch (err) { alert("Lỗi lưu hạng thành viên."); }
  };

  const totalRevenue = orders.reduce((acc, curr) => acc + (curr.total || 0), 0);

  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerForm(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAddBanner = () => {
    const maxOrder = banners.length > 0 ? Math.max(...banners.map(b => b.orderIndex || 0)) : -1;
    setEditingBanner(null);
    setBannerForm({ imageUrl: '', title: '', subtitle: '', linkUrl: '', orderIndex: maxOrder + 1, isActive: true });
    setShowBannerModal(true);
  };

  const handleOpenEditBanner = (b: Banner) => {
    setEditingBanner(b);
    setBannerForm(b);
    setShowBannerModal(true);
  };

  const handleDeleteBanner = async (id: number) => {
    if (!window.confirm("Xóa banner này?")) return;
    try {
      const banner = banners.find(b => b.id === id);
      await axios.delete(`${ENDPOINTS.adminBanners}/${id}`);
      logActivity(`Xóa banner: ${banner?.title || id}`, "DELETE_BANNER", `Banner ID: ${id}`);
      fetchData();
    } catch (err) { alert("Lỗi xóa banner."); }
  };

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBanner) await axios.put(`${ENDPOINTS.adminBanners}/${editingBanner.id}`, bannerForm);
      else await axios.post(ENDPOINTS.adminBanners, bannerForm);
      logActivity(
        `${editingBanner ? 'Cập nhật' : 'Thêm'} banner: ${bannerForm.title || 'Không tiêu đề'}`,
        `${editingBanner ? 'UPDATE' : 'CREATE'}_BANNER`,
        `Thứ tự hiển thị: ${bannerForm.orderIndex}`
      );
      setShowBannerModal(false);
      fetchData();
    } catch (err) { alert("Lỗi lưu banner."); }
  };

  const handleFaqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFaq) await axios.put(`${ENDPOINTS.faqs}/${editingFaq.id}`, faqForm);
      else await axios.post(ENDPOINTS.faqs, faqForm);
      logActivity(
        `${editingFaq ? 'Cập nhật' : 'Thêm'} câu hỏi FAQ`,
        `${editingFaq ? 'UPDATE' : 'CREATE'}_FAQ`,
        `Từ khóa: ${faqForm.keyword}`
      );
      setShowFaqModal(false);
      fetchData();
    } catch (err) { alert("Lỗi lưu FAQ."); }
  };

  const handleDeleteFaq = async (id: number) => {
    if (!window.confirm("Xóa câu hỏi này?")) return;
    try {
      const faq = faqs.find(f => f.id === id);
      await axios.delete(`${ENDPOINTS.faqs}/${id}`);
      logActivity(`Xóa câu hỏi FAQ: ${faq?.keyword || id}`, "DELETE_FAQ", `FAQ ID: ${id}`);
      fetchData();
    } catch (err) { alert("Lỗi khi xóa FAQ."); }
  };

  // --- Dashboard Logic ---
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({ productName: '', price: 0, category: categories[0]?.name || '', availability: 0, discription: '', image: '', images: [], sizes: '', colors: '', variants: [] });
    setProductModalStep(1);
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (product: any) => { 
    setEditingProduct(product); 
    setProductModalStep(1);
    // Map brandId to brand object if needed for the UI
    const brandData = product.brandId ? { id: product.brandId } : product.brand;
    
    setProductForm({ 
      ...product, 
      brand: brandData,
      images: product.images || (product.image ? [product.image] : []),
      sizes: product.sizes || '',
      colors: product.colors || ''
    }); 
    setShowProductModal(true); 
  };

  const generateVariants = () => {
    const colorArr = productForm.colors ? productForm.colors.split(',').map(c => c.trim()).filter(c => c) : [];
    const sizeArr = productForm.sizes ? productForm.sizes.split(',').map(s => s.trim()).filter(s => s) : [];
    
    if (colorArr.length === 0 || sizeArr.length === 0) {
      alert("Vui lòng nhập ít nhất một màu và một size để tạo biến thể.");
      return;
    }

    const newVariants: ProductVariant[] = [];
    colorArr.forEach(color => {
      sizeArr.forEach(size => {
        // Giữ lại số lượng cũ nếu trùng màu/size khi đang chỉnh sửa
        const existing = (productForm.variants || []).find(v => v.color === color && v.size === size);
        newVariants.push({
          id: existing?.id,
          color,
          size,
          stock: existing?.stock || 0
        });
      });
    });
    
    setProductForm({ ...productForm, variants: newVariants });
    setProductModalStep(3);
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm("Xóa sản phẩm này?")) return;
    try {
      const prod = products.find(p => p.id === id);
      await axios.delete(`${ENDPOINTS.adminProducts}/${id}`);
      logActivity(`Xóa sản phẩm: ${prod?.productName || id}`, "DELETE_PRODUCT", `Sản phẩm ID: ${id}`);
      fetchData();
    } catch (err) { alert("Lỗi xóa."); }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...productForm,
      price: Number(productForm.price),
      availability: Number(productForm.availability),
      brandId: productForm.brand?.id || (typeof productForm.brand === 'number' ? productForm.brand : null)
    };

    try {
      if (editingProduct) {
        await axios.put(`${ENDPOINTS.adminProducts}/${editingProduct.id}`, payload);
        logActivity(`Cập nhật sản phẩm: ${payload.productName}`, "UPDATE_PRODUCT", `Giá: ${payload.price.toLocaleString()} ₫`);
      } else {
        await axios.post(ENDPOINTS.adminProducts, { ...payload, active: 1 });
        logActivity(`Thêm sản phẩm mới: ${payload.productName}`, "CREATE_PRODUCT", `Giá: ${payload.price.toLocaleString()} ₫, Tồn kho: ${payload.availability}`);
      }
      setShowProductModal(false);
      fetchData();
    } catch (err: any) { 
      console.error("Product Submit Error:", err);
      let errorMsg = "Lỗi không xác định";
      if (err.response && err.response.data) {
        errorMsg = typeof err.response.data === 'string' ? err.response.data : (err.response.data.message || JSON.stringify(err.response.data));
      }

      // Chỉ fallback Demo nếu là lỗi kết nối (không có response)
      if (!err.response) {
        if (editingProduct) {
          setProducts(products.map(p => p.id === editingProduct.id ? { ...payload, id: editingProduct.id } as Product : p));
          logActivity(`Cập nhật sản phẩm (Demo): ${payload.productName}`, "UPDATE_PRODUCT", `Giá: ${payload.price.toLocaleString()} ₫`);
        } else {
          setProducts([{ ...payload, id: Date.now() } as Product, ...products]);
          logActivity(`Thêm sản phẩm mới (Demo): ${payload.productName}`, "CREATE_PRODUCT", `Giá: ${payload.price.toLocaleString()} ₫`);
        }
        setShowProductModal(false);
        alert("Đang ở chế độ Demo: Dữ liệu đã được cập nhật tạm thời trên giao diện.");
      } else {
        alert("Lỗi từ hệ thống: " + errorMsg);
      }
    }
  };



  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm("Xóa danh mục?")) return;
    try {
      const cat = categories.find(c => c.id === id);
      await axios.delete(`${ENDPOINTS.adminCategories}/${id}`);
      logActivity(`Xóa danh mục: ${cat?.name || id}`, "DELETE_CATEGORY", `Danh mục ID: ${id}`);
      fetchData();
    } catch (err) { alert("Lỗi xóa."); }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) await axios.put(`${ENDPOINTS.adminCategories}/${editingCategory.id}`, categoryForm);
      else await axios.post(ENDPOINTS.adminCategories, categoryForm);
      logActivity(
        `${editingCategory ? 'Cập nhật' : 'Thêm'} danh mục: ${categoryForm.name}`,
        `${editingCategory ? 'UPDATE' : 'CREATE'}_CATEGORY`,
        `Mô tả: ${categoryForm.description || ''}`
      );
      setShowCategoryModal(false);
      fetchData();
    } catch (err) { alert("Lỗi khi lưu danh mục."); }
  };

  const handleFlashSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...flashSaleForm,
      startTime: flashSaleForm.startTime.length === 16 ? `${flashSaleForm.startTime}:00` : flashSaleForm.startTime,
      endTime: flashSaleForm.endTime.length === 16 ? `${flashSaleForm.endTime}:00` : flashSaleForm.endTime
    };
    try {
      if (editingFlashSale) await axios.put(`${ENDPOINTS.flashSales}/${editingFlashSale.id}`, payload);
      else await axios.post(ENDPOINTS.flashSales, payload);
      logActivity(
        `${editingFlashSale ? 'Cập nhật' : 'Thêm'} Flash Sale: ${flashSaleForm.title}`,
        `${editingFlashSale ? 'UPDATE' : 'CREATE'}_FLASHSALE`,
        `Thời gian: ${flashSaleForm.startTime} - ${flashSaleForm.endTime}`
      );
      setShowFlashSaleModal(false);
      fetchData();
    } catch (err) { alert("Lỗi lưu Flash Sale."); }
  };

  const handleDeleteFlashSale = async (id: number) => {
    if (!window.confirm("Xóa chương trình Flash Sale này?")) return;
    try {
      const sale = flashSales.find(f => f.id === id);
      await axios.delete(`${ENDPOINTS.flashSales}/${id}`);
      logActivity(`Xóa Flash Sale: ${sale?.title || id}`, "DELETE_FLASHSALE", `Flash Sale ID: ${id}`);
      fetchData();
    } catch (err) { alert("Lỗi xóa Flash Sale."); }
  };

  const handleAddFlashItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlashSaleId) return;
    const payload = {
      product: { id: flashItemForm.productId },
      flashPrice: flashItemForm.flashPrice,
      initialQuantity: flashItemForm.initialQuantity,
      availableQuantity: flashItemForm.initialQuantity,
      maxPerUser: flashItemForm.maxPerUser
    };
    try {
      const prod = products.find(p => p.id === flashItemForm.productId);
      await axios.post(`${ENDPOINTS.flashSales}/${selectedFlashSaleId}/items`, payload);
      logActivity(
        `Thêm sản phẩm vào Flash Sale: ${prod?.productName || flashItemForm.productId}`,
        "ADD_FLASHSALE_ITEM",
        `Giá Flash: ${flashItemForm.flashPrice.toLocaleString()} ₫, Số lượng: ${flashItemForm.initialQuantity}`
      );
      setShowFlashItemModal(false);
      fetchData();
    } catch (err) { alert("Lỗi thêm sản phẩm vào Flash Sale."); }
  };

  const handleRemoveFlashItem = async (itemId: number) => {
    if (!window.confirm("Xóa sản phẩm khỏi Flash Sale?")) return;
    try {
      await axios.delete(`${ENDPOINTS.flashSaleItems}/${itemId}`);
      logActivity(`Xóa sản phẩm khỏi Flash Sale`, "REMOVE_FLASLSALE_ITEM", `Item ID: ${itemId}`);
      fetchData();
    } catch (err) { alert("Lỗi xóa sản phẩm."); }
  };

  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserForm({ userName: '', password: '', role: 'STAFF', firstName: '', lastName: '' });
    setShowUserModal(true);
  };

  const handleOpenEditUser = (u: User) => {
    setEditingUser(u);
    setUserForm({ 
      userName: u.userName, 
      role: typeof u.role === 'object' ? u.role.roleName : u.role || 'STAFF', 
      firstName: u.userDetails?.firstName || '', 
      lastName: u.userDetails?.lastName || '',
      email: u.userDetails?.email || '',
      phoneNumber: u.userDetails?.phoneNumber || '',
      avatar: u.userDetails?.avatar || ''
    });
    setShowUserModal(true);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userPayload = {
      userName: userForm.userName,
      userPassword: userForm.password || '123456',
      active: 1,
      role: { id: userForm.role === 'ADMIN' ? 1 : 2, roleName: userForm.role },
      userDetails: {
        firstName: userForm.firstName,
        lastName: userForm.lastName,
        email: userForm.email,
        phoneNumber: userForm.phoneNumber,
        avatar: userForm.avatar
      }
    };

    try {
      if (editingUser) {
        const response = await axios.put(`${ENDPOINTS.users}/${editingUser.id}`, userPayload);
        if (editingUser.id === currentUser?.id) {
          const updatedUser = response.data;
          setCurrentUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        logActivity(`Cập nhật nhân sự: ${userForm.userName}`, "UPDATE_USER", `Vai trò: ${userForm.role}`);
      } else {
        await axios.post(ENDPOINTS.users, userPayload);
        logActivity(`Thêm nhân sự mới: ${userForm.userName}`, "CREATE_USER", `Vai trò: ${userForm.role}`);
      }
      fetchData();
      setShowUserModal(false);
    } catch (err) {
      alert("Lỗi: Không thể lưu thông tin nhân sự. Kiểm tra kết nối Backend.");
      console.error(err);
    }
  };

  const handleDeleteUser = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bản ghi này?")) {
      const u = users.find(user => user.id === id) || staffList.find(s => s.id === id);
      axios.delete(`${ENDPOINTS.users}/${id}`)
        .then(() => {
          logActivity(`Xóa nhân sự: ${u?.userName || id}`, "DELETE_USER", `Nhân sự ID: ${id}`);
          fetchData();
        })
        .catch(err => console.error(err));
    }
  };

  const handleDeleteBrand = async (id: number) => {
    if (!window.confirm("Xóa thương hiệu này?")) return;
    try {
      const brand = brands.find(b => b.id === id);
      await axios.delete(`${ENDPOINTS.adminBrands}/${id}`);
      logActivity(`Xóa thương hiệu: ${brand?.name || id}`, "DELETE_BRAND", `Thương hiệu ID: ${id}`);
      fetchData();
    } catch (err) { alert("Lỗi xóa."); }
  };

  const handleBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBrand) await axios.put(`${ENDPOINTS.adminBrands}/${editingBrand.id}`, brandForm);
      else await axios.post(ENDPOINTS.adminBrands, brandForm);
      logActivity(
        `${editingBrand ? 'Cập nhật' : 'Thêm'} thương hiệu: ${brandForm.name}`,
        `${editingBrand ? 'UPDATE' : 'CREATE'}_BRAND`,
        `Mô tả: ${brandForm.description || ''}`
      );
      setShowBrandModal(false);
      fetchData();
    } catch (err) { alert("Lỗi lưu thương hiệu."); }
  };

  const handleOpenAddCustomer = () => {
    setEditingCustomer(null);
    setCustomerForm({ 
      userName: '', 
      password: '', 
      role: 'CUSTOMER', 
      firstName: '', 
      lastName: '', 
      email: '', 
      phoneNumber: '',
      locality: ''
    });
    setShowCustomerModal(true);
  };

  const handleOpenEditCustomer = (c: User) => {
    setEditingCustomer(c);
    setCustomerForm({ 
      userName: c.userName, 
      role: 'CUSTOMER', 
      firstName: c.userDetails?.firstName || '', 
      lastName: c.userDetails?.lastName || '',
      email: c.userDetails?.email || '',
      phoneNumber: c.userDetails?.phoneNumber || '',
      locality: c.userDetails?.locality || '',
      password: ''
    });
    setShowCustomerModal(true);
  };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const customerPayload = {
      userName: customerForm.userName,
      userPassword: customerForm.password || '123456',
      active: 1,
      role: { id: 3, roleName: 'CUSTOMER' },
      userDetails: {
        firstName: customerForm.firstName,
        lastName: customerForm.lastName,
        email: customerForm.email,
        phoneNumber: customerForm.phoneNumber,
        locality: customerForm.locality,
        country: 'Việt Nam'
      }
    };

    try {
      if (editingCustomer) {
        await axios.put(`${ENDPOINTS.users}/${editingCustomer.id}`, customerPayload);
        logActivity(`Cập nhật khách hàng: ${customerForm.userName}`, "UPDATE_CUSTOMER", `Họ tên: ${customerForm.firstName} ${customerForm.lastName}`);
      } else {
        await axios.post(ENDPOINTS.users, customerPayload);
        logActivity(`Thêm khách hàng mới: ${customerForm.userName}`, "CREATE_CUSTOMER", `Họ tên: ${customerForm.firstName} ${customerForm.lastName}`);
      }
      fetchData();
      setShowCustomerModal(false);
    } catch (err) {
      alert("Lỗi: Không thể lưu thông tin khách hàng.");
      console.error(err);
    }
  };

  const handleOpenEditOrder = (order: Order) => {
    setEditingOrder(order);
    setOrderStatusForm(order.status);
    setShowOrderModal(true);
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    try {
      await axios.patch(`${ENDPOINTS.orders}/${editingOrder.id}`, { status: orderStatusForm });
      logActivity(`Cập nhật trạng thái đơn hàng #${editingOrder.id}`, "UPDATE_ORDER_STATUS", `Trạng thái mới: ${orderStatusForm}`);
      
      // Tự động gửi thông báo cho khách hàng
      const orderUser: any = editingOrder.user;
      if (orderUser && orderUser.id) {
        axios.post(ENDPOINTS.createNotification, {
          userId: orderUser.id,
          title: "Cập nhật đơn hàng",
          content: `Đơn hàng #${editingOrder.id} của bạn đã chuyển sang trạng thái: ${orderStatusForm}`,
          type: "ORDER",
          link: "/orders"
        }).catch(err => console.log("Silent error sending notif", err));
      }

      fetchData();
    } catch (err) {
      setOrders(orders.map(o => o.id === editingOrder.id ? { ...o, status: orderStatusForm } : o));
    } finally {
      setShowOrderModal(false);
    }
  };

  const handleOpenAddOrder = () => {
    setNewOrderForm({ userId: '', customerName: '', items: [], status: 'PENDING' });
    const firstProd = products[0];
    setSelectedProduct({ 
      productId: firstProd?.id || 0, 
      quantity: 1, 
      size: firstProd?.sizes?.split(',')[0]?.trim() || '', 
      color: firstProd?.colors?.split(',')[0]?.trim() || '' 
    });
    setShowAddOrderModal(true);
  };
  
  const handleAddItemToOrder = () => {
    const prod = products.find(p => p.id === selectedProduct.productId);
    if (prod) {
      const existing = newOrderForm.items.find((i: any) => 
        i.productId === prod.id && i.selectedSize === selectedProduct.size && i.selectedColor === selectedProduct.color
      );
      
      const currentQtyInOrder = existing ? existing.quantity : 0;
      const totalRequested = currentQtyInOrder + selectedProduct.quantity;
      
      if (totalRequested > (prod.availability || 0)) {
        alert(`Số lượng không đủ! Kho chỉ còn ${prod.availability} sản phẩm.`);
        return;
      }

      if (existing) {
        setNewOrderForm({
          ...newOrderForm,
          items: newOrderForm.items.map((i: any) => 
            (i.productId === prod.id && i.selectedSize === selectedProduct.size && i.selectedColor === selectedProduct.color) 
            ? { ...i, quantity: totalRequested } 
            : i
          )
        });
      } else {
        setNewOrderForm({
          ...newOrderForm,
          items: [...newOrderForm.items, { 
            productId: prod.id, 
            name: prod.productName, 
            price: prod.price, 
            quantity: selectedProduct.quantity,
            selectedSize: selectedProduct.size,
            selectedColor: selectedProduct.color
          }]
        });
      }
    }
  };

  const handleRemoveFromOrder = (id: number) => {
    setNewOrderForm({ ...newOrderForm, items: newOrderForm.items.filter((i: any) => i.productId !== id) });
  };

  const handleAddOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleAddOrderSubmit triggered");
    
    if (newOrderForm.items.length === 0) {
      window.alert("Vui lòng thêm ít nhất một sản phẩm vào đơn hàng!");
      return;
    }
    
    setOrderSubmitting(true);
    setOrderError(null);

    try {
      // Find the selected user or use the typed customer name
      const selectedUser = users.find(u => u.id.toString() === newOrderForm.userId);
      let displayName = 'Khách vãng lai';
      
      if (selectedUser) {
        displayName = selectedUser.userDetails?.firstName ? `${selectedUser.userDetails.firstName} ${selectedUser.userDetails.lastName}` : selectedUser.userName;
      } else if (newOrderForm.customerName) {
        displayName = newOrderForm.customerName;
      }

      const total = newOrderForm.items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);
      
      const backendItems = newOrderForm.items.map((item: any) => ({
        product: {
          id: item.productId,
          productName: item.name,
          price: item.price
        },
        quantity: item.quantity,
        subTotal: item.price * item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor
      }));

      const orderData = { 
        orderedDate: new Date().toISOString().split('T')[0], 
        status: newOrderForm.status || 'PENDING', 
        total: total, 
        user: { 
          id: selectedUser ? selectedUser.id : undefined,
          userName: selectedUser ? selectedUser.userName : (newOrderForm.customerName || displayName)
        }, 
        shippingRecipientName: newOrderForm.shippingRecipientName || displayName,
        shippingPhoneNumber: newOrderForm.shippingPhoneNumber,
        shippingAddress: newOrderForm.shippingAddress,
        items: backendItems 
      };

      console.log("Attempting to post orderData:", orderData);

      const res = await axios.post(ENDPOINTS.orders, orderData);
      const createdOrder = res.data;

      logActivity(
        `Tạo đơn hàng mới: #${createdOrder?.id || 'mới'} cho ${orderData.shippingRecipientName}`,
        "CREATE_ORDER",
        `Tổng tiền: ${orderData.total.toLocaleString()} ₫`
      );

      // Tự động gửi thông báo cho khách hàng
      if (selectedUser) {
        axios.post(ENDPOINTS.createNotification, {
          userId: selectedUser.id,
          title: "Đơn hàng mới đã được tạo",
          content: `Quản trị viên đã tạo đơn hàng #${createdOrder?.id || 'mới'} cho bạn.`,
          type: "ORDER",
          link: "/orders"
        }).catch(err => console.log("Silent error sending notif", err));
      }
      
      console.log("Server response:", res.data);
      
      // Update local state immediately for better UX
      const newOrderWithId = { ...orderData, id: res.data?.id || Date.now() };
      setOrders(prev => [newOrderWithId as any, ...prev]);
      
      window.alert("Chúc mừng! Đơn hàng đã được tạo thành công.");
      
      // Attempt to refresh all data in background
      try {
        await fetchData();
      } catch (fErr) {
        console.warn("Background data refresh failed, but order was created.", fErr);
      }
      
      setShowAddOrderModal(false);
    } catch (err: any) {
      console.error("CRITICAL ERROR in handleAddOrderSubmit:", err);
      let errMsg = "Không thể kết nối đến máy chủ thanh toán.";
      if (err.response) {
        errMsg = `Lỗi ${err.response.status}: ${typeof err.response.data === 'string' ? err.response.data : (err.response.data.message || JSON.stringify(err.response.data))}`;
      } else if (err.request) {
        errMsg = "Yêu cầu đã gửi nhưng không nhận được phản hồi từ Server (Timeout).";
      } else {
        errMsg = err.message;
      }
      setOrderError(errMsg);
      
      // Fallback for demo mode
      window.alert(`Hệ thống đang bận (${errMsg}). Đã lưu tạm đơn hàng vào danh sách hiện tại.`);
      const fallbackOrder = { 
        orderedDate: new Date().toISOString().split('T')[0],
        status: 'PENDING',
        total: newOrderForm.items.reduce((s: any, i: any) => s + i.price * i.quantity, 0),
        id: Date.now(),
        user: { userName: newOrderForm.customerName || 'Khách Demo' }
      };
      logActivity(
        `Tạo đơn hàng mới (Demo): #${fallbackOrder.id} cho ${newOrderForm.shippingRecipientName || fallbackOrder.user.userName}`,
        "CREATE_ORDER",
        `Tổng tiền: ${fallbackOrder.total.toLocaleString()} ₫`
      );
      setOrders(prev => [fallbackOrder as any, ...prev]);
    } finally {
      setOrderSubmitting(false);
    }
  };

  const handleCompletePayment = async (orderId: number) => {
    try {
      // Gọi đúng API POST /pay của Order Service
      await axios.post(`${ENDPOINTS.orders}/${orderId}/pay`);
      logActivity(`Xác nhận thanh toán đơn hàng #${orderId}`, "PAY_ORDER", `Đơn hàng đã thanh toán thành công.`);
      fetchData();
      setActiveTab(lastTab);
      setCurrentInvoiceOrder(null);
      alert("Đã thanh toán thành công. Dữ liệu đã được lưu vào database.");
    } catch (err) {
      console.error("Lỗi thanh toán:", err);
      // Logic fallback cho demo nếu backend không phản hồi
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'PAID' } : o));
      logActivity(`Xác nhận thanh toán đơn hàng (Demo) #${orderId}`, "PAY_ORDER", `Thanh toán demo.`);
      setActiveTab(lastTab);
      setCurrentInvoiceOrder(null);
      alert("Chế độ Demo: Đã cập nhật giao diện (Vui lòng kiểm tra lại kết nối backend để lưu vĩnh viễn).");
    }
  };

  const handleCollectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCollection) await axios.put(`${ENDPOINTS.adminCollections}/${editingCollection.id}`, collectionForm);
      else await axios.post(ENDPOINTS.adminCollections, collectionForm);
      logActivity(
        `${editingCollection ? 'Cập nhật' : 'Thêm'} bộ sưu tập: ${collectionForm.name}`,
        `${editingCollection ? 'UPDATE' : 'CREATE'}_COLLECTION`,
        `Thương hiệu ID: ${collectionForm.brandId}`
      );
      setShowCollectionModal(false);
      fetchData();
    } catch (err) { alert("Lỗi lưu bộ sưu tập."); }
  };

  const handleOpenAddCollection = () => {
    setEditingCollection(null);
    setCollectionForm({ name: '', bannerUrl: '', products: [] });
    setShowCollectionModal(true);
  };

  const handleOpenEditCollection = (c: Collection) => {
    setEditingCollection(c);
    setCollectionForm(c);
    setShowCollectionModal(true);
  };

  const handleDeleteCollection = async (id: number) => {
    if (!window.confirm("Xóa bộ sưu tập này?")) return;
    try { await axios.delete(`${ENDPOINTS.adminCollections}/${id}`); fetchData(); } catch (err) { alert("Lỗi xóa bộ sưu tập."); }
  };

  const handleCollectionBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCollectionForm(prev => ({ ...prev, bannerUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStoreInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(ENDPOINTS.adminStoreInfo, storeInfo);
      alert("Đã cập nhật thông tin cửa hàng thành công!");
      fetchData();
    } catch (err) { alert("Lỗi lưu thông tin cửa hàng."); }
  };

  const handleUserAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUserForm({
          ...userForm,
          firstName: userForm.firstName || '',
          lastName: userForm.lastName || '',
          avatar: base64String
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Dashboard Logic ---
  const getDashboardData = () => {
    const productStats: Record<string, number> = {};
    orders.forEach(o => o.items?.forEach(i => {
      // Get product name from either flat attribute or nested product object
      const name = i.product?.productName || i.productName || 'Sản phẩm không tên';
      const quantity = i.quantity || 0;
      productStats[name] = (productStats[name] || 0) + quantity;
    }));
    const topProducts = Object.entries(productStats)
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value)
      .slice(0, 5);
    
    const catStats: Record<string, number> = {};
    orders.forEach(o => o.items?.forEach(i => {
      const name = i.product?.productName || i.productName;
      const p = products.find(prod => prod.productName === name);
      const catName = p?.category || 'Khác';
      const revenue = (i.product?.price || i.price || 0) * (i.quantity || 0);
      catStats[catName] = (catStats[catName] || 0) + revenue;
    }));
    const categoryData = Object.entries(catStats).map(([name, value]) => ({ name, value }));

    const revStats: Record<string, number> = {};
    orders.forEach(o => {
      if (o.orderedDate) {
        const d = new Date(o.orderedDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        revStats[d] = (revStats[d] || 0) + (o.total || 0);
      }
    });
    const revenueData = Object.entries(revStats).map(([date, revenue]) => ({ date, revenue }));

    return { topProducts, categoryData, revenueData };
  };

  const getLowStockItems = () => {
    return products.flatMap(p => {
      if (p.variants && p.variants.length > 0) {
        return p.variants.filter(v => v.stock < 5).map(v => ({
          ...p, // Keep product info
          color: v.color,
          size: v.size,
          stock: v.stock,
          isVariant: true
        }));
      } else {
        if (p.availability < 5) {
          return [{
            ...p,
            color: null,
            size: null,
            stock: p.availability,
            isVariant: false
          }];
        }
        return [];
      }
    });
  };

  const getReturnPurchaseRate = () => {
    const userOrderCounts: Record<string, number> = {};
    orders.forEach(o => {
      const uId = o.user?.id || o.user?.userName;
      if (uId) {
        userOrderCounts[uId] = (userOrderCounts[uId] || 0) + 1;
      }
    });
    const totalCustomers = Object.keys(userOrderCounts).length;
    const repeatCustomers = Object.values(userOrderCounts).filter(count => count > 1).length;
    return totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;
  };

  const dashData = getDashboardData();
  const lowStockItems = getLowStockItems();
  const returnRate = getReturnPurchaseRate();
  const COLORS = ['#f9a8d4', '#f472b6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <div className="login-card glass fade-in">
          <div className="login-header">
            <div className="logo-box" style={{ margin: '0 auto 16px' }}><LayoutDashboard color="white" /></div>
            <h1>CtusAdmin</h1>
            <p>Đăng nhập để tiếp tục</p>
          </div>
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group"><label>User</label><input type="text" required value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} /></div>
            <div className="form-group"><label>Pass</label><input type="password" required value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} /></div>
            <button type="submit" className="primary-btn login-btn" disabled={loginLoading}>Đăng nhập</button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) return <div className="loading-screen"><div className="animate-spin"></div><p>Đang tải...</p></div>;

  return (
    <div className="app-container">
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header"><LayoutDashboard size={20} /><span className="logo-text">CtusAdmin</span></div>
        <nav className="nav-list">
          <SidebarItem icon={LayoutDashboard} text="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={Package} text="Sản phẩm" active={activeTab === 'products'} onClick={() => setActiveTab('products')} />
          <SidebarItem icon={Tags} text="Danh mục" active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} />
          <SidebarItem icon={Award} text="Thương hiệu" active={activeTab === 'brands'} onClick={() => setActiveTab('brands')} />
          <SidebarItem icon={ShoppingCart} text="Đơn hàng" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
          <SidebarItem icon={Users} text="Khách hàng" active={activeTab === 'customers'} onClick={() => setActiveTab('customers')} />
          <SidebarItem icon={Award} text="Hạng thành viên" active={activeTab === 'membership'} onClick={() => setActiveTab('membership')} />
          <SidebarItem icon={Percent} text="Khuyến mãi" active={activeTab === 'promotions'} onClick={() => setActiveTab('promotions')} />
          <SidebarItem icon={ImageIcon} text="Banners" active={activeTab === 'banners'} onClick={() => setActiveTab('banners')} collapsed={collapsed} />
          <SidebarItem icon={Zap} text="Flash Sale" active={activeTab === 'flash-sales'} onClick={() => setActiveTab('flash-sales')} collapsed={collapsed} />
          <SidebarItem icon={CreditCard} text="Thanh toán" active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} collapsed={collapsed} />
          <SidebarItem icon={Star} text="Đánh giá" active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')} />
          <SidebarItem icon={MessageSquare} text="Tin nhắn" active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} />
          <SidebarItem icon={Zap} text="Bộ sưu tập" active={activeTab === 'collections'} onClick={() => setActiveTab('collections')} />
          <SidebarItem icon={Settings} text="Cấu hình & Footer" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          <SidebarItem icon={MessageSquare} text="Trợ lý ảo (FAQ)" active={activeTab === 'faqs'} onClick={() => setActiveTab('faqs')} />
          <SidebarItem icon={Bell} text="Thông báo" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
          <SidebarItem icon={UserPlus} text="Nhân sự" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
          <SidebarItem icon={Clock} text="Nhật ký hoạt động" active={activeTab === 'activity-logs'} onClick={() => { setActiveTab('activity-logs'); fetchActivityLogs(); }} />
          <div style={{ marginTop: 'auto' }}><SidebarItem icon={LogOut} text="Đăng xuất" onClick={handleLogout} /></div>
        </nav>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <div className="search-box"><Search size={18} /><input type="text" placeholder="Tìm kiếm..." /></div>
          <div className="user-profile-trigger" onClick={() => setShowProfileModal(true)}>
            <div className="responsive-hide" style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600 }}>
                {currentUser?.userDetails?.firstName 
                  ? `${currentUser.userDetails.firstName} ${currentUser.userDetails.lastName}` 
                  : currentUser?.userName}
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                {(currentUser?.role && typeof currentUser.role === 'object') ? currentUser.role.roleName : (typeof currentUser?.role === 'string' ? currentUser.role : 'Nhân viên')}
              </div>
            </div>
            <div className="user-avatar-circle">
              {currentUser?.userDetails?.avatar ? (
                <img src={currentUser.userDetails.avatar} alt="Avatar" />
              ) : (
                <User size={20} />
              )}
            </div>
          </div>
          
          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <div 
              className="notification-bell" 
              style={{ 
                marginLeft: '20px', 
                cursor: 'pointer', 
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: isNotificationsOpen ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                transition: 'all 0.3s'
              }}
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              title="Thông báo"
            >
              <Bell size={20} />
              {(lowStockItems.length + unreadAdminCount) > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  border: '2px solid #1a1a1a'
                }}>
                  {lowStockItems.length + unreadAdminCount}
                </span>
              )}
            </div>

            {isNotificationsOpen && (
              <>
                <div 
                  style={{ position: 'fixed', inset: 0, zIndex: 998 }} 
                  onClick={() => setIsNotificationsOpen(false)} 
                />
                <div 
                  className="fade-in"
                  style={{ 
                    position: 'absolute', 
                    top: '100%', 
                    right: 0, 
                    marginTop: '12px', 
                    width: '320px', 
                    background: '#1e1e1e', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '12px', 
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)', 
                    zIndex: 999,
                    overflow: 'hidden',
                    animation: 'dropdownFade 0.2s ease-out'
                  }}
                >
                  <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Thông báo hệ thống</span>
                    <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>{(lowStockItems.length + unreadAdminCount)} thông báo</span>
                  </div>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {/* System Notifications */}
                    {adminNotifications.map((n, idx) => (
                      <div 
                        key={`sys-${idx}`} 
                        style={{ 
                          padding: '12px 16px', 
                          borderBottom: '1px solid rgba(255,255,255,0.05)', 
                          cursor: 'pointer',
                          background: !n.isRead ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
                        }}
                        onClick={() => {
                          handleMarkAdminAsRead(n.id);
                          if (n.link) {
                             if (n.link === '/orders') setActiveTab('orders');
                             else if (n.link.startsWith('/order/')) setActiveTab('orders');
                          }
                          setIsNotificationsOpen(false);
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.65rem', color: '#3b82f6', fontWeight: 'bold' }}>{n.type}</span>
                          <span style={{ fontSize: '0.6rem', opacity: 0.4 }}>{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', fontWeight: !n.isRead ? 'bold' : 'normal', marginBottom: '2px' }}>{n.title}</div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.6, lineHeight: '1.4' }}>{n.content}</div>
                      </div>
                    ))}

                    {/* Stock Warnings Header */}
                    {lowStockItems.length > 0 && (
                      <div style={{ padding: '8px 16px', background: 'rgba(239, 68, 68, 0.1)', fontSize: '0.65rem', fontWeight: 'bold', color: '#ef4444', textTransform: 'uppercase' }}>
                        Cảnh báo tồn kho
                      </div>
                    )}
                    {lowStockItems.map((item, idx) => (
                      <div 
                        key={`stock-${idx}`} 
                        style={{ 
                          padding: '12px 16px', 
                          borderBottom: '1px solid rgba(255,255,255,0.05)', 
                          cursor: 'pointer',
                          display: 'flex',
                          gap: '12px',
                          alignItems: 'center'
                        }}
                        className="hover-bg-white-5"
                        onClick={() => {
                          setSelectedProductDetail(item);
                          setShowProductDetailModal(true);
                          setIsNotificationsOpen(false);
                        }}
                      >
                        <img src={formatImageUrl(item.image)} alt="" style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '2px' }}>{item.productName}</div>
                          <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>
                            {item.isVariant ? `${item.color} / ${item.size}` : 'Mặc định'} • Còn <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{item.stock}</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {adminNotifications.length === 0 && lowStockItems.length === 0 && (
                      <div style={{ padding: '40px 20px', textAlign: 'center', opacity: 0.4 }}>
                        <Bell size={24} style={{ marginBottom: '12px', opacity: 0.2 }} />
                        <div style={{ fontSize: '0.75rem' }}>Không có thông báo nào</div>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '12px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <button 
                      style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase' }}
                      onClick={() => { setActiveTab('dashboard'); setIsNotificationsOpen(false); }}
                    >
                      Xem chi tiết trên Dashboard
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        <div className="page-container">
          {activeTab === 'dashboard' && (
            <div className="fade-in">
              {lowStockItems.length > 0 && (
                <div className="dashboard-card glass fade-in" style={{ marginBottom: '24px', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}>
                  <div className="card-title" style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertTriangle size={20} />
                    Cảnh báo tồn kho (Dưới 5 sản phẩm)
                  </div>
                  <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ textAlign: 'left', opacity: 0.6 }}>
                          <th>Sản phẩm</th>
                          <th>Phân loại</th>
                          <th>Số lượng</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lowStockItems.map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '12px 0' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <img src={formatImageUrl(item.image)} alt={item.productName} style={{ width: '30px', height: '30px', borderRadius: '4px', objectFit: 'cover' }} />
                                <span>{item.productName}</span>
                              </div>
                            </td>
                            <td>
                              {item.isVariant ? (
                                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                  {item.color} / {item.size}
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>Mặc định</span>
                              )}
                            </td>
                            <td>
                              <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{item.stock}</span>
                            </td>
                            <td>
                              <button 
                                className="icon-btn view" 
                                style={{ color: '#3b82f6' }} 
                                onClick={() => { 
                                  setSelectedProductDetail(item); 
                                  setShowProductDetailModal(true); 
                                }}
                              >
                                <Eye size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <StatCard 
                  title="Doanh thu" 
                  value={`${totalRevenue.toLocaleString()} ₫`} 
                  icon={TrendingUp} 
                  trend="up" 
                  trendValue="+12%" 
                  color="#f9a8d4" 
                  onClick={() => setActiveTab('payments')}
                />
                <StatCard 
                  title="Đơn hàng" 
                  value={orders.length} 
                  icon={ShoppingCart} 
                  color="#10b981" 
                  onClick={() => setActiveTab('orders')}
                />
                <StatCard 
                  title="Khách hàng" 
                  value={customersList.length} 
                  icon={Users} 
                  color="#f59e0b" 
                  onClick={() => setActiveTab('customers')}
                />
                <StatCard 
                  title="Sản phẩm" 
                  value={products.length} 
                  icon={Package} 
                  color="#3b82f6" 
                  onClick={() => setActiveTab('products')}
                />
                <StatCard 
                  title="Nhân viên" 
                  value={staffList.length} 
                  icon={UserPlus} 
                  color="#a855f7" 
                  onClick={() => setActiveTab('users')}
                />
                <StatCard 
                  title="Tỉ lệ quay lại" 
                  value={`${returnRate.toFixed(1)}%`} 
                  icon={Zap} 
                  color="#fbbf24" 
                />
              </div>

              <div className="dashboard-layout" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div className="dashboard-card glass">
                  <div className="card-title">Doanh thu</div>
                  <div style={{ height: 250 }}><ResponsiveContainer><AreaChart data={dashData.revenueData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" /><XAxis dataKey="date" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><RechartsTooltip /><Area type="monotone" dataKey="revenue" stroke="#f9a8d4" fill="#f9a8d420" /></AreaChart></ResponsiveContainer></div>
                </div>
                <div className="dashboard-card glass">
                  <div className="card-title">Tỉ lệ khách hàng mới/cũ</div>
                  <div style={{ height: 250 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie 
                          data={[
                            { name: 'Khách quay lại', value: orders.filter(o => orders.filter(o2 => o2.user?.id === o.user?.id).length > 1).length },
                            { name: 'Khách mới', value: orders.filter(o => orders.filter(o2 => o2.user?.id === o.user?.id).length === 1).length }
                          ]} 
                          innerRadius={60} 
                          outerRadius={80} 
                          dataKey="value"
                        >
                          <Cell fill="#f9a8d4" />
                          <Cell fill="#3b82f6" />
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="dashboard-card glass">
                  <div className="card-title">Danh mục</div>
                  <div style={{ height: 250 }}><ResponsiveContainer><PieChart><Pie data={dashData.categoryData} innerRadius={60} outerRadius={80} dataKey="value">{dashData.categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><RechartsTooltip /></PieChart></ResponsiveContainer></div>
                </div>
              </div>
              <div className="dashboard-card glass" style={{ marginTop: '24px' }}>
                <div className="card-title">Sản phẩm bán chạy</div>
                <div className="table-container">
                  <table style={{ width: '100%', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', opacity: 0.6 }}>
                        <th>Xếp hạng</th>
                        <th>Sản phẩm</th>
                        <th>Đã bán</th>
                        <th>Xu hướng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashData.topProducts.map((p, i) => (
                        <tr key={p.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '12px 0' }}>
                            <span style={{ 
                              background: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#b45309' : 'rgba(255,255,255,0.1)',
                              color: i < 3 ? 'black' : 'white',
                              borderRadius: '4px', padding: '2px 8px', fontWeight: 'bold'
                            }}>
                              #{i + 1}
                            </span>
                          </td>
                          <td>{p.name}</td>
                          <td>{p.value} cái</td>
                          <td><TrendingUp size={16} color="#10b981" /></td>
                        </tr>
                      ))}
                      {dashData.topProducts.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: '20px', opacity: 0.5 }}>Chưa có dữ liệu sản phẩm</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}


          {activeTab === 'collections' && (
            <div className="fade-in">
              <div className="page-header"><h1>Bộ sưu tập</h1><button className="primary-btn" onClick={handleOpenAddCollection}><Plus /> Thêm mới</button></div>
              <div className="dashboard-card glass">
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Banner</th>
                        <th>Tên bộ sưu tập</th>
                        <th>Thương hiệu</th>
                        <th>Sản phẩm</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {collections.map(c => (
                        <tr key={c.id}>
                          <td><img src={c.bannerUrl} alt={c.name} style={{ width: '80px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} /></td>
                          <td><div className="font-bold">{c.name}</div></td>
                          <td>{brands.find(b => b.id === c.brandId)?.name || 'N/A'}</td>
                          <td>{c.products?.length || 0} sản phẩm</td>
                          <td>
                            <div className="action-menu">
                              <button className="icon-btn edit" onClick={() => handleOpenEditCollection(c)}><Edit2 size={16} /></button>
                              <button className="icon-btn delete" onClick={() => handleDeleteCollection(c.id!)}><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {collections.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px', opacity: 0.5 }}>Chưa có bộ sưu tập nào</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="fade-in">
              <div className="page-header"><h1>Cài đặt cửa hàng</h1></div>
              <div className="dashboard-card glass" style={{ maxWidth: '800px' }}>
                <form onSubmit={handleStoreInfoSubmit} className="product-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Tên cửa hàng</label>
                      <input type="text" value={storeInfo.storeName} onChange={e => setStoreInfo({...storeInfo, storeName: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Số điện thoại</label>
                      <input type="text" value={storeInfo.phone} onChange={e => setStoreInfo({...storeInfo, phone: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Email liên hệ</label>
                    <input type="email" value={storeInfo.email} onChange={e => setStoreInfo({...storeInfo, email: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Địa chỉ</label>
                    <input type="text" value={storeInfo.address} onChange={e => setStoreInfo({...storeInfo, address: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Về chúng tôi (Footer)</label>
                    <textarea value={storeInfo.aboutUs} onChange={e => setStoreInfo({...storeInfo, aboutUs: e.target.value})} style={{ minHeight: '100px' }} />
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Facebook URL</label>
                      <input type="text" value={storeInfo.facebookUrl} onChange={e => setStoreInfo({...storeInfo, facebookUrl: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Instagram URL</label>
                      <input type="text" value={storeInfo.instagramUrl} onChange={e => setStoreInfo({...storeInfo, instagramUrl: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Bản quyền (Copyright)</label>
                    <input type="text" value={storeInfo.copyrightText} onChange={e => setStoreInfo({...storeInfo, copyrightText: e.target.value})} />
                  </div>
                  <div className="modal-actions" style={{ justifyContent: 'flex-start' }}>
                    <button type="submit" className="primary-btn">Lưu thay đổi</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="fade-in">
              <div className="page-header">
                <div className="welcome-msg">
                  <h1>Quản lý Thông báo</h1>
                  <p>Gửi tin nhắn trực tiếp đến khách hàng của bạn.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="dashboard-card glass">
                  <div className="card-title">Gửi thông báo mới</div>
                  <form className="modal-form" onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSendingNotif(true);
                    try {
                      if (notificationForm.userId === 'ALL') {
                        // Send to all customers
                        const promises = (customersList || []).map(c => axios.post(ENDPOINTS.createNotification, {
                          userId: c.id,
                          title: notificationForm.title,
                          content: notificationForm.content,
                          type: notificationForm.type,
                          link: notificationForm.link
                        }));
                        await Promise.all(promises);
                      } else {
                        await axios.post(ENDPOINTS.createNotification, {
                          ...notificationForm,
                          userId: Number(notificationForm.userId)
                        });
                      }
                      alert("Gửi thông báo thành công!");
                      setNotificationForm({ userId: 'ALL', title: '', content: '', type: 'SYSTEM', link: '' });
                    } catch (err) {
                      alert("Lỗi khi gửi thông báo.");
                    } finally {
                      setIsSendingNotif(false);
                    }
                  }}>
                    <div className="form-group">
                      <label>Gửi đến</label>
                      <select 
                        value={notificationForm.userId}
                        onChange={e => setNotificationForm({...notificationForm, userId: e.target.value})}
                      >
                        <option value="ALL">Tất cả khách hàng</option>
                        {customersList.map(c => <option key={c.id} value={c.id}>{c.userDetails?.firstName} {c.userDetails?.lastName} ({c.userName})</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Tiêu đề</label>
                      <input 
                        type="text" 
                        required 
                        value={notificationForm.title}
                        onChange={e => setNotificationForm({...notificationForm, title: e.target.value})}
                        placeholder="VD: Flash Sale sắp bắt đầu!"
                      />
                    </div>
                    <div className="form-group">
                      <label>Nội dung</label>
                      <textarea 
                        required 
                        style={{ minHeight: '100px' }}
                        value={notificationForm.content}
                        onChange={e => setNotificationForm({...notificationForm, content: e.target.value})}
                        placeholder="Nhập nội dung thông báo..."
                      />
                    </div>
                    <div className="form-group">
                      <label>Loại thông báo</label>
                      <select 
                        value={notificationForm.type}
                        onChange={e => setNotificationForm({...notificationForm, type: e.target.value})}
                      >
                        <option value="SYSTEM">Hệ thống</option>
                        <option value="ORDER">Đơn hàng</option>
                        <option value="PROMOTION">Khuyến mãi</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Liên kết (Link)</label>
                      <input 
                        type="text" 
                        value={notificationForm.link}
                        onChange={e => setNotificationForm({...notificationForm, link: e.target.value})}
                        placeholder="VD: /orders hoặc /category/Sale"
                      />
                    </div>
                    <button type="submit" className="primary-btn" disabled={isSendingNotif} style={{ width: '100%', justifyContent: 'center' }}>
                      {isSendingNotif ? 'Đang gửi...' : 'Gửi thông báo ngay'}
                    </button>
                  </form>
                </div>

                <div className="dashboard-card glass">
                  <div className="card-title">Mẹo sử dụng</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                    <p style={{ marginBottom: '12px' }}>• <strong>Loại Đơn hàng:</strong> Nên đính kèm link tới <code>/orders</code> để khách xem chi tiết.</p>
                    <p style={{ marginBottom: '12px' }}>• <strong>Khuyến mãi:</strong> Sử dụng tiêu đề hấp dẫn để tăng tỉ lệ click.</p>
                    <p style={{ marginBottom: '12px' }}>• <strong>Hệ thống:</strong> Dùng cho các cập nhật bảo trì hoặc thay đổi chính sách.</p>
                  </div>
                </div>
              </div>
            </div>
          )}


          {activeTab === 'faqs' && (
            <div className="fade-in">
              <div className="page-header">
                <h1>Quản lý Trợ lý ảo (FAQ)</h1>
                <button className="primary-btn" onClick={() => { setEditingFaq(null); setFaqForm({ keyword: '', answer: '' }); setShowFaqModal(true); }}>
                  <Plus /> Thêm câu hỏi
                </button>
              </div>
              <div className="dashboard-card glass">
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Từ khóa (Keyword)</th>
                        <th>Câu trả lời của Bot</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {faqs.length === 0 && (
                        <tr>
                          <td colSpan={3} style={{ textAlign: 'center', padding: '40px 0', opacity: 0.5 }}>Chưa có câu hỏi nào được thiết lập.</td>
                        </tr>
                      )}
                      {faqs.map(faq => (
                        <tr key={faq.id}>
                          <td style={{ fontWeight: 'bold', color: 'var(--accent)' }}>{faq.keyword}</td>
                          <td style={{ maxWidth: '400px', whiteSpace: 'pre-wrap' }}>{faq.answer}</td>
                          <td>
                            <div className="action-menu">
                              <button className="icon-btn edit" onClick={() => { setEditingFaq(faq); setFaqForm(faq); setShowFaqModal(true); }}>
                                <Edit2 size={16} />
                              </button>
                              <button className="icon-btn delete" onClick={() => handleDeleteFaq(faq.id!)}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="fade-in">
              <div className="page-header"><h1>Sản phẩm</h1><button className="primary-btn" onClick={handleOpenAddProduct}><Plus /> Thêm mới</button></div>
              <div className="dashboard-card glass">
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Ảnh</th>
                        <th>Tên</th>
                        <th>Loại</th>
                        <th>Giá</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => {
                        const isActive = p.active !== 0; // Mặc định là 1 nếu null hoặc undefined
                        return (
                          <tr key={p.id} style={{ opacity: !isActive ? 0.5 : 1 }}>
                            <td><img src={formatImageUrl(p.image)} alt={p.productName} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} onError={(e: any) => e.target.src = DEFAULT_PRODUCT_IMAGE} /></td>
                            <td>
                              <div className="font-bold">{p.productName}</div>
                              {!isActive && <div style={{ fontSize: '0.7rem', color: '#ef4444' }}>[ĐÃ ẨN]</div>}
                            </td>
                            <td>{p.category}</td>
                            <td>{p.price?.toLocaleString()} ₫</td>
                            <td>
                               <span className={`status-badge ${isActive ? 'status-completed' : 'status-cancelled'}`}>
                                  {isActive ? 'Đang bán' : 'Ngừng bán'}
                               </span>
                            </td>
                            <td>
                              <div className="action-menu">
                                <button className="icon-btn view" title="Xem chi tiết" style={{ color: '#3b82f6' }} onClick={() => { setSelectedProductDetail(p); setShowProductDetailModal(true); }}><Eye size={16} /></button>
                                <button className="icon-btn edit" title="Sửa" onClick={() => handleOpenEditProduct(p)}><Edit2 size={16} /></button>
                                <button 
                                  className="icon-btn" 
                                  title={isActive ? 'Ẩn sản phẩm' : 'Hiện sản phẩm'} 
                                  style={{ color: isActive ? '#94a3b8' : '#10b981' }}
                                  onClick={async () => {
                                    try {
                                      // Xác định trạng thái mới: Nếu đang active thì gửi 0, ngược lại gửi 1
                                      const newStatus = isActive ? 0 : 1;
                                      const updatedProduct = { ...p, active: newStatus };
                                      await axios.put(`${ENDPOINTS.adminProducts}/${p.id}`, updatedProduct);
                                      fetchData();
                                    } catch (err) { 
                                      console.error("Update failed", err);
                                      alert("Lỗi cập nhật trạng thái."); 
                                    }
                                  }}
                                >
                                  {isActive ? <X size={16} /> : <CheckCircle2 size={16} />}
                                </button>
                                <button className="icon-btn delete" title="Xóa vĩnh viễn" onClick={() => handleDeleteProduct(p.id!)}><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="fade-in">
              <div className="page-header"><h1>Danh mục</h1><button className="primary-btn" onClick={() => { setEditingCategory(null); setCategoryForm({ name: '', description: '' }); setShowCategoryModal(true); }}><Plus /> Tạo mới</button></div>
              <div className="dashboard-card glass"><div className="table-container"><table><thead><tr><th>ID</th><th>Tên</th><th>Mô tả</th><th>Thao tác</th></tr></thead><tbody>{categories.map(c => <tr key={c.id}><td>#{c.id}</td><td>{c.name}</td><td>{c.description}</td><td><div className="action-menu"><button className="icon-btn edit" onClick={() => { setEditingCategory(c); setCategoryForm(c); setShowCategoryModal(true); }}><Edit2 size={16} /></button><button className="icon-btn delete" onClick={() => handleDeleteCategory(c.id!)}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div></div>
            </div>
          )}

          {activeTab === 'brands' && (
            <div className="fade-in">
              <div className="page-header"><h1>Thương hiệu</h1><button className="primary-btn" onClick={() => { setEditingBrand(null); setBrandForm({ name: '', description: '', image: '' }); setShowBrandModal(true); }}><Plus /> Tạo mới</button></div>
              <div className="dashboard-card glass"><div className="table-container"><table><thead><tr><th>Logo</th><th>ID</th><th>Tên</th><th>Mô tả</th><th>Thao tác</th></tr></thead><tbody>{brands.map(b => <tr key={b.id}><td><img src={formatImageUrl(b.image, true)} alt={b.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} /></td><td>#{b.id}</td><td>{b.name}</td><td>{b.description}</td><td><div className="action-menu"><button className="icon-btn edit" onClick={() => { setEditingBrand(b); setBrandForm(b); setShowBrandModal(true); }}><Edit2 size={16} /></button><button className="icon-btn delete" onClick={() => handleDeleteBrand(b.id!)}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div></div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="fade-in">
              <div className="page-header">
                <h1>Đơn hàng</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select 
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0 15px', fontSize: '0.85rem', cursor: 'pointer' }}
                    value={orderSort}
                    onChange={(e) => setOrderSort(e.target.value as any)}
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                  </select>
                  <button className="primary-btn" onClick={handleOpenAddOrder}><Plus /> Tạo đơn</button>
                </div>
              </div>
              <div className="dashboard-card glass">
                <div className="table-container">
                  <table>
                    <thead>
                      <tr><th>ID</th><th>Khách</th><th>Tổng</th><th>Trạng thái</th><th>Thao tác</th></tr>
                    </thead>
                    <tbody>
                      {orders
                        .sort((a, b) => orderSort === 'newest' ? b.id - a.id : a.id - b.id)
                        .map(o => (
                        <tr key={o.id}>
                          <td className="font-bold">#{o.id}</td>
                          <td>{o.shippingRecipientName || o.user?.userName || 'Khách vãng lai'}</td>
                          <td className="font-bold" style={{ color: '#f9a8d4' }}>{o.total?.toLocaleString()} ₫</td>
                          <td><StatusBadge status={o.status} /></td>
                          <td>
                            <div className="action-menu">
                              <button className="icon-btn edit" title="Sửa trạng thái" onClick={() => handleOpenEditOrder(o)}><Edit2 size={16} /></button>
                              <button className="icon-btn" title="Xem hóa đơn" style={{ color: '#fbbf24' }} onClick={() => { setCurrentInvoiceOrder(o); setLastTab('orders'); setActiveTab('invoice'); }}>
                                <FileText size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>Chưa có đơn hàng nào.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="fade-in">
              <div className="page-header">
                <h1>Khách hàng <span style={{ fontSize: '1rem', opacity: 0.5 }}>(Tổng: {customersList.length})</span></h1>
                <button className="primary-btn" onClick={handleOpenAddCustomer}><UserPlus /> Thêm khách</button>
              </div>
              <div className="dashboard-card glass"><div className="table-container"><table><thead><tr><th>ID</th><th>Tên/Tài khoản</th><th>Email</th><th>Hạng</th><th>Địa chỉ</th><th>Thao tác</th></tr></thead><tbody>{customersList.map(u => {
                const tier = u.userDetails?.membershipTier;
                const tierName = tier?.tierName || 'Cơ bản';
                
                // Cấu hình màu sắc cho hạng
                let tierStyle = { background: 'rgba(148, 163, 184, 0.2)', color: '#94a3b8' }; // Default (Silver/Basic)
                if (tierName.toUpperCase().includes('GOLD') || tierName.toUpperCase().includes('VÀNG')) {
                  tierStyle = { background: 'rgba(234, 179, 8, 0.2)', color: '#eab308' };
                } else if (tierName.toUpperCase().includes('DIAMOND') || tierName.toUpperCase().includes('KIM CƯƠNG')) {
                  tierStyle = { background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' };
                } else if (tierName.toUpperCase().includes('PLATINUM') || tierName.toUpperCase().includes('BẠCH KIM')) {
                  tierStyle = { background: 'rgba(168, 85, 247, 0.2)', color: '#a855f7' };
                } else if (tierName.toUpperCase().includes('BRONZE') || tierName.toUpperCase().includes('ĐỒNG')) {
                  tierStyle = { background: 'rgba(180, 83, 9, 0.2)', color: '#b45309' };
                }

                return (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td>{u.userDetails?.firstName ? `${u.userDetails.firstName} ${u.userDetails.lastName}` : (u.userName || 'Chưa đặt tên')}</td>
                    <td>{u.userDetails?.email || 'N/A'}</td>
                    <td>
                      <span className="status-tag" style={tierStyle}>
                        {tierName}
                      </span>
                    </td>
                    <td>{u.userDetails?.locality || 'N/A'}</td>
                    <td><div className="action-menu"><button className="icon-btn edit" onClick={() => handleOpenEditCustomer(u)}><Edit2 size={16} /></button><button className="icon-btn delete" onClick={() => handleDeleteUser(u.id)}><Trash2 size={16} /></button></div></td>
                  </tr>
                );
              })}</tbody></table></div></div>
            </div>
          )}

          {activeTab === 'membership' && (
            <div className="fade-in">
              <div className="page-header">
                <h1>Quản lý Hạng thành viên</h1>
                <button className="primary-btn" onClick={handleOpenAddTier}>
                  <Plus /> Thêm hạng mới
                </button>
              </div>
              <div className="dashboard-card glass">
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Thứ tự</th>
                        <th>Tên hạng</th>
                        <th>Chi tiêu tối thiểu</th>
                        <th>Ưu đãi</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {membershipTiers.sort((a,b) => (a.tierOrder || 0) - (b.tierOrder || 0)).map(tier => (
                        <tr key={tier.id}>
                          <td>{tier.tierOrder}</td>
                          <td className="font-bold">{tier.tierName}</td>
                          <td>{tier.minSpending?.toLocaleString()} ₫</td>
                          <td>
                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                              <span className="status-tag" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>Giảm {tier.discountPercent}%</span>
                              {tier.freeShipping && <span className="status-tag" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}>Freeship</span>}
                              {tier.priorityFlashSale && <span className="status-tag" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}>Ưu tiên Flash</span>}
                            </div>
                          </td>
                          <td>
                            <div className="action-menu">
                              <button className="icon-btn edit" onClick={() => handleOpenEditTier(tier)}><Edit2 size={16} /></button>
                              <button className="icon-btn delete" onClick={() => handleDeleteTier(tier.id!)}><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {membershipTiers.length === 0 && (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>Chưa có hạng thành viên nào.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'promotions' && (
            <div className="fade-in">
              <div className="page-header">
                <h1>Chương trình Khuyến mãi</h1>
                <button className="primary-btn" onClick={() => { 
                  setEditingPromotion(null); 
                  setPromotionForm({ title: '', code: '', discount: 0, validUntil: '', usageLimit: 100, isUnlimited: true, applicableProducts: ['ALL'] }); 
                  setShowPromotionModal(true); 
                }}>
                  <Plus /> Thêm mã mới
                </button>
              </div>
              <div className="dashboard-card glass">
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Tên chương trình</th>
                        <th>Mã giảm giá</th>
                        <th>Mức giảm</th>
                        <th>Hạn dùng</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {promotions.map(promo => (
                        <tr key={promo.id}>
                          <td className="font-bold">{promo.title}</td>
                          <td><span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '8px', fontFamily: 'monospace', color: '#f9a8d4' }}>{promo.code}</span></td>
                          <td>{promo.discount}%</td>
                          <td>{new Date(promo.validUntil).toLocaleDateString('vi-VN')}</td>
                          <td>
                            <div className="action-menu">
                              <button className="icon-btn edit" onClick={() => { 
                                setEditingPromotion(promo); 
                                setPromotionForm({
                                  ...promo,
                                  isUnlimited: promo.isUnlimited ?? true,
                                  usageLimit: promo.usageLimit ?? 100,
                                  applicableProducts: promo.applicableProducts ?? ['ALL']
                                }); 
                                setShowPromotionModal(true); 
                              }}><Edit2 size={16} /></button>
                              <button className="icon-btn delete" onClick={async () => { 
                                if(window.confirm('Xóa mã này?')) {
                                  try {
                                    await axios.delete(`${ENDPOINTS.adminPromotions}/${promo.id}`);
                                    fetchData();
                                  } catch (err) { alert("Lỗi xóa."); }
                                }
                              }}><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {promotions.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '30px', opacity: 0.5 }}>Chưa có mã khuyến mãi nào</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'banners' && (
            <div className="fade-in">
              <div className="page-header">
                <h1>Quản lý Banner</h1>
                <button className="primary-btn" onClick={handleOpenAddBanner}><Plus /> Thêm banner</button>
              </div>
              <div className="dashboard-card glass">
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Ảnh</th>
                        <th>Tiêu đề</th>
                        <th>Vị trí</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {banners.map(b => (
                        <tr key={b.id}>
                          <td><img src={b.imageUrl} alt={b.title} style={{ width: '120px', height: '60px', borderRadius: '4px', objectFit: 'cover' }} /></td>
                          <td>
                            <div className="font-bold">{b.title || 'Không tiêu đề'}</div>
                            <div className="text-xs opacity-50">{b.subtitle}</div>
                          </td>
                          <td>{b.orderIndex}</td>
                          <td>
                            <span className={`status-badge ${b.isActive ? 'status-completed' : 'status-cancelled'}`}>
                              {b.isActive ? 'Đang hiện' : 'Đang ẩn'}
                            </span>
                          </td>
                          <td>
                            <div className="action-menu">
                              <button className="icon-btn edit" onClick={() => handleOpenEditBanner(b)}><Edit2 size={16} /></button>
                              <button className="icon-btn delete" onClick={() => handleDeleteBanner(b.id!)}><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {banners.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '30px', opacity: 0.5 }}>Chưa có banner nào</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="fade-in">
              <div className="page-header">
                <h1>Quản lý Đánh giá</h1>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div className="stat-badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>Trung bình: {reviewStats?.averageRating?.toFixed(1) || 0} ⭐</div>
                  <div className="stat-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>Tổng: {reviewStats?.totalCount ?? reviewStats?.totalReviews ?? reviewStats?.total ?? 0} nhận xét</div>
                  <button className="btn btn-secondary" onClick={fetchData} style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} /> Làm mới
                  </button>
                </div>
              </div>

              {/* Statistics Chart */}
              <div className="dashboard-grid mb-8" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '24px' }}>
                 <div className="dashboard-card glass" style={{ height: 'auto', padding: '24px' }}>
                    <div className="card-title">Phân bổ sao</div>
                    <div className="space-y-3" style={{ marginTop: '20px' }}>
                       {[5, 4, 3, 2, 1].map(star => {
                          const dist = reviewStats?.distribution || {};
                          const count = dist[star.toString()] ?? dist[star] ?? 0;
                          const totalReviews = reviewStats?.totalCount ?? reviewStats?.totalReviews ?? reviewStats?.total ?? 0;
                          const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                          return (
                            <div key={star} style={{ marginBottom: '12px' }}>
                               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                                  <span>{star} ⭐</span>
                                  <span>{count} ({percent.toFixed(0)}%)</span>
                               </div>
                               <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                  <div style={{ width: `${percent}%`, height: '100%', background: star >= 4 ? '#10b981' : star >= 3 ? '#fbbf24' : '#ef4444', borderRadius: '10px' }} />
                               </div>
                            </div>
                          );
                       })}
                    </div>
                 </div>
                 <div className="dashboard-card glass" style={{ height: 'auto', padding: '24px' }}>
                    <div className="card-title">Hành động nhanh</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '20px' }}>
                       <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <ShieldCheck size={24} color="#10b981" style={{ marginBottom: '8px' }} />
                          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{reviews.filter(r => r.status === 'VISIBLE').length}</div>
                          <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>Đánh giá đang hiện</div>
                       </div>
                       <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <X size={24} color="#ef4444" style={{ marginBottom: '8px' }} />
                          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{reviews.filter(r => r.status === 'HIDDEN').length}</div>
                          <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>Đánh giá bị ẩn</div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="dashboard-card glass">
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th>Người đánh giá</th>
                        <th>Đánh giá</th>
                        <th>Nội dung</th>
                        <th>Ngày</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map(r => (
                        <tr key={r.id} style={{ opacity: r.status === 'HIDDEN' ? 0.5 : 1 }}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <img src={formatImageUrl(r.product?.image)} style={{ width: '30px', height: '30px', borderRadius: '4px' }} />
                              <span style={{ fontSize: '0.85rem' }}>{r.product?.productName || 'Sản phẩm'}</span>
                            </div>
                          </td>
                          <td>
                            <div className="font-bold">{r.userName}</div>
                            <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>ID: {r.userId}</div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', color: '#fbbf24' }}>
                              {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < r.rating ? '#fbbf24' : 'transparent'} />)}
                            </div>
                          </td>
                          <td style={{ maxWidth: '250px' }}>
                            <div className="text-xs truncate">{r.content}</div>
                            {r.reply && <div style={{ fontSize: '0.7rem', color: '#f9a8d4', marginTop: '4px' }}>💬 Phản hồi: {r.reply}</div>}
                          </td>
                          <td>{new Date(r.createdAt).toLocaleDateString('vi-VN')}</td>
                          <td>
                            <div className="action-menu">
                              <button className="icon-btn" title="Phản hồi" onClick={() => { setEditingReview(r); setReplyText(r.reply || ''); setShowReplyModal(true); }}>
                                <MessageSquare size={16} />
                              </button>
                              <button className="icon-btn" title={r.status === 'VISIBLE' ? 'Ẩn' : 'Hiện'} onClick={async () => {
                                const newStatus = r.status === 'VISIBLE' ? 'HIDDEN' : 'VISIBLE';
                                await axios.put(`${ENDPOINTS.adminReviews}/${r.id}/status`, { status: newStatus });
                                fetchData();
                              }}>
                                {r.status === 'VISIBLE' ? <X size={16} color="#ef4444" /> : <CheckCircle2 size={16} color="#10b981" />}
                              </button>
                              <button className="icon-btn delete" title="Xóa" onClick={async () => {
                                if(window.confirm('Xóa đánh giá này vĩnh viễn?')) {
                                  await axios.delete(`${ENDPOINTS.adminReviews}/${r.id}`);
                                  fetchData();
                                }
                              }}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {reviews.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: '30px', opacity: 0.5 }}>Chưa có đánh giá nào</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="fade-in">
              <div className="page-header"><h1>Nhân sự <span style={{ fontSize: '1rem', opacity: 0.5 }}>(Tổng: {staffList.length})</span></h1><button className="primary-btn" onClick={handleOpenAddUser}><UserPlus /> Thêm Nhân viên</button></div>
              <div className="dashboard-card glass"><div className="table-container"><table><thead><tr><th>ID</th><th>Họ tên</th><th>Tài khoản</th><th>Quyền</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{staffList.map(u => (
                <tr key={u.id}>
                  <td>#{u.id}</td>
                  <td>{u.userDetails?.firstName ? `${u.userDetails.firstName} ${u.userDetails.lastName}` : (u.userName || 'Chưa đặt tên')}</td>
                  <td>{u.userName}</td>
                  <td>{(u.role && typeof u.role === 'object') ? (u.role.roleName || (u.role.id === 1 ? 'ADMIN' : 'STAFF')) : u.role}</td>
                  <td>{u.active ? 'Bật' : 'Tắt'}</td>
                  <td><div className="action-menu"><button className="icon-btn edit" onClick={() => handleOpenEditUser(u)}><Edit2 size={16} /></button><button className="icon-btn delete" onClick={() => handleDeleteUser(u.id)}><Trash2 size={16} /></button></div></td>
                </tr>
              ))}</tbody></table></div></div>
            </div>
          )}

          {activeTab === 'flash-sales' && (
            <div className="fade-in">
              <div className="page-header">
                <h1>Quản lý Flash Sale</h1>
                <button className="primary-btn" onClick={() => {
                  setEditingFlashSale(null);
                  setFlashSaleForm({ title: '', description: '', startTime: '', endTime: '', status: 'Upcoming' });
                  setShowFlashSaleModal(true);
                }}>
                  <Plus /> Tạo chương trình
                </button>
              </div>

              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
                {flashSales.length > 0 ? (
                  flashSales.map(fs => (
                    <div key={fs.id} className="dashboard-card glass" style={{ padding: '24px', height: 'auto' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                         <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{fs.title}</h2>
                         <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="icon-btn" onClick={() => { setEditingFlashSale(fs); setFlashSaleForm(fs); setShowFlashSaleModal(true); }}><Edit2 size={16} /></button>
                            <button className="icon-btn" style={{ color: '#ef4444' }} onClick={() => handleDeleteFlashSale(fs.id!)}><Trash2 size={16} /></button>
                         </div>
                      </div>
                      
                      <div className={`status-badge status-${fs.status?.toLowerCase() === 'active' ? 'completed' : fs.status?.toLowerCase() === 'upcoming' ? 'processing' : 'cancelled'}`} style={{ marginBottom: '16px', display: 'inline-block' }}>
                        {fs.status}
                      </div>

                      <div style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}><Clock size={14} /> {fs.startTime?.replace('T', ' ')}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={14} /> {fs.endTime?.replace('T', ' ')}</div>
                      </div>

                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <strong>Sản phẩm ({fs.items?.length || 0})</strong>
                            <button style={{ color: '#f9a8d4', fontSize: '0.8rem', fontWeight: 'bold' }} onClick={() => {
                              setSelectedFlashSaleId(fs.id!);
                              setFlashItemForm({ productId: products[0]?.id || 0, flashPrice: 0, initialQuantity: 10, maxPerUser: 1 });
                              setShowFlashItemModal(true);
                            }}>+ Thêm</button>
                         </div>
                         <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                            {fs.items?.map(item => (
                              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px', marginBottom: '8px', fontSize: '0.8rem' }}>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <img src={formatImageUrl(item.product.image)} style={{ width: '30px', height: '30px', borderRadius: '4px', objectFit: 'cover' }} />
                                    <span>{item.product.productName}</span>
                                 </div>
                                 <div style={{ textAlign: 'right' }}>
                                    <div style={{ color: '#10b981', fontWeight: 'bold' }}>{Number(item.flashPrice).toLocaleString()} ₫</div>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>Còn: {item.availableQuantity}</div>
                                 </div>
                              </div>
                            ))}
                            {(!fs.items || fs.items.length === 0) && <p style={{ textAlign: 'center', opacity: 0.3, fontSize: '0.8rem' }}>Chưa có sản phẩm</p>}
                         </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="dashboard-card glass" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 20px' }}>
                    <Zap size={60} style={{ opacity: 0.1, marginBottom: '20px' }} />
                    <h3 style={{ opacity: 0.7, marginBottom: '8px' }}>Chưa có chương trình Flash Sale nào</h3>
                    <p style={{ opacity: 0.4, marginBottom: '24px' }}>Hãy tạo chương trình đầu tiên để thu hút khách hàng.</p>
                    <button className="primary-btn" style={{ margin: '0 auto' }} onClick={() => setShowFlashSaleModal(true)}>Tạo chương trình ngay</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="fade-in">
              <div className="page-header">
                <h1>Thanh toán & Hóa đơn</h1>
                <div className="filter-tabs">
                  <button className={`filter-tab ${paymentFilter === 'ALL' ? 'active' : ''}`} onClick={() => setPaymentFilter('ALL')}>Tất cả</button>
                  <button className={`filter-tab ${paymentFilter === 'UNPAID' ? 'active' : ''}`} onClick={() => setPaymentFilter('UNPAID')}>Chưa thanh toán</button>
                  <button className={`filter-tab ${paymentFilter === 'PAID' ? 'active' : ''}`} onClick={() => setPaymentFilter('PAID')}>Đã thanh toán</button>
                </div>
              </div>
              
              <div className="stats-grid" style={{ marginBottom: '24px' }}>
                <div className="stat-card glass" style={{ borderColor: 'rgba(249, 168, 212, 0.3)' }}>
                  <div style={{ opacity: 0.6, fontSize: '0.8rem', marginBottom: '8px' }}>Đang chờ thanh toán</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f9a8d4' }}>
                    {orders.filter(o => o.status === 'PENDING' || o.status === 'SHIPPED').length} Đơn
                  </div>
                </div>
                <div className="stat-card glass" style={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                  <div style={{ opacity: 0.6, fontSize: '0.8rem', marginBottom: '8px' }}>Đã thu tiền</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                    {orders.filter(o => o.status === 'PAID' || o.status === 'COMPLETED' || o.status === 'DELIVERED').length} Đơn
                  </div>
                </div>
              </div>

              <div className="dashboard-card glass">
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Khách hàng</th>
                        <th>Ngày tạo</th>
                        <th>Số tiền</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders
                        .filter(o => o.status !== 'CANCELLED' && o.status !== 'REFUNDED')
                        .filter(o => {
                          const isPaid = o.status === 'PAID' || o.status === 'COMPLETED' || o.status === 'DELIVERED';
                          if (paymentFilter === 'PAID') return isPaid;
                          if (paymentFilter === 'UNPAID') return !isPaid;
                          return true;
                        })
                        .sort((a,b) => orderSort === 'newest' ? b.id - a.id : a.id - b.id)
                        .map(o => (
                        <tr key={o.id}>
                          <td className="font-bold">#{o.id}</td>
                          <td>{o.shippingRecipientName || o.user?.userName || 'Khách vãng lai'}</td>
                          <td>{new Date(o.orderedDate).toLocaleDateString('vi-VN')}</td>
                          <td style={{ color: '#f9a8d4', fontWeight: 'bold' }}>{o.total.toLocaleString()} ₫</td>
                          <td><StatusBadge status={o.status} /></td>
                          <td>
                            <div className="action-menu">
                              <button className="icon-btn" title="Xem hóa đơn" onClick={() => { setCurrentInvoiceOrder(o); setLastTab('payments'); setActiveTab('invoice'); }}>
                                <FileText size={18} />
                              </button>
                              {!(o.status === 'PAID' || o.status === 'COMPLETED' || o.status === 'DELIVERED') && (
                                <button className="icon-btn" title="Xác nhận đã thu tiền" style={{ color: '#10b981' }} onClick={() => handleCompletePayment(o.id)}>
                                  <CheckCircle size={18} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {orders.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>Chưa có đơn hàng nào.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'invoice' && currentInvoiceOrder && (
            <div className="fade-in" style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <div className="dashboard-card glass" style={{ width: '100%', maxWidth: '800px', padding: '40px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '2rem', opacity: 0.1, fontWeight: 'bold' }}>INVOICE</div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                   <div>
                      <h2 style={{ margin: 0, color: '#f9a8d4' }}>CtusAdmin Shop</h2>
                      <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>Đường Xuân Thủy, Cầu Giấy, Hà Nội<br/>Hotline: 1900 1234</p>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                      <h3 style={{ margin: 0 }}>HÓA ĐƠN #{currentInvoiceOrder.id}</h3>
                      <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>Ngày: {new Date(currentInvoiceOrder.orderedDate).toLocaleDateString('vi-VN')}</p>
                   </div>
                </div>

                <div style={{ marginBottom: '30px' }}>
                   <div style={{ fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>Khách hàng</div>
                   <div style={{ fontSize: '1.1rem' }}>{currentInvoiceOrder.user?.userName}</div>
                   <div style={{ opacity: 0.6 }}>Trạng thái: {currentInvoiceOrder.status}</div>
                </div>

                <div className="table-container" style={{ marginBottom: '30px' }}>
                  <table style={{ width: '100%' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
                        <th style={{ padding: '12px 0' }}>Sản phẩm</th>
                        <th>Đơn giá</th>
                        <th>Số lượng</th>
                        <th style={{ textAlign: 'right' }}>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentInvoiceOrder.items?.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '15px 0' }}>{item.product?.productName || item.productName || 'N/A'}</td>
                          <td>{(item.product?.price || item.price || 0).toLocaleString()} ₫</td>
                          <td>x{item.quantity}</td>
                          <td style={{ textAlign: 'right' }}>{((item.product?.price || item.price || 0) * item.quantity).toLocaleString()} ₫</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ marginLeft: 'auto', width: '250px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <span>Tạm tính:</span>
                      <span>${currentInvoiceOrder.total.toLocaleString()}</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontWeight: 'bold', fontSize: '1.4rem', color: '#f9a8d4' }}>
                      <span>Tổng cộng:</span>
                      <span>${currentInvoiceOrder.total.toLocaleString()}</span>
                   </div>
                </div>

                <div style={{ marginTop: '50px', display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                   <button className="secondary-btn" onClick={() => { setActiveTab(lastTab); setCurrentInvoiceOrder(null); }}>Quay lại</button>
                   {currentInvoiceOrder.status !== 'PAID' && (
                     <button className="primary-btn" style={{ padding: '12px 30px', gap: '10px' }} onClick={() => handleCompletePayment(currentInvoiceOrder.id)}>
                        <CreditCard size={20} /> Xác nhận thanh toán
                     </button>
                   )}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'messages' && (
            <AdminChat />
          )}
          {activeTab === 'activity-logs' && (
            <div className="fade-in">
              <div className="page-header">
                <div className="welcome-msg">
                  <h1>Nhật ký hoạt động hệ thống</h1>
                  <p>Giám sát các hành động quản trị, cập nhật cấu hình và lịch sử phiên hoạt động để bảo mật thông tin.</p>
                </div>
                <button className="primary-btn" onClick={fetchActivityLogs} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} /> Làm mới nhật ký
                </button>
              </div>

              <div className="dashboard-card glass" style={{ marginBottom: '24px', padding: '20px' }}>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
                  <div className="search-box" style={{ flex: 1, minWidth: '250px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0 12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Search size={18} style={{ opacity: 0.5 }} />
                    <input 
                      type="text" 
                      placeholder="Tìm theo tài khoản, hành động, chi tiết..." 
                      value={activityLogsSearch} 
                      onChange={e => setActivityLogsSearch(e.target.value)} 
                      style={{ background: 'none', border: 'none', color: 'white', padding: '10px 8px', width: '100%', outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.85rem', opacity: 0.6 }}>Lọc loại thao tác:</span>
                    <select 
                      value={activityLogsFilter} 
                      onChange={e => setActivityLogsFilter(e.target.value)}
                      style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px 16px', borderRadius: '8px', outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="ALL">TẤT CẢ THAO TÁC</option>
                      <option value="LOGIN">LOGIN / LOGOUT</option>
                      <option value="CREATE">CREATE (THÊM MỚI)</option>
                      <option value="UPDATE">UPDATE (CẬP NHẬT)</option>
                      <option value="DELETE">DELETE (XÓA)</option>
                    </select>
                  </div>
                </div>

                <div className="table-container">
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '2px solid rgba(255,255,255,0.1)', opacity: 0.7 }}>
                        <th style={{ padding: '12px' }}>Thời gian</th>
                        <th style={{ padding: '12px' }}>Tài khoản</th>
                        <th style={{ padding: '12px' }}>Hành động</th>
                        <th style={{ padding: '12px' }}>Thao tác</th>
                        <th style={{ padding: '12px' }}>Chi tiết</th>
                        <th style={{ padding: '12px' }}>Địa chỉ IP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityLogs
                        .filter(log => {
                          const q = activityLogsSearch.toLowerCase();
                          const matchesSearch = 
                            (log.username || '').toLowerCase().includes(q) ||
                            (log.action || '').toLowerCase().includes(q) ||
                            (log.operation || '').toLowerCase().includes(q) ||
                            (log.details || '').toLowerCase().includes(q);
                          
                          if (activityLogsFilter === 'ALL') return matchesSearch;
                          if (activityLogsFilter === 'LOGIN') {
                            return matchesSearch && (log.operation === 'LOGIN' || log.operation === 'LOGOUT');
                          }
                          return matchesSearch && (log.operation || '').toUpperCase().startsWith(activityLogsFilter);
                        })
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        .map(log => (
                          <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
                            <td style={{ padding: '12px', whiteSpace: 'nowrap', opacity: 0.7 }}>
                              {new Date(log.timestamp).toLocaleString('vi-VN')}
                            </td>
                            <td style={{ padding: '12px', fontWeight: 'bold' }}>
                              {log.username}
                            </td>
                            <td style={{ padding: '12px' }}>
                              <span style={{ 
                                padding: '4px 8px', 
                                borderRadius: '4px', 
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                background: 
                                  log.operation?.startsWith('CREATE') ? 'rgba(16, 185, 129, 0.1)' :
                                  log.operation?.startsWith('UPDATE') ? 'rgba(59, 130, 246, 0.1)' :
                                  log.operation?.startsWith('DELETE') ? 'rgba(239, 68, 68, 0.1)' :
                                  log.operation === 'LOGIN' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                                color:
                                  log.operation?.startsWith('CREATE') ? '#10b981' :
                                  log.operation?.startsWith('UPDATE') ? '#3b82f6' :
                                  log.operation?.startsWith('DELETE') ? '#ef4444' :
                                  log.operation === 'LOGIN' ? '#fbbf24' : '#ffffff'
                              }}>
                                {log.action}
                              </span>
                            </td>
                            <td style={{ padding: '12px', opacity: 0.8 }}>
                              <code>{log.operation}</code>
                            </td>
                            <td style={{ padding: '12px', opacity: 0.9 }}>
                              {log.details}
                            </td>
                            <td style={{ padding: '12px', opacity: 0.6, fontSize: '0.85rem' }}>
                              {log.ipAddress || '127.0.0.1'}
                            </td>
                          </tr>
                        ))}
                      {activityLogs.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                            Chưa có nhật ký hoạt động nào.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showProductDetailModal && selectedProductDetail && (
        <div className="modal-overlay">
          <div className="modal-content glass" style={{ maxWidth: '800px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Chi tiết sản phẩm</h2>
              <button className="icon-btn" onClick={() => setShowProductDetailModal(false)}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px' }}>
              <div className="responsive-hide-mobile">
                <img 
                  src={formatImageUrl(selectedProductDetail.image)} 
                  alt={selectedProductDetail.productName} 
                  style={{ width: '100%', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', objectFit: 'cover', height: '300px' }}
                  onError={(e: any) => e.target.src = DEFAULT_PRODUCT_IMAGE}
                />
                
                <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="dashboard-card" style={{ padding: '15px', textAlign: 'center', background: 'rgba(59, 130, 246, 0.1)' }}>
                    <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Tồn kho</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#3b82f6' }}>{selectedProductDetail.availability}</div>
                  </div>
                  <div className="dashboard-card" style={{ padding: '15px', textAlign: 'center', background: 'rgba(16, 185, 129, 0.1)' }}>
                    <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Đã bán</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>{selectedProductDetail.salesCount || 0}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '5px' }}>{selectedProductDetail.productName}</h3>
                <div style={{ fontSize: '0.9rem', color: '#f9a8d4', fontWeight: 'bold', marginBottom: '15px' }}>
                  {selectedProductDetail.category} • {selectedProductDetail.price?.toLocaleString()} ₫
                </div>
                
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', opacity: 0.6 }}>Mô tả sản phẩm</label>
                  <p style={{ fontSize: '0.9rem', lineHeight: '1.6', opacity: 0.9, maxHeight: '120px', overflowY: 'auto', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    {selectedProductDetail.description || 'Chưa có mô tả cho sản phẩm này.'}
                  </p>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', opacity: 0.6, display: 'block', marginBottom: '8px' }}>Size khả dụng</label>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {selectedProductDetail.sizes?.split(',').map(s => (
                        <span key={s} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '0.8rem' }}>{s.trim()}</span>
                      )) || <span style={{ opacity: 0.4 }}>N/A</span>}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', opacity: 0.6, display: 'block', marginBottom: '8px' }}>Màu khả dụng</label>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {selectedProductDetail.colors?.split(',').map(c => (
                        <div key={c} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '0.8rem' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: c.trim().toLowerCase() }}></div>
                          {c.trim()}
                        </div>
                      )) || <span style={{ opacity: 0.4 }}>N/A</span>}
                    </div>
                  </div>
                </div>

                {selectedProductDetail.variants && selectedProductDetail.variants.length > 0 ? (
                  <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <label style={{ fontSize: '0.8rem', opacity: 0.6, display: 'block', marginBottom: '10px' }}>Chi tiết phân loại tồn kho</label>
                    <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                      <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ opacity: 0.5, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Màu</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Size</th>
                            <th style={{ textAlign: 'right', padding: '8px' }}>Tồn kho</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedProductDetail.variants.map((v, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <td style={{ padding: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: v.color.toLowerCase() }}></div>
                                  {v.color}
                                </div>
                              </td>
                              <td style={{ padding: '8px' }}>{v.size}</td>
                              <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: v.stock > 0 ? '#10b981' : '#ef4444' }}>{v.stock}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <p style={{ fontSize: '0.8rem', opacity: 0.5, textAlign: 'center' }}>
                      Sản phẩm này chưa có dữ liệu phân loại tồn kho chi tiết.<br/>
                      Hãy nhấn <strong>"Chỉnh sửa sản phẩm"</strong> để thiết lập.
                    </p>
                  </div>
                )}

                <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <BarChart3 size={18} color="#f9a8d4" />
                    <span style={{ fontWeight: 'bold' }}>Tỉ lệ bán ra</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                    Tỉ lệ: <strong>{((selectedProductDetail.salesCount || 0) / (Math.max(1, (selectedProductDetail.availability || 0) + (selectedProductDetail.salesCount || 0))) * 100).toFixed(1)}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginTop: '10px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${((selectedProductDetail.salesCount || 0) / (Math.max(1, (selectedProductDetail.availability || 0) + (selectedProductDetail.salesCount || 0))) * 100)}%`, 
                      height: '100%', 
                      background: 'linear-gradient(90deg, #f9a8d4, #fbbf24)' 
                    }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button type="button" className="secondary-btn" onClick={() => setShowProductDetailModal(false)}>Đóng</button>
              <button type="button" className="primary-btn" onClick={() => { setShowProductDetailModal(false); handleOpenEditProduct(selectedProductDetail); }}>Chỉnh sửa sản phẩm</button>
            </div>
          </div>
        </div>
      )}

      {showProductModal && (
        <div className="modal-overlay">
          <div className="modal-content glass" style={{ maxWidth: '700px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>{editingProduct ? 'Cập nhật' : 'Thêm mới'} Sản phẩm</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span className={`step-dot ${productModalStep >= 1 ? 'active' : ''}`}>1</span>
                <span className={`step-dot ${productModalStep >= 2 ? 'active' : ''}`}>2</span>
                <span className={`step-dot ${productModalStep >= 3 ? 'active' : ''}`}>3</span>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); if(productModalStep === 3) handleProductSubmit(e); }} className="modal-form">
              
              {/* STEP 1: THÔNG TIN CƠ BẢN */}
              {productModalStep === 1 && (
                <div className="fade-in">
                  <div className="form-group"><label>Tên sản phẩm</label><input type="text" required value={productForm.productName || ''} onChange={e => setProductForm({...productForm, productName: e.target.value})} placeholder="VD: Áo thun A" /></div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label>Danh mục</label>
                      <select value={productForm.category || ''} onChange={e => setProductForm({...productForm, category: e.target.value})}>
                        <option value="">-- Chọn danh mục --</option>
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Thương hiệu</label>
                      <select 
                        value={typeof productForm.brand === 'object' ? productForm.brand?.id : productForm.brand} 
                        onChange={e => setProductForm({...productForm, brand: { id: Number(e.target.value) }})}
                      >
                        <option value="">-- Chọn thương hiệu --</option>
                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Giá bán (₫)</label>
                    <input type="number" required value={productForm.price || 0} onChange={e => setProductForm({...productForm, price: parseFloat(e.target.value)})} />
                  </div>

                  <div className="form-group">
                    <label>Ảnh sản phẩm</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {(productForm.images || []).map((img, index) => (
                        <div key={index} className="image-preview-mini">
                          <img src={formatImageUrl(img)} alt="Preview" />
                          <button type="button" onClick={() => removeProductImage(index)} className="remove-btn">×</button>
                        </div>
                      ))}
                      <label className="upload-btn-mini">
                        <Plus size={20} />
                        <input type="file" accept="image/*" multiple onChange={handleImageChange} style={{ display: 'none' }} />
                      </label>
                    </div>
                  </div>

                  <div className="form-group"><label>Mô tả</label><textarea value={productForm.discription || ''} onChange={e => setProductForm({...productForm, discription: e.target.value})} style={{ height: '80px' }} /></div>
                  
                  <div className="modal-actions">
                    <button type="button" className="secondary-btn" onClick={() => setShowProductModal(false)}>Hủy</button>
                    <button type="button" className="primary-btn" onClick={() => setProductModalStep(2)}>Tiếp theo: Chọn thuộc tính <ChevronRight size={16} /></button>
                  </div>
                </div>
              )}

              {/* STEP 2: CHỌN THUỘC TÍNH */}
              {productModalStep === 2 && (
                <div className="fade-in">
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                    <h3 style={{ marginBottom: '15px', fontSize: '1rem' }}>Thiết lập Màu sắc & Kích thước</h3>
                    <div className="form-group">
                      <label>Màu sắc (Cách nhau bằng dấu phẩy)</label>
                      <input type="text" placeholder="Đen, Trắng, Xanh..." value={productForm.colors || ''} onChange={e => setProductForm({...productForm, colors: e.target.value})} />
                      <p style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '4px' }}>VD: Đen, Trắng</p>
                    </div>
                    <div className="form-group" style={{ marginTop: '15px' }}>
                      <label>Kích thước (Cách nhau bằng dấu phẩy)</label>
                      <input type="text" placeholder="S, M, L, XL..." value={productForm.sizes || ''} onChange={e => setProductForm({...productForm, sizes: e.target.value})} />
                      <p style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '4px' }}>VD: M, L</p>
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="secondary-btn" onClick={() => setProductModalStep(1)}>Quay lại</button>
                    <button type="button" className="primary-btn" onClick={generateVariants}>Tiếp theo: Nhập số lượng <ChevronRight size={16} /></button>
                  </div>
                </div>
              )}

              {/* STEP 3: NHẬP SỐ LƯỢNG BIẾN THỂ */}
              {productModalStep === 3 && (
                <div className="fade-in">
                  <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ background: 'rgba(255,255,255,0.05)', position: 'sticky', top: 0 }}>
                        <tr>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.8rem' }}>Màu sắc</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.8rem' }}>Kích thước</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.8rem' }}>Số lượng tồn</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productForm.variants?.map((v, idx) => (
                          <tr key={idx} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '12px' }}>{v.color}</td>
                            <td style={{ padding: '12px' }}>{v.size}</td>
                            <td style={{ padding: '12px' }}>
                              <input 
                                type="number" 
                                min="0" 
                                style={{ width: '100px', padding: '6px', borderRadius: '4px' }} 
                                value={v.stock} 
                                onChange={e => {
                                  const newVariants = [...(productForm.variants || [])];
                                  newVariants[idx].stock = parseInt(e.target.value) || 0;
                                  setProductForm({...productForm, variants: newVariants});
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ textAlign: 'right', marginBottom: '20px', opacity: 0.7, fontSize: '0.9rem' }}>
                    Tổng tồn kho: <strong>{productForm.variants?.reduce((acc, v) => acc + v.stock, 0)}</strong>
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="secondary-btn" onClick={() => setProductModalStep(2)}>Quay lại</button>
                    <button type="submit" className="primary-btn" onClick={handleProductSubmit}>Hoàn tất & Lưu sản phẩm</button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
      {showCategoryModal && (
        <div className="modal-overlay"><div className="modal-content glass"><h2>{editingCategory ? 'Sửa' : 'Thêm'} Danh mục</h2>
          <form onSubmit={handleCategorySubmit} className="modal-form">
            <div className="form-group"><label>Tên danh mục</label><input type="text" required value={categoryForm.name || ''} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} /></div>
            <div className="form-group"><label>Mô tả</label><textarea value={categoryForm.description || ''} onChange={e => setCategoryForm({...categoryForm, description: e.target.value})} /></div>
            <div className="modal-actions"><button type="button" className="secondary-btn" onClick={() => setShowCategoryModal(false)}>Hủy</button><button type="submit" className="primary-btn">Lưu</button></div>
          </form>
        </div></div>
      )}
      {showOrderModal && (
        <div className="modal-overlay"><div className="modal-content glass"><h2>Cập nhật</h2>
          <form onSubmit={handleOrderSubmit} className="modal-form">
            <select value={orderStatusForm} onChange={e => setOrderStatusForm(e.target.value)}>
              <option value="PENDING">Đang chờ (PENDING)</option>
              <option value="PAID">Đã thanh toán (PAID)</option>
              <option value="SHIPPED">Đang giao (SHIPPED)</option>
              <option value="DELIVERED">Đã giao hàng (DELIVERED)</option>
              <option value="COMPLETED">Hoàn tất (COMPLETED)</option>
              <option value="CANCELLED">Đã hủy (CANCELLED)</option>
            </select>
            <div className="modal-actions"><button type="button" onClick={() => setShowOrderModal(false)}>Hủy</button><button type="submit">Lưu</button></div>
          </form>
        </div></div>
      )}
      {showAddOrderModal && (
        <div className="modal-overlay"><div className="modal-content glass" style={{ maxWidth: '600px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2>Tạo đơn hàng mới</h2>
            <button className="icon-btn" onClick={() => setShowAddOrderModal(false)}><X size={20} /></button>
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '15px' }}>
            Nhân viên tạo đơn: <strong>{currentUser?.userName}</strong>
          </div>
          <form className="modal-form">
            <div className="form-group">
              <label>Khách hàng & Thông tin giao hàng</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <select value={newOrderForm.userId} onChange={e => {
                  const id = e.target.value;
                  const u = users.find(user => user.id.toString() === id);
                  setNewOrderForm({
                    ...newOrderForm, 
                    userId: id,
                    customerName: u ? (u.userDetails?.firstName ? `${u.userDetails.firstName} ${u.userDetails.lastName}` : u.userName) : '',
                    shippingRecipientName: u ? (u.userDetails?.firstName ? `${u.userDetails.firstName} ${u.userDetails.lastName}` : u.userName) : '',
                    shippingPhoneNumber: u?.userDetails?.phoneNumber || '',
                    shippingAddress: u?.userDetails?.street ? `${u.userDetails.street}, ${u.userDetails.locality || ''}` : ''
                  });
                }}>
                  <option value="">-- Chọn khách có sẵn --</option>
                  {users.filter(u => {
                    const rid = getRoleId(u.role);
                    return rid !== 1 && rid !== 2;
                  }).map(u => (
                    <option key={u.id} value={u.id}>
                      {u.userDetails?.firstName ? `${u.userDetails.firstName} ${u.userDetails.lastName}` : (u.userName || `ID: ${u.id}`)}
                    </option>
                  ))}
                </select>
                <input type="text" placeholder="Tên người nhận..." value={newOrderForm.shippingRecipientName || ''} onChange={e => setNewOrderForm({...newOrderForm, shippingRecipientName: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                <input type="text" placeholder="Số điện thoại..." value={newOrderForm.shippingPhoneNumber || ''} onChange={e => setNewOrderForm({...newOrderForm, shippingPhoneNumber: e.target.value})} />
                <input type="text" placeholder="Địa chỉ giao hàng chi tiết..." value={newOrderForm.shippingAddress || ''} onChange={e => setNewOrderForm({...newOrderForm, shippingAddress: e.target.value})} />
              </div>
            </div>

            <div className="form-group" style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}>
              <label style={{ marginBottom: '10px', display: 'block' }}>Thêm sản phẩm</label>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 80px 80px 70px auto', gap: '8px', marginBottom: '10px', alignItems: 'end' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.7rem', opacity: 0.5 }}>Sản phẩm</label>
                  <select value={selectedProduct.productId} style={{ width: '100%' }} onChange={e => {
                    const id = parseInt(e.target.value);
                    const p = products.find(prod => prod.id === id);
                    setSelectedProduct({
                      ...selectedProduct, 
                      productId: id,
                      size: p?.sizes?.split(',')[0]?.trim() || '',
                      color: p?.colors?.split(',')[0]?.trim() || ''
                    });
                  }}>
                    <option value="0">-- Chọn --</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.productName} ({p.availability})</option>)}
                  </select>
                </div>
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.7rem', opacity: 0.5 }}>Size</label>
                  <select value={selectedProduct.size} style={{ width: '100%' }} onChange={e => setSelectedProduct({...selectedProduct, size: e.target.value})}>
                    {(products.find(p => p.id === selectedProduct.productId)?.sizes?.split(',') || []).map(s => (
                      <option key={s} value={s.trim()}>{s.trim()}</option>
                    ))}
                    {!products.find(p => p.id === selectedProduct.productId)?.sizes && <option value="">N/A</option>}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.7rem', opacity: 0.5 }}>Màu</label>
                  <select value={selectedProduct.color} style={{ width: '100%' }} onChange={e => setSelectedProduct({...selectedProduct, color: e.target.value})}>
                    {(products.find(p => p.id === selectedProduct.productId)?.colors?.split(',') || []).map(c => (
                      <option key={c} value={c.trim()}>{c.trim()}</option>
                    ))}
                    {!products.find(p => p.id === selectedProduct.productId)?.colors && <option value="">N/A</option>}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.7rem', opacity: 0.5 }}>SL</label>
                  <input type="number" min="1" style={{ width: '100%', padding: '8px' }} value={selectedProduct.quantity} onChange={e => setSelectedProduct({...selectedProduct, quantity: parseInt(e.target.value)})} />
                </div>

                <button type="button" className="primary-btn" style={{ height: '38px', padding: '0 12px', fontSize: '0.75rem' }} onClick={handleAddItemToOrder}>Thêm</button>
              </div>

              {newOrderForm.items.length > 0 && (
                <div style={{ marginTop: '15px' }}>
                  <table style={{ width: '100%', fontSize: '0.85rem' }}>
                    <thead><tr style={{ textAlign: 'left', opacity: 0.6 }}><th>Sản phẩm</th><th>Chi tiết</th><th>SL</th><th>Giá</th><th></th></tr></thead>
                    <tbody>
                      {newOrderForm.items.map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td>{item.name}</td>
                          <td><span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{item.selectedSize} / {item.selectedColor}</span></td>
                          <td>x{item.quantity}</td>
                          <td>{(item.price * item.quantity).toLocaleString()} ₫</td>
                          <td style={{ textAlign: 'right' }}>
                            <button type="button" onClick={() => {
                              const newItems = [...newOrderForm.items];
                              newItems.splice(idx, 1);
                              setNewOrderForm({...newOrderForm, items: newItems});
                            }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ marginTop: '10px', textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
                    Tổng cộng: {newOrderForm.items.reduce((s: any, i: any) => s + i.price * i.quantity, 0).toLocaleString()} ₫
                  </div>
                </div>
              )}
            </div>

            {orderError && (
              <div style={{ 
                background: 'rgba(239, 68, 68, 0.1)', 
                color: '#ef4444', 
                padding: '10px', 
                borderRadius: '8px', 
                fontSize: '0.85rem',
                marginBottom: '15px',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}>
                <strong>⚠️ Lỗi:</strong> {orderError}
              </div>
            )}

            <div className="modal-actions">
              <button type="button" className="secondary-btn" onClick={() => { setShowAddOrderModal(false); setOrderError(null); }}>Hủy</button>
              <button type="button" className="primary-btn" disabled={newOrderForm.items.length === 0 || orderSubmitting} onClick={handleAddOrderSubmit}>
                {orderSubmitting ? 'Đang xử lý...' : 'Xác nhận tạo đơn'}
              </button>
            </div>
          </form>
        </div></div>
      )}
      {showCustomerModal && (
        <div className="modal-overlay"><div className="modal-content glass" style={{ maxWidth: '600px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>{editingCustomer ? 'Sửa' : 'Thêm'} Khách hàng</h2>
            <button className="icon-btn" onClick={() => setShowCustomerModal(false)}><X size={20} /></button>
          </div>
          <form onSubmit={handleCustomerSubmit} className="modal-form">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group"><label>Họ</label><input type="text" value={customerForm.firstName || ''} onChange={e => setCustomerForm({...customerForm, firstName: e.target.value})} /></div>
              <div className="form-group"><label>Tên</label><input type="text" value={customerForm.lastName || ''} onChange={e => setCustomerForm({...customerForm, lastName: e.target.value})} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group"><label>Email</label><input type="email" required placeholder="example@mail.com" value={customerForm.email || ''} onChange={e => setCustomerForm({...customerForm, email: e.target.value})} /></div>
              <div className="form-group"><label>SĐT (10 số, đầu 0)</label><input type="text" pattern="0[0-9]{9}" minLength={10} maxLength={10} placeholder="0xxxxxxxxx" value={customerForm.phoneNumber || ''} onChange={e => setCustomerForm({...customerForm, phoneNumber: e.target.value.replace(/\D/g,'')})} /></div>
            </div>
            <div className="form-group"><label>Địa chỉ</label><input type="text" value={customerForm.locality || ''} onChange={e => setCustomerForm({...customerForm, locality: e.target.value})} placeholder="Địa chỉ thường trú..." /></div>
            <div className="modal-actions"><button type="button" className="secondary-btn" onClick={() => setShowCustomerModal(false)}>Hủy</button><button type="submit" className="primary-btn">Lưu</button></div>
          </form>
        </div></div>
      )}
      {showBrandModal && (
        <div className="modal-overlay"><div className="modal-content glass"><h2>{editingBrand ? 'Sửa' : 'Thêm'} Thương hiệu</h2>
          <form onSubmit={handleBrandSubmit} className="modal-form">
            <div className="form-group"><label>Tên thương hiệu</label><input type="text" required value={brandForm.name || ''} onChange={e => setBrandForm({...brandForm, name: e.target.value})} /></div>
            
            <div className="form-group">
              <label>Logo thương hiệu (Chọn từ máy tính)</label>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div style={{ 
                  width: '80px', height: '80px', borderRadius: '8px', 
                  border: '2px dashed rgba(255,255,255,0.2)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', background: 'rgba(255,255,255,0.05)'
                }}>
                  {brandForm.image ? (
                    <img src={formatImageUrl(brandForm.image, true)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Award size={24} style={{ opacity: 0.3 }} />
                  )}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input type="file" accept="image/*" onChange={handleBrandImageChange} style={{ fontSize: '0.8rem' }} />
                  <p style={{ fontSize: '0.7rem', opacity: 0.5, margin: 0 }}>Hoặc dán URL ảnh bên dưới:</p>
                  <input type="text" placeholder="https://..." value={brandForm.image || ''} onChange={e => setBrandForm({...brandForm, image: e.target.value})} style={{ fontSize: '0.85rem' }} />
                </div>
              </div>
            </div>

            <div className="form-group"><label>Mô tả</label><textarea value={brandForm.description || ''} onChange={e => setBrandForm({...brandForm, description: e.target.value})} /></div>
            <div className="modal-actions"><button type="button" className="secondary-btn" onClick={() => setShowBrandModal(false)}>Hủy</button><button type="submit" className="primary-btn">Lưu</button></div>
          </form>
        </div></div>
      )}
      {showUserModal && (
        <div className="modal-overlay"><div className="modal-content glass" style={{ maxWidth: '600px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>{editingUser ? 'Sửa' : 'Thêm'} Nhân sự</h2>
            <button className="icon-btn" onClick={() => setShowUserModal(false)}><X size={20} /></button>
          </div>
          <form onSubmit={handleUserSubmit} className="modal-form">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group"><label>Họ (First Name)</label><input type="text" required value={userForm.firstName || ''} onChange={e => setUserForm({...userForm, firstName: e.target.value})} /></div>
              <div className="form-group"><label>Tên (Last Name)</label><input type="text" required value={userForm.lastName || ''} onChange={e => setUserForm({...userForm, lastName: e.target.value})} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group"><label>Email</label><input type="email" required placeholder="example@mail.com" value={userForm.email || ''} onChange={e => setUserForm({...userForm, email: e.target.value})} /></div>
              <div className="form-group"><label>SĐT (10 số, đầu 0)</label><input type="text" pattern="0[0-9]{9}" minLength={10} maxLength={10} placeholder="0xxxxxxxxx" value={userForm.phoneNumber || ''} onChange={e => setUserForm({...userForm, phoneNumber: e.target.value.replace(/\D/g,'')})} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group"><label>Tên đăng nhập</label><input type="text" required value={userForm.userName || ''} onChange={e => setUserForm({...userForm, userName: e.target.value})} /></div>
              <div className="form-group">
                <label>Quyền hạn</label>
                <select value={userForm.role || 'STAFF'} onChange={e => setUserForm({...userForm, role: e.target.value})}>
                  <option value="STAFF">NHÂN VIÊN (STAFF)</option>
                  <option value="ADMIN">QUẢN TRỊ (ADMIN)</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Ảnh đại diện</label>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div style={{ 
                  width: '60px', height: '60px', borderRadius: '50%', 
                  border: '2px dashed rgba(255,255,255,0.2)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', background: 'rgba(255,255,255,0.05)'
                }}>
                  {userForm.avatar ? (
                    <img src={userForm.avatar} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={24} style={{ opacity: 0.3 }} />
                  )}
                </div>
                <input type="file" accept="image/*" onChange={handleUserAvatarChange} />
              </div>
            </div>
            {!editingUser && <div className="form-group"><label>Mật khẩu</label><input type="password" required value={userForm.password || ''} onChange={e => setUserForm({...userForm, password: e.target.value})} placeholder="Mật khẩu ban đầu" /></div>}
            <div className="modal-actions"><button type="button" className="secondary-btn" onClick={() => setShowUserModal(false)}>Hủy</button><button type="submit" className="primary-btn">Lưu thông tin</button></div>
          </form>
        </div></div>
      )}

      {showPromotionModal && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <h2>{editingPromotion ? 'Sửa' : 'Thêm'} Khuyến mãi</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const payload = {
                ...promotionForm,
                applicableProducts: promotionForm.applicableProducts.join(',')
              };
              try {
                if(editingPromotion) await axios.put(`${ENDPOINTS.adminPromotions}/${editingPromotion.id}`, payload);
                else await axios.post(ENDPOINTS.adminPromotions, payload);
                fetchData();
                setShowPromotionModal(false);
              } catch (err) {
                alert("Lỗi lưu khuyến mãi.");
              }
            }} className="modal-form">
              <div className="form-group"><label>Tên chương trình</label><input type="text" required value={promotionForm.title} onChange={e => setPromotionForm({...promotionForm, title: e.target.value})} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group"><label>Mã giảm giá</label><input type="text" required value={promotionForm.code} onChange={e => setPromotionForm({...promotionForm, code: e.target.value.toUpperCase()})} /></div>
                <div className="form-group"><label>Mức giảm (%)</label><input type="number" required min="1" max="100" value={promotionForm.discount} onChange={e => setPromotionForm({...promotionForm, discount: parseInt(e.target.value)})} /></div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group"><label>Hạn sử dụng</label><input type="date" required value={promotionForm.validUntil} onChange={e => setPromotionForm({...promotionForm, validUntil: e.target.value})} /></div>
                <div className="form-group">
                  <label>Số lượng mã</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                      type="number" 
                      disabled={promotionForm.isUnlimited} 
                      value={promotionForm.usageLimit} 
                      onChange={e => setPromotionForm({...promotionForm, usageLimit: parseInt(e.target.value)})}
                      style={{ flex: 1 }}
                    />
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={promotionForm.isUnlimited} onChange={e => setPromotionForm({...promotionForm, isUnlimited: e.target.checked})} />
                      Vô hạn
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Sản phẩm áp dụng</label>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={promotionForm.applicableProducts?.includes('ALL')} 
                      onChange={e => setPromotionForm({...promotionForm, applicableProducts: e.target.checked ? ['ALL'] : []})} 
                    />
                    <strong>Áp dụng cho tất cả sản phẩm</strong>
                  </label>
                  
                  {!promotionForm.applicableProducts?.includes('ALL') && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxHeight: '120px', overflowY: 'auto', padding: '5px' }}>
                      {products.map(p => (
                        <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={promotionForm.applicableProducts?.includes(p.id?.toString())}
                            onChange={e => {
                              const currentIds = promotionForm.applicableProducts || [];
                              const ids = e.target.checked 
                                ? [...currentIds, p.id?.toString()] 
                                : currentIds.filter((id: string) => id !== p.id?.toString());
                              setPromotionForm({...promotionForm, applicableProducts: ids});
                            }}
                          />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.productName}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowPromotionModal(false)}>Hủy</button>
                <button type="submit" className="primary-btn">Lưu khuyến mãi</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showProfileModal && (
        <div className="modal-overlay">
          <div className="modal-content glass profile-card" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <button className="close-btn" onClick={() => setShowProfileModal(false)}><X /></button>
            
            <div className="profile-header-bg"></div>
            
            <div style={{ marginTop: '-50px', position: 'relative', marginBottom: '15px' }}>
              <div style={{ 
                width: '100px', height: '100px', borderRadius: '50%', 
                border: '4px solid #1a1a1a', margin: '0 auto', overflow: 'hidden',
                background: '#333'
              }}>
                {currentUser?.userDetails?.avatar ? (
                  <img src={currentUser.userDetails.avatar} alt="Me" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><User size={40} /></div>
                )}
              </div>
            </div>

            <h2 style={{ margin: '0' }}>{currentUser?.userDetails?.firstName} {currentUser?.userDetails?.lastName}</h2>
            <p style={{ opacity: 0.6, marginTop: '5px' }}>@{currentUser?.userName} | <span style={{ color: '#f9a8d4' }}>{(currentUser?.role && typeof currentUser?.role === 'object') ? currentUser.role.roleName : currentUser?.role}</span></p>
            
            <div className="profile-info-grid" style={{ marginTop: '30px', textAlign: 'left', padding: '0 20px' }}>
               <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontSize: '0.75rem', opacity: 0.5, display: 'block' }}>Email</label>
                  <span>{currentUser?.userDetails?.email || 'N/A'}</span>
               </div>
               <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontSize: '0.75rem', opacity: 0.5, display: 'block' }}>Số điện thoại</label>
                  <span>{currentUser?.userDetails?.phoneNumber || 'N/A'}</span>
               </div>
               <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontSize: '0.75rem', opacity: 0.5, display: 'block' }}>Địa chỉ</label>
                  <span>{currentUser?.userDetails?.street ? `${currentUser.userDetails.streetNumber} ${currentUser.userDetails.street}, ${currentUser.userDetails.locality}` : 'Chưa cập nhật'}</span>
               </div>
            </div>

            <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '10px' }}>
               <button className="primary-btn" style={{ flex: 1, padding: '10px' }} onClick={() => { if(currentUser) { handleOpenEditUser(currentUser); setShowProfileModal(false); } }}>
                  <Edit2 size={16} style={{ marginRight: '8px' }} /> Chỉnh sửa hồ sơ
               </button>
               <button className="secondary-btn" style={{ flex: 1, padding: '10px' }} onClick={() => setShowProfileModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
      {showBannerModal && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <div className="modal-header">
              <h2>{editingBanner ? 'Sửa Banner' : 'Thêm Banner Mới'}</h2>
              <button className="close-btn" onClick={() => setShowBannerModal(false)}><X /></button>
            </div>
            <form onSubmit={handleBannerSubmit} className="product-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Tiêu đề</label>
                  <input type="text" value={bannerForm.title} onChange={e => setBannerForm({...bannerForm, title: e.target.value})} placeholder="VD: Bộ sưu tập Thu Đông" />
                </div>
                <div className="form-group">
                  <label>Phụ đề</label>
                  <input type="text" value={bannerForm.subtitle} onChange={e => setBannerForm({...bannerForm, subtitle: e.target.value})} placeholder="VD: Giảm giá đến 30%" />
                </div>
              </div>
              
              <div className="form-group">
                <label>Ảnh Banner</label>
                <div className="image-upload-area">
                  {bannerForm.imageUrl ? (
                    <div className="image-preview" style={{ width: '100%', height: '200px', background: '#000', borderRadius: '12px', overflow: 'hidden' }}>
                      <img src={bannerForm.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      <button type="button" className="remove-img" onClick={() => setBannerForm({...bannerForm, imageUrl: ''})}><X size={14} /></button>
                    </div>
                  ) : (
                    <label className="upload-placeholder" style={{ height: '200px' }}>
                      <ImageIcon size={30} />
                      <span>Tải ảnh banner lên</span>
                      <input type="file" hidden accept="image/*" onChange={handleBannerImageChange} />
                    </label>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Link liên kết (URL)</label>
                <input type="text" value={bannerForm.linkUrl} onChange={e => setBannerForm({...bannerForm, linkUrl: e.target.value})} placeholder="VD: /products/1" />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Thứ tự hiển thị</label>
                  <input type="number" value={bannerForm.orderIndex} onChange={e => setBannerForm({...bannerForm, orderIndex: Number(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label>Trạng thái</label>
                  <select value={bannerForm.isActive ? 'true' : 'false'} onChange={e => setBannerForm({...bannerForm, isActive: e.target.value === 'true'})}>
                    <option value="true">Hiển thị</option>
                    <option value="false">Ẩn</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowBannerModal(false)}>Hủy</button>
                <button type="submit" className="primary-btn">Lưu Banner</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showFaqModal && (
        <div className="modal-overlay">
          <div className="modal-content glass" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>{editingFaq ? 'Sửa câu hỏi' : 'Thêm câu hỏi mới'}</h2>
              <button className="close-btn" onClick={() => setShowFaqModal(false)}><X /></button>
            </div>
            <form onSubmit={handleFaqSubmit} className="modal-form">
              <div className="form-group">
                <label>Từ khóa (Keyword)</label>
                <input 
                  type="text" 
                  required 
                  value={faqForm.keyword} 
                  onChange={e => setFaqForm({...faqForm, keyword: e.target.value})} 
                  placeholder="VD: ship, giao hàng, bảo hành" 
                />
                <p style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '4px' }}>Bot sẽ trả lời nếu tin nhắn khách hàng chứa từ khóa này.</p>
              </div>
              <div className="form-group">
                <label>Câu trả lời của Bot</label>
                <textarea 
                  required 
                  style={{ minHeight: '150px' }}
                  value={faqForm.answer} 
                  onChange={e => setFaqForm({...faqForm, answer: e.target.value})} 
                  placeholder="Nhập nội dung Bot sẽ trả lời..." 
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowFaqModal(false)}>Hủy</button>
                <button type="submit" className="primary-btn">Lưu thiết lập</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFlashSaleModal && (
        <div className="modal-overlay">
          <div className="modal-content glass" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>{editingFlashSale ? 'Sửa Flash Sale' : 'Tạo Flash Sale Mới'}</h2>
              <button className="close-btn" onClick={() => setShowFlashSaleModal(false)}><X /></button>
            </div>
            <form onSubmit={handleFlashSaleSubmit} className="modal-form">
              <div className="form-group">
                <label>Tên chương trình</label>
                <input type="text" required value={flashSaleForm.title} onChange={e => setFlashSaleForm({...flashSaleForm, title: e.target.value})} placeholder="VD: Flash Sale Mùa Hè" />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea value={flashSaleForm.description} onChange={e => setFlashSaleForm({...flashSaleForm, description: e.target.value})} placeholder="Thông tin chương trình..." />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Thời gian bắt đầu</label>
                  <input type="datetime-local" required value={flashSaleForm.startTime} onChange={e => setFlashSaleForm({...flashSaleForm, startTime: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Thời gian kết thúc</label>
                  <input type="datetime-local" required value={flashSaleForm.endTime} onChange={e => setFlashSaleForm({...flashSaleForm, endTime: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <select value={flashSaleForm.status} onChange={e => setFlashSaleForm({...flashSaleForm, status: e.target.value})}>
                  <option value="Upcoming">Chưa bắt đầu (Upcoming)</option>
                  <option value="Active">Đang diễn ra (Active)</option>
                  <option value="Ended">Đã kết thúc (Ended)</option>
                  <option value="Disabled">Tạm dừng (Disabled)</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowFlashSaleModal(false)}>Hủy</button>
                <button type="submit" className="primary-btn">Lưu chương trình</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTierModal && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <h2>{editingTier ? 'Sửa' : 'Thêm'} Hạng thành viên</h2>
            <form onSubmit={handleTierSubmit} className="modal-form">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Tên hạng</label>
                  <input type="text" required value={tierForm.tierName} onChange={e => setTierForm({...tierForm, tierName: e.target.value})} placeholder="Vd: Silver, Gold..." />
                </div>
                <div className="form-group">
                  <label>Thứ tự hạng (0, 1, 2...)</label>
                  <input type="number" required value={tierForm.tierOrder} onChange={e => setTierForm({...tierForm, tierOrder: parseInt(e.target.value)})} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Chi tiêu tối thiểu (₫)</label>
                  <input type="number" required value={tierForm.minSpending} onChange={e => setTierForm({...tierForm, minSpending: parseFloat(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label>Giảm giá (%)</label>
                  <input type="number" value={tierForm.discountPercent} onChange={e => setTierForm({...tierForm, discountPercent: parseFloat(e.target.value)})} />
                </div>
              </div>

              <div className="form-group">
                <label>Mô tả quyền lợi</label>
                <textarea value={tierForm.description} onChange={e => setTierForm({...tierForm, description: e.target.value})} placeholder="Vd: Ưu đãi đặc biệt cho thành viên VIP..." />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px' }}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={tierForm.freeShipping} onChange={e => setTierForm({...tierForm, freeShipping: e.target.checked})} />
                  <span className="text-[10px] uppercase font-bold">Freeship</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={tierForm.priorityFlashSale} onChange={e => setTierForm({...tierForm, priorityFlashSale: e.target.checked})} />
                  <span className="text-[10px] uppercase font-bold">Ưu tiên Flash Sale</span>
                </label>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '9px' }}>Hệ số điểm</label>
                  <input type="number" value={tierForm.rewardMultiplier} onChange={e => setTierForm({...tierForm, rewardMultiplier: parseInt(e.target.value)})} style={{ padding: '4px 8px' }} />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowTierModal(false)}>Hủy</button>
                <button type="submit" className="primary-btn">Lưu cấu hình</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFlashItemModal && (
        <div className="modal-overlay">
          <div className="modal-content glass" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h2>Thêm sản phẩm Flash Sale</h2>
              <button className="close-btn" onClick={() => setShowFlashItemModal(false)}><X /></button>
            </div>
            <form onSubmit={handleAddFlashItem} className="modal-form">
              <div className="form-group">
                <label>Sản phẩm</label>
                <select required value={flashItemForm.productId} onChange={e => {
                  const p = products.find(prod => prod.id === Number(e.target.value));
                  setFlashItemForm({...flashItemForm, productId: Number(e.target.value), flashPrice: p ? p.price * 0.7 : 0});
                }}>
                  <option value="">-- Chọn sản phẩm --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.productName} (Gốc: {Number(p.price).toLocaleString()} ₫)</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Giá Flash Sale (₫)</label>
                <input type="number" required value={flashItemForm.flashPrice} onChange={e => setFlashItemForm({...flashItemForm, flashPrice: Number(e.target.value)})} />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Số lượng bán</label>
                  <input type="number" required value={flashItemForm.initialQuantity} onChange={e => setFlashItemForm({...flashItemForm, initialQuantity: Number(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label>G.Hạn mỗi người</label>
                  <input type="number" value={flashItemForm.maxPerUser} onChange={e => setFlashItemForm({...flashItemForm, maxPerUser: Number(e.target.value)})} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowFlashItemModal(false)}>Hủy</button>
                <button type="submit" className="primary-btn">Xác nhận thêm</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Reply Modal */}
      {showReplyModal && (
        <div className="modal-overlay">
          <div className="modal-content glass" style={{ maxWidth: '500px' }}>
            <h2>Phản hồi đánh giá</h2>
            <div style={{ marginBottom: '20px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ display: 'flex', gap: '8px', color: '#fbbf24', marginBottom: '8px' }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < (editingReview?.rating || 0) ? '#fbbf24' : 'transparent'} />)}
               </div>
               <p style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>"{editingReview?.content}"</p>
               <div style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '8px' }}>— {editingReview?.userName}</div>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!editingReview) return;
              try {
                await axios.post(`${ENDPOINTS.adminReviews}/${editingReview.id}/reply`, { reply: replyText });
                setShowReplyModal(false);
                fetchData();
              } catch (err) { alert("Lỗi gửi phản hồi."); }
            }} className="modal-form">
              <div className="form-group">
                <label>Nội dung phản hồi của shop</label>
                <textarea 
                  required 
                  style={{ minHeight: '120px' }}
                  value={replyText} 
                  onChange={e => setReplyText(e.target.value)} 
                  placeholder="Cảm ơn bạn đã đánh giá..."
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowReplyModal(false)}>Hủy</button>
                <button type="submit" className="primary-btn">Gửi phản hồi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCollectionModal && (
        <div className="modal-overlay">
          <div className="modal-content glass" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>{editingCollection ? 'Sửa Bộ sưu tập' : 'Thêm Bộ sưu tập Mới'}</h2>
              <button className="close-btn" onClick={() => setShowCollectionModal(false)}><X /></button>
            </div>
            <form onSubmit={handleCollectionSubmit} className="product-form">
              <div className="form-group">
                <label>Tên bộ sưu tập</label>
                <input type="text" required value={collectionForm.name} onChange={e => setCollectionForm({...collectionForm, name: e.target.value})} placeholder="VD: Thu Đông 2026" />
              </div>

              <div className="form-group">
                <label>Thương hiệu đại diện</label>
                <select value={collectionForm.brandId} onChange={e => setCollectionForm({...collectionForm, brandId: Number(e.target.value)})}>
                  <option value="">-- Chọn thương hiệu --</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Banner riêng bộ sưu tập <span style={{ fontSize: '10px', opacity: 0.5 }}>(Khuyên dùng: 1920x800 px)</span></label>
                <div className="image-upload-area">
                  {collectionForm.bannerUrl ? (
                    <div className="image-preview" style={{ width: '100%', height: '150px' }}>
                      <img src={collectionForm.bannerUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button type="button" className="remove-img" onClick={() => setCollectionForm({...collectionForm, bannerUrl: ''})}><X size={14} /></button>
                    </div>
                  ) : (
                    <label className="upload-placeholder" style={{ height: '150px' }}>
                      <ImageIcon size={30} />
                      <span>Tải ảnh banner lên</span>
                      <input type="file" hidden accept="image/*" onChange={handleCollectionBannerChange} />
                    </label>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Sản phẩm trong bộ sưu tập</label>
                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px' }}>
                  {products.map(p => (
                    <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={collectionForm.products?.some(cp => cp.id === p.id)} 
                        onChange={e => {
                          const current = collectionForm.products || [];
                          if (e.target.checked) {
                            setCollectionForm({...collectionForm, products: [...current, { id: p.id } as Product]});
                          } else {
                            setCollectionForm({...collectionForm, products: current.filter(cp => cp.id !== p.id)});
                          }
                        }}
                      />
                      <span style={{ fontSize: '0.85rem' }}>{p.productName}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowCollectionModal(false)}>Hủy</button>
                <button type="submit" className="primary-btn">Lưu bộ sưu tập</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
