import { Component, OnInit, computed, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { TurmaService } from '../../../services/turma.service';
import { AtividadeRecente, AtividadeRecenteService } from '../../../services/atividade-recente.service';
import { Usuario } from '../../../model/professor.models';
import { Turma } from '../../../model/turma.model';
import { AdmView } from '../adm.component';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardAdminComponent implements OnInit {
  irPara = output<AdmView>();

  private userService = inject(UserService);
  private turmaService = inject(TurmaService);
  private atividadeRecenteService = inject(AtividadeRecenteService);

  loading = signal<boolean>(false);
  users = signal<Usuario[]>([]);
  turmas = signal<Turma[]>([]);
  atividadesRecentes = signal<AtividadeRecente[]>([]);

  // Feed recolhido por padrão para não poluir o dashboard.
  private readonly atividadesRecolhidas = 5;
  mostrarTodasAtividades = signal<boolean>(false);

  atividadesVisiveis = computed(() =>
    this.mostrarTodasAtividades()
      ? this.atividadesRecentes()
      : this.atividadesRecentes().slice(0, this.atividadesRecolhidas)
  );

  atividadesOcultas = computed(() =>
    Math.max(0, this.atividadesRecentes().length - this.atividadesRecolhidas)
  );

  // Professores e admins recém-cadastrados aguardando aprovação.
  pendingUsers = computed(() => this.users().filter((u) => !u.approved));

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
      const [users, turmas, atividades] = await Promise.all([
        this.userService.getUsers(),
        this.turmaService.getTurmas(),
        this.atividadeRecenteService.getAtividadesRecentes(),
      ]);
      this.users.set(users);
      this.turmas.set(turmas);
      this.atividadesRecentes.set(atividades);
    } finally {
      this.loading.set(false);
    }
  }

  iconeAtividade(tipo: string): string {
    switch (tipo) {
      case 'aluno_cadastrado': return '🎓';
      case 'solicitacao_cadastro': return '📩';
      case 'usuario_aprovado': return '✅';
      case 'professor_designado': return '📌';
      case 'professor_removido': return '⚠️';
      case 'acesso_revogado': return '⛔';
      default: return '🔹';
    }
  }

  tempoRelativo(data: string): string {
    const diffMs = Date.now() - new Date(data).getTime();
    const minutos = Math.floor(diffMs / 60000);
    if (minutos < 1) return 'agora';
    if (minutos < 60) return `há ${minutos} min`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `há ${horas} h`;
    const dias = Math.floor(horas / 24);
    if (dias < 7) return dias === 1 ? 'há 1 dia' : `há ${dias} dias`;
    return new Date(data).toLocaleDateString('pt-BR');
  }

  ocupacaoPercentual(turma: Turma): number {
    if (!turma.capacidade_maxima) return 0;
    const percentual = ((turma.totalAlunos ?? 0) / turma.capacidade_maxima) * 100;
    return Math.min(100, Math.round(percentual));
  }
}
