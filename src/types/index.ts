export type Gender = 'male' | 'female' | 'other' | 'unspecified';

export type Role = 'user' | 'assistant' | 'system';

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  age: number | null;
  gender: Gender | null;
  avatar_url: string | null;
  goal: string | null;
  topics: string[] | null;
  created_at: string;
};

export type Conversation = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
};

export type Citation = {
  surah: number;
  ayah: number;
  text?: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  role: Role;
  content: string;
  citation: Citation | null;
  created_at: string;
  bookmarked?: boolean;
};

export type Bookmark = {
  id: string;
  user_id: string;
  message_id: string;
};

export type ChatRequestBody = {
  messages: { role: Role; content: string }[];
  conversationId?: string;
};

export type ChatResponse = {
  content: string;
  citation: Citation | null;
  conversationId: string;
  messageId: string;
};
