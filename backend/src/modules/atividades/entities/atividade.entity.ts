import { stringify } from "querystring";

export class Atividade {
    id!: number;
    titulo_atividade!: string;
    descricao_atividade!: string;
    tipo_atividade!: string;
    
    constructor(id: number, titulo_atividade: string, descricao_atividade: string, tipo_atividade: string) {
        this.id = id;
        this.tipo_atividade = titulo_atividade;
        this.descricao_atividade = descricao_atividade;
        this.tipo_atividade = tipo_atividade;
    }
}
