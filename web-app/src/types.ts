export enum Role {
  Admin = "admin",
  User = "user",
}

export enum Status {
  Active = "active",
  Banned = "banned",
}

export enum Provider {
  Google = "google",
  Conj = "conj",
}

export interface Account {
  role: string;
  email: string;
  username: string;
  last_thread: string;
  status: string;
  id: number;
  avatar: string;
  last_reply: string;
  provider: string;
  is_onboarding: boolean;
}

export interface Image {
  filename: string;
  location: string;
}

export interface Post {
  id: number;
  image: Image | null;
  is_anonymous?: boolean;
  subject: string | null;
  comment: string;
  time: string;
  username: string;
  avatar: string | null;
}

export type Thread = Post[];
