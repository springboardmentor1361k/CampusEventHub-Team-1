export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  college: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum UserRole {
  STUDENT = 'student',
  COLLEGE_ADMIN = 'college_admin',
  SUPER_ADMIN = 'super_admin'
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  college: string;
  role: UserRole;
}
