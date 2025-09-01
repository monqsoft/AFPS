'use client';

import type React from 'react';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Minus, Users, Target, AlertTriangle, PlusCircle } from 'lucide-react';
import {
  createMatchAction,
  updateMatchAction,
  fetchPlayersAction,
} from '@/app/admin/match-actions';
import { toast } from 'sonner';
import type { IMatch, IGoal, ICard } from '@/models/match-model';
import type { IPlayer } from '@/models/player-model';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface MatchFormProps {
  match?: IMatch | null;
  onSuccess: () => void;
}

// Helper component for the event dialog
function AddEventForm({ player, team, addGoal, addCard, onFinished }: any) {
  const [minute, setMinute] = useState('');
  const [type, setType] = useState('gol');

  const handleAddEvent = () => {
    if (!minute) {
      toast.error('Minuto é obrigatório');
      return;
    }
    if (type === 'gol' || type === 'gol_contra' || type === 'penalti') {
      addGoal(team, player.cpf, parseInt(minute), type);
    } else {
      addCard(team, player.cpf, parseInt(minute), type);
    }
    onFinished();
  };

  return (
    <div className="space-y-4 p-1">
      <h3 className="font-semibold">Adicionar evento para {player.nome}</h3>
      <div>
        <Label htmlFor="event-type">Tipo de Evento</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger id="event-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gol">Gol</SelectItem>
            <SelectItem value="gol_contra">Gol Contra</SelectItem>
            <SelectItem value="penalti">Pênalti</SelectItem>
            <SelectItem value="amarelo">Cartão Amarelo</SelectItem>
            <SelectItem value="vermelho">Cartão Vermelho</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="minute">Minuto</Label>
        <Input
          id="minute"
          type="number"
          value={minute}
          onChange={(e) => setMinute(e.target.value)}
          placeholder="Ex: 42"
        />
      </div>
      <Button onClick={handleAddEvent} className="w-full">Adicionar</Button>
    </div>
  );
}

export function MatchForm({ match, onSuccess }: MatchFormProps) {
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState<IPlayer[]>([]);
  const [formData, setFormData] = useState(() => {
    const initialState = {
      data: match?.data ? new Date(match.data).toISOString().split('T')[0] : '',
      horario: match?.horario || '',
      local: match?.local || '',
      timeA: {
        nome: match?.timeA.nome || 'Time A',
        jogadores: match?.timeA.jogadores || [],
        gols: match?.timeA.gols || [],
        cartoes: match?.timeA.cartoes || [],
      },
      timeB: {
        nome: match?.timeB.nome || 'Time B',
        jogadores: match?.timeB.jogadores || [],
        gols: match?.timeB.gols || [],
        cartoes: match?.timeB.cartoes || [],
      },
      status: match?.status || 'agendada',
      observacoes: match?.observacoes || '',
      arbitro: match?.arbitro || { cpf: '', nome: '' },
    };
    return initialState;
  });

  // Real-time score calculation
  const placar = useMemo(() => {
    const placarTimeA = 
      formData.timeA.gols.filter((g) => g.tipo !== 'gol_contra').length +
      formData.timeB.gols.filter((g) => g.tipo === 'gol_contra').length;
    const placarTimeB = 
      formData.timeB.gols.filter((g) => g.tipo !== 'gol_contra').length +
      formData.timeA.gols.filter((g) => g.tipo === 'gol_contra').length;
    return { timeA: placarTimeA, timeB: placarTimeB };
  }, [formData.timeA.gols, formData.timeB.gols]);

  useEffect(() => {
    loadPlayers();
  }, []);

  // Effect to reset form when the match prop changes
  useEffect(() => {
    if (match) {
      setFormData({
        data: match.data ? new Date(match.data).toISOString().split('T')[0] : '',
        horario: match.horario || '',
        local: match.local || '',
        timeA: match.timeA || { nome: 'Time A', jogadores: [], gols: [], cartoes: [] },
        timeB: match.timeB || { nome: 'Time B', jogadores: [], gols: [], cartoes: [] },
        status: match.status || 'agendada',
        observacoes: match.observacoes || '',
        arbitro: match.arbitro || { cpf: '', nome: '' },
      });
    }
  }, [match]);

  const loadPlayers = async () => {
    try {
      const result = await fetchPlayersAction();
      if (result.success) {
        setPlayers(result.players || []);
      }
    } catch (error) {
      toast.error('Erro ao carregar jogadores');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const matchData = {
        ...formData,
        data: new Date(formData.data),
        placarFinal: placar, // Use the calculated score
      };

      const result = match
        ? await updateMatchAction(match._id, matchData)
        : await createMatchAction(matchData);

      if (result.success) {
        toast.success(
          match
            ? 'Partida atualizada com sucesso'
            : 'Partida criada com sucesso'
        );
        onSuccess();
      } else {
        toast.error(result.message || 'Erro ao salvar partida');
      }
    } catch (error) {
      toast.error('Erro ao salvar partida');
    } finally {
      setLoading(false);
    }
  };

  const addPlayerToTeam = (team: 'timeA' | 'timeB', playerCpf: string) => {
    const player = players.find((p) => p.cpf === playerCpf);
    if (!player) return;

    const playerExists = formData[team].jogadores.some(
      (p) => p.cpf === playerCpf
    );
    if (playerExists) {
      toast.error('Jogador já está no time');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [team]: {
        ...prev[team],
        jogadores: [
          ...prev[team].jogadores,
          {
            cpf: player.cpf,
            nome: player.nome,
            numero: player.numero,
            posicao: player.posicao,
          },
        ],
      },
    }));
  };

  const removePlayerFromTeam = (team: 'timeA' | 'timeB', playerCpf: string) => {
    setFormData((prev) => ({
      ...prev,
      [team]: {
        ...prev[team],
        jogadores: prev[team].jogadores.filter((p) => p.cpf !== playerCpf),
        gols: prev[team].gols.filter((g) => g.jogadorCpf !== playerCpf),
        cartoes: prev[team].cartoes.filter((c) => c.jogadorCpf !== playerCpf),
      },
    }));
  };

  const addGoal = (
    team: 'timeA' | 'timeB',
    playerCpf: string,
    minuto: number,
    tipo: 'gol' | 'gol_contra' | 'penalti'
  ) => {
    const player = formData[team].jogadores.find((p) => p.cpf === playerCpf);
    if (!player) return;

    const newGoal: IGoal = {
      jogadorCpf: playerCpf,
      jogadorNome: player.nome,
      minuto,
      tipo,
    };

    setFormData((prev) => ({
      ...prev,
      [team]: {
        ...prev[team],
        gols: [...prev[team].gols, newGoal],
      },
    }));
  };

  const addCard = (
    team: 'timeA' | 'timeB',
    playerCpf: string,
    minuto: number,
    tipo: 'amarelo' | 'vermelho',
    motivo?: string
  ) => {
    const player = formData[team].jogadores.find((p) => p.cpf === playerCpf);
    if (!player) return;

    const newCard: ICard = {
      jogadorCpf: playerCpf,
      jogadorNome: player.nome,
      minuto,
      tipo,
      motivo,
    };

    setFormData((prev) => ({
      ...prev,
      [team]: {
        ...prev[team],
        cartoes: [...prev[team].cartoes, newCard],
      },
    }));
  };

  const removeGoal = (team: 'timeA' | 'timeB', goalIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      [team]: {
        ...prev[team],
        gols: prev[team].gols.filter((_, index) => index !== goalIndex),
      },
    }));
  };

  const removeCard = (team: 'timeA' | 'timeB', cardIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      [team]: {
        ...prev[team],
        cartoes: prev[team].cartoes.filter((_, index) => index !== cardIndex),
      },
    }));
  };


  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Basic Match Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Partida</CardTitle>
        </CardHeader>
        <CardContent className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <Label htmlFor='data'>Data</Label>
            <Input
              id='data'
              type='date'
              value={formData.data}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, data: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <Label htmlFor='horario'>Horário</Label>
            <Input
              id='horario'
              type='time'
              value={formData.horario}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, horario: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <Label htmlFor='local'>Local</Label>
            <Input
              id='local'
              value={formData.local}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, local: e.target.value }))
              }
              placeholder='Campo de futebol...'
            />
          </div>
          <div>
            <Label htmlFor='status'>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, status: value as any }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='agendada'>Agendada</SelectItem>
                <SelectItem value='em_andamento'>Em Andamento</SelectItem>
                <SelectItem value='finalizada'>Finalizada</SelectItem>
                <SelectItem value='cancelada'>Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='md:col-span-2'>
            <Label htmlFor='observacoes'>Observações</Label>
            <Textarea
              id='observacoes'
              value={formData.observacoes}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  observacoes: e.target.value,
                }))
              }
              placeholder='Observações sobre a partida...'
            />
          </div>
        </CardContent>
      </Card>

      {/* Teams */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {(['timeA', 'timeB'] as const).map((team, index) => (
          <Card key={team}>
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                <div className="flex items-center gap-2">
                  <Users className='h-5 w-5' />
                  Time {index === 0 ? 'A' : 'B'}
                </div>
                <Badge variant="secondary">{placar[team]} Gols</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label>Nome do Time</Label>
                <Input
                  value={formData[team].nome}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [team]: { ...prev[team], nome: e.target.value },
                    }))
                  }
                  placeholder={`Nome do Time ${index === 0 ? 'A' : 'B'}`}
                  required
                />
              </div>

              <div>
                <Label>Adicionar Jogador</Label>
                <Select
                  onValueChange={(playerCpf) =>
                    addPlayerToTeam(team, playerCpf)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Selecione um jogador' />
                  </SelectTrigger>
                  <SelectContent>
                    {players
                      .filter(
                        (p) =>
                          !formData.timeA.jogadores.some((j) => j.cpf === p.cpf) &&
                          !formData.timeB.jogadores.some((j) => j.cpf === p.cpf)
                      )
                      .map((player) => (
                        <SelectItem key={player.cpf} value={player.cpf}>
                          {player.nome}{' '}
                          {player.numero ? `(#${player.numero})` : ''}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <ScrollArea className='h-40 border rounded-md'>
                <div className='p-2 space-y-2'>
                  {formData[team].jogadores.map((player) => (
                    <div
                      key={player.cpf}
                      className='flex items-center justify-between p-2 bg-muted rounded'
                    >
                      <span className='text-sm'>
                        {player.nome} {player.numero ? `#${player.numero}` : ''}
                      </span>
                      <div className="flex items-center gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button type="button" variant="outline" size="sm">
                              <PlusCircle className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Adicionar Evento</DialogTitle>
                            </DialogHeader>
                            <AddEventForm 
                              player={player} 
                              team={team} 
                              addGoal={addGoal} 
                              addCard={addCard} 
                              onFinished={() => {}}
                            />
                          </DialogContent>
                        </Dialog>
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => removePlayerFromTeam(team, player.cpf)}
                        >
                          <Minus className='h-4 w-4 text-destructive' />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <Separator />

              <div>
                <Label className='flex items-center gap-2'>
                  <Target className='h-4 w-4' />
                  Gols: {formData[team].gols.length}
                </Label>
                <div className='flex flex-wrap gap-1 mt-2'>
                  {formData[team].gols.map((gol, idx) => (
                    <Badge key={idx} variant='secondary' className='text-xs flex items-center gap-1'>
                      <span>{gol.jogadorNome} ({gol.minuto}')</span>
                      <button type="button" onClick={() => removeGoal(team, idx)} className="ml-1 p-0.5 rounded-full hover:bg-black/20">
                        <Minus className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className='flex items-center gap-2'>
                  <AlertTriangle className='h-4 w-4' />
                  Cartões: {formData[team].cartoes.length}
                </Label>
                <div className='flex flex-wrap gap-1 mt-2'>
                  {formData[team].cartoes.map((cartao, idx) => (
                    <Badge
                      key={idx}
                      variant={
                        cartao.tipo === 'vermelho' ? 'destructive' : 'default'
                      }
                      className='text-xs flex items-center gap-1'
                    >
                      <span>{cartao.jogadorNome} ({cartao.minuto}')</span>
                      <button type="button" onClick={() => removeCard(team, idx)} className="ml-1 p-0.5 rounded-full hover:bg-black/20">
                        <Minus className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='flex justify-end gap-4'>
        <Button type='submit' disabled={loading}>
          {loading
            ? 'Salvando...'
            : match
            ? 'Atualizar Partida'
            : 'Criar Partida'}
        </Button>
      </div>
    </form>
  );
}
