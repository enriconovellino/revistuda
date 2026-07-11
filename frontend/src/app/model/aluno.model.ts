import { Atividade } from './atividade.model';
import { Modulo } from './modulo.model';
import { Licao } from './licao.model';

export interface DashboardData {
  modulos: Modulo[];
  licoes: Licao[];
  atividades: Atividade[];
}
