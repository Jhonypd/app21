'use server';

import { NovoPerfil } from '@/data/auth/novo-perfil';
import { createClientServer } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const supabase = await createClientServer();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } =
    await supabase.auth.signInWithPassword(data);

  if (error) {
    console.error('Login error:', error.message);
    redirect(
      '/error?message=' + encodeURIComponent(error.message),
    );
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signup(formData: FormData) {
  const supabase = await createClientServer();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        name: formData.get('nome') as string,
      },
    },
  };

  const { data: authData, error } =
    await supabase.auth.signUp(data);

  if (error) {
    console.error('Signup error:', error.message);
    redirect(
      '/error?message=' + encodeURIComponent(error.message),
    );
  }

  // Se você quiser criar um perfil após o signup, pode fazer aqui
  if (authData.user) {
    try {
      await NovoPerfil({
        nome: formData.get('nome') as string,
        user_id: authData.user.id,
      });
    } catch (profileError) {
      console.error(
        'Profile creation error:',
        profileError,
      );
    }
  }

  revalidatePath('/', 'layout');
  redirect('/confirmacao-email');
}
