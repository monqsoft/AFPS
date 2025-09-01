'use server';

import dbConnect from '@/lib/mongodb';
import Expense from '@/models/expense-model';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getSession } from '@/lib/auth'; // Corrigido para getSession

const expenseSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.preprocess(
    (val) => Number(val),
    z.number().positive('Valor deve ser positivo')
  ),
  date: z.string().refine((val) => !isNaN(new Date(val).getTime()), 'Data inválida'),
  category: z.string().min(1, 'Categoria é obrigatória'),
});

export async function addExpense(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return { message: 'Não autorizado', success: false };
  }

  const validatedFields = expenseSchema.safeParse({
    description: formData.get('description'),
    amount: formData.get('amount'),
    date: formData.get('date'),
    category: formData.get('category'),
  });

  if (!validatedFields.success) {
    return { message: validatedFields.error.flatten().fieldErrors, success: false };
  }

  const { description, amount, date, category } = validatedFields.data;

  try {
    await dbConnect();
    const newExpense = new Expense({
      description,
      amount,
      date: new Date(date),
      category,
      recordedBy: session.nome || session.cpf, // Use user's name or CPF
    });
    await newExpense.save();
    revalidatePath('/admin/despesas');
    return { message: 'Despesa adicionada com sucesso!', success: true };
  } catch (error) {
    console.error('Erro ao adicionar despesa:', error);
    return { message: 'Erro ao adicionar despesa.', success: false };
  }
}

export async function fetchExpenses() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return { message: 'Não autorizado', success: false, expenses: [] };
  }

  try {
    await connectToDatabase();
    const expenses = await Expense.find({}).sort({ date: -1 }).lean();
    return { message: 'Despesas carregadas com sucesso!', success: true, expenses: JSON.parse(JSON.stringify(expenses)) };
  } catch (error) {
    console.error('Erro ao carregar despesas:', error);
    return { message: 'Erro ao carregar despesas.', success: false, expenses: [] };
  }
}
