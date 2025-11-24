/**
 * Design System do PlanningHub
 *
 * Arquivo central de padronização visual do aplicativo.
 * Todas as cores, estilos de botões, modais e componentes devem seguir este padrão.
 */

// ============================================
// 🎨 CORES
// ============================================

export const colors = {
  // Gradientes principais
  gradient: {
    primary: 'from-purple-600 to-pink-600',
    primaryHover: 'from-purple-700 to-pink-700',
    secondary: 'from-purple-500 to-pink-500',
    success: 'from-green-500 to-emerald-500',
    danger: 'from-red-500 to-rose-500',
    warning: 'from-orange-500 to-yellow-500',
    info: 'from-blue-500 to-cyan-500',
  },

  // Backgrounds
  bg: {
    primary: 'bg-slate-950',
    secondary: 'bg-slate-900',
    tertiary: 'bg-slate-800',
    card: 'bg-white/5',
    cardHover: 'bg-white/10',
    overlay: 'bg-slate-900/80',
  },

  // Borders
  border: {
    default: 'border-white/10',
    hover: 'border-white/20',
    focus: 'border-purple-500/50',
    active: 'border-white/30',
  },

  // Text colors
  text: {
    primary: 'text-white',
    secondary: 'text-gray-400',
    tertiary: 'text-gray-500',
    muted: 'text-gray-600',
    accent: 'text-purple-400',
    success: 'text-green-400',
    danger: 'text-red-400',
    warning: 'text-yellow-400',
  },

  // Status colors
  status: {
    active: 'bg-green-500',
    inactive: 'bg-gray-500',
    pending: 'bg-yellow-500',
    error: 'bg-red-500',
  },
};

// ============================================
// 🔘 BOTÕES
// ============================================

export const buttons = {
  // Botão Primário (Purple/Pink gradient)
  primary: `
    bg-gradient-to-r ${colors.gradient.primary}
    hover:${colors.gradient.primaryHover}
    active:scale-95
    rounded-xl px-6 py-3
    transition-all
    disabled:opacity-50 disabled:cursor-not-allowed
  `
    .replace(/\s+/g, ' ')
    .trim(),

  // Botão Secundário (Glass effect)
  secondary: `
    bg-white/5
    hover:bg-white/10
    active:scale-95
    rounded-xl px-6 py-3
    ${colors.border.default}
    border
    transition-all
    disabled:opacity-50 disabled:cursor-not-allowed
  `
    .replace(/\s+/g, ' ')
    .trim(),

  // Botão Ghost (Transparente)
  ghost: `
    bg-transparent
    hover:bg-white/5
    active:scale-95
    rounded-xl px-4 py-2
    transition-all
  `
    .replace(/\s+/g, ' ')
    .trim(),

  // Botão Danger (Vermelho)
  danger: `
    bg-red-600/20
    hover:bg-red-600/30
    active:scale-95
    rounded-xl px-6 py-3
    ${colors.text.danger}
    transition-all
    disabled:opacity-50 disabled:cursor-not-allowed
  `
    .replace(/\s+/g, ' ')
    .trim(),

  // Botão Success (Verde)
  success: `
    bg-green-600/20
    hover:bg-green-600/30
    active:scale-95
    rounded-xl px-6 py-3
    ${colors.text.success}
    transition-all
    disabled:opacity-50 disabled:cursor-not-allowed
  `
    .replace(/\s+/g, ' ')
    .trim(),

  // Botão pequeno
  sm: {
    primary: `
      bg-gradient-to-r ${colors.gradient.primary}
      hover:${colors.gradient.primaryHover}
      active:scale-95
      rounded-lg px-4 py-2 text-sm
      transition-all
      disabled:opacity-50 disabled:cursor-not-allowed
    `
      .replace(/\s+/g, ' ')
      .trim(),

    secondary: `
      bg-white/5
      hover:bg-white/10
      active:scale-95
      rounded-lg px-4 py-2 text-sm
      ${colors.border.default}
      border
      transition-all
    `
      .replace(/\s+/g, ' ')
      .trim(),
  },

  // Botão de ícone
  icon: `
    flex h-9 w-9 items-center justify-center
    bg-white/5
    hover:bg-white/10
    active:scale-95
    rounded-xl
    transition-all
  `
    .replace(/\s+/g, ' ')
    .trim(),
};

// ============================================
// 💬 MODAIS / DIALOGS
// ============================================

export const modal = {
  // Container do modal
  container: `
    border-white/20 bg-slate-900 text-white
    max-w-md
  `
    .replace(/\s+/g, ' ')
    .trim(),

  // Container grande
  containerLg: `
    border-white/20 bg-slate-900 text-white
    max-w-2xl
  `
    .replace(/\s+/g, ' ')
    .trim(),

  // Header do modal
  header: `
    border-b ${colors.border.default} p-6
  `
    .replace(/\s+/g, ' ')
    .trim(),

  // Footer do modal
  footer: `
    border-t ${colors.border.default} p-6
    flex items-center justify-end gap-3
  `
    .replace(/\s+/g, ' ')
    .trim(),

  // Content do modal
  content: `
    p-6
  `
    .replace(/\s+/g, ' ')
    .trim(),

  // Overlay
  overlay: `
    bg-black/60 backdrop-blur-sm
  `
    .replace(/\s+/g, ' ')
    .trim(),
};

// ============================================
// 🃏 CARDS
// ============================================

export const card = {
  // Card padrão (glass effect)
  default: `
    ${colors.bg.card}
    backdrop-blur-xl
    border ${colors.border.default}
    rounded-3xl
    overflow-hidden
    transition-all
    active:scale-98
  `
    .replace(/\s+/g, ' ')
    .trim(),

  // Card hover
  hover: `
    hover:${colors.bg.cardHover}
    hover:${colors.border.hover}
  `
    .replace(/\s+/g, ' ')
    .trim(),

  // Card com padding
  padded: `
    p-4
  `
    .replace(/\s+/g, ' ')
    .trim(),
};

// ============================================
// 📝 INPUTS
// ============================================

export const input = {
  // Input padrão
  default: `
    w-full rounded-xl
    ${colors.bg.card}
    ${colors.border.default}
    border
    px-4 py-3
    ${colors.text.primary}
    placeholder:${colors.text.tertiary}
    focus:${colors.border.focus}
    focus:outline-none
    transition-all
  `
    .replace(/\s+/g, ' ')
    .trim(),

  // Label
  label: `
    text-sm ${colors.text.secondary} mb-2 block
  `
    .replace(/\s+/g, ' ')
    .trim(),

  // Error
  error: `
    text-sm ${colors.text.danger} mt-1
  `
    .replace(/\s+/g, ' ')
    .trim(),
};

// ============================================
// 🎯 BADGES
// ============================================

export const badge = {
  // Badge de proprietário
  owner: `
    flex h-5 w-5 items-center justify-center
    rounded-full bg-yellow-500/20
  `
    .replace(/\s+/g, ' ')
    .trim(),

  // Badge de status
  status: {
    active: `
      px-2 py-1 rounded-full text-xs
      bg-green-500/20 ${colors.text.success}
    `
      .replace(/\s+/g, ' ')
      .trim(),

    inactive: `
      px-2 py-1 rounded-full text-xs
      bg-gray-500/20 ${colors.text.secondary}
    `
      .replace(/\s+/g, ' ')
      .trim(),
  },
};

// ============================================
// ⚙️ CONFIGURAÇÕES DE COMPORTAMENTO
// ============================================

export const behavior = {
  // Modais não devem fechar ao clicar fora
  modalProps: {
    onPointerDownOutside: (e: Event) => e.preventDefault(),
    onEscapeKeyDown: (e: Event) => e.preventDefault(),
  },
};

// ============================================
// 🎨 HELPERS
// ============================================

/**
 * Converte as classes do design system para string
 */
export const cn = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Gera cor de avatar consistente baseada em um ID
 */
export const getAvatarColor = (id: string) => {
  const cores = [
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-purple-500',
    'from-pink-500 to-rose-500',
  ];
  const index = id.charCodeAt(0) % cores.length;
  return cores[index];
};

/**
 * Gera iniciais a partir de um nome
 */
export const getInitials = (name: string) => {
  const palavras = name.trim().split(' ');
  if (palavras.length >= 2) {
    return palavras[0][0] + palavras[1][0];
  }
  return name.substring(0, 2);
};
