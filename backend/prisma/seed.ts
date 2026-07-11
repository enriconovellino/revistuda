import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? '',
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando a semeadura do banco de dados...');

  // Limpar dados anteriores (users antes de turmas por causa do FK turma_id)
  await prisma.conteudo.deleteMany({});
  await prisma.atividade.deleteMany({});
  await prisma.licao.deleteMany({});
  await prisma.modulo.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.turma.deleteMany({});

  const defaultPasswordHash = await bcrypt.hash('123456', 10);

  console.log('👥 Criando usuários de teste (Senha padrão: 123456)...');
  await prisma.user.create({
    data: {
      nome: 'Administrador ReviStuda',
      email: 'admin@revistuda.com.br',
      senha: defaultPasswordHash,
      permissions: ['ADM'],
      approved: true,
    },
  });

  const professor = await prisma.user.create({
    data: {
      nome: 'Professor Carlos',
      email: 'professor@revistuda.com.br',
      senha: defaultPasswordHash,
      permissions: ['PROFESSOR'],
      approved: true,
    },
  });

  console.log('🏫 Criando turmas...');
  const turmaA = await prisma.turma.create({
    data: {
      nome_turma: 'Turma A - Ensino Fundamental',
      descricao_turma: 'Alunos do 5º ano matutino.',
      capacidade_maxima: 30,
      professor_id: professor.id,
    },
  });

  const turmaB = await prisma.turma.create({
    data: {
      nome_turma: 'Turma B - Inclusão Digital (EJA)',
      descricao_turma: 'Alunos do Ensino de Jovens e Adultos no período noturno.',
      capacidade_maxima: 20,
      professor_id: professor.id,
    },
  });

  console.log('🎓 Criando alunos vinculados às turmas...');
  const maria = await prisma.user.create({
    data: {
      nome: 'Maria Souza',
      email: 'maria@revistuda.com.br',
      senha: defaultPasswordHash,
      permissions: ['ALUNO_IDOSO'],
      approved: true,
      turma_id: turmaA.turma_id,
    },
  });

  const joao = await prisma.user.create({
    data: {
      nome: 'João Silva',
      email: 'joao@revistuda.com.br',
      senha: defaultPasswordHash,
      permissions: ['ALUNO_IDOSO'],
      approved: true,
      turma_id: turmaA.turma_id,
    },
  });

  const ana = await prisma.user.create({
    data: {
      nome: 'Ana Costa',
      email: 'ana@revistuda.com.br',
      senha: defaultPasswordHash,
      permissions: ['ALUNO_IDOSO'],
      approved: true,
      turma_id: turmaB.turma_id,
    },
  });

  await prisma.user.create({
    data: {
      nome: 'Pedro Lima',
      email: 'pedro@revistuda.com.br',
      senha: defaultPasswordHash,
      permissions: ['ALUNO_IDOSO'],
      approved: true,
      turma_id: turmaB.turma_id,
    },
  });

  console.log('📚 Criando módulos...');
  const moduloMatematica = await prisma.modulo.create({
    data: {
      titulo_modulo: 'Matemática Básica',
      descricao_modulo: 'Estudo de operações fundamentais e lógica matemática.',
      dificuldade: 'Fácil',
      turma_id: turmaA.turma_id,
    },
  });

  const moduloLeitura = await prisma.modulo.create({
    data: {
      titulo_modulo: 'Introdução à Leitura',
      descricao_modulo: 'Alfabetização e interpretação de textos simples.',
      dificuldade: 'Fácil',
      turma_id: turmaA.turma_id,
    },
  });

  const moduloHistoria = await prisma.modulo.create({
    data: {
      titulo_modulo: 'História do Brasil',
      descricao_modulo: 'Principais eventos históricos desde a colonização até a república.',
      dificuldade: 'Médio',
      turma_id: turmaB.turma_id,
    },
  });

  console.log('📖 Criando lições...');
  const licaoMatematica = await prisma.licao.create({
    data: {
      titulo_licao: 'Lição 1 - Adição e Subtração',
      comentario: 'Fundamentos básicos da matemática.',
      modulo_id: moduloMatematica.modulo_id,
    },
  });

  const licaoLeitura = await prisma.licao.create({
    data: {
      titulo_licao: 'Lição 1 - Leitura Inicial',
      comentario: 'Incentivo à leitura infantil.',
      modulo_id: moduloLeitura.modulo_id,
    },
  });

  const licaoHistoria = await prisma.licao.create({
    data: {
      titulo_licao: 'Lição 1 - Brasil Colônia',
      comentario: 'Introdução à história colonial.',
      modulo_id: moduloHistoria.modulo_id,
    },
  });

  console.log('📝 Criando conteúdos...');
  await prisma.conteudo.createMany({
    data: [
      {
        nome_conteudo: 'Vídeo: Somar e Subtrair',
        tipo_conteudo: 'Vídeo',
        url_conteudo: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        texto_conteudo: 'Neste vídeo vamos aprender os conceitos fundamentais de soma e subtração.',
        licao_id: licaoMatematica.licao_id,
      },
      {
        nome_conteudo: 'Leitura: O Sítio do Pica-Pau Amarelo',
        tipo_conteudo: 'Texto',
        texto_conteudo: 'Texto clássico infantil para incentivar e treinar a leitura fluida.',
        licao_id: licaoLeitura.licao_id,
      },
      {
        nome_conteudo: 'Podcast: A Revolução de 1930',
        tipo_conteudo: 'Áudio',
        url_conteudo: 'https://exemplo.com/podcast-revolucao-1930.mp3',
        texto_conteudo: 'Áudio explicativo sobre os antecedentes e consequências do movimento de 1930 no Brasil.',
        licao_id: licaoHistoria.licao_id,
      },
    ],
  });

  console.log('🎯 Criando atividades...');
  const atividadeAdicao = await prisma.atividade.create({
    data: {
      titulo_atividade: 'Prática de Adição',
      tipo_atividade: 'multipla_escolha',
      enunciado: 'Quanto é 2 + 2?',
      licao_id: licaoMatematica.licao_id,
      multipla_escolha: {
        create: {
          opcoes: {
            create: [
              { letra: 'a', texto_opcao: '3', correta: false },
              { letra: 'b', texto_opcao: '4', correta: true },
              { letra: 'c', texto_opcao: '5', correta: false },
              { letra: 'd', texto_opcao: '6', correta: false },
            ],
          },
        },
      },
    },
    include: {
      multipla_escolha: { include: { opcoes: true } },
    },
  });

  const atividadeLeitura = await prisma.atividade.create({
    data: {
      titulo_atividade: 'Exercício de Interpretação',
      tipo_atividade: 'multipla_escolha',
      enunciado: 'Quem escreveu O Sítio do Pica-Pau Amarelo?',
      licao_id: licaoLeitura.licao_id,
      multipla_escolha: {
        create: {
          opcoes: {
            create: [
              { letra: 'a', texto_opcao: 'Monteiro Lobato', correta: true },
              { letra: 'b', texto_opcao: 'Machado de Assis', correta: false },
              { letra: 'c', texto_opcao: 'Clarice Lispector', correta: false },
            ],
          },
        },
      },
    },
    include: {
      multipla_escolha: { include: { opcoes: true } },
    },
  });

  const opcoesAdicao = atividadeAdicao.multipla_escolha!.opcoes;
  const opcoesLeitura = atividadeLeitura.multipla_escolha!.opcoes;

  const opcaoAdicaoCorreta = opcoesAdicao.find((o) => o.correta)!;
  const opcaoAdicaoErrada = opcoesAdicao.find((o) => !o.correta)!;
  const opcaoLeituraCorreta = opcoesLeitura.find((o) => o.correta)!;
  const opcaoLeituraErrada = opcoesLeitura.find((o) => !o.correta)!;

  console.log('📊 Criando respostas de desempenho...');
  // Maria: 1 acerto + 1 erro
  await prisma.respostaMultiplaEscolha.createMany({
    data: [
      { aluno_id: maria.id, resposta_aluno_id: opcaoAdicaoCorreta.opcao_id },
      { aluno_id: maria.id, resposta_aluno_id: opcaoLeituraErrada.opcao_id },
      // João: 2 acertos
      { aluno_id: joao.id, resposta_aluno_id: opcaoAdicaoCorreta.opcao_id },
      { aluno_id: joao.id, resposta_aluno_id: opcaoLeituraCorreta.opcao_id },
      // Ana: 1 acerto (atividade da Turma A — ainda conta no desempenho geral do professor)
      { aluno_id: ana.id, resposta_aluno_id: opcaoAdicaoCorreta.opcao_id },
      // Pedro: sem respostas
    ],
  });

  console.log('✅ Semeadura concluída com sucesso!');
  console.log('   Professor: professor@revistuda.com.br / 123456');
  console.log('   Alunos: Maria & João (Turma A), Ana & Pedro (Turma B)');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
