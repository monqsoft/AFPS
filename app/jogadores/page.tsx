// app/jogadores/page.tsx
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import dbConnect from "@/lib/mongodb"
import Player, { type IPlayer } from "@/models/player-model"

export default async function JogadoresPage() {
  const session = await getSession()

  if (!session || session.role !== "admin") {
    redirect("/login")
  }

  await dbConnect()
  const players = (await Player.find().sort({ createdAt: -1 }).lean()) as IPlayer[]

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-primary">Lista de Jogadores</h1>
      <Card>
        <CardHeader>
          <CardTitle>Jogadores Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CPF</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Status Cadastro</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Cadastrado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Nenhum jogador encontrado.
                    </TableCell>
                  </TableRow>
                )}
                {players.map((player) => (
                  <TableRow key={player.cpf}>
                    <TableCell>{player.cpf}</TableCell>
                    <TableCell>{player.nome}</TableCell>
                    <TableCell>
                      <Badge
                        variant={player.registrationCompleted ? "default" : "secondary"}
                        className={player.registrationCompleted ? "bg-green-500 text-white" : "bg-yellow-400 text-black"}
                      >
                        {player.registrationCompleted ? "Completo" : "Pendente"}
                      </Badge>
                    </TableCell>
                    <TableCell>{player.role || "Jogador"}</TableCell>
                    <TableCell>{player.createdAt ? new Date(player.createdAt).toLocaleDateString("pt-BR") : ""}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}