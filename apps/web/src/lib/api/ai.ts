import { apiClient, type ApiResponse } from './client';
import type { Conversation, Message, SendMessageRequest } from '@/types/shared';

export type { Conversation, Message, SendMessageRequest };

export interface ConversationsResponse {
  conversations: Conversation[];
}

export interface MessagesResponse {
  messages: Message[];
}

export interface SendMessageResponse {
  response: string;
  conversationId: string;
}

export const aiApi = {
  getConversations: () =>
    apiClient.get<ApiResponse<ConversationsResponse>>('/api/ai/conversations'),

  createConversation: () =>
    apiClient.post<ApiResponse<{ conversationId: string }>>('/api/ai/conversations'),

  getMessages: (conversationId: string) =>
    apiClient.get<ApiResponse<MessagesResponse>>(`/api/ai/conversations/${conversationId}/messages`),

  sendMessage: (data: SendMessageRequest) =>
    apiClient.post<ApiResponse<SendMessageResponse>>('/api/ai/chat', data),
};
