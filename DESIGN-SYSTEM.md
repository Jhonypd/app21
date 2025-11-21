# 🎨 Design System - PlanningHub

Sistema de design padronizado para o aplicativo PlanningHub.

## 📁 Arquivo Principal

**`/lib/design-system.ts`** - Contém todas as definições de cores, botões, modais, cards e helpers.

---

## 🎨 Cores Padronizadas

### Gradientes Principais

```tsx
// Primário (Purple/Pink) - Usar em botões principais, CTAs
from-purple-600 to-pink-600
hover:from-purple-700 to-pink-700

// Secundário (Purple/Pink mais claro)
from-purple-500 to-pink-500

// Success (Verde)
from-green-500 to-emerald-500

// Danger (Vermelho)
from-red-500 to-rose-500
```

### Backgrounds

```tsx
bg - slate - 950; // Fundo principal da app
bg - slate - 900; // Fundo secundário (modais, cards)
bg - white / 5; // Glass effect (cards, botões)
bg - white / 10; // Glass effect hover
```

### Borders

```tsx
border - white / 10; // Border padrão
border - white / 20; // Border hover
```

### Textos

```tsx
text - white; // Texto principal
text - gray - 400; // Texto secundário
text - gray - 500; // Texto terciário
text - purple - 400; // Texto destaque
```

---

## 🔘 Botões Padronizados

### ✨ Botão Primário (Gradient Purple/Pink)

**Uso:** Ações principais, CTAs, confirmações

```tsx
className =
  "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 active:scale-95 rounded-xl px-6 py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed";
```

**Exemplos:**

- "Criar Sala"
- "Entrar na Sala"
- "Confirmar"
- "Próximo" (no wizard)

---

### 🔳 Botão Secundário (Glass Effect)

**Uso:** Ações secundárias, cancelar

```tsx
className =
  "bg-white/5 hover:bg-white/10 active:scale-95 rounded-xl px-6 py-3 border border-white/10 transition-all";
```

**Exemplos:**

- "Cancelar"
- "Voltar"
- Copiar código

---

### 👻 Botão Ghost (Transparente)

**Uso:** Ações sutis, ícones

```tsx
className =
  "bg-transparent hover:bg-white/5 active:scale-95 rounded-xl px-4 py-2 transition-all";
```

**Exemplos:**

- Ícones de compartilhar
- Botões de menu

---

### ❌ Botão Danger (Vermelho)

**Uso:** Ações destrutivas

```tsx
className =
  "bg-red-600/20 hover:bg-red-600/30 active:scale-95 rounded-xl px-6 py-3 text-red-400 transition-all";
```

**Exemplos:**

- "Excluir"
- "Remover"
- "Sair"

---

### ✅ Botão Success (Verde)

**Uso:** Ações positivas, iniciar

```tsx
className =
  "bg-green-600/20 hover:bg-green-600/30 active:scale-95 rounded-xl px-6 py-3 text-green-400 transition-all";
```

**Exemplos:**

- "Iniciar Sessão"
- "Confirmar"
- Botão Play

---

## 💬 Modais / Dialogs Padronizados

### 📋 Estrutura Padrão

```tsx
<Dialog open={aberto} onOpenChange={(open) => !open && aoFechar()}>
  <DialogContent
    className="bg-slate-900 border-white/20 text-white"
    onPointerDownOutside={(e) => e.preventDefault()} // Não fecha ao clicar fora
    onEscapeKeyDown={(e) => e.preventDefault()} // Não fecha com ESC
  >
    <DialogHeader>
      <DialogTitle>Título do Modal</DialogTitle>
      <DialogDescription>Descrição do modal</DialogDescription>
    </DialogHeader>

    {/* Conteúdo */}
    <div className="p-6">...</div>

    <DialogFooter className="gap-3">
      <Button variant="outline" onClick={aoFechar}>
        Cancelar
      </Button>
      <Button onClick={aoConfirmar}>Confirmar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### ⚠️ Regras Importantes

1. **NÃO usar botão X para fechar** - Apenas botões de ação (Cancelar/Confirmar)
2. **NÃO fechar ao clicar fora** - Usar `onPointerDownOutside={(e) => e.preventDefault()}`
3. **NÃO fechar com ESC** - Usar `onEscapeKeyDown={(e) => e.preventDefault()}`
4. **Sempre ter DialogTitle e DialogDescription** - Para acessibilidade

---

## 🃏 Cards Padronizados

### Card Padrão (Glass Effect)

```tsx
className =
  "bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden transition-all active:scale-98";
```

**Estrutura:**

```tsx
<div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden transition-all active:scale-98">
  {/* Live Indicator (opcional) */}
  {isActive && (
    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500" />
  )}

  <div className="p-4">{/* Conteúdo do card */}</div>
</div>
```

---

## 📝 Inputs Padronizados

```tsx
<Input
  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500"
  placeholder="Digite aqui..."
/>
```

**Label:**

```tsx
<Label className="text-sm text-gray-400">Nome do campo</Label>
```

---

## 🎯 Badges

### Proprietário (Crown)

```tsx
<div className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500/20">
  <Crown className="h-3 w-3 text-yellow-400" />
</div>
```

### Status Ativo

```tsx
<div className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
  Ativo
</div>
```

### Status Inativo

```tsx
<div className="px-2 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400">
  Inativo
</div>
```

---

## 🎨 Helpers Úteis

### Gerar Cor de Avatar

```tsx
import { getAvatarColor } from "@/lib/design-system";

const cor = getAvatarColor(userId);
// Retorna: "from-purple-500 to-pink-500"

<div className={`bg-gradient-to-br ${cor}`}>...</div>;
```

### Gerar Iniciais

```tsx
import { getInitials } from "@/lib/design-system";

const iniciais = getInitials("João Silva");
// Retorna: "JS"

<span>{iniciais}</span>;
```

---

## 📐 Componentes Oficiais

### ✅ Usar Sempre

| Componente        | Arquivo                               | Descrição                |
| ----------------- | ------------------------------------- | ------------------------ |
| CardSala          | `/components/CardSala.tsx`            | Card de sala atualizado  |
| SalaPlanning      | `/components/SalaPlanning.tsx`        | Tela de planning oficial |
| WizardCriarSessao | `/components/wizard-criar-sessao.tsx` | Wizard de 3 steps        |
| MenuPerfil        | `/components/menu-perfil.tsx`         | Menu do avatar           |
| CriarSala         | `/components/CriarSala.tsx`           | Modal criar sala         |
| EntrarSala        | `/components/EntrarSala.tsx`          | Modal entrar sala        |

### ❌ Não Usar (Versões antigas)

- `card-sala-updated.tsx` (usar `CardSala.tsx`)
- `sala-planning-final.tsx` (usar `SalaPlanning.tsx`)
- `dialog-perfil.tsx` (usar `menu-perfil.tsx`)

---

## 🎨 Cores no globals.css

As cores estão padronizadas em `/styles/globals.css`:

```css
--background: #020617; /* slate-950 */
--primary: #9333ea; /* purple-600 */
--card: rgba(255, 255, 255, 0.05); /* white/5 */
--border: rgba(255, 255, 255, 0.1); /* white/10 */
```

---

## ✅ Checklist de Padronização

Ao criar/atualizar componentes, verificar:

- [ ] Botões usam as classes padronizadas do design system
- [ ] Modais não fecham ao clicar fora
- [ ] Modais não têm botão X
- [ ] Modais têm DialogTitle e DialogDescription
- [ ] Cards usam glass effect (bg-white/5)
- [ ] Inputs usam o estilo padronizado
- [ ] Cores seguem o padrão purple/pink
- [ ] Bordas usam white/10 ou white/20
- [ ] Textos secundários usam gray-400

---

## 🔧 Como Usar

### Importar o Design System

```tsx
import { colors, buttons, modal, card, input } from "@/lib/design-system";
```

### Exemplo de Uso

```tsx
// Botão primário
<button className={buttons.primary}>
  Criar Sala
</button>

// Card
<div className={card.default}>
  <div className={card.padded}>
    Conteúdo
  </div>
</div>

// Input
<input className={input.default} placeholder="Digite..." />
```

---

## 📚 Exemplos Práticos

### Modal Completo

```tsx
import { modal, buttons } from "@/lib/design-system";

<Dialog open={open} onOpenChange={(o) => !o && onClose()}>
  <DialogContent
    className={modal.container}
    onPointerDownOutside={(e) => e.preventDefault()}
    onEscapeKeyDown={(e) => e.preventDefault()}
  >
    <DialogHeader>
      <DialogTitle>Criar Nova Sala</DialogTitle>
      <DialogDescription>Digite o nome da sala</DialogDescription>
    </DialogHeader>

    <div className={modal.content}>{/* Conteúdo */}</div>

    <DialogFooter className={modal.footer}>
      <button className={buttons.secondary} onClick={onClose}>
        Cancelar
      </button>
      <button className={buttons.primary} onClick={onCreate}>
        Criar
      </button>
    </DialogFooter>
  </DialogContent>
</Dialog>;
```

---

## 🎯 Resumo das Regras

### 🟣 Botões

- **Primário:** Gradient purple/pink
- **Secundário:** Glass effect (white/5)
- **Danger:** Red com fundo red/20
- **Sempre:** `active:scale-95` para feedback visual

### 💬 Modais

- **Não** fechar ao clicar fora
- **Não** ter botão X
- **Sempre** ter DialogTitle e DialogDescription
- **Fundo:** bg-slate-900

### 🃏 Cards

- **Glass effect:** bg-white/5 backdrop-blur-xl
- **Border:** border-white/10
- **Rounded:** rounded-3xl
- **Hover:** hover:bg-white/10

### 📝 Inputs

- **Background:** bg-white/5
- **Border:** border-white/10
- **Focus:** focus:border-purple-500

---

## 🚀 Onde Encontrar

- **Design System:** `/lib/design-system.ts`
- **Cores CSS:** `/styles/globals.css`
- **Componentes:** `/components/`
- **Documentação:** `/DESIGN-SYSTEM.md` (este arquivo)

---

✨ **Seguir este design system garante consistência visual em todo o app!**
