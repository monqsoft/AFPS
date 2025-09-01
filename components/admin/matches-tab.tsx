'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Calendar, MapPin, Trophy, Edit, Trash2 } from 'lucide-react';
import { MatchForm } from './match-form';
import {
  fetchMatchesAction,
  deleteMatchAction,
} from '@/app/admin/match-actions';
import { toast } from 'sonner';
import type { IMatch } from '@/models/match-model';

export function MatchesTab() {
  const [matches, setMatches] = useState<IMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<IMatch | null>(null);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const result = await fetchMatchesAction({});
      if (result.success) {
        setMatches(result.matches || []);
      } else {
        toast.error('Erro ao carregar partidas');
      }
    } catch (error) {
      toast.error('Erro ao carregar partidas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const handleDelete = async (matchId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta partida?')) return;

    try {
      const result = await deleteMatchAction(matchId);
      if (result.success) {
        toast.success('Partida excluída com sucesso');
        loadMatches();
      } else {
        toast.error(result.message || 'Erro ao excluir partida');
      }
    } catch (error) {
      toast.error('Erro ao excluir partida');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      agendada: 'secondary',
      em_andamento: 'default',
      finalizada: 'outline',
      cancelada: 'destructive',
    } as const;

    const labels = {
      agendada: 'Agendada',
      em_andamento: 'Em Andamento',
      finalizada: 'Finalizada',
      cancelada: 'Cancelada',
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <Trophy className='h-5 w-5' />
              Gestão de Partidas
            </CardTitle>
            <CardDescription>
              Cadastre e gerencie as partidas da associação
            </CardDescription>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className='h-4 w-4 mr-2' />
                Nova Partida
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
              <DialogHeader>
                <DialogTitle>Cadastrar Nova Partida</DialogTitle>
                <DialogDescription>
                  Preencha os dados da partida e registre os jogadores
                  participantes
                </DialogDescription>
              </DialogHeader>
              <MatchForm
                onSuccess={() => {
                  setIsCreateDialogOpen(false);
                  loadMatches();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className='flex items-center justify-center py-8'>
            <div className='text-muted-foreground'>Carregando partidas...</div>
          </div>
        ) : matches.length === 0 ? (
          <div className='text-center py-8 text-muted-foreground'>
            <Trophy className='h-12 w-12 mx-auto mb-4 opacity-50' />
            <p>Nenhuma partida cadastrada ainda</p>
            <p className='text-sm'>Clique em "Nova Partida" para começar</p>
          </div>
        ) : (
          <ScrollArea className='h-[600px]'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Times</TableHead>
                  <TableHead>Placar</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className='text-right'>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.map((match) => (
                  <TableRow key={match._id}>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <Calendar className='h-4 w-4 text-muted-foreground' />
                        {formatDate(match.data)}
                      </div>
                    </TableCell>
                    <TableCell>{match.horario}</TableCell>
                    <TableCell>
                      <div className='space-y-1'>
                        <div className='font-medium'>{match.timeA.nome}</div>
                        <div className='text-sm text-muted-foreground'>vs</div>
                        <div className='font-medium'>{match.timeB.nome}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='text-center font-mono text-lg'>
                        {match.placarFinal.timeA} - {match.placarFinal.timeB}
                      </div>
                    </TableCell>
                    <TableCell>
                      {match.local && (
                        <div className='flex items-center gap-2'>
                          <MapPin className='h-4 w-4 text-muted-foreground' />
                          <span className='text-sm'>{match.local}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(match.status)}</TableCell>
                    <TableCell className='text-right'>
                      <div className='flex items-center justify-end gap-2'>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => setEditingMatch(match)}
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
                            <DialogHeader>
                              <DialogTitle>Editar Partida</DialogTitle>
                              <DialogDescription>
                                Atualize os dados da partida
                              </DialogDescription>
                            </DialogHeader>
                            <MatchForm
                              match={editingMatch}
                              onSuccess={() => {
                                setEditingMatch(null);
                                loadMatches();
                              }}
                            />
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleDelete(match._id)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}

        {/* Edit Dialog */}
        <Dialog
          open={!!editingMatch}
          onOpenChange={() => setEditingMatch(null)}
        >
          <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Editar Partida</DialogTitle>
              <DialogDescription>
                Atualize os dados da partida
              </DialogDescription>
            </DialogHeader>
            {editingMatch && (
              <MatchForm
                match={editingMatch}
                onSuccess={() => {
                  setEditingMatch(null);
                  loadMatches();
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
