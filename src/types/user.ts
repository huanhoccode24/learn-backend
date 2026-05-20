export type UserRole = 'ADMIN' | 'USER' | 'PRO' | 'VIP' | 'COLLABORATOR';

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: UserRole;
  bio?: string;
  phoneNumber?: string;
  address?: string;
  facebookLink?: string;
  tiktokLink?: string;
  youtubeLink?: string;
  accounts: string[];
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  image: string | null;
  createdAt: string;
  providers: string[];
}

