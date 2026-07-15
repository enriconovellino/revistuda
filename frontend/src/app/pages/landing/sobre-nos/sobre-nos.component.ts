import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface MembroEquipe {
  nome: string;
  papel: string;
  curso: string;
  instituicao?: string;
  cidade: string;
  uf: string;
  iniciais: string;
  techLead?: boolean;
}

@Component({
  selector: 'app-sobre-nos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sobre-nos.component.html',
  styleUrl: './sobre-nos.component.scss'
})
export class SobreNosComponent {
  equipe: MembroEquipe[] = [
    {
      nome: 'Felipe da Costa Marroni',
      papel: 'Tech Lead',
      curso: 'Engenharia de Computação e Informação',
      cidade: 'Rio de Janeiro',
      uf: 'RJ',
      iniciais: 'FM',
      techLead: true
    },
    {
      nome: 'Tainara dos Anjos da Silva',
      papel: 'Desenvolvedora',
      curso: 'Análise e Desenvolvimento de Sistemas',
      cidade: 'Brasília',
      uf: 'DF',
      iniciais: 'TA'
    },
    {
      nome: 'Enrico Novellino',
      papel: 'Desenvolvedor',
      curso: 'Ciência da Computação',
      instituicao: 'Unifor',
      cidade: 'Fortaleza',
      uf: 'CE',
      iniciais: 'EN'
    },
    {
      nome: 'Pedro Felipe Alves Bezerra',
      papel: 'Desenvolvedor',
      curso: 'Ciência da Computação',
      instituicao: 'UFCG',
      cidade: 'Campina Grande',
      uf: 'PB',
      iniciais: 'PF'
    }
  ];
}
