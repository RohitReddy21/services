export type UserRole = "CUSTOMER" | "ADMIN" | "TECHNICIAN";

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  profileImage: string | null;
  twoFactorEnabled: boolean;
  notificationPreferences: {
    email: boolean;
    sms: boolean;
  };
  createdAt: string;
}

export interface AuthResponse {
  user: PublicUser;
}
