'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFormState, useFormStatus } from 'react-dom';
import { addExpense, fetchExpenses } from './actions';
import { useEffect } from 'react';
import { IExpense } from '@/types/expense-interfaces';
import { useToast } from '@/components/ui/use-toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" aria-disabled={pending}>
      {pending ? 'Adicionando...' : 'Adicionar Despesa'}
    </Button>
  );
}

export default function DespesasPage() {
  const [state, formAction] = useFormState(addExpense, { message: '', success: false });
  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadExpenses = async () => {
      const fetchedExpenses = await fetchExpenses();
      if (fetchedExpenses.success && fetchedExpenses.expenses) {
        setExpenses(fetchedExpenses.expenses);
      } else {
        toast({
          title: 'Erro ao carregar despesas',
          description: fetchedExpenses.message || 'Ocorreu um erro desconhecido.',
          variant: 'destructive',
        });
      }
    };
    loadExpenses();
  }, [toast]);

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Sucesso!' : 'Erro',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
    }
    if (state.success) {
      // Optionally re-fetch expenses after successful addition
      const loadExpenses = async () => {
        const fetchedExpenses = await fetchExpenses();
        if (fetchedExpenses.success && fetchedExpenses.expenses) {
          setExpenses(fetchedExpenses.expenses);
        }
      };
      loadExpenses();
    }
  }, [state, toast]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Gestão de Despesas</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Adicionar Nova Despesa</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" name="description" required />
            </div>
            <div>
              <Label htmlFor="amount">Valor</Label>
              <Input id="amount" name="amount" type="number" step="0.01" required />
            </div>
            <div>
              <Label htmlFor="date">Data</Label>
              <Input id="date" name="date" type="date" required />
            </div>
            <div>
              <Label htmlFor="category">Categoria</Label>
              <Select name="category" required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="material">Material</SelectItem>
                  <SelectItem value="aluguel">Aluguel</SelectItem>
                  <SelectItem value="transporte">Transporte</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <SubmitButton />
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Despesas Registradas</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <p>Nenhuma despesa registrada ainda.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Registrado Por</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense, index) => (
                  <TableRow key={index}>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>R$ {expense.amount.toFixed(2)}</TableCell>
                    <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>{expense.recordedBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
