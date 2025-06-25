import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import dbConnect from "@/lib/mongodb"
import Player, { type IPlayer } from "@/models/player-model"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

async function AuthorizedCpfList() {
  await dbConnect()
  // Fetch players who are authorized but not fully registered, or all players for a general list
  const authorizedPlayers = (await Player.find({ isAuthorized: true }).sort({ createdAt: -1 }).lean()) as IPlayer[]

  return (
    <Card>
      <CardHeader>
        <CardTitle>CPFs Autorizados e Status de Cadastro</CardTitle>
        <CardDescription>Lista de CPFs com permissão de acesso e seu status no sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CPF</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Status Cadastro</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Autorizado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {authorizedPlayers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Nenhum CPF autorizado encontrado.
                  </TableCell>
                </TableRow>
              )}
              {authorizedPlayers.map((player) => (
                <TableRow key={player.cpf}>
                  <TableCell>{player.cpf}</TableCell>
                  <TableCell>{player.nome}</TableCell>
                  <TableCell>
                    <Badge
                      variant={player.registrationCompleted ? "default" : "secondary"}
                      className={player.registrationCompleted ? "bg-green-500 text-white" : "bg-yellow-400 text-black"}
                    >
                      {player.registrationCompleted
                        ? "Completo"
                        : player.status === "autorizado_nao_cadastrado"
                          ? "Pendente"
                          : player.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{player.role || "Não Definido"}</TableCell>
                  <TableCell>{new Date(player.createdAt).toLocaleDateString("pt-BR")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
        {/* TODO: Add FormularioAdicionarCPF component here */}
      </CardContent>
    </Card>
  )
}

export default async function AdminDashboardPage() {
  const session = await getSession()

  if (!session || session.role !== "admin") {
    redirect("/login") // Or an unauthorized page
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-primary">Painel Administrativo AFPS</h1>
      <Tabs defaultValue="cpfs" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-4">
          <TabsTrigger value="jogadores">Jogadores</TabsTrigger>
          <TabsTrigger value="cpfs">Perfis e Acesso</TabsTrigger>
          <TabsTrigger value="mensalidade">Mensalidade</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
        </TabsList>

        <TabsContent value="jogadores">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Jogadores</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Em desenvolvimento: Listagem, filtros, edição de jogadores, etc.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cpfs">
          <AuthorizedCpfList />
          {/* <GerenciadorRoles /> */}
        </TabsContent>

        <TabsContent value="mensalidade">
          <Card>
            <CardHeader>
              <CardTitle>Configurar Mensalidade</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Em desenvolvimento: Definir valor da mensalidade.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Logs e Auditoria</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Em desenvolvimento: Visualizar logs do sistema.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="despesas">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Despesas da Comissão</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Em desenvolvimento: Adicionar, editar despesas, visualizar gráficos.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
