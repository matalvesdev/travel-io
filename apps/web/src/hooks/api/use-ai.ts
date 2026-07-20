'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi, type SendMessageRequest } from '@/lib/api';

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => aiApi.getConversations(),
    select: (data) => data.data,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => aiApi.createConversation(),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['conversations'] }); },
  });
}

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => aiApi.getMessages(conversationId),
    select: (data) => data.data,
    enabled: !!conversationId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SendMessageRequest) => aiApi.sendMessage(data),
    onSuccess: (_, variables) => {
      if (variables.conversationId) {
        queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    },
  });
}
