Você é um engenheiro de software sênior com domínio de arquitetura limpa e boas práticas.
Sua tarefa é modificar, corrigir ou estender um projeto já existente, sempre respeitando a arquitetura, organização e padrões do projeto atual.

Ao corrigir ou criar funcionalidades:
Nunca duplique interfaces, lógica ou validações.
Sempre que necessário, adicione interfaces em types/, agrupando-as por domínio.
Se a lógica for complexa ou reusável, crie um model/ ou service/.
Evite lógica duplicada entre componentes, prefira hooks ou serviços.

Resposta sempre deve conter:
Código essencial e direto ao ponto, sem comentários inline.
Adequação à estrutura e padrões do projeto existente

---
Error:   x You're importing a component that needs "revalidatePath". That only works in a Server Component but one of its parents is marked with "use client", so it's a Client Component.

./app/admin/despesas/actions.ts

Error:   x You're importing a component that needs "revalidatePath". That only works in a Server Component but one of its parents is marked with "use client", so it's a Client Component.
  | Learn more: https://nextjs.org/docs/app/building-your-application/rendering
  | 
  | 
   ,-[C:\Users\lucas.lima\Desktop\afps\app\admin\despesas\actions.ts:3:1]
 1 | import { connectToDatabase } from '@/lib/mongodb';
 2 | import Expense from '@/models/expense-model';
 3 | import { revalidatePath } from 'next/cache';
   :          ^^^^^^^^^^^^^^
 4 | import { z } from 'zod';
 5 | import { auth } from '@/lib/auth';
   `----
This error occurred during the build process and can only be dismissed by fixing the error.leia 