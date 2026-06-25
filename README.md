# 🏫 Plataforma ReviStuda

Uma solução tecnológica baseada em **NestJS** (Backend) e **Angular** (Frontend) desenvolvida para mitigar o baixo desempenho escolar e reduzir a desigualdade no acesso à educação básica na rede pública brasileira.

O projeto foca no **Diagnóstico Educacional**, oferecendo aos professores ferramentas para criação de conteúdos e avaliações direcionadas, enquanto estimula os alunos através de revisões baseadas em repetição espaçada e mecânicas de gamificação.

---

## 🚀 Funcionalidades Principais

### 👨‍🏫 Para Professores
* **Gestão de Conteúdo:** Registro de aulas, upload de resumos e indexação de vídeo-aulas.
* **Gerador de Provas:** Filtro inteligente de questões por matéria, assunto e série.
* **Cronograma de Revisão:** Agendamento automatizado de ciclos de revisão (diária, semanal, mensal e anual) disparados para turmas específicas.
* **Dashboard Analítico:** Monitoramento do progresso estruturado por Escola ➔ Turma ➔ Aluno.

### 🧑‍🎓 Para Alunos
* **Central de Estudos:** Acesso a resumos e materiais compartilhados pelos professores.
* **Módulo de Revisão Ativa:** Fixação do conteúdo com pontuações baseadas em engajamento.
* **Gamificação:** Acúmulo de pontos e conquista de selos internos conforme a constância nos estudos.
* **Histórico de Evolução:** Gráficos de performance e acesso fácil a revisões passadas.

### 👥 Para Responsáveis
* **Acompanhamento:** Visualização direta do desempenho escolar e engajamento das revisões do estudante.

---

## 📂 Estrutura do Projeto

O projeto é dividido em um monorepo simples contendo:
* **`/backend`**: API desenvolvida com NestJS, TypeScript, Prisma ORM e PostgreSQL.
* **`/frontend`**: Interface web desenvolvida com Angular.

---

## 🛠️ Como Iniciar o Projeto Localmente

Siga os passos abaixo na ordem correta para configurar o ambiente de desenvolvimento e executar o projeto sem erros.

### 📋 Pré-requisitos
Antes de começar, certifique-se de possuir instalado em sua máquina:
* [Docker e Docker Compose](https://www.docker.com/) (Essencial para rodar o banco de dados sem configurações complexas)
* [Node.js](https://nodejs.org/) (Versão recomendada: LTS mais recente)
* [npm](https://www.npmjs.com/)

---

### 1️⃣ Inicializando o Banco de Dados (Docker)
Navegue até a pasta do backend (onde está o arquivo `docker-compose.yml` do banco de dados):
```bash
cd backend
```

E execute o comando abaixo para iniciar o container do PostgreSQL em segundo plano:
```bash
docker compose up -d
```
> 💡 *Isso criará uma instância do PostgreSQL rodando na porta `5432` com as credenciais padrão já configuradas para a aplicação.*

Para parar o banco quando terminar de codificar (dentro da pasta `backend`):
```bash
docker compose down
```

---

### 2️⃣ Configurando e Iniciando o Backend
Navegue até o diretório do backend:
```bash
cd backend
```

1. **Instalar as dependências:**
   ```bash
   npm install
   ```

2. **Configuração de Variáveis de Ambiente:**
   Crie ou verifique o arquivo `.env` na pasta `backend/`. As credenciais padrão para conectar ao Docker são:
   ```env
   DATABASE_URL="postgresql://postgres:1978@localhost:5432/revistuda?schema=public"
   JWT_SECRET="revistuda-super-secret-key-2026-very-secure-phrase-here"
   ```

3. **Gerar o Prisma Client e Executar as Migrations:**
   Gere os tipos do Prisma e sincronize o banco de dados local com as migrations pendentes:
   ```bash
   npm run prisma:generate
   npm run migration:run
   ```

4. **Verificar Status das Migrations:**
   Para conferir se existem migrações pendentes ou se o banco local está atualizado em relação às migrações do repositório:
   ```bash
   npm run migration:status
   ```

5. **Popular o Banco de Dados (Seed):**
   Para popular o banco com dados de testes (usuários, turmas, módulos e conteúdos iniciais):
   ```bash
   npm run seed
   ```
   > 👤 *Isso criará os seguintes usuários de teste (todos com a senha padrão `123456`):*
   > * **Administrador:** `admin@revistuda.com.br`
   > * **Professor:** `professor@revistuda.com.br`
   > * **Aluno (Criança):** `lucas@revistuda.com.br`
   > * **Aluno (Idoso):** `maria@revistuda.com.br`

6. **Iniciar o Servidor em Modo de Desenvolvimento:**
   ```bash
   npm run start:dev
   ```
   A API estará disponível em `http://localhost:3000`.

#### 🔄 Criando uma Nova Migration
Caso precise alterar a estrutura do banco (adicionar tabelas, colunas, etc.):
1. Altere o arquivo `backend/prisma/schema.prisma`.
2. Gere e aplique a nova migration localmente rodando:
   ```bash
   npx prisma migrate dev --name nome_da_sua_migration
   ```
3. O Prisma criará os arquivos SQL na pasta `prisma/migrations/` e atualizará automaticamente o seu banco de dados local. Lembre-se de commitar estes arquivos gerados.

---

### 3️⃣ Configurando e Iniciando o Frontend
Em outro terminal, a partir da raiz, navegue até a pasta do frontend:
```bash
cd frontend
```

1. **Instalar as dependências:**
   ```bash
   npm install
   ```

2. **Iniciar o Servidor de Desenvolvimento:**
   ```bash
   npm run start
   ```
   O frontend Angular estará disponível em `http://localhost:4200`.

---

## 🧼 Boas Práticas e Clean Code

Para manter a base de código escalável, legível e de fácil manutenção, todos os colaboradores devem seguir as diretrizes abaixo:

### 🧩 Arquitetura Limpa (Clean Architecture)
No backend, o código é estruturado de forma modular (`src/modules/`), seguindo a separação de conceitos:
* **Domain (Domínio):** Regras de negócio puras (entidades, casos de uso, interfaces/ports). Livre de frameworks.
* **Application (Aplicação):** Orquestração dos casos de uso, DTOs e presenters.
* **Infrastructure (Infraestrutura):** Implementações concretas de banco de dados (repositórios Prisma), serviços externos, etc.
* **Presentation (Apresentação):** Controladores REST (NestJS) que expõem os endpoints da API.

### 📐 Princípios SOLID e Clean Code
1. **Responsabilidade Única (SRP):** Cada classe, arquivo ou função deve ter apenas uma razão para mudar. Evite arquivos gigantescos com múltiplas responsabilidades.
2. **Nomes Significativos:** Use variáveis, funções e classes com nomes descritivos em inglês (ou português, seguindo o padrão atual do arquivo editado). Evite abreviações confusas.
3. **Funções Pequenas:** Funções devem fazer apenas uma coisa e fazê-la bem.
4. **Tratamento de Erros:** Sempre trate exceções de forma adequada e limpa utilizando exceções customizadas do NestJS (`HttpException`, `BadRequestException`, etc.).

### 🤝 Convenções de Commits (Conventional Commits)
Utilize commits semânticos para manter o histórico de alterações legível:
* `feat:` Uma nova funcionalidade.
* `fix:` Correção de um bug.
* `docs:` Alterações na documentação.
* `style:` Formatação de código (espaços, ponto e vírgula, etc.) sem alteração lógica.
* `refactor:` Alteração que não corrige bug nem adiciona funcionalidade, mas melhora a estrutura do código.
* `chore:` Atualizações de build, pacotes, etc.
