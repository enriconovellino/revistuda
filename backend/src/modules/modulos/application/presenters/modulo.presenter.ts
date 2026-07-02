import { Modulo } from '../../domain/entities/modulo.entity';

export class ModuloPresenter{
  modulo_id!: number;
  titulo_modulo!: string;
  descricao_id?: string;
  dificuldade!: string ;

  static toPresentation(modulo: Modulo): ModuloPresenter{
    const presenter = new ModuloPresenter();
    presenter.modulo_id= modulo.modulo_id;
    presenter.titulo_modulo= modulo.titulo_modulo;
    presenter.descricao_id= modulo.descricao_modulo;
    presenter.dificuldade= modulo.dificuldade;
    return presenter;
  }
 static toCollection(modulos: Modulo[]): ModuloPresenter[]{
  return modulos.map((m) => this.toPresentation(m));
 }
}