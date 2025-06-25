"use client"
import { useEffect, useState } from "react"
import { fetchLogsAction } from "@/app/admin/actions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import type { ILog } from "@/models/log-model" // Assuming ILog is exported

export default function LogsTable() {
  const [logs, setLogs] = useState<ILog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadLogs = async () => {
    setIsLoading(true)
    setError(null)
    const result = await fetchLogsAction({}) // Pass filters if implemented
    if (result.success && result.logs) {
      setLogs(result.logs as ILog[]) // Cast needed if type from action is generic
    } else {
      setError(result.message || "Falha ao carregar logs.")
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadLogs()
  }, [])

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={loadLogs} disabled={isLoading} variant="outline">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Atualizar Logs
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
                  Nenhum log encontrado.
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
    </div>
  )
}
