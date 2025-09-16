export interface LoginRequest {
  email: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface TokenData {
  email: string;
  tenant_id: number;
  user_id: number;
  role: string;
}

export interface User {
  id: number;
  email: string;
  role: 'admin' | 'member';
  tenant_id: number;
  created_at: string;
  updated_at: string;
}