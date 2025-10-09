# AI Coding Assistant / Copilot Instructions — app21

Este documento define as diretrizes para o uso de assistentes de IA (como GitHub Copilot, ChatGPT ou outros) dentro do projeto **app21**, garantindo consistência no estilo, idioma e arquitetura do código.

---

## 1. Idioma Padrão

- Todas as respostas, comentários e explicações devem ser escritas em **português**.
- Os nomes de **funções, variáveis e classes** devem ser escritos em **português**, exceto termos técnicos consolidados como `useAuth`, `WebSocket`, `schema`, `context`, `hook`, `API`, etc.

Exemplo:

```ts
// Correto
function criarSalaDePlanejamento() { ... }

// Incorreto
function createPlanningRoom() { ... }
```

---

## 2. Convenções Gerais

1. Seguir o estilo e arquitetura definidos em `AI Agent Instructions for app21`.
2. Usar **camelCase** para nomes de funções e variáveis.
3. Usar **PascalCase** para nomes de componentes React.
4. Separar responsabilidades de acordo com os módulos e contextos do projeto.
5. Evitar duplicação de código; sempre verificar se já existe uma função ou componente com propósito semelhante antes de criar um novo.

---

## 3. Estrutura e Padrões do Projeto

- **Forms:**
  - Usar **Zod** para validação.
  - Os schemas ficam em `**/schema.ts`.
  - Utilizar `components/forms/basic-form.tsx` como base.

- **Componentes:**
  - Organizar em `components/[categoria]/`.
  - Manter componentes pequenos, claros e reutilizáveis.

- **Tabelas:**
  - Basear-se em `components/table/data-table.tsx`.

- **Contextos e Estado:**
  - Armazenar contextos em `/contexts`.
  - Usar o padrão de `SalaContext` como referência para novos contextos.

---

## 4. Banco de Dados e Prisma

- Alterações de schema devem ser feitas em `prisma/schema.prisma`.
- Após modificar o schema, executar:

  ```bash
  npx prisma migrate dev --name [nome-da-migracao]
  ```

- Seguir os modelos de entidades já existentes (`Pessoa`, `Equipe`, `Projeto`, `Sala`, `Historia`, etc).

---

## 5. Autenticação e Integrações

- A autenticação é feita via **Supabase** (`lib/supabase.ts`).
- Para obter informações do usuário autenticado, utilizar o **hook `useAuth()`**.
- Funcionalidades em tempo real devem utilizar **WebSockets**, seguindo o padrão das salas (`Sala`).

---

## 6. Boas Práticas para Código Gerado

1. Comentar o código com descrições breves e objetivas.
2. Evitar traduções literais de termos técnicos (ex: “hook”, “socket”, “schema”).
3. Seguir a estrutura e convenções do projeto ao criar novas rotas, APIs ou hooks.
4. Implementar estados de carregamento e erro em componentes assíncronos.
5. Priorizar legibilidade e clareza do código.

---

## 7. Exemplo de Nomeação e Estilo

```tsx
// Componente React
export function ListaDeHistorias({
  historias,
}: {
  historias: Historia[];
}) {
  return (
    <ul>
      {historias.map((h) => (
        <li key={h.id}>{h.titulo}</li>
      ))}
    </ul>
  );
}

// Hook personalizado
export function useGerenciarSala() {
  const { sala, atualizarSala } = useContext(SalaContext);
  return { sala, atualizarSala };
}
```

---

## 8. Erros Comuns a Evitar

- Usar nomes em inglês quando há equivalente claro em português.
- Criar arquivos ou funções fora das pastas definidas (`/modules`, `/components`, `/contexts`).
- Esquecer validação Zod em formulários.
- Omitir estados de carregamento e erro em componentes que dependem de dados assíncronos.

---

## 9. Padrões de Commits e Pull Requests

### 9.1. Idioma e Estilo

- Todas as mensagens de commit devem ser escritas em **português**.
- Evitar abreviações ou termos ambíguos.
- As mensagens devem ser claras e descrever **a intenção da mudança**, não apenas o que foi feito.

### 9.2. Padrão de Commit (Conventional Commits)

Seguir o formato:

```
<tipo>(escopo): descrição
```

Exemplos:

```
feat(sala): adicionar botão para iniciar votação
fix(projeto): corrigir erro ao carregar lista de histórias
refactor(contexto): simplificar lógica de atualização de sala
docs: atualizar instruções para assistente de IA
```

**Tipos comuns:**

- `feat`: nova funcionalidade
- `fix`: correção de bug
- `refactor`: melhoria de código sem alterar comportamento
- `docs`: alterações em documentação
- `style`: ajustes de formatação, nomeação ou estilo
- `test`: inclusão ou ajuste de testes
- `chore`: manutenção geral (dependências, scripts, etc)

### 9.3. Pull Requests

- O título e a descrição do PR devem estar em português.
- Cada PR deve focar em uma **única feature, correção ou melhoria**.
- Sempre descrever o **motivo da mudança** e **impactos esperados**.
- Referenciar issues ou tarefas relacionadas, se aplicável.

---

## 10. Resumo das Instruções

| Categoria     | Diretriz                                                  |
| ------------- | --------------------------------------------------------- |
| Idioma        | Sempre português                                          |
| Nomeação      | Funções e variáveis em português (exceto termos técnicos) |
| Estilo        | camelCase e PascalCase                                    |
| Estrutura     | Seguir pastas e padrões do app21                          |
| Validação     | Usar Zod                                                  |
| Banco         | Prisma + Migrations                                       |
| Autenticação  | Supabase                                                  |
| Estado        | Contexts e Hooks                                          |
| Comentários   | Em português e explicativos                               |
| Commits       | Seguir Conventional Commits em português                  |
| Pull Requests | Um objetivo por PR, descrição clara                       |
