
# `[CRÍTICO]` Correção de Autoatribuição Indevida de Role `admin` + Refatoração de Uso de Roles

## Objetivo
Corrigir falha de segurança onde usuários conseguem se cadastrar com a role `admin`.  
Padronizar e centralizar o uso de papéis (roles) em todo o sistema.

---

## Tarefas Obrigatórias

### 1. **Bloquear Autoatribuição de `admin`**
- Impedir que qualquer usuário consiga se cadastrar com `role: "admin"` diretamente via payload ou interface.

---

### 2. **Criar Centralizador de Roles**
- Criar o arquivo: `/lib/roles.ts`
- Conteúdo do arquivo:

  export const ROLES = {
    ADMIN: "admin",
    JOGADOR: "jogador",
    ARBITRO: "arbitro",
    COMISSAO: "comissao",
  } as const;

  export type Role = typeof ROLES[keyof typeof ROLES];


---

### 3. **Remover Tratamentos com Fallback de Role**

* Eliminar todos os usos de:


  player.role || "jogador"
  viewedPlayer.role || "Jogador"

* Substituir por acesso direto à propriedade:


  <TableCell>{player.role}</TableCell>

* Se necessário, o fallback deve ser tratado em nível de lógica (ex: validação) e **não diretamente na renderização**.

---

### 4. **Refatorar Ocorrências Hardcoded de Role**

* Substituir **todas as 11 ocorrências** de comparações e atribuições como:


  player.role === "admin"
  viewedPlayer.role === "jogador"
  player.role = "jogador"


  por:


  player.role === ROLES.ADMIN
  viewedPlayer.role === ROLES.JOGADOR
  player.role = ROLES.JOGADOR
---

## Observações

* Toda lógica condicional, exibição ou fallback que depender de `role` deve agora usar os valores centralizados de `ROLES`.
* Isso garante consistência, evita erros de digitação, e facilita futuras alterações ou expansões de perfis.

@