// resources/js/types/index.d.ts

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  avatar?: string;
  storage_used: number;
  storage_limit: number;
  dark_mode: boolean;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: number;
  user_id: number;
  original_filename: string;
  stored_filename: string;
  file_path: string;
  thumbnail_path?: string;
  file_size: number;
  mime_type: string;
  width?: number;
  height?: number;
  taken_at?: string;
  camera_make?: string;
  camera_model?: string;
  latitude?: number;
  longitude?: number;
  location_name?: string;
  is_favorite: boolean;
  is_archived: boolean;
  deleted_at?: string;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
  // Computed properties for frontend
  url?: string; // Full URL to photo
  src?: string; // Alternative URL
  alt?: string; // Alternative text
  title?: string; // Photo title
}

export interface Album {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  cover_photo_id?: number;
  cover_photo?: Photo;
  is_auto: boolean;
  auto_type?: 'date' | 'location' | 'camera' | 'person';
  auto_criteria?: Record<string, any>;
  photos_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Place {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  photos_count: number;
  cover_photo?: Photo;
}

export interface Person {
  id: number;
  user_id: number;
  name?: string;
  avatar_photo_id?: number;
  avatar_photo?: Photo;
  photos_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Share {
  id: number;
  user_id: number;
  shareable_type: string;
  shareable_id: number;
  share_token: string;
  share_type: 'public' | 'friends' | 'specific';
  password?: string;
  expires_at?: string;
  is_active: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message?: string;
  data?: Record<string, any>;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface PageProps<T = Record<string, any>> {
  auth: {
    user?: User;
  };
  flash?: {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
  };
  [key: string]: any;
}

export interface PaginatedData<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
}

export interface PhotosByDate {
  date: string;
  photos: Photo[];
}

export interface PhotosByMonth {
  month: string;
  photos: Photo[];
}
