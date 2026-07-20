import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!authHeader) {
      return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'As senhas não coincidem' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Senha deve ter no mínimo 8 caracteres' },
        { status: 400 }
      );
    }

    // Create Supabase client with user's auth token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${authHeader}` } }});

    // Verify current password by trying to sign in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) {
      return NextResponse.json({ success: false, message: 'Usuário não encontrado' }, { status: 401 });
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword});

    if (signInError) {
      return NextResponse.json(
        { success: false, message: 'Senha atual incorreta' },
        { status: 400 }
      );
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

    if (updateError) {
      return NextResponse.json(
        { success: false, message: updateError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
