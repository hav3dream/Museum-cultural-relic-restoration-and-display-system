export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: number;
}

export interface AuthResponse {
  user: User;
  credits: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}
