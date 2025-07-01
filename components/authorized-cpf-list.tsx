"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2, Pencil } from "lucide-react"
import { removeAuthorizedCpfAction, deactivatePlayerAction } from "@/app/admin/actions"
import { useToast } from "@/components/ui/use-toast"
import { IPlayer } from "@/models/player-model"
import EditPlayerDialog from "./edit-player-dialog"

interface AuthorizedCpfListProps {
  initialPlayers: IPlayer[];
}

export function AuthorizedCpfList({ initialPlayers }: AuthorizedCpfListProps) {
  const [players, setPlayers] = useState(initialPlayers);
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<IPlayer | null>(null);

  const handleRemoveCpf = async (cpf: string) => {
    const result = await removeAuthorizedCpfAction(cpf);
    if (result.success) {
      toast({
        title: "Sucesso!",
        description: result.message,
        variant: "default",
      });
      // Update the list of players after successful removal
      setPlayers(players.filter(player => player.cpf !== cpf));
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const handleDeactivatePlayer = async (cpf: string) => {
    const result = await deactivatePlayerAction(cpf);
    if (result.success) {
      toast({
        title: "Sucesso!",
        description: result.message,
        variant: "default",
      });
      // Update the player's status in the local state
      setPlayers(players.map(player =>
        player.cpf === cpf
          ? Object.assign(Object.create(Object.getPrototypeOf(player)), player, { isAuthorized: false, status: "inativo" })
          : player
      ));
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const handleEditPlayer = (player: IPlayer) => {
    setSelectedPlayer(player);
    setIsEditDialogOpen(true);
  };

  const handlePlayerUpdated = (updatedPlayer: IPlayer) => {
    setPlayers(players.map(player =>
      player.cpf === updatedPlayer.cpf ? updatedPlayer : player
    ));
    setIsEditDialogOpen(false);
    setSelectedPlayer(null);
  };

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
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Nenhum CPF autorizado encontrado.
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
                      {player.registrationCompleted
                        ? "Completo"
                        : player.status === "autorizado_nao_cadastrado"
                          ? "Pendente"
                          : player.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{player.role}</TableCell>
                  <TableCell>{player.createdAt ? new Date(player.createdAt).toLocaleDateString("pt-BR") : ""}</TableCell>
                  <TableCell className="flex gap-2">
                    {player.status !== "inativo" && (
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        title="Editar Jogador"
                        onClick={() => handleEditPlayer(player)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {player.registrationCompleted ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        type="button"
                        title="Desativar Jogador"
                        onClick={() => handleDeactivatePlayer(player.cpf)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="destructive"
                        size="sm"
                        type="button"
                        title="Remover Autorização"
                        onClick={() => handleRemoveCpf(player.cpf)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>

      {selectedPlayer && (
        <EditPlayerDialog
          player={selectedPlayer}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onPlayerUpdated={handlePlayerUpdated}
        />
      )}
    </Card>
  )
}