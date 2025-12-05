import { api } from './http';

export type AuthUser = {
  id: number;
  email: string;
  fullName: string;
  role: 'ADMINISTRADOR' | 'GESTOR' | 'LECTOR' | 'AYUDANTE';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LoginResponse = {
  access_token: string;
  user: AuthUser;
};

export async function loginApi(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', {
    email,
    password,
  });
  return data;
}

export async function fetchMe(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>('/auth/me');
  return data;
}

// 🔹 NUEVO: registro
export type RegisterInput = {
  email: string;
  password: string;
  fullName: string;
  role?: 'ADMINISTRADOR' | 'GESTOR' | 'LECTOR' | 'AYUDANTE';
};

export async function registerApi(input: RegisterInput): Promise<AuthUser> {
  const { data } = await api.post<AuthUser>('/auth/register', input);
  return data;
}
