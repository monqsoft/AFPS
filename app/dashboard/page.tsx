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
          <p className="mt-4 text-lg">⚽️ Em breve, suas estatísticas e informações aqui! 🏃💨</p>
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
