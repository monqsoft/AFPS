"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { IPlayer } from "@/models/player-model"
import { editPlayerAction } from "@/app/admin/actions"
import { ROLES } from "@/lib/roles"
import { Loader2 } from "lucide-react"

interface EditPlayerDialogProps {
  player: IPlayer;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPlayerUpdated: (updatedPlayer: IPlayer) => void;
}

export default function EditPlayerDialog({
  player,
  isOpen,
  onOpenChange,
  onPlayerUpdated,
}: EditPlayerDialogProps) {
  const { toast } = useToast();
  const [editedName, setEditedName] = useState(player.nome);
  const [editedRole, setEditedRole] = useState(player.role || "");
  const [editedStatus, setEditedStatus] = useState(player.status);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (player) {
      setEditedName(player.nome);
      setEditedRole(player.role || "");
      setEditedStatus(player.status);
    }
  }, [player]);

  const handleSave = async () => {
    setIsSaving(true);
    const result = await editPlayerAction(player.cpf, {
      nome: editedName,
      role: editedRole === "" ? null : (editedRole as any),
      status: editedStatus,
    });

    if (result.success) {
      toast({
        title: "Sucesso!",
        description: result.message,
        variant: "default",
      });
      onPlayerUpdated({
        ...player,
        nome: editedName,
        role: editedRole === "" ? null : (editedRole as any),
        status: editedStatus,
      });
    } else {
      toast({
        title: "Erro",
        description: result.message || "Falha ao atualizar jogador.",
        variant: "destructive",
      });
    }
    setIsSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Jogador</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cpf" className="text-right">
              CPF
            </Label>
            <Input id="cpf" value={player.cpf} className="col-span-3" disabled />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nome" className="text-right">
              Nome
            </Label>
            <Input
              id="nome"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Perfil
            </Label>
            <Select value={editedRole} onValueChange={setEditedRole}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione um perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum</SelectItem>
                {Object.values(ROLES).map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select value={editedStatus} onValueChange={setEditedStatus}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione um status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="autorizado_nao_cadastrado">Autorizado Não Cadastrado</SelectItem>
                <SelectItem value="pendente_aprovacao">Pendente Aprovação</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
