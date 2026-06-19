import { stringify } from "querystring";

export class Atividade {
    id!: number;
    titulo_atividade!: string;
    descricao_atividade!: string;
    tipo_atividade!: string;
    pergunta!: string;
    resposta_correta!: string;
    licao_id!: number;
    
    constructor(id: number, titulo_atividade: string, descricao_atividade: string, tipo_atividade: string, pergunta: string, resposta_correta: string, licao_id: number) {
        this.id = id;
        this.titulo_atividade = titulo_atividade;
        this.descricao_atividade = descricao_atividade;
        this.tipo_atividade = tipo_atividade;
        this.pergunta = pergunta;
        this.resposta_correta = resposta_correta;
        this.licao_id = licao_id;
    }
}
