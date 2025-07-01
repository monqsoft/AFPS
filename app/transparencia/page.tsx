import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function TransparenciaPage() {
  // Placeholder data for financial summary
  const financialSummary = [
    { year: 2024, revenue: 150000, expenses: 120000, balance: 30000, status: "Positivo" },
    { year: 2023, revenue: 130000, expenses: 135000, balance: -5000, status: "Negativo" },
    { year: 2022, revenue: 100000, expenses: 90000, balance: 10000, status: "Positivo" },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-primary">Transparência AFPS</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro Anual</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ano</TableHead>
                    <TableHead>Receita</TableHead>
                    <TableHead>Despesas</TableHead>
                    <TableHead>Balanço</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financialSummary.map((item) => (
                    <TableRow key={item.year}>
                      <TableCell>{item.year}</TableCell>
                      <TableCell>R$ {item.revenue.toLocaleString('pt-BR')}</TableCell>
                      <TableCell>R$ {item.expenses.toLocaleString('pt-BR')}</TableCell>
                      <TableCell>R$ {item.balance.toLocaleString('pt-BR')}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === "Positivo" ? "default" : "destructive"}>
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
            <p className="text-sm text-muted-foreground mt-4">
              Para relatórios financeiros detalhados, entre em contato com a administração.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações Gerais</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              A Associação de Futebol de Praia e Salão (AFPS) está comprometida com a transparência em todas as suas operações.
              Nesta seção, você encontrará informações relevantes sobre a gestão, finanças e atividades da associação.
            </p>
            <h3 className="text-lg font-semibold mb-2">Missão e Valores</h3>
            <p className="mb-4">
              Nossa missão é promover o futebol de praia e salão, incentivando a prática esportiva, o fair play e a integração social.
              Valorizamos a ética, a responsabilidade e a clareza em todas as nossas ações.
            </p>
            <h3 className="text-lg font-semibold mb-2">Documentos Importantes</h3>
            <ul className="list-disc pl-5">
              <li>Estatuto Social (disponível mediante solicitação)</li>
              <li>Regulamento Interno (disponível mediante solicitação)</li>
              <li>Atas de Reuniões (disponível mediante solicitação)</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              Para acesso a documentos específicos ou mais informações, por favor, utilize nossos canais de contato.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
