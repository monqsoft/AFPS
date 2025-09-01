import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import dbConnect from '@/lib/mongodb';
import Player from '@/models/player-model';
import { getAppConfig } from '@/models/config-model';
import { ROLES } from '@/lib/roles';
import { fetchLogsAction } from './actions';
import { AccessProfilesTab } from '@/components/admin/access-profiles-tab';
import { MonthlyFeeTab } from '@/components/admin/monthly-fee-tab';
import { LogsTab } from '@/components/admin/logs-tab';
import { ExpensesTab } from '@/components/admin/expenses-tab';
import PlayersTab from '@/components/admin/players-tab';
import { MatchesTab } from '@/components/admin/matches-tab';

export default async function AdminDashboardPage() {
  const session = await getSession();

  if (!session || session.role !== ROLES.ADMIN) {
    redirect('/login');
  }

  await dbConnect();
  const authorizedPlayers = await Player.find({ isAuthorized: true })
    .sort({ createdAt: -1 })
    .lean();
  const config = await getAppConfig();
  const logsResult = await fetchLogsAction({});
  const initialLogs = logsResult.success ? logsResult.logs : [];

  return (
    <div className='container mx-auto py-8 px-4'>
      <h1 className='text-3xl font-bold mb-6 text-primary'>
        Painel Administrativo AFPS
      </h1>
      <Tabs defaultValue='cpfs' className='w-full'>
        <TabsList className='grid w-full grid-cols-2 md:grid-cols-6 mb-4'>
          <TabsTrigger value='jogadores'>Jogadores</TabsTrigger>
          <TabsTrigger value='cpfs'>Perfis e Acesso</TabsTrigger>
          <TabsTrigger value='mensalidade'>Mensalidade</TabsTrigger>
          <TabsTrigger value='partidas'>Partidas</TabsTrigger>
          <TabsTrigger value='logs'>Logs</TabsTrigger>
          <TabsTrigger value='despesas'>Despesas</TabsTrigger>
        </TabsList>

        <TabsContent value='jogadores'>
          <PlayersTab />
        </TabsContent>
        <TabsContent value='cpfs'>
          <AccessProfilesTab authorizedPlayers={authorizedPlayers} />
        </TabsContent>
        <TabsContent value='mensalidade'>
          <MonthlyFeeTab currentValor={config.valorMensalidade} />
        </TabsContent>
        <TabsContent value='partidas'>
          <MatchesTab />
        </TabsContent>
        <TabsContent value='logs'>
          <LogsTab initialLogs={initialLogs} />
        </TabsContent>
        <TabsContent value='despesas'>
          <ExpensesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
