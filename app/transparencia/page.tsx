"use client"
import { getSession } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function TransparenciaPage() {

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-primary">Transparência AFPS</h1>
      <Card>
        <CardHeader>
          <CardTitle>Informações de Transparência</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta página exibirá informações sobre despesas, mensalidades, e outras atividades financeiras da Associação de Futebol de Porto dos Santos.
          </p>
          <p className="mt-4">Em desenvolvimento: Gráficos de despesas, relatórios financeiros, e logs de atividades.</p>
        </CardContent>
      </Card>
    </div>
  )
}