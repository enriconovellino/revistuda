import { SafeResourceUrl } from '@angular/platform-browser';

export interface Conteudo {
    conteudo_id: number;
    nome_conteudo: string;
    tipo_conteudo: string;
    url_conteudo?: string | null;
    texto_conteudo?: string | null;
    licao_id: number;
    safeUrl?: SafeResourceUrl | null;
}
