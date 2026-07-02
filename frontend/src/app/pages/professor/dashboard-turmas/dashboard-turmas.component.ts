import { Component, inject, OnInit, output, signal } from '@angular/core';
import { ProfessorService } from '../../../services/professor.service';
import { Turma } from '../../../model/professor.models';

@Component({
  selector: 'app-dashboard-turmas',
  standalone: true,
  imports: [],
  templateUrl: './dashboard-turmas.component.html',
  styleUrl: './dashboard-turmas.component.css',
})
export class DashboardTurmas implements OnInit {

  private professorService = inject(ProfessorService);

  turmas = signal<Turma[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  mostrarForma = signal(false);
  salvando = signal(false);
  erroForm = signal<string | null>(null);
  nomeTurma = '';
  descricaoTurma = '';
  capacidadeMaxima: number | null = null;

  turmasSelecionadas = output<Turma>();


  async carregarTurmas() {
    try {
      this.loading.set(true);
      const turmas = await this.professorService.getTurmas();
      this.turmas.set(turmas);
    }
    catch (error: unknown) {
      this.error.set('Erro ao carregar turmas');
    }
    finally {
      this.loading.set(false);
    }
  }

  toggleForm() {
    this.mostrarForma.set(!this.mostrarForma());
    this.erroForm.set(null);
    this.nomeTurma = '';
    this.descricaoTurma = '';
    this.capacidadeMaxima = null;
  }

  

  async ngOnInit() {
    await this.carregarTurmas();
  }

}
