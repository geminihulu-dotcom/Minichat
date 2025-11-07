import { Timestamp } from 'firebase/firestore';

export enum Screen {
  SPLASH,
  LOGIN,
  CHAT_LIST,
  CHAT,
  PROFILE,
  NEW_CHAT,
  NOTIFICATIONS,
  PRIVACY,
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
  lastSeen: Timestamp;
  isOnline?: boolean;
}

export interface Message {
  id: string;
  text?: string;
  createdAt: Timestamp;
  senderId: string;
  imageUrl?: string;
}

export interface Chat {
  id: string;
  members: string[]; // array of user IDs
  lastMessage?: {
    text?: string;
    createdAt: Timestamp;
    senderId: string;
  };
  updatedAt: Timestamp;
  isGroup?: boolean;
  groupName?: string;
  groupAvatar?: string;
}
