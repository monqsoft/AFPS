import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ROLES } from "@/lib/roles"

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Dashboard</CardTitle>
          <CardDescription>Bem-vindo(a) de volta, {session.nome}!</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Seu CPF: {session.cpf}</p>
          <p>Seu Perfil: {session.role }</p>
          <div className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas do Jogador</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Gols: 0</p>
                <p>Assistências: 0</p>
                <p>Cartões Amarelos: 0</p>
                <p>Cartões Vermelhos: 0</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Pagamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Último Pagamento: N/A</p>
                <p>Status da Mensalidade: Em dia</p>
              </CardContent>
            </Card>
          </div>
          {session.role === ROLES.ADMIN && (
            <div className="mt-6 p-4 bg-secondary/10 rounded-lg">
              <h3 className="text-xl font-semibold text-secondary">Painel do Administrador</h3>
              <p className="text-muted-foreground">Funcionalidades administrativas serão exibidas aqui.</p>
            </div>
          )}
          {session.role === ROLES.JOGADOR && (
            <div className="mt-6 p-4 bg-primary/10 rounded-lg">
              <h3 className="text-xl font-semibold text-primary">Painel do Jogador</h3>
              <p className="text-muted-foreground">Suas informações de jogador, pagamentos e estatísticas.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
