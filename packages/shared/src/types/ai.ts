export interface Conversation {
  id: string;
  title: string;
  agentType: string;
  status: string;
  messageCount: number;
  lastMessageAt: string;
  lastMessagePreview: string;
}

export interface Message {
  id: string;
  role: string;
  content: string;
  tokensUsed: number;
  modelUsed: string;
  processingTimeMs: number;
  createdAt: string;
}

export interface SendMessageRequest {
  conversationId?: string;
  message: string;
}

export interface CreateConversationRequest {
  agentType?: string;
}
