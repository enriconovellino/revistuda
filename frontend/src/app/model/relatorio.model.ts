export interface MediaPorTurma {
    turmaId: number;
    nome: string;
    media: number | null;
    totalRespostas: number;
}

export interface MediaPorModulo {
    moduloId: number;
    nome: string;
    media: number | null;
    totalRespostas: number;
}

export interface RelatorioOverview {
    totalAlunos: number;
    totalProfessores: number;
    totalModulos: number;
    totalLicoes: number;
    totalAtividadesRespondidas: number;
    mediaPorTurma: MediaPorTurma[];
    mediaPorModulo: MediaPorModulo[];
}