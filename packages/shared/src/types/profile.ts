export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
}

export interface ProfileData {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  birthDate?: string;
  avatarUrl?: string;
}
