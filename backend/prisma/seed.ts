import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import 'dotenv/config';
import { ROLE_PERMISSIONS } from '../src/shared/constants/roles-permissions';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? '',
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando a semeadura do banco de dados...');

  // Limpar dados anteriores de forma segura
  await prisma.user.deleteMany({});
  await prisma.modulo.deleteMany({});
  await prisma.turma.deleteMany({});
  await prisma.conteudo.deleteMany({});

  // Criptografar senha padrão para os testes
  const defaultPasswordHash = await bcrypt.hash('123456', 10);

  // 1. Criar Usuários Padrão para cada Perfil
  console.log('👥 Criando usuários de teste (Senha padrão: 123456)...');
  await prisma.user.create({
    data: {
      nome: 'Administrador ReviStuda',
      email: 'admin@revistuda.com.br',
      senha: defaultPasswordHash,
      permissions: ROLE_PERMISSIONS.ADM,
    },
  });

  await prisma.user.create({
    data: {
      nome: 'Professor Carlos',
      email: 'professor@revistuda.com.br',
      senha: defaultPasswordHash,
      permissions: ROLE_PERMISSIONS.PROFESSOR,
    },
  });

  await prisma.user.create({
    data: {
      nome: 'Lucas Silva (Criança)',
      email: 'lucas@revistuda.com.br',
      senha: defaultPasswordHash,
      permissions: ROLE_PERMISSIONS.ALUNO_CRIANCA,
    },
  });

  await prisma.user.create({
    data: {
      nome: 'Maria Souza (Idoso)',
      email: 'maria@revistuda.com.br',
      senha: defaultPasswordHash,
      permissions: ROLE_PERMISSIONS.ALUNO_IDOSO,
    },
  });

  // 2. Criar Módulos de Teste
  console.log('📚 Criando módulos...');
  await prisma.modulo.createMany({
    data: [
      {
        titulo_modulo: 'Matemática Básica',
        descricao_modulo: 'Estudo de operações fundamentais e lógica matemática.',
        dificuldade: 'Fácil',
      },
      {
        titulo_modulo: 'Introdução à Leitura',
        descricao_modulo: 'Alfabetização e interpretação de textos simples.',
        dificuldade: 'Fácil',
      },
      {
        titulo_modulo: 'História do Brasil',
        descricao_modulo: 'Principais eventos históricos desde a colonização até a república.',
        dificuldade: 'Médio',
      },
    ],
  });

  // 3. Criar Turmas de Teste
  console.log('🏫 Criando turmas...');
  await prisma.turma.createMany({
    data: [
      {
        nome_turma: 'Turma A - Ensino Fundamental',
        descricao_turma: 'Alunos do 5º ano matutino.',
        capacidade_maxima: 30,
      },
      {
        nome_turma: 'Turma B - Inclusão Digital (EJA)',
        descricao_turma: 'Alunos do Ensino de Jovens e Adultos no período noturno.',
        capacidade_maxima: 20,
      },
    ],
  });

  // 4. Criar Conteúdos de Teste
  console.log('📝 Criando conteúdos...');
  await prisma.conteudo.createMany({
    data: [
      {
        nome_conteudo: 'Vídeo: Somar e Subtrair',
        tipo_conteudo: 'Vídeo',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        texto_conteudo: 'Neste vídeo vamos aprender os conceitos fundamentais de soma e subtração.',
      },
      {
        nome_conteudo: 'Leitura: O Sítio do Pica-Pau Amarelo',
        tipo_conteudo: 'Texto',
        texto_conteudo: 'Texto clássico infantil para incentivar e treinar a leitura fluida.',
      },
      {
        nome_conteudo: 'Podcast: A Revolução de 1930',
        tipo_conteudo: 'Áudio',
        audio_link: 'https://exemplo.com/podcast-revolucao-1930.mp3',
        texto_conteudo: 'Áudio explicativo sobre os antecedentes e consequências do movimento de 1930 no Brasil.',
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
