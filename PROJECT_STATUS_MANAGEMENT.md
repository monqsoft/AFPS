# Status do Módulo de Gerenciamento (Admin)

Este documento sumariza as funcionalidades existentes, melhorias recentes e o backlog de funcionalidades a serem implementadas especificamente no módulo de gerenciamento (painel administrativo) do sistema AFPS, formatado como requisitos de sistema e categorizado por nível de criticidade.

## Funcionalidades Atuais do Módulo de Gerenciamento (Crítico - Base do Sistema)

### 1. Gestão Administrativa (`/admin`)
- **Perfis e Acesso:**
  - [Permitir][autorização de novos CPFs][para cadastro de jogadores, via `AddAuthorizedCpfForm`, garantindo que apenas CPFs válidos e não cadastrados possam ser autorizados para iniciar o fluxo de registro de um novo jogador no sistema.]
  - [Listar][todos os CPFs autorizados e seu status][via `AuthorizedCpfList`, exibindo informações como o CPF, o status de cadastro (se já completou o registro) e a role atribuída, para facilitar a visualização e gestão dos acessos pendentes e existentes.]
  - [Inativar][jogador][quando a remoção de autorização de CPF já cadastrado ocorrer, em vez de deletar o registro, garantindo a integridade histórica dos dados e a possibilidade de reativação futura se necessário.]
- **Mensalidade:**
  - [Permitir][atualização do valor da mensalidade][para administradores, via `ConfigMensalidadeForm`, salvando o novo valor no modelo `Config`, assegurando que o sistema utilize sempre o valor mais recente para cálculos de pagamento.]
- **Logs:**
  - [Exibir][tabela (`LogsTable`) com todos os registros de auditoria do sistema][com carregamento assíncrono pela `fetchLogsAction`, apresentando detalhes como data/hora, tipo de evento, usuário responsável e descrição da ação, para fins de rastreabilidade e segurança.]
  - [Fornecer][funcionalidade de filtragem e paginação][para a tabela de logs, permitindo que administradores busquem por eventos específicos (e.g., por tipo, por usuário) e naveguem por grandes volumes de registros de forma eficiente.]

### 2. Autorização de Novo Jogador (Admin)
- [Permitir][acesso de administrador][ao painel `/admin`, mediante autenticação bem-sucedida, garantindo que apenas usuários com a role de administrador possam acessar as funcionalidades de gestão.]
- [Permitir][adição do CPF de um novo jogador][por administrador, na aba "Perfis e Acesso", via `AddAuthorizedCpfForm`, como o primeiro passo para que um novo membro possa iniciar seu processo de cadastro no sistema.]
- [Criar][novo documento `Player`][via `addAuthorizedCpfAction`, com `isAuthorized: true`, `registrationCompleted: false`, `status: 'autorizado_nao_cadastrado'`, e permitindo pré-definição da `role` inicial (Jogador, Administrador, Árbitro, Comissão), estabelecendo o estado inicial do futuro jogador no sistema.]

## Melhorias e Refatorações Recentes Relacionadas ao Gerenciamento

### Alta Criticidade (Impacto em Segurança, Integridade de Dados ou Funcionalidade Essencial)
- [Utilizar][roles centralizadas (`admin`, `jogador`, `arbitro`, `comissao`)][definidas em `lib/roles.ts`, para padronização e consistência na gestão de perfis e controle de acesso em todo o módulo administrativo.]
- [Padronizar][registro de erros e eventos importantes][via utilitário de logging (`lib/logger.ts`), para facilitar depuração e monitoramento de ações administrativas, garantindo que todas as operações críticas sejam devidamente registradas.]
- [Inativar][jogador][quando a ação de remover um CPF autorizado for executada, se o jogador já estiver cadastrado, em vez de deletar o registro, preservando o histórico do jogador e permitindo uma eventual reativação.]
- [Garantir][tipagem e validação de dados aprimoradas][em Server Actions, utilizando tipos específicos ou schemas Zod, para ações administrativas, aumentando a robustez e segurança das operações de backend.]

### Média Criticidade (Impacto em Usabilidade, Performance ou Novas Funcionalidades Importantes)
- [Fornecer][funcionalidade de filtragem e paginação][para a tabela de logs no painel administrativo, otimizando a usabilidade e performance ao lidar com grandes volumes de dados de auditoria.]
- [Exibir][estados de carregamento e otimizações de UI/UX][para interações com Server Actions, no painel administrativo, proporcionando feedback visual ao usuário durante o processamento de requisições e melhorando a experiência geral.]

### Baixa Criticidade (Impacto em Manutenibilidade ou Melhorias Menores)
- [Centralizar e organizar][interfaces e tipos TypeScript][na pasta `types/`, incluindo `admin-interfaces.ts` e `config-interfaces.ts`, promovendo a reusabilidade, clareza e manutenção do código relacionado ao módulo de gerenciamento.]

## Bugs Conhecidos no Módulo de Gerenciamento

### Alta Criticidade (Impedem o Uso ou Causam Perda de Dados)
- [Não há][bugs conhecidos e não resolvidos][específicos do módulo de gerenciamento, conforme a documentação atual, indicando um estado de estabilidade para as funcionalidades existentes.]

## Funcionalidades a Serem Implementadas no Módulo de Gerenciamento

### Alta Criticidade (Essenciais para o Core do Módulo)
- **Gestão Administrativa (`/admin`):
  - [Implementar][gerenciamento completo de dados e estatísticas][para jogadores, no módulo administrativo, incluindo funcionalidades para visualizar, editar e gerenciar informações pessoais, financeiras e de desempenho dos jogadores.]
  - [Adicionar][ações (editar, re-autorizar, visualizar detalhes)][para cada entrada na tabela de CPFs autorizados, proporcionando aos administradores maior controle e flexibilidade na gestão dos acessos pendentes e já cadastrados.]

### Média Criticidade (Importantes para a Expansão do Módulo)
- **Gestão Administrativa (`/admin`):
  - [Implementar][controle de despesas][para a comissão, no módulo administrativo, permitindo o registro, categorização e acompanhamento de todas as despesas da associação.]
- **Feedback ao Usuário (UI/UX):
  - [Implementar][notificações toast][para informar o usuário sobre sucesso ou falha das ações, em todo o módulo de gerenciamento, fornecendo feedback imediato e claro sobre o resultado das operações realizadas.]