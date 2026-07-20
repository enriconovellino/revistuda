export type NivelDificuldade = 'facil' | 'medio' | 'dificil';

const LABELS: Record<NivelDificuldade, string> = {
  facil: 'Fácil',
  medio: 'Médio',
  dificil: 'Difícil',
};

// Dados antigos gravaram a dificuldade com variações ("Fácil", "fácil", "medio"),
// então a comparação precisa ignorar acento e caixa.
export function nivelDificuldade(valor?: string): NivelDificuldade {
  const normalizado = (valor ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase();
  if (normalizado.startsWith('dif')) return 'dificil';
  if (normalizado.startsWith('med')) return 'medio';
  return 'facil';
}

export function labelDificuldade(valor?: string): string {
  return LABELS[nivelDificuldade(valor)];
}
