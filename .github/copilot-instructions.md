# AI Coding Assistant / Copilot Instructions — app21

Este documento define as diretrizes para o uso de assistentes de IA (como GitHub Copilot, ChatGPT ou outros) dentro do projeto **app21**, uma aplicação Next.js para gerenciamento de Planning Poker, garantindo consistência no estilo, idioma e arquitetura do código.

## Arquitetura e Estrutura

### Tecnologias Principais

- **Framework**: Next.js 14+ com App Router
- **Database**: PostgreSQL + Prisma ORM
- **Autenticação**: Supabase
- **Estilização**: Tailwind CSS + Shadcn/UI
- **Tempo Real**: WebSockets para salas de Planning Poker

### Estrutura de Diretórios

- `/app` - Rotas e páginas Next.js
- `/components` - Componentes React reutilizáveis
- `/contexts` - Contextos React (ex: `SalaContext`)
- `/lib` - Configurações de bibliotecas (Prisma, Supabase)
- `/hooks` - Hooks personalizados
- `/data` - Funções de acesso a dados
- `/prisma` - Schema e migrações do banco de dados

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

### Formulários e Validação

- **Zod Schema:**
  ```ts
  // schema.ts
  export const equipeFormSchema = z.object({
    nome: z
      .string()
      .min(1, 'O nome da equipe é obrigatório')
      .max(100, 'O nome deve ter no máximo 100 caracteres'),
    inativo: z.boolean().default(false),
  });
  ```
- Utilizar `components/forms/basic-form.tsx` como base
- Implementar funções de conversão para dados do formulário:
  ```ts
  export const convertFormToCreateData = (
    formData: EquipeFormValues,
  ): CreateEquipeData => ({
    nome: formData.nome,
  });
  ```

### Componentes UI

- **Localização**: `components/[categoria]/`
- **Nomenclatura**: PascalCase (ex: `ListaDeHistorias.tsx`)
- **Gradientes e Estilos**:
  ```tsx
  className={cn(
    "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500",
    "hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600"
  )}
  ```

### Tabelas e Listagens

- Utilizar `components/table/data-table.tsx` como base
- Definir interfaces para colunas:
  ```ts
  export interface ColumnsEquipesTable {
    id: string;
    editar: React.ReactNode;
    nome: string;
    administrador: string;
    integrantes: React.ReactNode;
    projetos: React.ReactNode;
    inativo: 'ativo' | 'inativo';
  }
  ```

### Contextos e Estado

- **Localização**: `/contexts`
- **Padrão**: Baseado no `SalaContext.tsx`
- **Tempo Real**: WebSocket para atualizações em tempo real
- **Autenticação**: Hook `useAuth()` para acesso ao usuário

---

## 4. Banco de Dados e Prisma

### Schema e Migrações

- Definir modelos em `prisma/schema.prisma`
- Executar migrações:
  ```bash
  npx prisma migrate dev --name [nome-da-migracao]
  ```

### Entidades Principais

- **Pessoa**: Usuários e participantes
- **Equipe**: Grupos de trabalho
- **Projeto**: Projetos associados às equipes
- **Sala**: Salas de Planning Poker
- **Historia**: Histórias para estimativa

### Padrões de Acesso

```ts
// Exemplo de query com relacionamentos
const salas = await prismaClient.sala.findMany({
  where: {
    OR: [
      { criado_por: userId },
      {
        participantes: {
          some: { pessoa_id: userId },
        },
      },
    ],
  },
  select: {
    id: true,
    codigo: true,
    participantes: {
      select: { pessoa_id: true },
    },
  },
});
```

## 5. Autenticação e APIs

### Supabase Auth

- **Configuração**: `lib/supabase.ts`
- **Hook de Autenticação**:
  ```ts
  const { isAuthenticated, user } = useAuth();
  ```
- **Rotas Protegidas**: Middleware para verificação de autenticação

### APIs RESTful

- **Estrutura**: `/app/api/[recurso]/route.ts`
- **Padrão de Resposta**:
  ```ts
  return NextResponse.json(data, { status: 200 });
  ```
- **Headers de Autenticação**:
  ```ts
  const userId = req.headers.get('x-user-id');
  ```

### WebSockets (Tempo Real)

- **Contexto**: `SalaContext` para estado em tempo real
- **Eventos**: Atualizações de votação e participantes
- **Padrão de Sala**:
  ```ts
  interface Sala {
    id: string;
    codigo: number;
    titulo: string;
    protegida: boolean;
    totalParticipantes: number;
    totalVotos: number;
  }
  ```

---

## 6. Padrões de Implementação

### Componentes de UI

```tsx
// Botão com Gradiente
<Button
  variant="primary"
  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
>
  <LogIn className="h-4 w-4" />
  Entrar
</Button>

// Card com Gradiente
<Card className="bg-gradient-card border-border shadow-card">
  <CardHeader>
    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2">
      <GiCardRandom className="h-6 w-6 text-white" />
    </div>
  </CardHeader>
</Card>
```

### Server Actions e APIs

```ts
// Server Action para autenticação
export async function login(formData: FormData) {
  const supabase = await createClientServer();
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  });

  if (error) {
    redirect(
      '/error?message=' + encodeURIComponent(error.message),
    );
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

// API Route com Prisma
export async function GET(
  req: Request,
): Promise<NextResponse> {
  const userId = req.headers.get('x-user-id');

  if (!userId) {
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 },
    );
  }

  const data = await prismaClient.sala.findMany({
    where: { criado_por: userId },
  });

  return NextResponse.json(data);
}
```

### Estados de Loading e Erro

````tsx
export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <div>Acesso não autorizado</div>;
  }

  return (
    <div className="container mx-auto">
      {/* Conteúdo */}
    </div>
  );
}

---

## 7. Exemplos de Implementação

### Componentes React
```tsx
// Planning Poker Card Component
export function PlanningPokerCard({
  valor,
  selecionado,
  onSelecionar,
}: {
  valor: string;
  selecionado: boolean;
  onSelecionar: () => void;
}) {
  return (
    <Card
      onClick={onSelecionar}
      className={cn(
        "cursor-pointer transition-transform",
        "hover:scale-105 active:scale-95",
        selecionado && "ring-2 ring-primary"
      )}
    >
      <CardContent>
        <span className="text-2xl font-bold">{valor}</span>
      </CardContent>
    </Card>
  );
}

// Modal com Formulário
export function ModalCriarSala() {
  const form = useForm<SalaFormValues>({
    resolver: zodResolver(salaFormSchema),
    defaultValues: {
      titulo: '',
      privada: false
    }
  });

  return (
    <Dialog>
      <DialogContent>
        <BasicForm
          form={form}
          onSubmit={handleSubmit}
        >
          <FormField
            control={form.control}
            name="titulo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título da Sala</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </BasicForm>
      </DialogContent>
    </Dialog>
  );
}
````

### Hooks e Contextos

```tsx
// Hook de Autenticação
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading, isAuthenticated: !!user };
}

// Contexto de Sala
export const SalaContext = createContext<SalaContextType>(
  {} as SalaContextType,
);

export function SalaProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [sala, setSala] = useState<Sala | null>(null);
  const [participantes, setParticipantes] = useState<
    Participante[]
  >([]);

  // Implementar WebSocket e lógica de estado aqui...

  return (
    <SalaContext.Provider
      value={{
        sala,
        participantes,
        atualizarSala,
        adicionarParticipante,
        removerParticipante,
      }}
    >
      {children}
    </SalaContext.Provider>
  );
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
