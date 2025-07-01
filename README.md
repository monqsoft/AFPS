# AFPS - Sistema de Gestão da Associação

## Visão Geral

O projeto AFPS é uma aplicação web full-stack construída com **Next.js** e **TypeScript**, projetada para gerenciar as operações da Associação de Futebol de Porto dos Santos. O sistema oferece um portal para jogadores e um painel administrativo robusto, cobrindo desde o cadastro de novos membros até a gestão financeira.

## Tecnologias e Arquitetura

- **Framework:** [Next.js](https://nextjs.org/) (usando App Router)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Banco de Dados:** [MongoDB](https://www.mongodb.com/), com schemas gerenciados por [Mongoose](https://mongoosejs.com/).
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) com um sistema de design customizado.
- **Componentes UI:** Uma combinação de componentes reutilizáveis de [shadcn/ui](https://ui.shadcn.com/) e componentes específicos da aplicação.
- **Autenticação:** Sistema de sessão baseado em cookies, gerenciado por um `middleware` customizado e `lib/auth.ts`.
- **Mutations de Dados:** [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) para interações com o backend (formulários, etc.).
- **Geração de PIX:** A biblioteca `qrcode-pix` é usada para gerar códigos de pagamento dinâmicos.
- **Máscaras de Input:** A biblioteca `react-input-mask` é utilizada para formatação de campos como CPF e telefone.
- **Tipagem Centralizada:** Interfaces e tipos TypeScript são centralizados na pasta `types/` para melhor organização e reuso.

## Configuração do Ambiente

Para executar este projeto localmente, siga os passos abaixo:

1.  **Clonar o Repositório**
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd afps
    ```

2.  **Instalar Dependências**
    ```bash
    npm install
    # ou
    yarn install
    ```

3.  **Configurar Variáveis de Ambiente**
    - Crie um arquivo chamado `.env.local` na raiz do projeto.
    - Adicione a sua string de conexão do MongoDB a este arquivo. Opcionalmente, você pode definir o nome do banco de dados.
      ```
      MONGODB_URI="sua_string_de_conexao_do_mongodb_aqui"
      DB_NAME="afps_db" # Opcional: nome do banco de dados, se não estiver na URI
      ```
    - **Importante:** O arquivo `.env.local` já está no `.gitignore` para garantir que suas credenciais não sejam enviadas para o repositório.

4.  **Popular o Banco de Dados (Opcional, mas Recomendado)**
    - O script `seed` popula o banco com dados iniciais para teste (configurações, usuário admin, etc.).
    - Execute o seguinte comando:
      ```bash
      npm run seed
      ```

5.  **Executar a Aplicação**
    ```bash
    npm run dev
    ```
    A aplicação estará disponível em `http://localhost:3000`.

## Estrutura de Dados (Models)

- **`Player` (`player-model.ts`):** O modelo central da aplicação. Armazena todas as informações dos jogadores, incluindo:
  - Dados pessoais (nome, CPF, nascimento).
  - Status de autorização e de cadastro (`isAuthorized`, `registrationCompleted`).
  - Perfil (`role`: utiliza os valores definidos em `lib/roles.ts`).
  - Dados de jogo (posição, número da camisa).
  - Histórico financeiro e estatísticas (mensalidades, cartões, gols).

- **`Config` (`config-model.ts`):** Armazena configurações globais do sistema, como o valor da mensalidade e a chave PIX da associação. O sistema garante que um documento de configuração padrão seja criado se nenhum existir.

- **`Log` (`log-model.ts`):** Registra eventos importantes para fins de auditoria. Uma função `createLog` é usada para padronizar a criação de logs de ações como autorização de CPFs, erros no sistema e finalização de cadastros.

- **`Subscription` (`subscription-model.ts`):** Representa as mensalidades dos jogadores, armazenando o mês de referência, valor, status de pagamento e o ID da transação PIX.

## Workflows Detalhados

### 1. Autenticação

1.  **Acesso:** O `middleware.ts` intercepta todas as requisições. Se o usuário não estiver autenticado (verificado via cookie `afps_session`) e tentar acessar uma rota protegida, ele é redirecionado para `/login`.
2.  **Login:** Na página de login, o usuário insere seu CPF. A `loginAction` (`app/login/actions.ts`) verifica se existe um jogador com aquele CPF e se ele está autorizado (`isAuthorized: true`). A validação do CPF agora inclui uma checagem matemática.
3.  **Criação da Sessão:** Se a validação for bem-sucedida, `lib/auth.ts` cria um cookie de sessão seguro (`httpOnly`) com os dados essenciais do usuário, utilizando os `ROLES` centralizados.
4.  **Logout:** A `logoutAction` remove o cookie de sessão e redireciona o usuário para a página de login.

### 2. Cadastro de Novo Jogador

Este fluxo é projetado para garantir que apenas pessoas aprovadas pela administração possam se cadastrar.

1.  **Autorização (Admin):**
    - Um administrador acessa o painel `/admin`.
    - Na aba "Perfis e Acesso", ele usa o formulário `AddAuthorizedCpfForm` para adicionar o CPF de um novo jogador.
    - A `addAuthorizedCpfAction` cria um novo documento `Player` com `isAuthorized: true`, `registrationCompleted: false` e `status: 'autorizado_nao_cadastrado'`. O administrador pode pré-definir a `role` inicial do usuário (Jogador, Administrador, Árbitro, Comissão).

2.  **Verificação (Novo Jogador):**
    - O novo jogador acessa a página `/cadastro`.
    - Ele insere seu CPF. A `checkCpfAuthorization` action verifica no banco de dados se o CPF pertence a um jogador com `isAuthorized: true` e `registrationCompleted: false`. A validação do CPF agora inclui uma checagem matemática.
    - Se o CPF não for autorizado, uma mensagem de erro é exibida. Se já for cadastrado, ele é instruído a fazer login.

3.  **Preenchimento do Formulário:**
    - Se o CPF for válido, o componente `RegistrationStepper` é renderizado.
    - O jogador preenche suas informações em um formulário de múltiplos passos (Informações Pessoais, Contato, Finalização). Campos como CPF e telefone agora utilizam máscaras de input para melhor experiência do usuário.
    - Cada passo chama a `submitRegistrationStep` action, que valida e salva os dados no documento `Player` correspondente.
    - Ao final, o status do jogador é atualizado para `ativo` e `registrationCompleted` se torna `true`. O usuário pode selecionar sua `role` (Jogador, Administrador, Árbitro, Comissão), com a `role` de Administrador sujeita a aprovação.

### 3. Gestão Administrativa (`/admin`)

O painel administrativo é uma página com abas que centraliza as operações:

- **Jogadores:** (Funcionalidade a ser implementada) Gerenciamento de dados e estatísticas dos jogadores.
- **Perfis e Acesso:**
  - Autoriza novos CPFs para cadastro (`AddAuthorizedCpfForm`).
  - Lista todos os CPFs autorizados e seu status (`AuthorizedCpfList`). A remoção de autorização para CPFs já cadastrados agora inativa o jogador se ele já estiver cadastrado, em vez de deletar o registro.
- **Mensalidade:**
  - Permite ao admin atualizar o valor da mensalidade (`ConfigMensalidadeForm`), que é salvo no modelo `Config`.
- **Logs:**
  - Exibe uma tabela (`LogsTable`) com todos os registros de auditoria do sistema, carregados de forma assíncrona pela `fetchLogsAction`.
- **Despesas:** (Funcionalidade a ser implementada) Controle de despesas da comissão.

### 4. Pagamento de Mensalidade

1.  **Acesso:** O jogador, em sua página de perfil (`/jogadores/[cpf]`), encontra o `PixPaymentCard`.
2.  **Geração do PIX:** Ao clicar no botão, a `generatePixPayment` action é chamada.
3.  **Lógica da Action:**
    - Busca as configurações (`getAppConfig`) para obter a chave PIX e o valor da mensalidade.
    - Busca os dados do jogador para personalizar a descrição do PIX.
    - Utiliza a biblioteca `qrcode-pix` para gerar o payload (Copia e Cola) e a imagem do QR Code em Base64.
4.  **Exibição:** O componente `PixPaymentCard` recebe os dados e exibe o QR Code e o código para o usuário, com opções para copiar e compartilhar.

## Componentes Principais

- **`Navbar` (`components/navbar.tsx`):** Barra de navegação principal. Renderiza links diferentes com base no `role` do usuário (obtido da sessão).
- **`LoginForm` (`components/login-form.tsx`):** Formulário de login com validação de estado (carregando, erro) gerenciada pelo `useFormState`. Agora utiliza máscara de input para CPF.
- **`RegistrationStepper` (`components/registration-stepper.tsx`):** Orquestra o fluxo de cadastro de múltiplos passos, gerenciando o estado do formulário e a comunicação com as Server Actions. Utiliza máscaras de input para CPF e telefone.
- **`AddAuthorizedCpfForm` e `ConfigMensalidadeForm`:** Formulários administrativos que usam Server Actions para modificar dados no backend.
- **`LogsTable` (`components/logs-table.tsx`):** Tabela que busca e exibe dados de forma assíncrona no cliente, mostrando um estado de carregamento.
- **`PixPaymentCard` (`components/pix-payment-card.tsx`):** Componente interativo que lida com a geração e exibição de dados de pagamento PIX.

## Scripts e Configuração

- **`scripts/seed.ts`:** Um script útil para ambiente de desenvolvimento. Ele popula o banco de dados com dados essenciais, como a configuração padrão e usuários de teste (um admin/jogador já cadastrado e um CPF apenas autorizado para testar o fluxo de cadastro). Para executar, use `npx tsx scripts/seed.ts`.
- **`tailwind.config.ts`:** Contém a configuração de tema do Tailwind CSS, com cores customizadas para a identidade visual da AFPS (`primary`, `secondary`, `accent`).
- **`middleware.ts`:** Essencial para a segurança, define as rotas públicas e privadas da aplicação.

## Melhorias e Refatorações Recentes

- **Centralização de Roles:** Definição de roles (`admin`, `jogador`, `arbitro`, `comissao`) em `lib/roles.ts` para padronização e consistência em todo o projeto.
- **Segurança na Build:** Desativação das opções `ignoreDuringBuilds` (ESLint) e `ignoreBuildErrors` (TypeScript) em `next.config.mjs` para garantir que o projeto não seja compilado com erros em produção.
- **Validação de CPF Aprimorada:** Implementação de uma função de validação matemática de CPF em `lib/utils.ts`, utilizada nos fluxos de login e cadastro.
- **Refatoração do `useToast`:** Remoção da implementação duplicada do hook `useToast`, garantindo o uso consistente da versão de `shadcn/ui`.
- **Logging Centralizado:** Introdução de um utilitário de logging (`lib/logger.ts`) para padronizar o registro de erros e eventos importantes, facilitando a depuração e monitoramento.
- **Organização de Interfaces:** Criação da pasta `types/` para centralizar e organizar todas as interfaces e tipos TypeScript, evitando duplicação e conflitos.
- **Política de Remoção de CPF:** A ação de remover um CPF autorizado agora inativa o jogador se ele já estiver cadastrado, em vez de simplesmente deletar o registro.
- **Redirecionamento de Login:** Corrigido o redirecionamento incorreto após o login, garantindo que o usuário seja direcionado para a página correta.
- **Links de Redes Sociais:** Removidos os links quebrados de redes sociais na página de login.
- **Nome do Banco de Dados:** A conexão com o MongoDB agora permite a configuração do nome do banco de dados via variável de ambiente `DB_NAME`.
- **Dashboard do Jogador:** Adicionadas estruturas básicas de placeholder para exibição de estatísticas e histórico de pagamentos nas páginas de dashboard e perfil do jogador.