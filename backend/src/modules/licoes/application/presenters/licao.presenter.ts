import { Licao } from '../../domain/entities/licao.entity';

export class LicaoPresenter {
  static toPresentation(licao: Licao) {
    return {
      licao_id: licao.licao_id,
      titulo_licao: licao.titulo_licao,
      comentario: licao.comentario || null,
      modulo_id: licao.modulo_id,
    };
  }

  static toCollection(licoes: Licao[]) {
    return licoes.map((licao) => this.toPresentation(licao));
  }
}
