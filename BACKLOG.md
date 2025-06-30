# Backlog do Projeto AFPS

Este documento serve como um backlog de desenvolvimento, listando tarefas pendentes, correções, melhorias e vulnerabilidades de segurança identificadas durante a análise do código em `2025-06-30`.

## ❗ Falhas de Segurança Críticas

Estas são as prioridades máximas e devem ser corrigidas imediatamente.

na correção **`[CRÍTICO]` Permissão de Autoatribuição de Perfil de Administrador no Cadastro** deve criar um arquivo unico de roles, esse arquivo deve substituir implementações       │
│   hardocode onde tiver player.role, alem de fazer a correção da propria falha critica. as roles sao admin jogador arbitro comissao. ou seja alem de corrijir a falha critica deve        │
│   atualizar a implementação relacionada as roles   
- **`[CRÍTICO]` Build Ignorando Erros de TypeScript e ESLint**
  - **Local:** `next.config.mjs`.
  - **Descrição:** As configurações `eslint: { ignoreDuringBuilds: true }` e `typescript: { ignoreBuildErrors: true }` estão ativadas. Isso permite que o projeto seja compilado e implantado mesmo que contenha erros de tipo ou não siga as regras de linting, o que pode levar a bugs e vulnerabilidades em produção.
  - **Componentes a serem alterados:** `next.config.mjs`, e todos os arquivos `.ts` e `.tsx` que atualmente possuem erros de TypeScript ou ESLint que precisam ser corrigidos.
  - **Correção Sugerida:** Remover essas duas configurações e corrigir todos os erros de TypeScript e ESLint para garantir a qualidade e a segurança do código.

- **`[ALTO]` Chave do Banco de Dados Hardcoded**
  - **Local:** `lib/mongodb.ts` e `scripts/seed.ts`.
  - **Descrição:** A string de conexão do MongoDB, que inclui as credenciais, está diretamente no código. Isso é um risco de segurança grave, pois expõe as credenciais a qualquer pessoa com acesso ao código-fonte.
  - **Componentes a serem alterados:** `lib/mongodb.ts`, `scripts/seed.ts`, e o arquivo de configuração de ambiente (`.env.local`).
  - **Correção Sugerida:** Mover a `MONGODB_URI` para variáveis de ambiente (`.env.local`) e acessá-la via `process.env.MONGODB_URI`.

## 🐛 Bugs e Inconsistências

- **`[MÉDIO]` Listagem de CPFs na Aba Errada do Painel de Admin**
  - **Local:** `app/admin/page.tsx`.
  - **Descrição:** A lista de CPFs autorizados (`AuthorizedCpfList`) está sendo exibida na aba "Jogadores". No entanto, o formulário para adicionar CPFs está na aba "Perfis e Acesso". Isso é confuso para o usuário.
  - **Componentes a serem alterados:** `app/admin/page.tsx`.
  - **Correção Sugerida:** Mover a renderização do componente `<AuthorizedCpfList />` para dentro do `TabsContent` com `value="cpfs"`.

- **`[BAIXO]` Links de Redes Sociais Quebrados**
  - **Local:** `app/login/page.tsx`.
  - **Descrição:** Os ícones de Facebook, Twitter e Instagram na página de login são links que apontam para `"#"`.
  - **Componentes a serem alterados:** `app/login/page.tsx`.
  - **Correção Sugerida:** Atualizar os links para os perfis reais da associação ou removê-los temporariamente.

- **`[MÉDIO]` Redirecionamento Incorreto Após Login**
  - **Local:** `app/login/actions.ts`
  - **Descrição:** Após um login bem-sucedido, o sistema não está redirecionando o usuário para a página correta (ex: dashboard). O usuário permanece na página de login ou é enviado para uma rota inesperada.
  - **Componentes a serem alterados:** `app/login/actions.ts`, `app/login/page.tsx`.
  - **Correção Sugerida:** Verificar a lógica na `action` de login e utilizar a função `redirect` do Next.js para encaminhar o usuário para a página `/dashboard` ou outra página apropriada após a autenticação bem-sucedida.

## 🚀 Funcionalidades a Implementar (Roadmap)

- **`[ALTO]` Reconciliação de Pagamentos PIX**
  - **Descrição:** O sistema gera o PIX, mas não há um mecanismo para verificar se o pagamento foi efetuado. É necessário criar um webhook ou um processo para consultar o status da transação e atualizar o modelo `Subscription` e `Player` quando um pagamento for confirmado.
  - **Componentes a serem alterados:** `models/subscription-model.ts`, `models/player-model.ts`, `app/api/pix-webhook/route.ts` (novo arquivo para webhook), `app/jogadores/actions.ts` (para atualizar status do jogador), `components/pix-payment-card.tsx` (para exibir status de pagamento), e possivelmente novos componentes em `components/` para o painel administrativo.

- **`[ALTO]` Gerenciamento de Jogadores no Painel de Admin**
  - **Local:** `app/admin/page.tsx` e `app/admin/actions.ts`.
  - **Descrição:** A aba "Jogadores" e suas actions (`editPlayerInfoAction`, `togglePlayerStatusAction`, etc.) são placeholders. É preciso implementar a UI e a lógica para:
    - Editar dados de um jogador.
    - Ativar/Inativar um jogador.
    - Adicionar estatísticas (gols, cartões).
  - **Componentes a serem alterados:** `app/admin/page.tsx`, `app/admin/actions.ts`, `models/player-model.ts`, e novos componentes em `components/` para formulários de edição e tabelas de jogadores.

- **`[MÉDIO]` Gerenciamento de Despesas no Painel de Admin**
  - **Local:** `app/admin/page.tsx` e `app/admin/actions.ts`.
  - **Descrição:** A aba "Despesas" é um placeholder. É preciso implementar o formulário, a tabela e a lógica para registrar e visualizar as despesas da comissão.
  - **Componentes a serem alterados:** `app/admin/page.tsx`, `app/admin/actions.ts`, e novos componentes em `components/` para o formulário e tabela de despesas.

- **`[MÉDIO]` Página de Transparência**
  - **Local:** `app/transparencia/page.tsx`.
  - **Descrição:** A página existe, mas não exibe dados. É preciso implementar a lógica para buscar e exibir relatórios financeiros, como total de mensalidades arrecadadas vs. despesas.
  - **Componentes a serem alterados:** `app/transparencia/page.tsx`, e possivelmente novos componentes em `components/` para exibição de relatórios e gráficos.

- **`[BAIXO]` Dashboard do Jogador**
  - **Local:** `app/dashboard/page.tsx` e `app/jogadores/[cpf]/page.tsx`.
  - **Descrição:** As páginas de dashboard e perfil do jogador têm placeholders para exibir estatísticas e histórico de pagamentos. É preciso implementar a busca e a exibição desses dados.
  - **Componentes a serem alterados:** `app/dashboard/page.tsx`, `app/jogadores/[cpf]/page.tsx`, e possivelmente novos componentes em `components/` para exibir estatísticas e histórico de pagamentos.

## 🛠️ Melhorias e Refinamentos Técnicos

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


- **`[MÉDIO]` Validação de CPF**
  - **Descrição:** A validação de CPF atual verifica apenas o formato (11 dígitos). Seria ideal adicionar uma função utilitária em `lib/utils.ts` para validar o CPF matematicamente (usando os dígitos verificadores), garantindo a inserção de CPFs válidos.
  - **Componentes a serem alterados:** `lib/utils.ts`, `app/cadastro/actions.ts`, `app/login/actions.ts`, e qualquer outro local onde o CPF é validado ou inserido.
  - **Correção Sugerida:** Adicionar uma função de validação de CPF em `lib/utils.ts` que utilize o algoritmo de dígitos verificadores. Integrar essa função nas `actions` de cadastro e login, e em qualquer outro formulário que receba CPF.

- **`[MÉDIO]` Política de Remoção de Autorização de CPF**
  - **Local:** `app/admin/actions.ts` (`removeAuthorizedCpfAction`).
  - **Descrição:** O código impede a remoção da autorização de um usuário já cadastrado. Uma nota no código (`// Decide policy...`) indica que essa política precisa ser definida. A funcionalidade poderia ser melhorada para permitir a inativação do jogador em vez da simples remoção.
  - **Componentes a serem alterados:** `app/admin/actions.ts`, `models/player-model.ts` (para adicionar um campo de status de inativação, se necessário), e `app/admin/page.tsx` (para a UI de inativação).
  - **Correção Sugerida:** Definir uma política clara para a remoção/inativação de CPFs autorizados. Implementar a lógica em `removeAuthorizedCpfAction` para inativar o jogador em vez de remover a autorização, se o jogador já estiver cadastrado. Atualizar a UI no painel de administração para refletir essa funcionalidade.

- **`[BAIXO]` Tratamento de Erros e Logging**
  - **Descrição:** Muitos blocos `catch` apenas logam o erro no console (`console.error`). Para produção, seria ideal integrar um serviço de logging mais robusto (como Sentry, Logtail, etc.) para monitorar e tratar erros de forma mais eficaz.
  - **Componentes a serem alterados:** Todos os arquivos `.ts` e `.tsx` que contêm blocos `try...catch` com `console.error`.
  - **Correção Sugerida:** Implementar uma solução de logging centralizada (ex: um utilitário em `lib/` ou integração com um serviço externo) e substituir as chamadas a `console.error` por essa solução. Garantir que informações relevantes sejam logadas para depuração e monitoramento.

- **`[BAIXO]` Refatorar Uso de `useToast`**
  - **Descrição:** O projeto contém duas implementações de `useToast` (`components/ui/use-toast.ts` e `hooks/use-toast.ts`). A implementação de `shadcn/ui` parece ser a padrão. A duplicata em `hooks` deve ser removida para evitar confusão e manter a consistência.
  - **Componentes a serem alterados:** `components/ui/use-toast.ts`, `hooks/use-toast.ts`, e todos os arquivos que importam `useToast` de `hooks/use-toast.ts`.
  - **Correção Sugerida:** Remover `hooks/use-toast.ts` e garantir que todas as chamadas a `useToast` utilizem a implementação de `components/ui/use-toast.ts` (ou a de `shadcn/ui` diretamente, se for o caso).

- **`[MÉDIO]` Aplicar Máscaras de Input para CPF e Telefone**
  - **Local:** Componentes de formulário, como `components/registration-stepper.tsx`.
  - **Descrição:** Os campos de CPF e telefone no formulário de cadastro aceitam texto livre, o que pode levar a erros de formatação. A experiência do usuário seria melhorada com a aplicação de máscaras de input (ex: `999.999.999-99` para CPF e `(99) 99999-9999` para telefone).
  - **Componentes a serem alterados:** `components/registration-stepper.tsx`, `components/ui/input.tsx` (se a máscara for aplicada diretamente no input), e possivelmente outros componentes de formulário que utilizem CPF/telefone.
  - **Correção Sugerida:** Utilizar uma biblioteca de máscaras como `react-input-mask` ou similar para formatar os campos de CPF e telefone em tempo real, garantindo que os dados sejam inseridos no formato correto.

- **`[BAIXO]` Alterar Nome do Banco de Dados Padrão**
  - **Local:** `lib/mongodb.ts`
  - **Descrição:** O nome do banco de dados utilizado pela aplicação está definido como "default" ou pode não ser configurável. É uma boa prática usar um nome descritivo para o banco de dados (ex: `afps_db`) e permitir que ele seja configurado via variáveis de ambiente.
  - **Componentes a serem alterados:** `lib/mongodb.ts`.
  - **Correção Sugerida:** Modificar a lógica de conexão em `lib/mongodb.ts` para extrair o nome do banco de dados da `MONGODB_URI` ou de uma variável de ambiente separada (`DB_NAME`), evitando o uso de um nome padrão genérico.
---
eu tenho essa lista de itens, se o seu backlog ja conter os itens q vou mencionar, ignores, caso nao, adicion no backlog.md com mais detalhes



lista do que falta afps

 corrigir a tela de login (redirecionamento)
criar dashboard e componentes 
corrigir mascaras dos inputs de telefone e cpf
tela de transparencia
tela de despesas da comissão dentro do painel de adm
alterar nome do db padrao na config do mongo.ts