'use client';
import Image from 'next/image';
import LoginForm from '@/components/login-form';

export default function LoginPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-primary via-primary/90 to-secondary flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <Image
            src='/logo-afps.png'
            alt='AFPS Logo'
            width={100}
            height={100}
            className='mx-auto mb-4 shadow-lg rounded-full bg-background p-2'
          />
          <h1 className='text-2xl font-bold text-primary-foreground mb-2'>
            AFPS - Sistema de Gestão
          </h1>
          <p className='text-primary-foreground/80'>
            Associação de Futebol de Porto dos Santos
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
