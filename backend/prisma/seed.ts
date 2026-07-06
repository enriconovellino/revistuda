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

  // Limpar dados anteriores de forma segura
  await prisma.conteudo.deleteMany({});
  await prisma.atividade.deleteMany({});
  await prisma.licao.deleteMany({});
  await prisma.modulo.deleteMany({});
  await prisma.turma.deleteMany({});
  await prisma.user.deleteMany({});

  // Criptografar senha padrão para os testes
  const defaultPasswordHash = await bcrypt.hash('123456', 10);

  // 1. Criar Usuários Padrão para cada Perfil
  console.log('👥 Criando usuários de teste (Senha padrão: 123456)...');
  await prisma.user.create({
    data: {
      nome: 'Administrador ReviStuda',
      email: 'admin@revistuda.com.br',
      senha: defaultPasswordHash,
      permissions: ['ADM'],
    },
  });

  const professor = await prisma.user.create({
    data: {
      nome: 'Professor Carlos',
      email: 'professor@revistuda.com.br',
      senha: defaultPasswordHash,
      permissions: ['PROFESSOR'],
    },
  });

  await prisma.user.create({
    data: {
      nome: 'Lucas Silva (Criança)',
      email: 'lucas@revistuda.com.br',
      senha: defaultPasswordHash,
      permissions: ['ALUNO_CRIANCA'],
    },
  });

  await prisma.user.create({
    data: {
      nome: 'Maria Souza (Idoso)',
      email: 'maria@revistuda.com.br',
      senha: defaultPasswordHash,
      permissions: ['ALUNO_IDOSO'],
    },
  });

  // 2. Criar Turmas de Teste
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

  // 3. Criar Módulos de Teste
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

  // Criar Lições de Teste
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

  // 4. Criar Conteúdos de Teste
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

  // Criar Atividades de Teste
  console.log('🎯 Criando atividades...');
  await prisma.atividade.createMany({
    data: [
      {
        titulo_atividade: 'Prática de Adição',
        descricao_atividade: 'Exercícios práticos de soma simples.',
        tipo_atividade: 'Prática',
        licao_id: licaoMatematica.licao_id,
      },
      {
        titulo_atividade: 'Exercício de Interpretação',
        descricao_atividade: 'Questões baseadas na leitura realizada.',
        tipo_atividade: 'Questionário',
        licao_id: licaoLeitura.licao_id,
      },
    ],
  });

  console.log('✅ Semeadura concluída com sucesso!');
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
