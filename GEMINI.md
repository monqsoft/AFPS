# Visão Geral do Projeto: AFPS - Sistema de Gestão da Associação

Este é um projeto de aplicação web full-stack construído com Next.js, TypeScript, MongoDB e Tailwind CSS. O objetivo é gerenciar as operações da Associação de Futebol de Porto dos Santos (AFPS), incluindo um portal para jogadores e um painel administrativo.

## Tecnologias Principais

*   **Framework:** Next.js (com App Router)
*   **Linguagem:** TypeScript
*   **Banco de Dados:** MongoDB com Mongoose
*   **Estilização:** Tailwind CSS com shadcn/ui
*   **Autenticação:** Baseada em cookies de sessão
*   **Mutations de Dados:** Next.js Server Actions

## Como Construir e Executar o Projeto

1.  **Instalar Dependências:**
    ```bash
    npm install
    ```
    ou
    ```bash
    yarn install
    ```

2.  **Configurar Variáveis de Ambiente:**
    *   Crie um arquivo `.env.local` na raiz do projeto.
    *   Adicione sua string de conexão do MongoDB:
        ```
        MONGODB_URI="sua_string_de_conexao_do_mongodb_aqui"
        DB_NAME="afps_db" # Opcional
        ```

3.  **Popular o Banco de Dados (Opcional):**
    ```bash
    npm run seed
    ```

4.  **Executar o Servidor de Desenvolvimento:**
    ```bash
    npm run dev
    ```

5.  **Build para Produção:**
    ```bash
    npm run build
    ```

## Convenções de Desenvolvimento

*   **Estrutura de Diretórios:** O projeto segue a estrutura padrão do Next.js App Router.
    *   `app/`: Contém as rotas e a lógica principal da aplicação.
    *   `components/`: Componentes React reutilizáveis.
    *   `lib/`: Funções utilitárias, lógica de autenticação e conexão com o banco de dados.
    *   `models/`: Schemas do Mongoose para o MongoDB.
    *   `types/`: Interfaces e tipos TypeScript.
*   **Estilo de Código:** O projeto utiliza ESLint e Prettier para garantir a consistência do código (configurações inferidas de `package.json` e `next.config.mjs`).
*   **Commits:** Espera-se que os commits sigam a especificação [Conventional Commits](https://www.conventionalcommits.org/).
*   **Server Actions:** As interações com o backend (como submissões de formulário) são feitas preferencialmente com Next.js Server Actions.
