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

type ParAssociacaoSeed = {
  esquerdo: { tipo: 'texto' | 'imagem'; texto?: string; imagem_url?: string };
  direito: { tipo: 'texto' | 'imagem'; texto?: string; imagem_url?: string };
};

const IMG = {
  a: '/uploads/1783723041448-505431183.jpg',
  b: '/uploads/1783723051635-186311209.jpg',
  c: '/uploads/1783723126254-188329413.jpg',
  d: '/uploads/1783774284165-888342269.jpg',
  e: '/uploads/1783774289694-312653463.jpg',
  f: '/uploads/1783774346569-111580931.jpg',
  g: '/uploads/1783936579772-873481562.jpg',
  h: '/uploads/1783936594941-598649968.jpg',
};

async function criarAtividadeMultiplaEscolha(params: {
  titulo: string;
  enunciado: string;
  explicacao: string;
  licaoId: number;
  opcoes: { letra: string; texto_opcao: string; correta: boolean }[];
}) {
  return prisma.atividade.create({
    data: {
      titulo_atividade: params.titulo,
      tipo_atividade: 'multipla_escolha',
      enunciado: params.enunciado,
      explicacao: params.explicacao,
      licao_id: params.licaoId,
      multipla_escolha: {
        create: {
          opcoes: { create: params.opcoes },
        },
      },
    },
    include: {
      multipla_escolha: { include: { opcoes: true } },
    },
  });
}

async function criarAtividadeAssociacao(params: {
  titulo: string;
  enunciado: string;
  licaoId: number;
  pares: ParAssociacaoSeed[];
}) {
  const atividade = await prisma.atividade.create({
    data: {
      titulo_atividade: params.titulo,
      tipo_atividade: 'associacao_imagens',
      enunciado: params.enunciado,
      licao_id: params.licaoId,
    },
  });

  const associacao = await prisma.associacaoImagens.create({
    data: { atividade_id: atividade.atividade_id },
  });

  for (const par of params.pares) {
    const esquerdo = await prisma.itemAssociacao.create({
      data: {
        tipo: par.esquerdo.tipo,
        texto: par.esquerdo.texto ?? null,
        imagem_url: par.esquerdo.imagem_url ?? null,
        lado: 'esquerdo',
        associacao_id: associacao.associacao_id,
      },
    });

    const direito = await prisma.itemAssociacao.create({
      data: {
        tipo: par.direito.tipo,
        texto: par.direito.texto ?? null,
        imagem_url: par.direito.imagem_url ?? null,
        lado: 'direito',
        associacao_id: associacao.associacao_id,
      },
    });

    await prisma.associacaoCorreta.create({
      data: {
        item_1_id: esquerdo.item_associacao_id,
        item_2_id: direito.item_associacao_id,
      },
    });
  }

  return prisma.atividade.findUniqueOrThrow({
    where: { atividade_id: atividade.atividade_id },
    include: {
      associacao_imagens: {
        include: {
          itens: true,
        },
      },
    },
  });
}

async function main() {
  console.log('🌱 Iniciando a semeadura do banco de dados...');

  // Limpeza (ordem respeitando FKs)
  await prisma.respostaAssociacao.deleteMany({});
  await prisma.tentativaAssociacao.deleteMany({});
  await prisma.associacaoCorreta.deleteMany({});
  await prisma.itemAssociacao.deleteMany({});
  await prisma.associacaoImagens.deleteMany({});
  await prisma.respostaMultiplaEscolha.deleteMany({});
  await prisma.opcao.deleteMany({});
  await prisma.multiplaEscolha.deleteMany({});
  await prisma.progressoAtividade.deleteMany({});
  await prisma.progressoConteudo.deleteMany({});
  await prisma.comentarioAluno.deleteMany({});
  await prisma.conteudo.deleteMany({});
  await prisma.atividade.deleteMany({});
  await prisma.licao.deleteMany({});
  await prisma.modulo.deleteMany({});
  await prisma.atividadeRecente.deleteMany({});
  await prisma.turma.updateMany({ data: { professor_id: null } });
  await prisma.user.deleteMany({});
  await prisma.turma.deleteMany({});

  const senha = await bcrypt.hash('123456', 10);

  // ---------------------------------------------------------------------------
  // Admin
  // ---------------------------------------------------------------------------
  console.log('👤 Criando administrador...');
  await prisma.user.create({
    data: {
      nome: 'Administrador ReviStuda',
      email: 'admin@revistuda.com.br',
      senha,
      permissions: ['ADM'],
      approved: true,
    },
  });

  // ---------------------------------------------------------------------------
  // 10 professores: 5 aprovados + 5 aguardando autorização
  // ---------------------------------------------------------------------------
  console.log('👩‍🏫 Criando 10 professores (5 aprovados + 5 pendentes)...');

  const professoresAprovadosData = [
    { nome: 'Professor Carlos', email: 'professor@revistuda.com.br' },
    { nome: 'Professora Fernanda', email: 'fernanda@revistuda.com.br' },
    { nome: 'Professor Roberto', email: 'roberto@revistuda.com.br' },
    { nome: 'Professora Juliana', email: 'juliana@revistuda.com.br' },
    { nome: 'Professor Marcelo', email: 'marcelo@revistuda.com.br' },
  ];

  const professoresPendentesData = [
    { nome: 'Professora Camila', email: 'camila@revistuda.com.br' },
    { nome: 'Professor Diego', email: 'diego@revistuda.com.br' },
    { nome: 'Professora Helena', email: 'helena@revistuda.com.br' },
    { nome: 'Professor Igor', email: 'igor@revistuda.com.br' },
    { nome: 'Professora Larissa', email: 'larissa@revistuda.com.br' },
  ];

  const professoresAprovados: { id: number; nome: string; email: string }[] = [];
  for (const p of professoresAprovadosData) {
    professoresAprovados.push(
      await prisma.user.create({
        data: {
          nome: p.nome,
          email: p.email,
          senha,
          permissions: ['PROFESSOR'],
          approved: true,
          rejected: false,
        },
        select: { id: true, nome: true, email: true },
      }),
    );
  }

  const professoresPendentes: { id: number; nome: string; email: string }[] = [];
  for (const p of professoresPendentesData) {
    professoresPendentes.push(
      await prisma.user.create({
        data: {
          nome: p.nome,
          email: p.email,
          senha,
          permissions: ['PROFESSOR'],
          approved: false,
          rejected: false,
        },
        select: { id: true, nome: true, email: true },
      }),
    );
  }

  // Exemplo de professor recusado (além dos 10)
  await prisma.user.create({
    data: {
      nome: 'Professor Recusado Exemplo',
      email: 'recusado@revistuda.com.br',
      senha,
      permissions: ['PROFESSOR'],
      approved: false,
      rejected: true,
    },
  });

  const [profCarlos, profFernanda, profRoberto, profJuliana, profMarcelo] = professoresAprovados;

  // ---------------------------------------------------------------------------
  // Turmas
  // ---------------------------------------------------------------------------
  console.log('🏫 Criando turmas...');
  const turmaA = await prisma.turma.create({
    data: {
      nome_turma: 'Turma A - Inclusão Digital (Manhã)',
      descricao_turma: 'Turma de inclusão digital para a terceira idade no período matutino.',
      capacidade_maxima: 10,
      professor_id: profCarlos.id,
    },
  });

  const turmaB = await prisma.turma.create({
    data: {
      nome_turma: 'Turma B - Inclusão Digital (Noite)',
      descricao_turma: 'Turma de inclusão digital para a terceira idade no período noturno.',
      capacidade_maxima: 10,
      professor_id: profCarlos.id,
    },
  });

  const turmaC = await prisma.turma.create({
    data: {
      nome_turma: 'Turma C - Inclusão Digital (Tarde)',
      descricao_turma: 'Turma de inclusão digital para a terceira idade no período vespertino.',
      capacidade_maxima: 10,
      professor_id: profFernanda.id,
    },
  });

  const turmaD = await prisma.turma.create({
    data: {
      nome_turma: 'Turma D - Informática Básica (Manhã)',
      descricao_turma: 'Turma de informática básica para iniciantes no período matutino.',
      capacidade_maxima: 10,
      professor_id: profFernanda.id,
    },
  });

  const turmaE = await prisma.turma.create({
    data: {
      nome_turma: 'Turma E - Inclusão Digital (Sábado)',
      descricao_turma: 'Turma de inclusão digital aos sábados para quem trabalha durante a semana.',
      capacidade_maxima: 10,
      professor_id: profRoberto.id,
    },
  });

  // Turma sem professor (útil para o painel admin)
  const turmaSemProfessor = await prisma.turma.create({
    data: {
      nome_turma: 'Turma F - Aguardando Professor',
      descricao_turma: 'Turma criada e ainda sem professor designado.',
      capacidade_maxima: 12,
      professor_id: null,
    },
  });

  // Turmas extras para Juliana e Marcelo
  await prisma.turma.create({
    data: {
      nome_turma: 'Turma G - WhatsApp e Comunicação',
      descricao_turma: 'Foco em mensagens, áudios e videochamadas.',
      capacidade_maxima: 10,
      professor_id: profJuliana.id,
    },
  });

  await prisma.turma.create({
    data: {
      nome_turma: 'Turma H - Segurança e Golpes',
      descricao_turma: 'Foco em prevenção de golpes digitais.',
      capacidade_maxima: 10,
      professor_id: profMarcelo.id,
    },
  });

  // ---------------------------------------------------------------------------
  // 20 alunos
  // ---------------------------------------------------------------------------
  console.log('🎓 Criando 20 alunos...');
  const alunosData = [
    { nome: 'Maria Souza', email: 'maria@revistuda.com.br', turma_id: turmaA.turma_id },
    { nome: 'João Silva', email: 'joao@revistuda.com.br', turma_id: turmaA.turma_id },
    { nome: 'Antônio Ferreira', email: 'antonio@revistuda.com.br', turma_id: turmaA.turma_id },
    { nome: 'Terezinha Oliveira', email: 'terezinha@revistuda.com.br', turma_id: turmaA.turma_id },
    { nome: 'Francisco Barbosa', email: 'francisco@revistuda.com.br', turma_id: turmaA.turma_id },
    { nome: 'Rita Nascimento', email: 'rita@revistuda.com.br', turma_id: turmaA.turma_id },
    { nome: 'Ana Costa', email: 'ana@revistuda.com.br', turma_id: turmaB.turma_id },
    { nome: 'Pedro Lima', email: 'pedro@revistuda.com.br', turma_id: turmaB.turma_id },
    { nome: 'José Carlos Mendes', email: 'josecarlos@revistuda.com.br', turma_id: turmaB.turma_id },
    { nome: 'Lourdes Almeida', email: 'lourdes@revistuda.com.br', turma_id: turmaB.turma_id },
    { nome: 'Sebastião Ramos', email: 'sebastiao@revistuda.com.br', turma_id: turmaB.turma_id },
    { nome: 'Neide Carvalho', email: 'neide@revistuda.com.br', turma_id: turmaB.turma_id },
    { nome: 'Geraldo Pinto', email: 'geraldo@revistuda.com.br', turma_id: turmaC.turma_id },
    { nome: 'Ivone Duarte', email: 'ivone@revistuda.com.br', turma_id: turmaC.turma_id },
    { nome: 'Osvaldo Teixeira', email: 'osvaldo@revistuda.com.br', turma_id: turmaC.turma_id },
    { nome: 'Marlene Rocha', email: 'marlene@revistuda.com.br', turma_id: turmaC.turma_id },
    { nome: 'Waldemar Gomes', email: 'waldemar@revistuda.com.br', turma_id: turmaD.turma_id },
    { nome: 'Zilda Martins', email: 'zilda@revistuda.com.br', turma_id: turmaD.turma_id },
    { nome: 'Benedito Freitas', email: 'benedito@revistuda.com.br', turma_id: turmaE.turma_id },
    { nome: 'Aparecida Nunes', email: 'aparecida@revistuda.com.br', turma_id: turmaE.turma_id },
  ];

  const alunosPorEmail: Record<string, { id: number; turma_id: number | null }> = {};
  for (const aluno of alunosData) {
    const criado = await prisma.user.create({
      data: {
        nome: aluno.nome,
        email: aluno.email,
        senha,
        permissions: ['ALUNO_IDOSO'],
        approved: true,
        turma_id: aluno.turma_id,
      },
    });
    alunosPorEmail[aluno.email] = criado;
  }

  const maria = alunosPorEmail['maria@revistuda.com.br'];
  const joao = alunosPorEmail['joao@revistuda.com.br'];
  const antonio = alunosPorEmail['antonio@revistuda.com.br'];
  const terezinha = alunosPorEmail['terezinha@revistuda.com.br'];
  const ana = alunosPorEmail['ana@revistuda.com.br'];
  const josecarlos = alunosPorEmail['josecarlos@revistuda.com.br'];

  // ---------------------------------------------------------------------------
  // Módulos + lições (definição central)
  // ---------------------------------------------------------------------------
  console.log('📚 Criando módulos, lições, conteúdos e atividades...');

  type ModuloSeed = {
    titulo_modulo: string;
    descricao_modulo: string;
    dificuldade: string;
    imagem_url: string;
    turma_id: number;
    licao: { titulo_licao: string; comentario: string };
    quiz: {
      titulo: string;
      enunciado: string;
      explicacao: string;
      opcoes: { letra: string; texto_opcao: string; correta: boolean }[];
    };
    associacao: {
      titulo: string;
      enunciado: string;
      pares: ParAssociacaoSeed[];
    };
    conteudos: {
      nome_conteudo: string;
      tipo_conteudo: string;
      url_conteudo?: string;
      texto_conteudo?: string;
    }[];
  };

  const modulosSeed: ModuloSeed[] = [
    {
      titulo_modulo: 'Segurança Digital',
      descricao_modulo: 'Aprenda a reconhecer e evitar os golpes mais comuns na internet e no celular.',
      dificuldade: 'Fácil',
      imagem_url: '/uploads/modulo-seguranca.jpg',
      turma_id: turmaA.turma_id,
      licao: {
        titulo_licao: 'Lição 1 - Como evitar golpes no WhatsApp e no celular',
        comentario: 'Conheça os golpes mais comuns e aprenda atitudes simples para se proteger.',
      },
      quiz: {
        titulo: 'Quiz: Você sabe evitar golpes?',
        enunciado:
          'Você recebe uma mensagem de um número desconhecido com a foto do seu filho pedindo dinheiro com urgência. O que você deve fazer?',
        explicacao:
          'Golpistas usam fotos de parentes para criar urgência. Ligue para o número que você já tem salvo e confirme antes de qualquer transferência.',
        opcoes: [
          { letra: 'a', texto_opcao: 'Transferir o dinheiro rapidamente, pois é uma emergência', correta: false },
          { letra: 'b', texto_opcao: 'Ligar para o número antigo do seu filho e confirmar se é ele mesmo', correta: true },
          { letra: 'c', texto_opcao: 'Responder pedindo mais detalhes sobre a conta', correta: false },
          { letra: 'd', texto_opcao: 'Enviar metade do valor por precaução', correta: false },
        ],
      },
      associacao: {
        titulo: 'Associação: Reconhecendo golpes',
        enunciado: 'Associe cada situação ao cuidado correto.',
        pares: [
          {
            esquerdo: { tipo: 'texto', texto: 'Mensagem pedindo Pix com urgência' },
            direito: { tipo: 'texto', texto: 'Ligar para o número salvo e confirmar' },
          },
          {
            esquerdo: { tipo: 'texto', texto: 'Banco pedindo senha por telefone' },
            direito: { tipo: 'texto', texto: 'Desligar — banco nunca pede senha' },
          },
          {
            esquerdo: { tipo: 'imagem', imagem_url: IMG.a },
            direito: { tipo: 'texto', texto: 'Ativar confirmação em duas etapas' },
          },
        ],
      },
      conteudos: [
        {
          nome_conteudo: 'Vídeo: Golpe no WhatsApp - como funciona e como se proteger',
          tipo_conteudo: 'Vídeo',
          url_conteudo: 'https://www.youtube.com/watch?v=U6dGh0R0t58',
          texto_conteudo:
            'Assista ao vídeo para entender como funciona o golpe do WhatsApp, em que criminosos se passam por um parente pedindo dinheiro com urgência.',
        },
        {
          nome_conteudo: 'Leitura: 5 regras de ouro para não cair em golpes',
          tipo_conteudo: 'Texto',
          texto_conteudo:
            '1) Desconfie de mensagens com urgência pedindo dinheiro. 2) Confirme pelo número antigo. 3) Banco nunca pede senha. 4) Não clique em links de prêmios. 5) Ative a confirmação em duas etapas.',
        },
      ],
    },
    {
      titulo_modulo: 'WhatsApp no Dia a Dia',
      descricao_modulo: 'Envie mensagens, áudios e faça videochamadas para conversar com a família.',
      dificuldade: 'Fácil',
      imagem_url: '/uploads/modulo-whatsapp.jpg',
      turma_id: turmaA.turma_id,
      licao: {
        titulo_licao: 'Lição 1 - Primeiros passos e videochamadas',
        comentario: 'Aprenda o básico do WhatsApp e como fazer uma videochamada com a família.',
      },
      quiz: {
        titulo: 'Quiz: Videochamada no WhatsApp',
        enunciado: 'Qual ícone você deve tocar para iniciar uma videochamada no WhatsApp?',
        explicacao: 'O ícone de câmera de vídeo, no canto superior da conversa, inicia a videochamada.',
        opcoes: [
          { letra: 'a', texto_opcao: 'O ícone de câmera de vídeo no topo da conversa', correta: true },
          { letra: 'b', texto_opcao: 'O ícone de clipe de papel', correta: false },
          { letra: 'c', texto_opcao: 'O ícone de microfone ao lado da mensagem', correta: false },
        ],
      },
      associacao: {
        titulo: 'Associação: Ícones do WhatsApp',
        enunciado: 'Associe cada ícone à sua função.',
        pares: [
          {
            esquerdo: { tipo: 'imagem', imagem_url: IMG.b },
            direito: { tipo: 'texto', texto: 'Iniciar videochamada' },
          },
          {
            esquerdo: { tipo: 'imagem', imagem_url: IMG.c },
            direito: { tipo: 'texto', texto: 'Enviar foto ou arquivo' },
          },
          {
            esquerdo: { tipo: 'texto', texto: 'Ícone de microfone' },
            direito: { tipo: 'texto', texto: 'Gravar e enviar áudio' },
          },
        ],
      },
      conteudos: [
        {
          nome_conteudo: 'Vídeo: Aula de WhatsApp básico para idosos',
          tipo_conteudo: 'Vídeo',
          url_conteudo: 'https://www.youtube.com/watch?v=dR5PNZhaLzU',
          texto_conteudo: 'Aula passo a passo mostrando como enviar mensagens, áudios e fotos no WhatsApp.',
        },
        {
          nome_conteudo: 'Leitura: Como fazer uma videochamada',
          tipo_conteudo: 'Texto',
          texto_conteudo:
            'Para fazer uma videochamada: 1) Abra a conversa. 2) Toque no ícone de câmera de vídeo. 3) Aguarde atender. 4) Encerre no botão vermelho.',
        },
      ],
    },
    {
      titulo_modulo: 'Notícias Falsas (Fake News)',
      descricao_modulo: 'Como identificar informações falsas antes de acreditar ou compartilhar.',
      dificuldade: 'Médio',
      imagem_url: '/uploads/modulo-fakenews.jpg',
      turma_id: turmaB.turma_id,
      licao: {
        titulo_licao: 'Lição 1 - Como identificar uma notícia falsa',
        comentario: 'Dicas práticas para desconfiar, verificar e não espalhar informações falsas.',
      },
      quiz: {
        titulo: 'Quiz: Notícia verdadeira ou falsa?',
        enunciado:
          'Você recebe no WhatsApp uma notícia alarmante pedindo "compartilhe com todos antes que apaguem". Qual a atitude correta?',
        explicacao:
          'Pedidos de compartilhamento urgente são um sinal clássico de fake news. Verifique em um site de notícias confiável antes de repassar.',
        opcoes: [
          { letra: 'a', texto_opcao: 'Compartilhar logo, pois pode ser importante', correta: false },
          { letra: 'b', texto_opcao: 'Verificar em um site de notícias conhecido antes de compartilhar', correta: true },
          { letra: 'c', texto_opcao: 'Compartilhar só com a família', correta: false },
        ],
      },
      associacao: {
        titulo: 'Associação: Sinais de fake news',
        enunciado: 'Associe o sinal ao significado.',
        pares: [
          {
            esquerdo: { tipo: 'texto', texto: '"Compartilhe antes que apaguem"' },
            direito: { tipo: 'texto', texto: 'Sinal clássico de fake news' },
          },
          {
            esquerdo: { tipo: 'texto', texto: 'Fonte desconhecida' },
            direito: { tipo: 'texto', texto: 'Desconfie e verifique' },
          },
          {
            esquerdo: { tipo: 'imagem', imagem_url: IMG.d },
            direito: { tipo: 'texto', texto: 'Buscar em site de notícias confiável' },
          },
        ],
      },
      conteudos: [
        {
          nome_conteudo: 'Vídeo: 5 características das fake news',
          tipo_conteudo: 'Vídeo',
          url_conteudo: 'https://www.youtube.com/watch?v=V3atlyamy70',
          texto_conteudo:
            'Aprenda a reconhecer os sinais de uma notícia falsa: títulos alarmantes, erros de português e fontes desconhecidas.',
        },
        {
          nome_conteudo: 'Leitura: Verifique antes de compartilhar',
          tipo_conteudo: 'Texto',
          texto_conteudo:
            'Antes de repassar: 1) Procure em site confiável. 2) Desconfie de "compartilhe com todos". 3) Verifique a data. 4) Na dúvida, não compartilhe.',
        },
      ],
    },
    {
      titulo_modulo: 'Pix e Banco pelo Celular',
      descricao_modulo: 'Use o aplicativo do banco e faça Pix com tranquilidade e segurança.',
      dificuldade: 'Médio',
      imagem_url: '/uploads/modulo-pix.jpg',
      turma_id: turmaA.turma_id,
      licao: {
        titulo_licao: 'Lição 1 - Fazendo um Pix com segurança',
        comentario: 'Passo a passo do Pix e os cuidados essenciais antes de confirmar um pagamento.',
      },
      quiz: {
        titulo: 'Quiz: Pix com segurança',
        enunciado: 'Antes de apertar "confirmar" em um Pix, o que você deve sempre conferir?',
        explicacao:
          'O Pix cai na hora e é difícil de reverter. Por isso, confira sempre o nome do destinatário e o valor antes de confirmar.',
        opcoes: [
          { letra: 'a', texto_opcao: 'Nada, o aplicativo do banco confere sozinho', correta: false },
          { letra: 'b', texto_opcao: 'O nome de quem vai receber e o valor', correta: true },
          { letra: 'c', texto_opcao: 'Apenas se a internet está funcionando', correta: false },
        ],
      },
      associacao: {
        titulo: 'Associação: Cuidados com o Pix',
        enunciado: 'Associe a ação ao cuidado correto.',
        pares: [
          {
            esquerdo: { tipo: 'texto', texto: 'Antes de confirmar o Pix' },
            direito: { tipo: 'texto', texto: 'Conferir nome e valor' },
          },
          {
            esquerdo: { tipo: 'texto', texto: 'Pix à noite' },
            direito: { tipo: 'texto', texto: 'Usar limite noturno baixo' },
          },
          {
            esquerdo: { tipo: 'imagem', imagem_url: IMG.e },
            direito: { tipo: 'texto', texto: 'Nunca fazer Pix "de teste" pedido por telefone' },
          },
        ],
      },
      conteudos: [
        {
          nome_conteudo: 'Vídeo: Pix na prática - tutorial passo a passo',
          tipo_conteudo: 'Vídeo',
          url_conteudo: 'https://www.youtube.com/watch?v=lPr-hL9CZd0',
          texto_conteudo: 'Tutorial mostrando na prática como cadastrar uma chave e fazer um Pix.',
        },
        {
          nome_conteudo: 'Leitura: Cuidados antes de confirmar um Pix',
          tipo_conteudo: 'Texto',
          texto_conteudo:
            '1) Confira nome e valor. 2) Configure limite noturno baixo. 3) Banco nunca pede Pix "de teste". 4) Confira tudo com calma antes de confirmar.',
        },
      ],
    },
    {
      titulo_modulo: 'Fotos e Memórias no Celular',
      descricao_modulo: 'Tire fotos bonitas, encontre suas imagens na galeria e compartilhe com a família.',
      dificuldade: 'Fácil',
      imagem_url: '/uploads/modulo-fotos.jpg',
      turma_id: turmaA.turma_id,
      licao: {
        titulo_licao: 'Lição 1 - Tirando e compartilhando fotos',
        comentario: 'Aprenda a fotografar, encontrar as fotos na galeria e enviar para a família.',
      },
      quiz: {
        titulo: 'Quiz: Enviando fotos para a família',
        enunciado: 'Onde ficam guardadas as fotos que você tira com o celular?',
        explicacao: 'As fotos ficam no aplicativo Galeria (ou Fotos), de onde você pode vê-las e compartilhá-las.',
        opcoes: [
          { letra: 'a', texto_opcao: 'No aplicativo Galeria (ou Fotos)', correta: true },
          { letra: 'b', texto_opcao: 'Elas somem depois de um dia', correta: false },
          { letra: 'c', texto_opcao: 'Só ficam no WhatsApp', correta: false },
        ],
      },
      associacao: {
        titulo: 'Associação: Fotos no celular',
        enunciado: 'Associe cada passo à ação correta.',
        pares: [
          {
            esquerdo: { tipo: 'imagem', imagem_url: IMG.f },
            direito: { tipo: 'texto', texto: 'Abrir a Galeria / Fotos' },
          },
          {
            esquerdo: { tipo: 'texto', texto: 'Enviar foto no WhatsApp' },
            direito: { tipo: 'texto', texto: 'Clipe de papel → Galeria → enviar' },
          },
          {
            esquerdo: { tipo: 'texto', texto: 'Tirar uma foto nova' },
            direito: { tipo: 'texto', texto: 'Abrir o app Câmera' },
          },
        ],
      },
      conteudos: [
        {
          nome_conteudo: 'Vídeo: Aprenda a tirar fotos com seu celular',
          tipo_conteudo: 'Vídeo',
          url_conteudo: 'https://www.youtube.com/watch?v=GgHhqwHiOsE',
          texto_conteudo: 'Dicas simples para tirar fotos mais bonitas com a câmera do celular.',
        },
        {
          nome_conteudo: 'Leitura: Como enviar uma foto para a família',
          tipo_conteudo: 'Texto',
          texto_conteudo:
            'Abra a conversa → toque no clipe → escolha Galeria → selecione a foto → envie pela setinha verde.',
        },
      ],
    },
    {
      titulo_modulo: 'Saúde na Palma da Mão',
      descricao_modulo: 'Use o celular para cuidar da saúde: carteira de vacinação, exames e consultas pelo Meu SUS Digital.',
      dificuldade: 'Médio',
      imagem_url: '/uploads/modulo-saude.jpg',
      turma_id: turmaB.turma_id,
      licao: {
        titulo_licao: 'Lição 1 - Conhecendo o Meu SUS Digital',
        comentario: 'Veja como acessar sua carteira de vacinação, exames e consultas pelo celular.',
      },
      quiz: {
        titulo: 'Quiz: Meu SUS Digital',
        enunciado: 'O que você consegue ver no aplicativo Meu SUS Digital?',
        explicacao:
          'O aplicativo oficial do Ministério da Saúde mostra a carteira de vacinação, resultados de exames e o cartão do SUS digital.',
        opcoes: [
          { letra: 'a', texto_opcao: 'Apenas notícias sobre saúde', correta: false },
          { letra: 'b', texto_opcao: 'Carteira de vacinação, exames e o cartão do SUS', correta: true },
          { letra: 'c', texto_opcao: 'Somente o telefone do hospital', correta: false },
        ],
      },
      associacao: {
        titulo: 'Associação: Meu SUS Digital',
        enunciado: 'Associe o recurso ao que ele mostra.',
        pares: [
          {
            esquerdo: { tipo: 'texto', texto: 'Carteira de vacinação' },
            direito: { tipo: 'texto', texto: 'Vacinas da gripe e COVID' },
          },
          {
            esquerdo: { tipo: 'imagem', imagem_url: IMG.g },
            direito: { tipo: 'texto', texto: 'Cartão do SUS digital' },
          },
          {
            esquerdo: { tipo: 'texto', texto: 'Resultados de exames' },
            direito: { tipo: 'texto', texto: 'Consultar no app oficial' },
          },
        ],
      },
      conteudos: [
        {
          nome_conteudo: 'Vídeo: Como usar o Meu SUS Digital',
          tipo_conteudo: 'Vídeo',
          url_conteudo: 'https://www.youtube.com/watch?v=z-YMX_bgOVc',
          texto_conteudo: 'Veja como baixar e usar o aplicativo oficial do SUS.',
        },
        {
          nome_conteudo: 'Leitura: O que dá para fazer no Meu SUS Digital',
          tipo_conteudo: 'Texto',
          texto_conteudo:
            'Com o Meu SUS Digital você vê carteira de vacinação, exames, histórico de atendimentos e o cartão do SUS digital.',
        },
      ],
    },
    {
      titulo_modulo: 'Compras Online com Segurança',
      descricao_modulo: 'Aprenda a comprar pela internet sem cair em sites falsos e ofertas enganosas.',
      dificuldade: 'Médio',
      imagem_url: '/uploads/modulo-compras.jpg',
      turma_id: turmaB.turma_id,
      licao: {
        titulo_licao: 'Lição 1 - Comprando pela internet sem cair em golpes',
        comentario: 'Como reconhecer um site confiável e desconfiar de ofertas boas demais.',
      },
      quiz: {
        titulo: 'Quiz: Site confiável ou golpe?',
        enunciado:
          'Você encontra uma loja desconhecida vendendo um celular pela metade do preço, mas ela só aceita Pix. O que isso indica?',
        explicacao:
          'Preço bom demais + pagamento só por Pix ou boleto são sinais clássicos de site falso. Prefira lojas conhecidas.',
        opcoes: [
          { letra: 'a', texto_opcao: 'Uma ótima oportunidade que não pode ser perdida', correta: false },
          { letra: 'b', texto_opcao: 'Provavelmente é um golpe — melhor não comprar', correta: true },
          { letra: 'c', texto_opcao: 'Que a loja é nova e está fazendo promoção', correta: false },
        ],
      },
      associacao: {
        titulo: 'Associação: Comprando com segurança',
        enunciado: 'Associe o sinal ao que ele indica.',
        pares: [
          {
            esquerdo: { tipo: 'texto', texto: 'Preço bom demais + só Pix' },
            direito: { tipo: 'texto', texto: 'Provável golpe' },
          },
          {
            esquerdo: { tipo: 'texto', texto: 'Loja conhecida com CNPJ' },
            direito: { tipo: 'texto', texto: 'Mais confiável' },
          },
          {
            esquerdo: { tipo: 'imagem', imagem_url: IMG.h },
            direito: { tipo: 'texto', texto: 'Pedir ajuda a um familiar antes de pagar' },
          },
        ],
      },
      conteudos: [
        {
          nome_conteudo: 'Vídeo: Como fazer compras online com segurança',
          tipo_conteudo: 'Vídeo',
          url_conteudo: 'https://www.youtube.com/watch?v=eZspUgfpuzY',
          texto_conteudo: 'A Serasa ensina dicas práticas para comprar pela internet sem cair em golpes.',
        },
        {
          nome_conteudo: 'Leitura: Sinais de um site falso',
          tipo_conteudo: 'Texto',
          texto_conteudo:
            'Desconfie de preço bom demais, site só com Pix/boleto, endereço com erros e loja sem telefone/CNPJ.',
        },
      ],
    },
  ];

  // Módulos espelhados nas turmas C, D e E (com quiz + associação)
  const espelhos: { baseIndex: number; turma_id: number }[] = [
    { baseIndex: 0, turma_id: turmaC.turma_id }, // Segurança
    { baseIndex: 1, turma_id: turmaC.turma_id }, // WhatsApp
    { baseIndex: 4, turma_id: turmaD.turma_id }, // Fotos
    { baseIndex: 3, turma_id: turmaD.turma_id }, // Pix
    { baseIndex: 2, turma_id: turmaE.turma_id }, // Fake News
    { baseIndex: 6, turma_id: turmaE.turma_id }, // Compras
  ];

  for (const esp of espelhos) {
    const base = modulosSeed[esp.baseIndex];
    modulosSeed.push({
      ...base,
      turma_id: esp.turma_id,
      conteudos: [
        {
          nome_conteudo: `Leitura: ${base.titulo_modulo} - primeiros passos`,
          tipo_conteudo: 'Texto',
          texto_conteudo:
            'Leia com calma o material desta lição e, se tiver dúvidas, use o espaço de comentários para perguntar ao professor.',
        },
      ],
    });
  }

  type QuizCriado = Awaited<ReturnType<typeof criarAtividadeMultiplaEscolha>>;
  type AssocCriada = Awaited<ReturnType<typeof criarAtividadeAssociacao>>;

  const quizzesCriados: QuizCriado[] = [];
  const associacoesCriadas: AssocCriada[] = [];
  const conteudosCriados: { conteudo_id: number; licao_id: number }[] = [];

  for (const item of modulosSeed) {
    const modulo = await prisma.modulo.create({
      data: {
        titulo_modulo: item.titulo_modulo,
        descricao_modulo: item.descricao_modulo,
        dificuldade: item.dificuldade,
        imagem_url: item.imagem_url,
        turma_id: item.turma_id,
      },
    });

    const licao = await prisma.licao.create({
      data: {
        titulo_licao: item.licao.titulo_licao,
        comentario: item.licao.comentario,
        modulo_id: modulo.modulo_id,
      },
    });

    for (const c of item.conteudos) {
      const conteudo = await prisma.conteudo.create({
        data: {
          nome_conteudo: c.nome_conteudo,
          tipo_conteudo: c.tipo_conteudo,
          url_conteudo: c.url_conteudo ?? null,
          texto_conteudo: c.texto_conteudo ?? null,
          licao_id: licao.licao_id,
        },
      });
      conteudosCriados.push({ conteudo_id: conteudo.conteudo_id, licao_id: licao.licao_id });
    }

    const quiz = await criarAtividadeMultiplaEscolha({
      titulo: item.quiz.titulo,
      enunciado: item.quiz.enunciado,
      explicacao: item.quiz.explicacao,
      licaoId: licao.licao_id,
      opcoes: item.quiz.opcoes,
    });
    quizzesCriados.push(quiz);

    const assoc = await criarAtividadeAssociacao({
      titulo: item.associacao.titulo,
      enunciado: item.associacao.enunciado,
      licaoId: licao.licao_id,
      pares: item.associacao.pares,
    });
    associacoesCriadas.push(assoc);
  }

  // ---------------------------------------------------------------------------
  // Respostas de múltipla escolha (desempenho)
  // ---------------------------------------------------------------------------
  console.log('📊 Criando respostas de desempenho (múltipla escolha)...');

  const quizGolpes = quizzesCriados[0];
  const quizWhatsapp = quizzesCriados[1];
  const quizPix = quizzesCriados[3];

  const opcoesGolpes = quizGolpes.multipla_escolha!.opcoes;
  const opcoesWhatsapp = quizWhatsapp.multipla_escolha!.opcoes;
  const opcoesPix = quizPix.multipla_escolha!.opcoes;

  const opcaoGolpesCorreta = opcoesGolpes.find((o) => o.correta)!;
  const opcaoGolpesErrada = opcoesGolpes.find((o) => !o.correta)!;
  const opcaoWhatsappCorreta = opcoesWhatsapp.find((o) => o.correta)!;
  const opcaoWhatsappErrada = opcoesWhatsapp.find((o) => !o.correta)!;
  const opcaoPixCorreta = opcoesPix.find((o) => o.correta)!;
  const opcaoPixErrada = opcoesPix.find((o) => !o.correta)!;

  await prisma.respostaMultiplaEscolha.createMany({
    data: [
      { aluno_id: maria.id, resposta_aluno_id: opcaoGolpesCorreta.opcao_id },
      { aluno_id: maria.id, resposta_aluno_id: opcaoWhatsappErrada.opcao_id },
      { aluno_id: joao.id, resposta_aluno_id: opcaoGolpesCorreta.opcao_id },
      { aluno_id: joao.id, resposta_aluno_id: opcaoWhatsappCorreta.opcao_id },
      { aluno_id: ana.id, resposta_aluno_id: opcaoGolpesCorreta.opcao_id },
      { aluno_id: antonio.id, resposta_aluno_id: opcaoGolpesCorreta.opcao_id },
      { aluno_id: antonio.id, resposta_aluno_id: opcaoWhatsappCorreta.opcao_id },
      { aluno_id: antonio.id, resposta_aluno_id: opcaoPixCorreta.opcao_id },
      { aluno_id: terezinha.id, resposta_aluno_id: opcaoWhatsappCorreta.opcao_id },
      { aluno_id: terezinha.id, resposta_aluno_id: opcaoGolpesErrada.opcao_id },
      { aluno_id: terezinha.id, resposta_aluno_id: opcaoPixErrada.opcao_id },
      { aluno_id: josecarlos.id, resposta_aluno_id: opcaoPixCorreta.opcao_id },
      { aluno_id: josecarlos.id, resposta_aluno_id: opcaoGolpesErrada.opcao_id },
      { aluno_id: alunosPorEmail['francisco@revistuda.com.br'].id, resposta_aluno_id: opcaoGolpesCorreta.opcao_id },
      { aluno_id: alunosPorEmail['francisco@revistuda.com.br'].id, resposta_aluno_id: opcaoPixCorreta.opcao_id },
      { aluno_id: alunosPorEmail['francisco@revistuda.com.br'].id, resposta_aluno_id: opcaoWhatsappErrada.opcao_id },
      { aluno_id: alunosPorEmail['rita@revistuda.com.br'].id, resposta_aluno_id: opcaoWhatsappCorreta.opcao_id },
      { aluno_id: alunosPorEmail['sebastiao@revistuda.com.br'].id, resposta_aluno_id: opcaoGolpesErrada.opcao_id },
      { aluno_id: alunosPorEmail['sebastiao@revistuda.com.br'].id, resposta_aluno_id: opcaoPixErrada.opcao_id },
      { aluno_id: alunosPorEmail['geraldo@revistuda.com.br'].id, resposta_aluno_id: opcaoGolpesCorreta.opcao_id },
      { aluno_id: alunosPorEmail['geraldo@revistuda.com.br'].id, resposta_aluno_id: opcaoWhatsappCorreta.opcao_id },
      { aluno_id: alunosPorEmail['ivone@revistuda.com.br'].id, resposta_aluno_id: opcaoPixCorreta.opcao_id },
      { aluno_id: alunosPorEmail['ivone@revistuda.com.br'].id, resposta_aluno_id: opcaoGolpesErrada.opcao_id },
      { aluno_id: alunosPorEmail['waldemar@revistuda.com.br'].id, resposta_aluno_id: opcaoGolpesCorreta.opcao_id },
      { aluno_id: alunosPorEmail['benedito@revistuda.com.br'].id, resposta_aluno_id: opcaoWhatsappErrada.opcao_id },
    ],
  });

  // ---------------------------------------------------------------------------
  // Tentativas de associação de imagens
  // ---------------------------------------------------------------------------
  console.log('🔗 Criando tentativas de associação de imagens...');
  const assocGolpes = associacoesCriadas[0];
  const itensGolpes = assocGolpes.associacao_imagens!.itens;
  const esquerdos = itensGolpes.filter((i) => i.lado === 'esquerdo');
  const direitos = itensGolpes.filter((i) => i.lado === 'direito');

  // Maria: tentativa correta
  const tentativaMaria = await prisma.tentativaAssociacao.create({
    data: {
      user_id: maria.id,
      associacao_id: assocGolpes.associacao_imagens!.associacao_id,
    },
  });
  for (let i = 0; i < Math.min(esquerdos.length, direitos.length); i++) {
    await prisma.respostaAssociacao.create({
      data: {
        tentativa_associacao_id: tentativaMaria.tentativa_associacao_id,
        item_1_id: esquerdos[i].item_associacao_id,
        item_2_id: direitos[i].item_associacao_id,
      },
    });
  }

  // João: tentativa com um par trocado
  const tentativaJoao = await prisma.tentativaAssociacao.create({
    data: {
      user_id: joao.id,
      associacao_id: assocGolpes.associacao_imagens!.associacao_id,
    },
  });
  if (esquerdos.length >= 2 && direitos.length >= 2) {
    await prisma.respostaAssociacao.createMany({
      data: [
        {
          tentativa_associacao_id: tentativaJoao.tentativa_associacao_id,
          item_1_id: esquerdos[0].item_associacao_id,
          item_2_id: direitos[1].item_associacao_id,
        },
        {
          tentativa_associacao_id: tentativaJoao.tentativa_associacao_id,
          item_1_id: esquerdos[1].item_associacao_id,
          item_2_id: direitos[0].item_associacao_id,
        },
        ...(esquerdos[2] && direitos[2]
          ? [
              {
                tentativa_associacao_id: tentativaJoao.tentativa_associacao_id,
                item_1_id: esquerdos[2].item_associacao_id,
                item_2_id: direitos[2].item_associacao_id,
              },
            ]
          : []),
      ],
    });
  }

  // ---------------------------------------------------------------------------
  // Progressos de atividade e conteúdo
  // ---------------------------------------------------------------------------
  console.log('📈 Criando progressos de atividades e conteúdos...');
  await prisma.progressoAtividade.createMany({
    data: [
      {
        aluno_id: maria.id,
        atividade_id: quizGolpes.atividade_id,
        status: 'feito',
        data_inicio: new Date('2026-07-01T10:00:00'),
        data_conclusao: new Date('2026-07-01T10:15:00'),
      },
      {
        aluno_id: maria.id,
        atividade_id: assocGolpes.atividade_id,
        status: 'feito',
        data_inicio: new Date('2026-07-01T10:20:00'),
        data_conclusao: new Date('2026-07-01T10:35:00'),
      },
      {
        aluno_id: joao.id,
        atividade_id: quizGolpes.atividade_id,
        status: 'feito',
        data_inicio: new Date('2026-07-02T09:00:00'),
        data_conclusao: new Date('2026-07-02T09:12:00'),
      },
      {
        aluno_id: antonio.id,
        atividade_id: quizWhatsapp.atividade_id,
        status: 'fazendo',
        data_inicio: new Date('2026-07-10T14:00:00'),
      },
      {
        aluno_id: terezinha.id,
        atividade_id: quizPix.atividade_id,
        status: 'a_fazer',
      },
      {
        aluno_id: ana.id,
        atividade_id: quizzesCriados[2].atividade_id,
        status: 'feito',
        data_inicio: new Date('2026-07-05T19:00:00'),
        data_conclusao: new Date('2026-07-05T19:20:00'),
      },
    ],
  });

  if (conteudosCriados.length > 0) {
    await prisma.progressoConteudo.createMany({
      data: [
        { aluno_id: maria.id, conteudo_id: conteudosCriados[0].conteudo_id },
        { aluno_id: maria.id, conteudo_id: conteudosCriados[1].conteudo_id },
        { aluno_id: joao.id, conteudo_id: conteudosCriados[0].conteudo_id },
        { aluno_id: antonio.id, conteudo_id: conteudosCriados[2]?.conteudo_id ?? conteudosCriados[0].conteudo_id },
        { aluno_id: ana.id, conteudo_id: conteudosCriados[4]?.conteudo_id ?? conteudosCriados[0].conteudo_id },
      ],
    });
  }

  // ---------------------------------------------------------------------------
  // Comentários de alunos (com e sem resposta do professor)
  // ---------------------------------------------------------------------------
  console.log('💬 Criando comentários de alunos...');
  if (conteudosCriados.length >= 2) {
    await prisma.comentarioAluno.create({
      data: {
        texto: 'Professor, como eu ativo a confirmação em duas etapas no WhatsApp?',
        alunoId: maria.id,
        conteudoId: conteudosCriados[0].conteudo_id,
        resposta:
          'Vá em Configurações > Conta > Confirmação em duas etapas e siga o passo a passo. Qualquer dúvida, me chame na próxima aula!',
        respostaAt: new Date('2026-07-03T11:00:00'),
      },
    });

    await prisma.comentarioAluno.create({
      data: {
        texto: 'Não consegui encontrar o ícone da videochamada. Pode ajudar?',
        alunoId: joao.id,
        conteudoId: conteudosCriados[2]?.conteudo_id ?? conteudosCriados[1].conteudo_id,
      },
    });

    await prisma.comentarioAluno.create({
      data: {
        texto: 'Gostei muito da explicação sobre o Pix. Vou praticar com calma.',
        alunoId: antonio.id,
        conteudoId: conteudosCriados[6]?.conteudo_id ?? conteudosCriados[1].conteudo_id,
        resposta: 'Que bom, Antônio! Lembre-se sempre de conferir o nome e o valor.',
        respostaAt: new Date('2026-07-08T16:30:00'),
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Feed de atividades recentes (painel admin)
  // ---------------------------------------------------------------------------
  console.log('📰 Criando atividades recentes do painel admin...');
  await prisma.atividadeRecente.createMany({
    data: [
      {
        tipo: 'aluno_cadastrado',
        descricao: 'Aluno(a) Maria Souza se cadastrou no sistema',
        data: new Date('2026-06-20T09:00:00'),
      },
      {
        tipo: 'solicitacao_cadastro',
        descricao: 'Professor(a) Camila solicitou cadastro e aguarda aprovação',
        data: new Date('2026-07-10T10:00:00'),
      },
      {
        tipo: 'solicitacao_cadastro',
        descricao: 'Professor(a) Diego solicitou cadastro e aguarda aprovação',
        data: new Date('2026-07-11T11:30:00'),
      },
      {
        tipo: 'solicitacao_cadastro',
        descricao: 'Professor(a) Helena solicitou cadastro e aguarda aprovação',
        data: new Date('2026-07-12T14:00:00'),
      },
      {
        tipo: 'solicitacao_cadastro',
        descricao: 'Professor(a) Igor solicitou cadastro e aguarda aprovação',
        data: new Date('2026-07-13T08:45:00'),
      },
      {
        tipo: 'solicitacao_cadastro',
        descricao: 'Professor(a) Larissa solicitou cadastro e aguarda aprovação',
        data: new Date('2026-07-14T16:20:00'),
      },
      {
        tipo: 'usuario_aprovado',
        descricao: 'Professor(a) Marcelo teve o cadastro aprovado',
        data: new Date('2026-07-01T12:00:00'),
      },
      {
        tipo: 'usuario_recusado',
        descricao: 'O cadastro de Professor(a) Recusado Exemplo foi recusado',
        data: new Date('2026-07-05T15:00:00'),
      },
      {
        tipo: 'professor_designado',
        descricao: `Professor(a) Carlos foi designado(a) para a turma ${turmaA.nome_turma}`,
        data: new Date('2026-06-15T10:00:00'),
      },
      {
        tipo: 'professor_removido',
        descricao: `A turma ${turmaSemProfessor.nome_turma} ficou sem professor`,
        data: new Date('2026-07-09T09:30:00'),
      },
    ],
  });

  console.log('✅ Semeadura concluída com sucesso!');
  console.log('');
  console.log('🔑 Senha padrão de todos: 123456');
  console.log('👤 Admin: admin@revistuda.com.br');
  console.log('');
  console.log('👩‍🏫 Professores aprovados (5):');
  console.log('   professor@ | fernanda@ | roberto@ | juliana@ | marcelo@ (revistuda.com.br)');
  console.log('⏳ Professores pendentes (5):');
  console.log('   camila@ | diego@ | helena@ | igor@ | larissa@ (revistuda.com.br)');
  console.log('❌ Professor recusado: recusado@revistuda.com.br');
  console.log('');
  console.log(`🎓 Alunos: ${alunosData.length}`);
  console.log(`📚 Módulos: ${modulosSeed.length} (cada um com quiz + associação de imagens)`);
  console.log(`🎯 Atividades: ${quizzesCriados.length} múltipla escolha + ${associacoesCriadas.length} associação`);
  console.log('🏫 Turma sem professor: Turma F - Aguardando Professor');
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
