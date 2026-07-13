import type { Atividade } from './atividade.model';
import type { Modulo } from './modulo.model';
import type { Licao } from './licao.model';

export type { Atividade } from './atividade.model';
export type { Modulo } from './modulo.model';
export type { Licao } from './licao.model';

export interface DashboardData {
  modulos: Modulo[];
  licoes: Licao[];
  atividades: Atividade[];
}