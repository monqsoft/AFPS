# Backlog do Projeto AFPS

Este documento serve como um backlog de desenvolvimento, listando tarefas pendentes, correções, melhorias e vulnerabilidades de segurança identificadas durante a análise do código em `2025-06-30`.

## ✅ Tarefas Concluídas

- **`[ALTO]` Chave do Banco de Dados Hardcoded**
  - **Local:** `lib/mongodb.ts` e `scripts/seed.ts`.
  - **Descrição:** A string de conexão do MongoDB, que inclui as credenciais, estava diretamente no código. Isso foi corrigido movendo a `MONGODB_URI` para variáveis de ambiente (`.env.local`) e acessando-a via `process.env.MONGODB_URI`.
  - **Status:** RESOLVIDO.

- **`[MÉDIO]` Listagem de CPFs na Aba Errada do Painel de Admin**
  - **Local:** `app/admin/page.tsx`.
  - **Descrição:** A lista de CPFs autorizados (`AuthorizedCpfList`) estava sendo exibida na aba "Jogadores". Corrigido movendo a renderização do componente `<AuthorizedCpfList />` para dentro do `TabsContent` com `value="cpfs"`.
  - **Status:** RESOLVIDO.

- **`[BAIXO]` Links de Redes Sociais Quebrados**
  - **Local:** `app/login/page.tsx`.
  - **Descrição:** Os ícones de Facebook, Twitter e Instagram na página de login eram links que apontavam para `"#"`. Corrigido removendo os links quebrados.
  - **Status:** RESOLVIDO.

- **`[MÉDIO]` Redirecionamento Incorreto Após Login**
  - **Local:** `app/login/actions.ts`
  - **Descrição:** Após um login bem-sucedido, o sistema não estava redirecionando o usuário corretamente. Corrigido utilizando `permanentRedirect` do Next.js.
  - **Status:** RESOLVIDO.

- **`[MÉDIO]` Validação de CPF**
  - **Local:** `lib/utils.ts`, `app/cadastro/actions.ts`, `app/login/actions.ts`.
  - **Descrição:** A validação de CPF foi aprimorada com uma função utilitária em `lib/utils.ts` que valida o CPF matematicamente (usando os dígitos verificadores).
  - **Status:** RESOLVIDO.

- **`[MÉDIO]` Política de Remoção de Autorização de CPF**
  - **Local:** `app/admin/actions.ts` (`removeAuthorizedCpfAction`).
  - **Descrição:** A lógica foi implementada para inativar o jogador (definindo `isAuthorized` como `false` e `status` como `inativo`) em vez de simplesmente remover o registro, se o jogador já estiver cadastrado.
  - **Status:** RESOLVIDO.

- **`[BAIXO]` Refatorar Uso de `useToast`**
  - **Local:** `components/ui/use-toast.ts` e `hooks/use-toast.ts`.
  - **Descrição:** A duplicata de `useToast` em `hooks/use-toast.ts` foi removida, garantindo que todas as chamadas utilizem a implementação padrão.
  - **Status:** RESOLVIDO.

- **`[BAIXO]` Alterar Nome do Banco de Dados Padrão**
  - **Local:** `lib/mongodb.ts`.
  - **Descrição:** A lógica de conexão em `lib/mongodb.ts` foi modificada para permitir a configuração do nome do banco de dados via variável de ambiente `DB_NAME`.
  - **Status:** RESOLVIDO.

- **`[BAIXO]` Tratamento de Erros e Logging**
  - **Local:** Projeto inteiro.
  - **Descrição:** O projeto já utiliza `logger.error` para tratamento de erros, garantindo um logging mais robusto.
  - **Status:** RESOLVIDO.

- **`[BAIXO]` Dashboard do Jogador**
  - **Local:** `app/dashboard/page.tsx` e `app/jogadores/[cpf]/page.tsx`.
  - **Descrição:** Adicionadas estruturas básicas de placeholder para exibição de estatísticas e histórico de pagamentos nas páginas de dashboard e perfil do jogador.
  - **Status:** RESOLVIDO (com placeholders, aguardando implementação de dados reais).

## ❗ Falhas de Segurança Críticas (Pendentes)

Estas são as prioridades máximas e devem ser corrigidas imediatamente.

- **`[CRÍTICO]` Permissão de Autoatribuição de Perfil de Administrador no Cadastro**
  - **Descrição:** Necessário criar um arquivo único de roles para substituir implementações hardcoded de `player.role` e corrigir a falha crítica de autoatribuição de perfil de administrador. As roles são `admin`, `jogador`, `arbitro`, `comissao`.
  - **Status:** PENDENTE.

- **`[CRÍTICO]` Build Ignorando Erros de TypeScript e ESLint**
  - **Local:** `next.config.mjs`.
  - **Descrição:** As configurações `eslint: { ignoreDuringBuilds: true }` e `typescript: { ignoreBuildErrors: true }` estão ativadas. Isso permite que o projeto seja compilado e implantado mesmo que contenha erros de tipo ou não siga as regras de linting, o que pode levar a bugs e vulnerabilidades em produção.
  - **Componentes a serem alterados:** `next.config.mjs`, e todos os arquivos `.ts` e `.tsx` que atualmente possuem erros de TypeScript ou ESLint que precisam ser corrigidos.
  - **Correção Sugerida:** Remover essas duas configurações e corrigir todos os erros de TypeScript e ESLint para garantir a qualidade e a segurança do código.
  - **Status:** PENDENTE.

## 🚀 Funcionalidades a Implementar (Roadmap)

- **`[ALTO]` Reconciliação de Pagamentos PIX**
  - **Descrição:** O sistema gera o PIX, mas não há um mecanismo para verificar se o pagamento foi efetuado. É necessário criar um webhook ou um processo para consultar o status da transação e atualizar o modelo `Subscription` e `Player` quando um pagamento for confirmado.
  - **Componentes a serem alterados:** `models/subscription-model.ts`, `models/player-model.ts`, `app/api/pix-webhook/route.ts` (novo arquivo para webhook), `app/jogadores/actions.ts` (para atualizar status do jogador), `components/pix-payment-card.tsx` (para exibir status de pagamento), e possivelmente novos componentes em `components/` para o painel administrativo.
  - **Status:** PENDENTE.

- **`[ALTO]` Gerenciamento de Jogadores no Painel de Admin**
  - **Local:** `app/admin/page.tsx` e `app/admin/actions.ts`.
  - **Descrição:** A aba "Jogadores" e suas actions (`editPlayerInfoAction`, `togglePlayerStatusAction`, etc.) são placeholders. É preciso implementar a UI e a lógica para:
    - Editar dados de um jogador.
    - Ativar/Inativar um jogador.
    - Adicionar estatísticas (gols, cartões).
  - **Componentes a serem alterados:** `app/admin/page.tsx`, `app/admin/actions.ts`, `models/player-model.ts`, e novos componentes em `components/` para formulários de edição e tabelas de jogadores.
  - **Status:** PENDENTE.

- **`[MÉDIO]` Gerenciamento de Despesas no Painel de Admin**
  - **Local:** `app/admin/page.tsx` e `app/admin/actions.ts`.
  - **Descrição:** A aba "Despesas" é um placeholder. É preciso implementar o formulário, a tabela e a lógica para registrar e visualizar as despesas da comissão.
  - **Componentes a serem alterados:** `app/admin/page.tsx`, `app/admin/actions.ts`, e novos componentes em `components/` para o formulário e tabela de despesas.
  - **Status:** PENDENTE.

- **`[MÉDIO]` Página de Transparência**
  - **Local:** `app/transparencia/page.tsx`.
  - **Descrição:** A página existe, mas não exibe dados. É preciso implementar a lógica para buscar e exibir relatórios financeiros, como total de mensalidades arrecadadas vs. despesas.
  - **Componentes a serem alterados:** `app/transparencia/page.tsx`, e possivelmente novos componentes em `components/` para exibição de relatórios e gráficos.
  - **Status:** PENDENTE.

## 🛠️ Melhorias e Refinamentos Técnicos (Pendentes)

- **`[ALTO]` Centralização e Padronização de Interfaces (Types)**
  - **Local:** Projeto inteiro.
  - **Descrição:** Atualmente, as interfaces e tipos TypeScript estão espalhados por diversos arquivos (models, componentes, actions, etc.). Isso pode levar a duplicação, inconsistências e dificuldade de manutenção.
  - **Componentes a serem alterados:** Todos os arquivos `.ts` e `.tsx` que definam interfaces ou tipos. Será criada uma nova pasta `types/` na raiz do projeto para centralizar todas as definições.
  - **Correção Sugerida:** Criar uma pasta `types/` na raiz do projeto. Mover todas as interfaces e tipos para arquivos `.ts` dentro desta pasta, organizando-os logicamente (ex: `types/player.ts`, `types/auth.ts`). Revisar todos os arquivos que utilizam essas interfaces para importar as definições centralizadas. Identificar e corrigir interfaces duplicadas ou conflitantes.
  - **Lista de Componentes/Arquivos com Interfaces/Tipos a serem revisados:**
    - `models/*.ts` (todos os modelos definem interfaces para os documentos MongoDB: `IConfig`, `ILog`, `IPlayer`, `ISubscription`)
    - `lib/auth.ts` (define `SessionData` interface)
    - `app/**/*.ts` (actions, pages, etc., podem conter tipos inferidos ou inline que precisarão ser extraídos)
    - `components/**/*.tsx` (componentes podem conter tipos inferidos ou inline para props que precisarão ser extraídos)
    - `lib/utils.ts` (contém `ClassValue` do `clsx`, mas não define interfaces próprias; pode conter tipos utilitários a serem extraídos)
    - `hooks/*.ts` (hooks podem conter tipos inferidos ou inline que precisarão ser extraídos)
  - **Status:** PENDENTE.

- **`[MÉDIO]` Aplicar Máscaras de Input para CPF e Telefone**
  - **Local:** Componentes de formulário, como `components/registration-stepper.tsx`.
  - **Descrição:** Os campos de CPF e telefone no formulário de cadastro aceitam texto livre, o que pode levar a erros de formatação. A experiência do usuário seria melhorada com a aplicação de máscaras de input (ex: `999.999.999-99` para CPF e `(99) 99999-9999` para telefone).
  - **Componentes a serem alterados:** `components/registration-stepper.tsx`, `components/ui/input.tsx` (se a máscara for aplicada diretamente no input), e possivelmente outros componentes de formulário que utilizem CPF/telefone.
  - **Correção Sugerida:** Utilizar uma biblioteca de máscaras como `react-input-mask` ou similar para formatar os campos de CPF e telefone em tempo real, garantindo que os dados sejam inseridos no formato correto.
  - **Status:** PARCIALMENTE IMPLEMENTADO (máscara de telefone adicionada, CPF pendente).
