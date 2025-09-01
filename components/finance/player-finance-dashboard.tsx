'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { IPayableItem } from '@/models/payable-item-model';
import { createCheckoutPixPayment } from '@/app/actions/finance-actions';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Loader2, Copy } from 'lucide-react';

interface PlayerFinanceDashboardProps {
  initialPayableItems: IPayableItem[];
}

interface PixDisplayData {
  qrCode: string;
  payload: string;
}

export function PlayerFinanceDashboard({ initialPayableItems }: PlayerFinanceDashboardProps) {
  const [payableItems, setPayableItems] = useState<IPayableItem[]>(initialPayableItems);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pixData, setPixData] = useState<PixDisplayData | null>(null);

  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const totalSelectedAmount = selectedItems.reduce((total, itemId) => {
    const item = payableItems.find((i) => i._id === itemId);
    return total + (item?.amount || 0);
  }, 0);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const result = await createCheckoutPixPayment(selectedItems);
      if (result.success && result.qrCode) {
        setPixData({ qrCode: result.qrCode, payload: result.payload || '' });
      } else {
        toast.error(result.error || 'Ocorreu um erro desconhecido ao gerar o PIX.');
      }
    } catch (error) {
      toast.error('Falha na comunicação com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAGO':
        return <Badge variant="success">Pago</Badge>;
      case 'ATRASADO':
        return <Badge variant="destructive">Atrasado</Badge>;
      case 'PENDENTE':
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Código PIX copiado!');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Meus Débitos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Pagar</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Data de Referência</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payableItems.map((item) => (
                <TableRow key={item._id} className={item.status !== 'PENDENTE' ? 'text-muted-foreground' : ''}>
                  <TableCell>
                    {item.status === 'PENDENTE' && (
                      <Checkbox
                        checked={selectedItems.includes(item._id)}
                        onCheckedChange={() => handleSelectItem(item._id)}
                      />
                    )}
                  </TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{format(new Date(item.referenceDate), 'MMM/yyyy', { locale: ptBR })}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-right">R$ {item.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        {selectedItems.length > 0 && (
          <CardFooter className="flex justify-between items-center mt-4">
            <div>
              <p className="text-lg font-semibold">Total Selecionado: R$ {totalSelectedAmount.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">{selectedItems.length} item(s) selecionado(s)</p>
            </div>
            <Button size="lg" onClick={handlePayment} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Pagar com PIX
            </Button>
          </CardFooter>
        )}
      </Card>

      <Dialog open={!!pixData} onOpenChange={() => setPixData(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pagamento PIX</DialogTitle>
          </DialogHeader>
          {pixData && (
            <div className="space-y-4">
              <p>Use o QR Code ou o código abaixo para pagar.</p>
              <div className="p-4 border rounded-md bg-white flex justify-center">
                <Image src={pixData.qrCode} alt="QR Code PIX" width={250} height={250} />
              </div>
              <div>
                <Label htmlFor="pix-payload">Copia e Cola</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input id="pix-payload" value={pixData.payload} readOnly />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(pixData.payload)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
