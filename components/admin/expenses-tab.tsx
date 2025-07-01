import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import DespesasPage from "@/app/admin/despesas/page";

export function ExpensesTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Despesas da Comissão</CardTitle>
        <CardDescription>Adicionar, editar e visualizar despesas. Gerar relatórios financeiros.</CardDescription>
      </CardHeader>
      <CardContent>
        <DespesasPage />
      </CardContent>
    </Card>
  );
}
