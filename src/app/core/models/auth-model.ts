// JWT TOKEN PAYLOAD INTERFACE
export interface UserTokenPayload {
  unique_name?: string;
  role?: string | string[];
  nameid?: string;
  nbf?: number;
  exp?: number;
  iat?: number;
  iss?: string;
  aud?: string;
}

// JWT FORMATED
export interface CurrentUser {
  id: number;
  username: string;
  roles: string[];
}

// API REQUEST AND RESPONSES
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  role: string;
  username: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  role: string;
}

export interface RegisterResponse {
  userId: number;
}

export interface RefreshSessionResponse {
  jwt: string;
}
