import { env } from './env';

export const api = {
  baseUrl: env.apiUrl,
  endpoints: {
    chat: '/api/chat',
  },
  chatUrl: `${env.apiUrl.replace(/\/$/, '')}/api/chat`,
} as const;