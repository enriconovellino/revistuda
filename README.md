# 🏫 Plataforma ReviStuda

Uma solução tecnológica baseada em **NestJS** e **TypeScript** desenvolvida para mitigar o baixo desempenho escolar e reduzir a desigualdade no acesso à educação básica (Ensino Fundamental e Médio) na rede pública brasileira.

O projeto foca no **Diagnóstico Educacional**, oferecendo aos professores ferramentas para criação de conteúdos e avaliações direcionadas, enquanto estimula os alunos através de revisões baseadas em repetição espaçada e mecânicas de gamificação.

---

## 🚀 Funcionalidades Principais (Plano Principal)

### 👨🏫 Para Professores
* **Gestão de Conteúdo:** Registro de aulas, upload de resumos e indexação de vídeo-aulas.
* **Gerador de Provas:** Filtro inteligente de questões por matéria, assunto e série. *(Roadmap: Integração com LLM para IA Generativa de questões)*.
* **Cronograma de Revisão:** Agendamento automatizado de ciclos de revisão (diária, semanal, mensal e anual) disparados para turmas específicas.
* **Dashboard Analítico:** Monitoramento do progresso estruturado por Escola ➔ Turma ➔ Aluno.

### 🧑🎓 Para Alunos
* **Central de Estudos:** Acesso a resumos e materiais compartilhados pelos professores.
* **Módulo de Revisão Ativa:** Fixação do conteúdo com pontuações focadas em engajamento (não computadas como nota punitiva).
* **Gamificação:** Acúmulo de pontos e conquista de selos internos conforme a constância nos estudos.
* **Histórico de Evolução:** Gráficos de performance e acesso fácil a revisões passadas.

### 👥 Para Responsáveis
* **Acompanhamento:** Visualização direta do desempenho escolar e engajamento das revisões do estudante.

---

## 📂 Estrutura de Pastas do Projeto

O projeto adota a arquitetura modular recomendada pelo NestJS, garantindo escalabilidade e separação de conceitos de domínio:

```text
src/
├── modules/
│   ├── users/
│   │   ├── domain/ (Entity, Ports, Use Cases)
│   │   ├── application/ (DTOs, Presenters)
│   │   ├── infrastructure/ (Repository)
│   │   ├── presentation/ (Controller)
│   │   └── users.module.ts
│   └── auth/
│       ├── infrastructure/ (Guard)
│       └── auth.module.ts
├── shared/ (Interfaces, Decorators)
├── prisma/ (PrismaService, PrismaModule)
└── app.module.ts
    │
    ├── app.module.ts             # Orquestrador central (Config, DB e Modules)
    └── main.ts                   # Ponto de entrada (Bootstrapping da API)
