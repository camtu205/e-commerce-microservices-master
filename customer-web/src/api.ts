
const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8900/api';
const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws').replace(/\/api$/, '');

export const ENDPOINTS = {
  products: `${API_BASE_URL}/catalog/products`,
  categories: `${API_BASE_URL}/catalog/categories`,
  brands: `${API_BASE_URL}/brand/brands`,
  orders: `${API_BASE_URL}/shop/order`,
  userOrders: (userName: string) => `${API_BASE_URL}/shop/order/user/${userName}`,
  login: `${API_BASE_URL}/accounts/login`,
  register: `${API_BASE_URL}/accounts/registration`,
  banners: `${API_BASE_URL}/catalog/banners`,
  collections: `${API_BASE_URL}/catalog/collections`,
  storeInfo: `${API_BASE_URL}/catalog/store-info`,
  orderDetail: (id: number | string) => `${API_BASE_URL}/shop/order-details/${id}`,
  flashSales: `${API_BASE_URL}/catalog/flash-sales`,
  flashSalePurchase: (itemId: number) => `${API_BASE_URL}/catalog/flash-sales/items/${itemId}/purchase`,
  membershipTiers: `${API_BASE_URL}/accounts/membership-tiers`,
  userProfile: (id: number) => `${API_BASE_URL}/accounts/users/${id}`,
  reviews: `${API_BASE_URL}/catalog/reviews`,
  chatHistory: (conversationId: number) => `${API_BASE_URL}/chat/history/${conversationId}`,
  conversations: `${API_BASE_URL}/chat/conversations`,
  customerConversation: (customerId: number) => `${API_BASE_URL}/chat/conversation/customer/${customerId}`,
  chatWS: `${WS_BASE_URL}/ws-chat`,
  notifications: `${API_BASE_URL}/accounts/notifications`,
  userNotifications: (userId: number) => `${API_BASE_URL}/accounts/notifications/user/${userId}`,
  unreadNotificationsCount: (userId: number) => `${API_BASE_URL}/accounts/notifications/unread-count/${userId}`,
  markNotificationRead: (id: number) => `${API_BASE_URL}/accounts/notifications/mark-as-read/${id}`,
  markAllNotificationsRead: (userId: number) => `${API_BASE_URL}/accounts/notifications/mark-all-read/${userId}`,
  changePassword: (id: number | string) => `${API_BASE_URL}/accounts/users/${id}/change-password`
};

export type Review = {
  id?: number;
  productId: number;
  userId: number;
  userName: string;
  rating: number;
  content: string;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  reply?: string;
  isUseful?: number;
  orderId?: number;
}

export type MembershipTier = {
  id?: number;
  tierName: string;
  minSpending: number;
  maxSpending?: number;
  description?: string;
  discountPercent?: number;
  freeShipping?: boolean;
  priorityFlashSale?: boolean;
  rewardMultiplier?: number;
  tierOrder: number;
}

export type FlashSaleItem = {
  id: number;
  product: Product;
  flashPrice: number;
  initialQuantity: number;
  availableQuantity: number;
  maxPerUser: number;
};

export type FlashSale = {
  id: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: 'Upcoming' | 'Active' | 'Ended' | 'Disabled';
  items: FlashSaleItem[];
};

export type Banner = {
  id?: number;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  linkUrl?: string;
};

export type Brand = {
  id?: number;
  name: string;
  description: string;
  image?: string;
};

export type ProductVariant = {
  id?: number;
  color: string;
  size: string;
  stock: number;
}

export type Product = {
  id?: number;
  productName: string;
  price: number;
  category: string;
  availability: number;
  discription: string;
  image?: string;
  images?: string[];
  sizes?: string;
  colors?: string;
  brand?: Brand;
  averageRating?: number;
  reviewCount?: number;
  salesCount?: number;
  variants?: ProductVariant[];
};

export type OrderItem = {
  id?: number;
  productName: string;
  price: number;
  quantity: number;
  image?: string;
  product?: Product;
  selectedSize?: string;
  selectedColor?: string;
}

export type Order = {
  id: number;
  orderedDate: string;
  status: string;
  total: number;
  items: OrderItem[];
  paymentMethod?: string;
  shippingRecipientName?: string;
  shippingPhoneNumber?: string;
  shippingAddress?: string;
}

export type CartItem = {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  flashSaleItemId?: number;
  flashPrice?: number;
}

export type Address = {
  id?: number;
  recipientName: string;
  phoneNumber: string;
  street: string;
  streetNumber: string;
  zipCode: string;
  locality: string;
  country: string;
  isDefault: boolean;
}
