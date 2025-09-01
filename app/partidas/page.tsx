import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ROLES } from '@/lib/roles';
import { MatchesDashboard } from '@/components/matches/matches-dashboard';

export default async function MatchesPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // Allow access to all authenticated users
  const allowedRoles = [
    ROLES.ADMIN,
    ROLES.JOGADOR,
    ROLES.ARBITRO,
    ROLES.COMISSAO,
  ];
  if (!allowedRoles.includes(session.role)) {
    redirect('/dashboard');
  }

  return (
    <div className='container mx-auto py-8 px-4'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-primary mb-2'>Partidas AFPS</h1>
        <p className='text-muted-foreground'>
          Acompanhe os resultados, estatísticas e histórico das partidas da
          associação
        </p>
      </div>
      <MatchesDashboard userCpf={session.cpf} userRole={session.role} />
    </div>
  );
}
