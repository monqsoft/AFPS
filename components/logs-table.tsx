"use client"
import { useEffect, useState } from "react"
import { fetchLogsAction } from "@/app/admin/actions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, ChevronLeft, ChevronRight, CalendarIcon, XCircle } from "lucide-react"
import type { ILog } from "@/models/log-model"
import { useToast } from "@/components/ui/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils"

interface LogsTableProps {
  initialLogs: ILog[];
}

export default function LogsTable({ initialLogs }: LogsTableProps) {
  const { toast } = useToast();
  const [logs, setLogs] = useState<ILog[]>(initialLogs);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalLogs, setTotalLogs] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [logTypeFilter, setLogTypeFilter] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const limit = 10; // Number of logs per page

  const loadLogs = async (page: number, search: string, type: string, start?: Date, end?: Date) => {
    setIsLoading(true);
    setError(null);
    try {
      const filter: any = { search, type: type === "all" ? undefined : type };
      if (start) {
        filter.startDate = start.toISOString();
      }
      if (end) {
        // Set end date to the end of the day
        const endOfDay = new Date(end);
        endOfDay.setHours(23, 59, 59, 999);
        filter.endDate = endOfDay.toISOString();
      }

      const result = await fetchLogsAction({
        page,
        limit,
        filter,
      });

      if (result.success && result.logs) {
        setLogs(result.logs as ILog[]);
        setTotalPages(result.totalPages || 0);
        setCurrentPage(result.currentPage || 1);
        setTotalLogs(result.totalLogs || 0);
      } else {
        setError(result.message || "Falha ao carregar logs.");
        toast({
          title: "Erro ao carregar logs",
          description: result.message || "Ocorreu um erro desconhecido.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro inesperado.");
      toast({
        title: "Erro inesperado",
        description: err.message || "Verifique sua conexão e tente novamente.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadLogs(currentPage, searchQuery, logTypeFilter, startDate, endDate);
  }, [currentPage, searchQuery, logTypeFilter, startDate, endDate]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setLogTypeFilter("");
    setStartDate(undefined);
    setEndDate(undefined);
    setCurrentPage(1);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-4 items-end">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "PPP", { locale: ptBR }) : <span>Data Início</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "PPP", { locale: ptBR }) : <span>Data Fim</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
        <Button variant="outline" onClick={handleClearFilters} className="flex items-center gap-2">
          <XCircle className="h-4 w-4" /> Limpar
        </Button>
      </div>

      {error && <p className="text-destructive text-center mb-4">{error}</p>}
      <ScrollArea className="h-[600px] border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Usuário CPF</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                  Carregando logs...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && logs.length === 0 && !error && (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Nenhum log encontrado com os filtros aplicados.
                </TableCell>
              </TableRow>
            )}
            {logs.map((log) => (
              <TableRow key={log._id as string}>
                <TableCell>{new Date(log.timestamp).toLocaleString("pt-BR")}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{log.acao}</Badge>
                </TableCell>
                <TableCell>{log.usuarioCpf || "Sistema"}</TableCell>
                <TableCell>{log.role || "-"}</TableCell>
                <TableCell>
                  <pre className="text-xs bg-muted p-2 rounded-sm overflow-auto max-w-xs">
                    {JSON.stringify(log.detalhes, null, 2)}
                  </pre>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      <div className="flex items-center justify-between space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage <= 1 || isLoading}
        >
          <ChevronLeft className="h-4 w-4 mr-2" /> Anterior
        </Button>
        <span className="text-sm text-muted-foreground">
          Página {currentPage} de {totalPages} ({totalLogs} logs)
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={currentPage >= totalPages || isLoading}
        >
          Próxima <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}