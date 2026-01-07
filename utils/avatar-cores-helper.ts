/**
 * Gera iniciais do nome (primeiras letras de até 2 palavras)
 */
export const gerarIniciais = (nome: string): string => {
  const palavras = nome.trim().split(' ');
  if (palavras.length >= 2) {
    return (palavras[0][0] + palavras[1][0]).toUpperCase();
  }
  return nome.substring(0, 2).toUpperCase();
};

/**
 * Lista de gradientes variados para avatares
 */
const GRADIENTES_AVATAR = [
  'from-red-500 to-orange-500',
  'from-orange-500 to-yellow-500',
  'from-yellow-500 to-green-500',
  'from-green-500 to-emerald-500',
  'from-emerald-500 to-teal-500',
  'from-teal-500 to-cyan-500',
  'from-cyan-500 to-sky-500',
  'from-sky-500 to-blue-500',
  'from-blue-500 to-indigo-500',
  'from-indigo-500 to-violet-500',
  'from-violet-500 to-purple-500',
  'from-purple-500 to-fuchsia-500',
  'from-fuchsia-500 to-pink-500',
  'from-pink-500 to-rose-500',
  'from-rose-500 to-red-500',
  // Combinações extras
  'from-amber-500 to-orange-600',
  'from-lime-500 to-green-600',
  'from-emerald-500 to-cyan-600',
  'from-sky-500 to-indigo-600',
  'from-violet-500 to-pink-600',
  'from-red-600 to-pink-600',
  'from-yellow-400 to-orange-600',
  'from-green-400 to-teal-600',
  'from-blue-400 to-purple-600',
  'from-pink-400 to-rose-600',
];

/**
 * Gera um hash numérico simples de uma string
 */
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

/**
 * Retorna um gradiente baseado no ID (sempre o mesmo para o mesmo ID)
 */
export const getAvatarGradient = (id: string): string => {
  const hash = hashString(id);
  const index = hash % GRADIENTES_AVATAR.length;
  return GRADIENTES_AVATAR[index];
};

/**
 * Retorna um gradiente baseado no role (para destacar roles especiais)
 */
export const getAvatarGradientPorRole = (
  id: string,
  role: number,
): string => {
  // Dono sempre dourado
  if (role === 0) {
    return 'from-yellow-500 to-orange-500';
  }

  // Admin sempre azul
  if (role === 1) {
    return 'from-blue-500 to-cyan-500';
  }

  // Membros e visitantes: cor aleatória baseada no ID
  return getAvatarGradient(id);
};

/**
 * Retorna cor de fundo sólida aleatória (alternativa ao gradiente)
 */
const CORES_SOLIDAS = [
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-yellow-500',
  'bg-lime-500',
  'bg-green-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-sky-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-purple-500',
  'bg-fuchsia-500',
  'bg-pink-500',
  'bg-rose-500',
];

export const getAvatarCorSolida = (id: string): string => {
  const hash = hashString(id);
  const index = hash % CORES_SOLIDAS.length;
  return CORES_SOLIDAS[index];
};
