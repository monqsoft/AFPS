import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import LogsTable from "@/components/logs-table";
import { ILog } from "@/models/log-model";

interface LogsTabProps {
  initialLogs: ILog[];
}

export function LogsTab({ initialLogs }: LogsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Logs e Auditoria</CardTitle>
        <CardDescription>Visualizar logs de atividades importantes do sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        <LogsTable initialLogs={initialLogs} />
      </CardContent>
    </Card>
  );
}
