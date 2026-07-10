import { Component, OnInit, computed, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { TurmaService } from '../../../services/turma.service';
import { Turma, Usuario } from '../../../model/professor.models';
import { AdmView } from '../adm.component';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.scss'
})
export class DashboardAdminComponent implements OnInit {
  irPara = output<AdmView>();

  private userService = inject(UserService);
  private turmaService = inject(TurmaService);

  loading = signal<boolean>(false);
  users = signal<Usuario[]>([]);
  turmas = signal<Turma[]>([]);

  pendingProfessors = computed(() =>
    this.users().filter((u) => u.permissions.includes('PROFESSOR') && !u.approved)
  );

  totalProfessores = computed(() =>
    this.users().filter((u) => u.permissions.includes('PROFESSOR') && u.approved).length
  );

  totalAlunos = computed(() =>
    this.users().filter((u) => u.permissions.includes('ALUNO_IDOSO') || u.permissions.includes('ALUNO_CRIANCA')).length
  );

  turmasSemProfessor = computed(() => this.turmas().filter((t) => !t.professor_id));

  turmasLotadas = computed(() =>
    this.turmas().filter((t) => t.capacidade_maxima != null && (t.totalAlunos ?? 0) >= t.capacidade_maxima)
  );

  vagasDisponiveis = computed(() =>
    this.turmas().reduce((soma, t) => {
      if (t.capacidade_maxima == null) return soma;
      return soma + Math.max(0, t.capacidade_maxima - (t.totalAlunos ?? 0));
    }, 0)
  );

  async ngOnInit() {
    this.loading.set(true);
    try {
      const [users, turmas] = await Promise.all([this.userService.getUsers(), this.turmaService.getTurmas()]);
      this.users.set(users);
      this.turmas.set(turmas);
    } finally {
      this.loading.set(false);
    }
  }

  ocupacaoPercentual(turma: Turma): number {
    if (!turma.capacidade_maxima) return 0;
    const percentual = ((turma.totalAlunos ?? 0) / turma.capacidade_maxima) * 100;
    return Math.min(100, Math.round(percentual));
  }
}
