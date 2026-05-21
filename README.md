# 🏫 Plataforma ReviStuda

Uma solução tecnológica baseada em **NestJS** e **TypeScript** desenvolvida para mitigar o baixo desempenho escolar e reduzir a desigualdade no acesso à educação básica (Ensino Fundamental e Médio) na rede pública brasileira.

O projeto foca no **Diagnóstico Educacional**, oferecendo aos professores ferramentas para criação de conteúdos e avaliações direcionadas, enquanto estimula os alunos através de revisões baseadas em repetição espaçada e mecânicas de gamificação.

---

## 🛑 O Problema

1. **Baixo desempenho em avaliações:** Indicadores nacionais e internacionais (como o PISA) apontam rendimento insatisfatório de estudantes em leitura, matemática e ciências. ([Fonte: INEP](https://www.gov.br/inep/pt-br/centrais-de-conteudo/noticias/acoes-internacionais/pisa-2018-revela-baixo-desempenho-escolar-em-leitura-matematica-e-ciencias-no-brasil)).
2. **Desigualdade no acesso:** Diferenças socioeconômicas e regionais afetam diretamente a permanência do aluno e a qualidade do aprendizado em áreas vulneráveis. ([Fonte: IBGE/Jornal Nacional](https://g1.globo.com/jornal-nacional/noticia/2023/06/07/pesquisa-do-ibge-revela-o-tamanho-da-desigualdade-que-a-educacao-brasileira-ainda-enfrenta.ghtml)).

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
meu-projeto/
├── .env                          # Credenciais reais (Ignorado pelo Git)
├── .env.example                  # Template de credenciais para a equipe
├── .gitignore                    # Arquivos ignorados pelo controle de versão
├── package.json
├── tsconfig.json
├── node_modules/
├── test/                         # Testes automatizados e2e (End-to-End)
│
└── src/
    ├── config/                   # Validação e tipagem de variáveis de ambiente
    │   └── app.config.ts
    │
    ├── common/                   # Recursos transversais compartilhados
    │   ├── decorators/           # Custom decorators (ex: @CurrentUser())
    │   ├── filters/              # Tratamento global de exceções HTTP
    │   └── interceptors/         # Interceptores para formatação de logs/respostas
    │
    ├── database/                 # Camada de Infraestrutura e Persistência
    │   ├── migrations/           # Histórico de alterações do schema do banco
    │   └── data-source.ts        # Configuração do TypeORM para uso via CLI
    │
    ├── modules/                  # Domínios de Negócio (Feature Modules)
    │   ├── auth/                 # Lógica de Autenticação e Controle de Acesso (JWT)
    │   ├── users/                # Gestão de Usuários (Perfis e Vinculações)
    │   ├── projects/             # Gestão de Escolas, Turmas e Matérias
    │   └── tasks/                # Gestão de Aulas, Banco de Questões, Provas e Cronogramas
    │
    ├── app.module.ts             # Orquestrador central (Config, DB e Modules)
    └── main.ts                   # Ponto de entrada (Bootstrapping da API)
