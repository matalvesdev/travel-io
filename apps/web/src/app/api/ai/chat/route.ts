import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';
import { analyzeSentiment } from '@/lib/api/hf';

export async function POST(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase}) => {
    const body = await request.json();
    const { message, conversationId } = body;

    if (!message) return Response.json({ success: false, message: 'Mensagem obrigatória' }, { status: 400 });

    const sentiment = await analyzeSentiment(message).catch(() => null);
    const botResponse = sentiment
      ? `Entendo como você se sente. Com base na sua mensagem, identifiquei um sentimento ${sentiment.label === 'POSITIVE' ? 'positivo' : sentiment.label === 'NEGATIVE' ? 'negativo' : 'neutro'} (score: ${(sentiment.score * 100).toFixed(0)}%). Como posso ajudar mais?`
      : 'Desculpe, não consegui processar sua mensagem agora. Por favor, tente novamente.';

    const { data, error } = await supabase
      .from('ai_messages')
      .insert([
        { conversation_id: conversationId, role: 'user', content: message },
        { conversation_id: conversationId, role: 'assistant', content: botResponse },
      ])
      .select();

    if (error) return Response.json({ success: false, message: error.message }, { status: 500 });

    return Response.json({
      success: true,
      data: { response: botResponse, conversationId }});
  });
}
