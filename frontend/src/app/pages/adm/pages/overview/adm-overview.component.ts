import { Component, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../../../services/users.service';
import { TurmasService } from '../../../../services/turmas.service';
import { ModulosService } from '../../../../services/modulos.service';
import { ConteudosService } from '../../../../services/conteudos.service';
import { detectRole, ROLE_LABELS, AppRole } from '../../../../shared/constants/roles';

@Component({
  selector: 'app-adm-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './adm-overview.component.html',
  styleUrl: './adm-overview.component.css',
})
export class AdmOverviewComponent implements OnInit {
  users = signal<any[]>([]);
  turmas = signal<any[]>([]);
  modulos = signal<any[]>([]);
  conteudos = signal<any[]>([]);
  loading = signal(true);

  roleDistribution = computed(() => {
    const all = this.users();
    const total = all.length || 1;
    const counts: Record<string, number> = { ADM: 0, PROFESSOR: 0, ALUNO_CRIANCA: 0, ALUNO_IDOSO: 0 };
    for (const u of all) {
      const role = detectRole(u.permissions ?? []);
      if (role) counts[role] = (counts[role] ?? 0) + 1;
    }
    return (Object.keys(ROLE_LABELS) as AppRole[]).map((role) => ({
      label: ROLE_LABELS[role],
      count: counts[role] ?? 0,
      pct: Math.round(((counts[role] ?? 0) / total) * 100),
    }));
  });

  constructor(
    private usersService: UsersService,
    private turmasService: TurmasService,
    private modulosService: ModulosService,
    private conteudosService: ConteudosService,
  ) {}

  async ngOnInit() {
    try {
      const [users, turmas, modulos, conteudos] = await Promise.all([
        this.usersService.getAll(),
        this.turmasService.getAll(),
        this.modulosService.getAll(),
        this.conteudosService.getAll(),
      ]);
      this.users.set(users);
      this.turmas.set(turmas);
      this.modulos.set(modulos);
      this.conteudos.set(conteudos);
    } finally {
      this.loading.set(false);
    }
  }
}
