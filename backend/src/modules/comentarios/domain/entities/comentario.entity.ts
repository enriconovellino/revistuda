export class Comentario {
  id!: number;
  texto!: string;
  alunoId!: number;
  conteudoId!: number;
  createdAt!: Date;
  updatedAt!: Date;
 
  constructor(
    id: number,
    texto: string,
    alunoId: number,
    conteudoId: number,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.texto = texto;
    this.alunoId = alunoId;
    this.conteudoId = conteudoId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}