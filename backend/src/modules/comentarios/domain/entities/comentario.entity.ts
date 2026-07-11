export class Comentario {
  id!: number;
  texto!: string;
  alunoId!: number;
  conteudoId!: number;
  createdAt!: Date;
  updatedAt!: Date;
  resposta?: string | null;
  respostaAt?: Date | null;

  constructor(
    id: number,
    texto: string,
    alunoId: number,
    conteudoId: number,
    createdAt: Date,
    updatedAt: Date,
    resposta?: string | null,
    respostaAt?: Date | null,
  ) {
    this.id = id;
    this.texto = texto;
    this.alunoId = alunoId;
    this.conteudoId = conteudoId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.resposta = resposta;
    this.respostaAt = respostaAt;
  }
}