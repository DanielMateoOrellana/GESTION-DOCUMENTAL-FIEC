import { api } from './http';
import { User, UserRoleEnum } from '../types';

export type { User };

export interface CreateUserInput {
    email: string;
    fullName: string;
    password?: string;
    role: UserRoleEnum;
}

export interface UpdateUserInput {
    email?: string;
    fullName?: string;
    password?: string;
    role?: UserRoleEnum;
    isActive?: boolean;
}

export async function fetchUsers(): Promise<User[]> {
    const { data } = await api.get<User[]>('/users');
    return data;
}

export async function createUser(input: CreateUserInput): Promise<User> {
    const { data } = await api.post<User>('/users', input);
    return data;
}

export async function updateUser(id: number, input: UpdateUserInput): Promise<User> {
    const { data } = await api.patch<User>(`/users/${id}`, input);
    return data;
}

export async function deleteUser(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
}
