import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { generatePlayerDuesAction } from '@/app/actions/finance-actions';
import PayableItem from '@/models/payable-item-model';
import { PlayerFinanceDashboard } from '@/components/finance/player-finance-dashboard';

export default async function FinancasPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  // Ensure all dues are generated before fetching
  await generatePlayerDuesAction();

  // Fetch all payable items for the player
  const payableItemsData = await PayableItem.find({ playerCpf: session.cpf }).sort({ referenceDate: -1 }).lean();
  const payableItems = JSON.parse(JSON.stringify(payableItemsData));

  return (
    <div className='container mx-auto py-8 px-4'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-primary mb-2'>Minhas Finanças</h1>
        <p className='text-muted-foreground'>
          Acompanhe e gerencie suas mensalidades e outros débitos com a associação.
        </p>
      </div>
      <PlayerFinanceDashboard initialPayableItems={payableItems} />
    </div>
  );
}
