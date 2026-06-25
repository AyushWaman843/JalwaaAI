export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  category: 'hair' | 'skin' | 'nails' | 'makeup' | 'massage' | 'bridal' | string;
}

export interface Salon {
  id: string;
  placeId?: string;
  name: string;
  address: string;
  rating: number;
  reviewsCount: number;
  phone: string;
  photos: string[];
  hours: Record<string, string> | string;
  services: Service[];
  lat?: number;
  lng?: number;
  isClaimed: boolean;
  distance?: string;
  priceRange?: '₹' | '₹₹' | '₹₹₹' | '₹₹₹₹' | string;
  featuredServices?: string[];
}

export interface Booking {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  salonId: string;
  salonName: string;
  salonAddress?: string;
  service: Service;
  date: string;
  time: string;
  status: 'pending' | 'checked_in' | 'in_service' | 'completed' | 'cancelled';
  price: number;
  qrCode: string;
  queueNumber?: number;
  createdAt: string;
}

export interface SearchFilters {
  location: string;
  services?: string[];
  minRating?: number;
  maxPrice?: number;
  keywords?: string[];
  maxResults?: number;
}

export interface ChatMessage {
  id: string;
  sender?: 'user' | 'ai';
  role?: 'user' | 'assistant';
  text?: string;
  content?: string;
  timestamp?: string;
  createdAt?: string;
  imageUrl?: string;
  base64Image?: string;
  recommendedSalons?: Salon[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

export interface ApifyUsage {
  callsUsed: number;
  callsLimit: number;
  resetDate: string;
}
