'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  MapPin,
  Trophy,
  Target,
  AlertTriangle,
  Users,
  Filter,
  TrendingUp,
  Award,
  BarChart3,
} from 'lucide-react';
import {
  fetchPublicMatchesAction,
  fetchPlayerStatsAction,
  fetchPlayersForFilterAction,
} from '@/app/partidas/actions';
import { toast } from 'sonner';
import type { IMatch } from '@/models/match-model';
import type { PlayerStats } from '@/types/match-interfaces';

interface MatchesDashboardProps {
  userCpf: string;
  userRole: string;
}

export function MatchesDashboard({ userCpf, userRole }: MatchesDashboardProps) {
  const [matches, setMatches] = useState<IMatch[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [playersForFilter, setPlayersForFilter] = useState<
    { cpf: string; nome: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    playerCpf: '',
    local: '',
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  useEffect(() => {
    loadPlayersForFilter();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [matchesResult, statsResult] = await Promise.all([
        fetchPublicMatchesAction(filters),
        fetchPlayerStatsAction(),
      ]);

      if (matchesResult.success) {
        setMatches(matchesResult.matches || []);
      } else {
        toast.error('Erro ao carregar partidas');
      }

      if (statsResult.success) {
        setPlayerStats(statsResult.stats || []);
      } else {
        toast.error('Erro ao carregar estatísticas');
      }
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadPlayersForFilter = async () => {
    try {
      const result = await fetchPlayersForFilterAction();
      if (result.success) {
        setPlayersForFilter(result.players || []);
      }
    } catch (error) {
      console.error('Error loading players for filter:', error);
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
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      dateFrom: '',
      dateTo: '',
      playerCpf: '',
      local: '',
    });
  };

  const userStats = playerStats.find((stats) => stats.cpf === userCpf);

  const getOverallStats = () => {
    const totalMatches = matches.filter(
      (m) => m.status === 'finalizada'
    ).length;
    const totalGoals = matches.reduce((acc, match) => {
      return acc + match.timeA.gols.length + match.timeB.gols.length;
    }, 0);
    const totalCards = matches.reduce((acc, match) => {
      return acc + match.timeA.cartoes.length + match.timeB.cartoes.length;
    }, 0);
    const avgGoalsPerMatch =
      totalMatches > 0 ? (totalGoals / totalMatches).toFixed(1) : '0';

    return { totalMatches, totalGoals, totalCards, avgGoalsPerMatch };
  };

  const getTopScorers = () => {
    return playerStats
      .filter((p) => p.gols > 0)
      .sort((a, b) => b.gols - a.gols)
      .slice(0, 5);
  };

  const getMostActiveLocations = () => {
    const locationCounts = matches.reduce((acc, match) => {
      if (match.local) {
        acc[match.local] = (acc[match.local] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(locationCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  };

  const overallStats = getOverallStats();
  const topScorers = getTopScorers();
  const topLocations = getMostActiveLocations();

  return (
    <div className='space-y-6'>
      {/* User Stats Card */}
      {userStats && (
        <Card className='bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-800'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-emerald-700 dark:text-emerald-300'>
              <Award className='h-5 w-5' />
              Suas Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-emerald-600 dark:text-emerald-400'>
                  {userStats.partidasJogadas}
                </div>
                <div className='text-sm text-muted-foreground'>Partidas</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-emerald-600 dark:text-emerald-400'>
                  {userStats.gols}
                </div>
                <div className='text-sm text-muted-foreground'>Gols</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-yellow-600 dark:text-yellow-400'>
                  {userStats.cartoesAmarelos}
                </div>
                <div className='text-sm text-muted-foreground'>
                  Cartões Amarelos
                </div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-red-600 dark:text-red-400'>
                  {userStats.cartoesVermelhos}
                </div>
                <div className='text-sm text-muted-foreground'>
                  Cartões Vermelhos
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue='matches' className='w-full'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='matches'>Partidas</TabsTrigger>
          <TabsTrigger value='stats'>Estatísticas</TabsTrigger>
          <TabsTrigger value='analytics'>Análises</TabsTrigger>
        </TabsList>

        <TabsContent value='matches' className='space-y-6'>
          {/* Enhanced Filters */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Filter className='h-5 w-5' />
                Filtros Avançados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4'>
                <div>
                  <Label htmlFor='status'>Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Todos os status' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>Todos os status</SelectItem>
                      <SelectItem value='agendada'>Agendada</SelectItem>
                      <SelectItem value='em_andamento'>Em Andamento</SelectItem>
                      <SelectItem value='finalizada'>Finalizada</SelectItem>
                      <SelectItem value='cancelada'>Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor='playerCpf'>Jogador</Label>
                  <Select
                    value={filters.playerCpf}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, playerCpf: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Todos os jogadores' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>Todos os jogadores</SelectItem>
                      {playersForFilter.map((player) => (
                        <SelectItem key={player.cpf} value={player.cpf}>
                          {player.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor='local'>Local</Label>
                  <Input
                    id='local'
                    value={filters.local}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, local: e.target.value }))
                    }
                    placeholder='Filtrar por local...'
                  />
                </div>
                <div>
                  <Label htmlFor='dateFrom'>Data Inicial</Label>
                  <Input
                    id='dateFrom'
                    type='date'
                    value={filters.dateFrom}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        dateFrom: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor='dateTo'>Data Final</Label>
                  <Input
                    id='dateTo'
                    type='date'
                    value={filters.dateTo}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        dateTo: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className='flex justify-end mt-4'>
                <Button
                  variant='outline'
                  onClick={clearFilters}
                  className='bg-transparent'
                >
                  Limpar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Matches List */}
          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='text-muted-foreground'>
                Carregando partidas...
              </div>
            </div>
          ) : matches.length === 0 ? (
            <Card>
              <CardContent className='text-center py-12'>
                <Trophy className='h-12 w-12 mx-auto mb-4 opacity-50' />
                <p className='text-muted-foreground'>
                  Nenhuma partida encontrada
                </p>
                <p className='text-sm text-muted-foreground'>
                  Tente ajustar os filtros
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className='grid gap-6'>
              {matches.map((match) => (
                <Card key={match._id} className='overflow-hidden'>
                  <CardHeader className='pb-4'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-4'>
                        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                          <Calendar className='h-4 w-4' />
                          {formatDate(match.data)} às {match.horario}
                        </div>
                        {match.local && (
                          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                            <MapPin className='h-4 w-4' />
                            {match.local}
                          </div>
                        )}
                      </div>
                      {getStatusBadge(match.status)}
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    {/* Score */}
                    <div className='flex items-center justify-center py-6 bg-muted/30 rounded-lg'>
                      <div className='text-center'>
                        <div className='text-lg font-semibold mb-2'>
                          {match.timeA.nome}
                        </div>
                        <div className='text-4xl font-bold text-primary'>
                          {match.placarFinal.timeA}
                        </div>
                      </div>
                      <div className='mx-8 text-2xl font-bold text-muted-foreground'>
                        ×
                      </div>
                      <div className='text-center'>
                        <div className='text-lg font-semibold mb-2'>
                          {match.timeB.nome}
                        </div>
                        <div className='text-4xl font-bold text-primary'>
                          {match.placarFinal.timeB}
                        </div>
                      </div>
                    </div>

                    {/* Match Details */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      {/* Team A */}
                      <div className='space-y-3'>
                        <h4 className='font-semibold flex items-center gap-2'>
                          <Users className='h-4 w-4' />
                          {match.timeA.nome}
                        </h4>
                        <div className='space-y-2'>
                          {match.timeA.gols.length > 0 && (
                            <div>
                              <div className='flex items-center gap-2 text-sm font-medium mb-1'>
                                <Target className='h-3 w-3' />
                                Gols
                              </div>
                              <div className='flex flex-wrap gap-1'>
                                {match.timeA.gols.map((gol, idx) => (
                                  <Badge
                                    key={idx}
                                    variant='secondary'
                                    className='text-xs'
                                  >
                                    {gol.jogadorNome} ({gol.minuto}')
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {match.timeA.cartoes.length > 0 && (
                            <div>
                              <div className='flex items-center gap-2 text-sm font-medium mb-1'>
                                <AlertTriangle className='h-3 w-3' />
                                Cartões
                              </div>
                              <div className='flex flex-wrap gap-1'>
                                {match.timeA.cartoes.map((cartao, idx) => (
                                  <Badge
                                    key={idx}
                                    variant={
                                      cartao.tipo === 'vermelho'
                                        ? 'destructive'
                                        : 'secondary'
                                    }
                                    className='text-xs'
                                  >
                                    {cartao.jogadorNome} ({cartao.minuto}')
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Team B */}
                      <div className='space-y-3'>
                        <h4 className='font-semibold flex items-center gap-2'>
                          <Users className='h-4 w-4' />
                          {match.timeB.nome}
                        </h4>
                        <div className='space-y-2'>
                          {match.timeB.gols.length > 0 && (
                            <div>
                              <div className='flex items-center gap-2 text-sm font-medium mb-1'>
                                <Target className='h-3 w-3' />
                                Gols
                              </div>
                              <div className='flex flex-wrap gap-1'>
                                {match.timeB.gols.map((gol, idx) => (
                                  <Badge
                                    key={idx}
                                    variant='secondary'
                                    className='text-xs'
                                  >
                                    {gol.jogadorNome} ({gol.minuto}')
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {match.timeB.cartoes.length > 0 && (
                            <div>
                              <div className='flex items-center gap-2 text-sm font-medium mb-1'>
                                <AlertTriangle className='h-3 w-3' />
                                Cartões
                              </div>
                              <div className='flex flex-wrap gap-1'>
                                {match.timeB.cartoes.map((cartao, idx) => (
                                  <Badge
                                    key={idx}
                                    variant={
                                      cartao.tipo === 'vermelho'
                                        ? 'destructive'
                                        : 'secondary'
                                    }
                                    className='text-xs'
                                  >
                                    {cartao.jogadorNome} ({cartao.minuto}')
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {match.observacoes && (
                      <>
                        <Separator />
                        <div>
                          <h5 className='font-medium mb-2'>Observações</h5>
                          <p className='text-sm text-muted-foreground'>
                            {match.observacoes}
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value='stats' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <TrendingUp className='h-5 w-5' />
                Ranking de Jogadores
              </CardTitle>
              <CardDescription>
                Classificação geral por desempenho
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className='h-[600px]'>
                <div className='space-y-4'>
                  {playerStats
                    .sort((a, b) => b.gols - a.gols)
                    .map((stats, index) => (
                      <div
                        key={stats.cpf}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          stats.cpf === userCpf
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                            : 'bg-muted/30'
                        }`}
                      >
                        <div className='flex items-center gap-4'>
                          <div className='text-2xl font-bold text-muted-foreground'>
                            #{index + 1}
                          </div>
                          <div>
                            <div className='font-semibold'>{stats.nome}</div>
                            <div className='text-sm text-muted-foreground'>
                              {stats.partidasJogadas} partidas jogadas
                            </div>
                          </div>
                        </div>
                        <div className='flex items-center gap-6 text-sm'>
                          <div className='text-center'>
                            <div className='font-bold text-emerald-600 dark:text-emerald-400'>
                              {stats.gols}
                            </div>
                            <div className='text-muted-foreground'>Gols</div>
                          </div>
                          <div className='text-center'>
                            <div className='font-bold text-yellow-600 dark:text-yellow-400'>
                              {stats.cartoesAmarelos}
                            </div>
                            <div className='text-muted-foreground'>
                              Amarelos
                            </div>
                          </div>
                          <div className='text-center'>
                            <div className='font-bold text-red-600 dark:text-red-400'>
                              {stats.cartoesVermelhos}
                            </div>
                            <div className='text-muted-foreground'>
                              Vermelhos
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='analytics' className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total de Partidas
                </CardTitle>
                <Trophy className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {overallStats.totalMatches}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Partidas finalizadas
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total de Gols
                </CardTitle>
                <Target className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {overallStats.totalGoals}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Em todas as partidas
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Média de Gols
                </CardTitle>
                <BarChart3 className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {overallStats.avgGoalsPerMatch}
                </div>
                <p className='text-xs text-muted-foreground'>Por partida</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total de Cartões
                </CardTitle>
                <AlertTriangle className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {overallStats.totalCards}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Amarelos e vermelhos
                </p>
              </CardContent>
            </Card>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Award className='h-5 w-5' />
                  Top 5 Artilheiros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {topScorers.map((player, index) => (
                    <div
                      key={player.cpf}
                      className='flex items-center justify-between'
                    >
                      <div className='flex items-center gap-3'>
                        <div className='text-lg font-bold text-muted-foreground'>
                          #{index + 1}
                        </div>
                        <div>
                          <div className='font-medium'>{player.nome}</div>
                          <div className='text-sm text-muted-foreground'>
                            {player.partidasJogadas} partidas
                          </div>
                        </div>
                      </div>
                      <div className='text-2xl font-bold text-emerald-600 dark:text-emerald-400'>
                        {player.gols}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <MapPin className='h-5 w-5' />
                  Locais Mais Utilizados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {topLocations.map(([location, count], index) => (
                    <div
                      key={location}
                      className='flex items-center justify-between'
                    >
                      <div className='flex items-center gap-3'>
                        <div className='text-lg font-bold text-muted-foreground'>
                          #{index + 1}
                        </div>
                        <div className='font-medium'>{location}</div>
                      </div>
                      <div className='text-2xl font-bold text-primary'>
                        {count}
                      </div>
                    </div>
                  ))}
                  {topLocations.length === 0 && (
                    <div className='text-center py-8 text-muted-foreground'>
                      <MapPin className='h-8 w-8 mx-auto mb-2 opacity-50' />
                      <p>Nenhum local registrado ainda</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
