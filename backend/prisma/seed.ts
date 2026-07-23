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

type CursoTemplate = {
  titulo_modulo: string;
  descricao_modulo: string;
  dificuldade: string;
  imagem_url: string;
  licoes: {
    titulo_licao: string;
    comentario: string;
    conteudos: {
      nome_conteudo: string;
      tipo_conteudo: string;
      url_conteudo?: string;
      texto_conteudo?: string;
    }[];
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
  }[];
};

/** 6 cursos: 2 Fácil, 2 Médio, 2 Difícil — cada um com 2 lições (2 conteúdos + 2 atividades). */
const cursosCarlosTemplate: CursoTemplate[] = [
  {
    titulo_modulo: 'Segurança Digital',
    descricao_modulo: 'Aprenda a reconhecer e evitar os golpes mais comuns na internet e no celular.',
    dificuldade: 'Fácil',
    imagem_url: '/uploads/modulo-seguranca.jpg',
    licoes: [
      {
        titulo_licao: 'Lição 1 - Golpes no WhatsApp e no celular',
        comentario: 'Conheça os golpes mais comuns e aprenda atitudes simples para se proteger.',
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
      },
      {
        titulo_licao: 'Lição 2 - Confirmação em duas etapas',
        comentario: 'Proteja sua conta com uma camada extra de segurança.',
        conteudos: [
          {
            nome_conteudo: 'Vídeo: Ativando a verificação em duas etapas',
            tipo_conteudo: 'Vídeo',
            url_conteudo: 'https://www.youtube.com/watch?v=U6dGh0R0t58',
            texto_conteudo: 'Veja o passo a passo para ativar a confirmação em duas etapas no WhatsApp.',
          },
          {
            nome_conteudo: 'Leitura: Por que usar senha + código?',
            tipo_conteudo: 'Texto',
            texto_conteudo:
              'Mesmo que alguém descubra sua senha, ainda precisará do código enviado ao seu celular. Guarde o código de recuperação em local seguro.',
          },
        ],
        quiz: {
          titulo: 'Quiz: Duas etapas',
          enunciado: 'Para que serve a confirmação em duas etapas?',
          explicacao: 'Ela exige um segundo fator (código) além da senha, dificultando o acesso de estranhos.',
          opcoes: [
            { letra: 'a', texto_opcao: 'Deixar o celular mais rápido', correta: false },
            { letra: 'b', texto_opcao: 'Exigir um código extra além da senha', correta: true },
            { letra: 'c', texto_opcao: 'Apagar mensagens antigas automaticamente', correta: false },
          ],
        },
        associacao: {
          titulo: 'Associação: Camadas de segurança',
          enunciado: 'Associe o item à sua função.',
          pares: [
            {
              esquerdo: { tipo: 'texto', texto: 'Senha forte' },
              direito: { tipo: 'texto', texto: 'Primeira barreira de acesso' },
            },
            {
              esquerdo: { tipo: 'texto', texto: 'Código SMS / app' },
              direito: { tipo: 'texto', texto: 'Segunda etapa de confirmação' },
            },
            {
              esquerdo: { tipo: 'imagem', imagem_url: IMG.a },
              direito: { tipo: 'texto', texto: 'Código de recuperação guardado' },
            },
          ],
        },
      },
    ],
  },
  {
    titulo_modulo: 'WhatsApp no Dia a Dia',
    descricao_modulo: 'Envie mensagens, áudios e faça videochamadas para conversar com a família.',
    dificuldade: 'Fácil',
    imagem_url: '/uploads/modulo-whatsapp.jpg',
    licoes: [
      {
        titulo_licao: 'Lição 1 - Primeiros passos e mensagens',
        comentario: 'Aprenda o básico do WhatsApp: mensagens, áudios e fotos.',
        conteudos: [
          {
            nome_conteudo: 'Vídeo: Aula de WhatsApp básico para idosos',
            tipo_conteudo: 'Vídeo',
            url_conteudo: 'https://www.youtube.com/watch?v=dR5PNZhaLzU',
            texto_conteudo: 'Aula passo a passo mostrando como enviar mensagens, áudios e fotos no WhatsApp.',
          },
          {
            nome_conteudo: 'Leitura: Enviando sua primeira mensagem',
            tipo_conteudo: 'Texto',
            texto_conteudo:
              'Abra a conversa, digite no campo inferior, toque na setinha verde para enviar. Para áudio, segure o microfone.',
          },
        ],
        quiz: {
          titulo: 'Quiz: Mensagens no WhatsApp',
          enunciado: 'Onde você digita o texto de uma mensagem no WhatsApp?',
          explicacao: 'O campo de texto fica na parte de baixo da conversa, ao lado do microfone.',
          opcoes: [
            { letra: 'a', texto_opcao: 'No topo da tela, perto do nome do contato', correta: false },
            { letra: 'b', texto_opcao: 'Na parte de baixo da conversa', correta: true },
            { letra: 'c', texto_opcao: 'Somente pelo teclado do computador', correta: false },
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
      },
      {
        titulo_licao: 'Lição 2 - Videochamadas com a família',
        comentario: 'Aprenda a ligar de vídeo e encerrar a chamada com segurança.',
        conteudos: [
          {
            nome_conteudo: 'Vídeo: Como fazer videochamada no WhatsApp',
            tipo_conteudo: 'Vídeo',
            url_conteudo: 'https://www.youtube.com/watch?v=dR5PNZhaLzU',
            texto_conteudo: 'Veja como iniciar e encerrar uma videochamada.',
          },
          {
            nome_conteudo: 'Leitura: Como fazer uma videochamada',
            tipo_conteudo: 'Texto',
            texto_conteudo:
              'Para fazer uma videochamada: 1) Abra a conversa. 2) Toque no ícone de câmera de vídeo. 3) Aguarde atender. 4) Encerre no botão vermelho.',
          },
        ],
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
          titulo: 'Associação: Passos da videochamada',
          enunciado: 'Associe o passo à ação.',
          pares: [
            {
              esquerdo: { tipo: 'texto', texto: 'Abrir a conversa' },
              direito: { tipo: 'texto', texto: 'Escolher com quem falar' },
            },
            {
              esquerdo: { tipo: 'imagem', imagem_url: IMG.b },
              direito: { tipo: 'texto', texto: 'Tocar no ícone de vídeo' },
            },
            {
              esquerdo: { tipo: 'texto', texto: 'Botão vermelho' },
              direito: { tipo: 'texto', texto: 'Encerrar a chamada' },
            },
          ],
        },
      },
    ],
  },
  {
    titulo_modulo: 'Notícias Falsas (Fake News)',
    descricao_modulo: 'Como identificar informações falsas antes de acreditar ou compartilhar.',
    dificuldade: 'Médio',
    imagem_url: '/uploads/modulo-fakenews.jpg',
    licoes: [
      {
        titulo_licao: 'Lição 1 - Como identificar uma notícia falsa',
        comentario: 'Dicas práticas para desconfiar, verificar e não espalhar informações falsas.',
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
      },
      {
        titulo_licao: 'Lição 2 - Fontes confiáveis',
        comentario: 'Saiba onde checar informações antes de acreditar.',
        conteudos: [
          {
            nome_conteudo: 'Vídeo: Onde checar notícias',
            tipo_conteudo: 'Vídeo',
            url_conteudo: 'https://www.youtube.com/watch?v=V3atlyamy70',
            texto_conteudo: 'Conheça sites e práticas para confirmar uma informação.',
          },
          {
            nome_conteudo: 'Leitura: Lista de checagem rápida',
            tipo_conteudo: 'Texto',
            texto_conteudo:
              'Confira: autor, data, site oficial, se outras reportagens confirmam e se o título bate com o texto.',
          },
        ],
        quiz: {
          titulo: 'Quiz: Fontes',
          enunciado: 'Qual é a melhor forma de confirmar uma notícia duvidosa?',
          explicacao: 'Buscar a mesma informação em veículos conhecidos e oficiais reduz o risco de fake news.',
          opcoes: [
            { letra: 'a', texto_opcao: 'Perguntar só no grupo da família', correta: false },
            { letra: 'b', texto_opcao: 'Conferir em site de notícias confiável', correta: true },
            { letra: 'c', texto_opcao: 'Acreditar se a imagem parecer real', correta: false },
          ],
        },
        associacao: {
          titulo: 'Associação: Verificar informação',
          enunciado: 'Associe a ação ao objetivo.',
          pares: [
            {
              esquerdo: { tipo: 'texto', texto: 'Ler a data da matéria' },
              direito: { tipo: 'texto', texto: 'Evitar notícia antiga recirculando' },
            },
            {
              esquerdo: { tipo: 'texto', texto: 'Buscar o título no Google' },
              direito: { tipo: 'texto', texto: 'Ver se outros sites confirmam' },
            },
            {
              esquerdo: { tipo: 'imagem', imagem_url: IMG.d },
              direito: { tipo: 'texto', texto: 'Preferir fonte oficial' },
            },
          ],
        },
      },
    ],
  },
  {
    titulo_modulo: 'Pix e Banco pelo Celular',
    descricao_modulo: 'Use o aplicativo do banco e faça Pix com tranquilidade e segurança.',
    dificuldade: 'Médio',
    imagem_url: '/uploads/modulo-pix.jpg',
    licoes: [
      {
        titulo_licao: 'Lição 1 - Fazendo um Pix com segurança',
        comentario: 'Passo a passo do Pix e os cuidados essenciais antes de confirmar um pagamento.',
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
      },
      {
        titulo_licao: 'Lição 2 - Chaves Pix e limites',
        comentario: 'Entenda chaves, limites e o que fazer se algo der errado.',
        conteudos: [
          {
            nome_conteudo: 'Vídeo: Tipos de chave Pix',
            tipo_conteudo: 'Vídeo',
            url_conteudo: 'https://www.youtube.com/watch?v=lPr-hL9CZd0',
            texto_conteudo: 'CPF, e-mail, telefone e chave aleatória: quando usar cada uma.',
          },
          {
            nome_conteudo: 'Leitura: Limite noturno e segurança',
            tipo_conteudo: 'Texto',
            texto_conteudo:
              'Defina um limite baixo à noite. Se receber ligação pedindo Pix urgente, desligue e ligue para o banco no número oficial.',
          },
        ],
        quiz: {
          titulo: 'Quiz: Chaves Pix',
          enunciado: 'Qual atitude é mais segura se alguém ligar pedindo um Pix "de teste"?',
          explicacao: 'Bancos não pedem Pix de teste por telefone. Desligue e use o canal oficial do banco.',
          opcoes: [
            { letra: 'a', texto_opcao: 'Fazer o Pix pequeno para testar', correta: false },
            { letra: 'b', texto_opcao: 'Desligar e contatar o banco pelo app ou número oficial', correta: true },
            { letra: 'c', texto_opcao: 'Passar a senha para o atendente', correta: false },
          ],
        },
        associacao: {
          titulo: 'Associação: Chaves e limites',
          enunciado: 'Associe o conceito ao significado.',
          pares: [
            {
              esquerdo: { tipo: 'texto', texto: 'Chave aleatória' },
              direito: { tipo: 'texto', texto: 'Código gerado pelo banco' },
            },
            {
              esquerdo: { tipo: 'texto', texto: 'Limite noturno' },
              direito: { tipo: 'texto', texto: 'Proteção contra golpes à noite' },
            },
            {
              esquerdo: { tipo: 'imagem', imagem_url: IMG.e },
              direito: { tipo: 'texto', texto: 'Conferir destinatário na tela' },
            },
          ],
        },
      },
    ],
  },
  {
    titulo_modulo: 'Privacidade e Senhas',
    descricao_modulo: 'Crie senhas fortes, proteja seus dados e evite compartilhar informações sensíveis.',
    dificuldade: 'Difícil',
    imagem_url: '/uploads/modulo-seguranca.jpg',
    licoes: [
      {
        titulo_licao: 'Lição 1 - Criando senhas fortes',
        comentario: 'Aprenda o que torna uma senha difícil de adivinhar.',
        conteudos: [
          {
            nome_conteudo: 'Vídeo: Como criar uma senha segura',
            tipo_conteudo: 'Vídeo',
            url_conteudo: 'https://www.youtube.com/watch?v=U6dGh0R0t58',
            texto_conteudo: 'Dicas práticas para montar senhas longas e únicas.',
          },
          {
            nome_conteudo: 'Leitura: Regras de uma boa senha',
            tipo_conteudo: 'Texto',
            texto_conteudo:
              'Use pelo menos 8 caracteres, misture letras e números, não use datas de aniversário e nunca repita a mesma senha em todos os sites.',
          },
        ],
        quiz: {
          titulo: 'Quiz: Senha forte',
          enunciado: 'Qual senha é mais segura?',
          explicacao: 'Senhas longas, sem dados pessoais óbvios e com combinação de caracteres são mais seguras.',
          opcoes: [
            { letra: 'a', texto_opcao: '123456', correta: false },
            { letra: 'b', texto_opcao: 'Nome + ano de nascimento', correta: false },
            { letra: 'c', texto_opcao: 'Frase longa com letras e números, sem dados pessoais', correta: true },
          ],
        },
        associacao: {
          titulo: 'Associação: Boas e más práticas',
          enunciado: 'Associe a prática ao risco ou benefício.',
          pares: [
            {
              esquerdo: { tipo: 'texto', texto: 'Mesma senha em tudo' },
              direito: { tipo: 'texto', texto: 'Alto risco se um site vazar' },
            },
            {
              esquerdo: { tipo: 'texto', texto: 'Senha única por serviço' },
              direito: { tipo: 'texto', texto: 'Mais proteção' },
            },
            {
              esquerdo: { tipo: 'imagem', imagem_url: IMG.g },
              direito: { tipo: 'texto', texto: 'Anotar em local privado e seguro' },
            },
          ],
        },
      },
      {
        titulo_licao: 'Lição 2 - Dados pessoais na internet',
        comentario: 'Saiba o que não deve ser compartilhado em redes e mensagens.',
        conteudos: [
          {
            nome_conteudo: 'Vídeo: Privacidade no celular',
            tipo_conteudo: 'Vídeo',
            url_conteudo: 'https://www.youtube.com/watch?v=U6dGh0R0t58',
            texto_conteudo: 'Cuidados com fotos, documentos e permissões de aplicativos.',
          },
          {
            nome_conteudo: 'Leitura: O que nunca enviar por mensagem',
            tipo_conteudo: 'Texto',
            texto_conteudo:
              'Não envie senha, foto do RG completo, código do banco ou cartão. Em dúvida, confirme pessoalmente ou por ligação no número conhecido.',
          },
        ],
        quiz: {
          titulo: 'Quiz: Privacidade',
          enunciado: 'O que você NÃO deve enviar por WhatsApp?',
          explicacao: 'Senhas e códigos de banco nunca devem ser enviados por mensagem.',
          opcoes: [
            { letra: 'a', texto_opcao: 'Uma foto da família no parque', correta: false },
            { letra: 'b', texto_opcao: 'A senha do banco ou o código SMS', correta: true },
            { letra: 'c', texto_opcao: 'Um áudio desejando bom dia', correta: false },
          ],
        },
        associacao: {
          titulo: 'Associação: Dados sensíveis',
          enunciado: 'Associe o dado ao cuidado.',
          pares: [
            {
              esquerdo: { tipo: 'texto', texto: 'Senha do banco' },
              direito: { tipo: 'texto', texto: 'Nunca compartilhar' },
            },
            {
              esquerdo: { tipo: 'texto', texto: 'Foto de documento' },
              direito: { tipo: 'texto', texto: 'Só em canal oficial seguro' },
            },
            {
              esquerdo: { tipo: 'imagem', imagem_url: IMG.g },
              direito: { tipo: 'texto', texto: 'Revisar permissões do app' },
            },
          ],
        },
      },
    ],
  },
  {
    titulo_modulo: 'Compras Online Seguras',
    descricao_modulo: 'Aprenda a comprar pela internet sem cair em sites falsos e ofertas enganosas.',
    dificuldade: 'Difícil',
    imagem_url: '/uploads/modulo-compras.jpg',
    licoes: [
      {
        titulo_licao: 'Lição 1 - Reconhecendo sites confiáveis',
        comentario: 'Como reconhecer um site confiável e desconfiar de ofertas boas demais.',
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
      },
      {
        titulo_licao: 'Lição 2 - Pagamento e entrega',
        comentario: 'Cuidados na hora de pagar e acompanhar o pedido.',
        conteudos: [
          {
            nome_conteudo: 'Vídeo: Formas seguras de pagamento',
            tipo_conteudo: 'Vídeo',
            url_conteudo: 'https://www.youtube.com/watch?v=eZspUgfpuzY',
            texto_conteudo: 'Cartão com proteção, site com cadeado e lojas conhecidas.',
          },
          {
            nome_conteudo: 'Leitura: Acompanhar o pedido',
            tipo_conteudo: 'Texto',
            texto_conteudo:
              'Guarde o comprovante, use o rastreio oficial da loja e desconfie de links de "taxa de liberação" enviados por SMS.',
          },
        ],
        quiz: {
          titulo: 'Quiz: Entrega',
          enunciado: 'Você recebe um SMS pedindo taxa para liberar uma encomenda. O que fazer?',
          explicacao: 'Golpes de taxa de liberação são comuns. Confirme no site/app oficial da loja ou dos Correios.',
          opcoes: [
            { letra: 'a', texto_opcao: 'Pagar logo pelo link do SMS', correta: false },
            { letra: 'b', texto_opcao: 'Ignorar o link e conferir no canal oficial', correta: true },
            { letra: 'c', texto_opcao: 'Passar os dados do cartão para o remetente', correta: false },
          ],
        },
        associacao: {
          titulo: 'Associação: Pagamento e entrega',
          enunciado: 'Associe a situação à atitude correta.',
          pares: [
            {
              esquerdo: { tipo: 'texto', texto: 'Site com cadeado (https)' },
              direito: { tipo: 'texto', texto: 'Conexão mais segura' },
            },
            {
              esquerdo: { tipo: 'texto', texto: 'SMS com link de taxa' },
              direito: { tipo: 'texto', texto: 'Provável golpe — não clicar' },
            },
            {
              esquerdo: { tipo: 'imagem', imagem_url: IMG.h },
              direito: { tipo: 'texto', texto: 'Guardar comprovante da compra' },
            },
          ],
        },
      },
    ],
  },
];

type CursoCriado = {
  modulo: { modulo_id: number; titulo_modulo: string; dificuldade: string; turma_id: number };
  conteudoIds: number[];
  atividadeIds: number[];
  licoes: number;
  conteudos: number;
  quizzes: number;
  associacoes: number;
};

async function criarCursoCompleto(template: CursoTemplate, turmaId: number): Promise<CursoCriado> {
  const modulo = await prisma.modulo.create({
    data: {
      titulo_modulo: template.titulo_modulo,
      descricao_modulo: template.descricao_modulo,
      dificuldade: template.dificuldade,
      imagem_url: template.imagem_url,
      turma_id: turmaId,
    },
  });

  const conteudoIds: number[] = [];
  const atividadeIds: number[] = [];
  let licoes = 0;
  let conteudos = 0;
  let quizzes = 0;
  let associacoes = 0;

  for (const licaoTpl of template.licoes) {
    const licao = await prisma.licao.create({
      data: {
        titulo_licao: licaoTpl.titulo_licao,
        comentario: licaoTpl.comentario,
        modulo_id: modulo.modulo_id,
      },
    });
    licoes += 1;

    for (const c of licaoTpl.conteudos) {
      const conteudo = await prisma.conteudo.create({
        data: {
          nome_conteudo: c.nome_conteudo,
          tipo_conteudo: c.tipo_conteudo,
          url_conteudo: c.url_conteudo ?? null,
          texto_conteudo: c.texto_conteudo ?? null,
          licao_id: licao.licao_id,
        },
      });
      conteudoIds.push(conteudo.conteudo_id);
      conteudos += 1;
    }

    const quiz = await criarAtividadeMultiplaEscolha({
      titulo: licaoTpl.quiz.titulo,
      enunciado: licaoTpl.quiz.enunciado,
      explicacao: licaoTpl.quiz.explicacao,
      licaoId: licao.licao_id,
      opcoes: licaoTpl.quiz.opcoes,
    });
    atividadeIds.push(quiz.atividade_id);
    quizzes += 1;

    const associacao = await criarAtividadeAssociacao({
      titulo: licaoTpl.associacao.titulo,
      enunciado: licaoTpl.associacao.enunciado,
      licaoId: licao.licao_id,
      pares: licaoTpl.associacao.pares,
    });
    atividadeIds.push(associacao.atividade_id);
    associacoes += 1;
  }

  return { modulo, conteudoIds, atividadeIds, licoes, conteudos, quizzes, associacoes };
}

async function marcarConteudosConcluidos(alunoId: number, conteudoIds: number[], dataBase: Date) {
  for (let i = 0; i < conteudoIds.length; i++) {
    await prisma.progressoConteudo.create({
      data: {
        aluno_id: alunoId,
        conteudo_id: conteudoIds[i],
        data_conclusao: new Date(dataBase.getTime() + i * 60 * 60 * 1000),
      },
    });
  }
}

async function marcarAtividadesFeitas(alunoId: number, atividadeIds: number[], dataBase: Date) {
  for (let i = 0; i < atividadeIds.length; i++) {
    const inicio = new Date(dataBase.getTime() + i * 90 * 60 * 1000);
    const fim = new Date(inicio.getTime() + 25 * 60 * 1000);
    await prisma.progressoAtividade.create({
      data: {
        aluno_id: alunoId,
        atividade_id: atividadeIds[i],
        status: 'feito',
        data_inicio: inicio,
        data_conclusao: fim,
      },
    });
  }
}

/** Responde quiz/associação com acertos e erros misturados e marca como feito. */
async function responderAtividadesComVariacao(
  alunoId: number,
  atividadeIds: number[],
  dataBase: Date,
) {
  for (let i = 0; i < atividadeIds.length; i++) {
    const atividadeId = atividadeIds[i];
    // ~2/3 certas, ~1/3 erradas — padrão diferente por aluno
    const acertou = (alunoId + i) % 3 !== 0;
    const momento = new Date(dataBase.getTime() + i * 35 * 60 * 1000);

    const atividade = await prisma.atividade.findUniqueOrThrow({
      where: { atividade_id: atividadeId },
      include: {
        multipla_escolha: { include: { opcoes: true } },
        associacao_imagens: { include: { itens: true } },
      },
    });

    if (atividade.multipla_escolha) {
      const opcoes = atividade.multipla_escolha.opcoes;
      const correta = opcoes.find((o) => o.correta);
      const erradas = opcoes.filter((o) => !o.correta);
      const escolhida =
        acertou && correta
          ? correta
          : erradas[(alunoId + i) % Math.max(erradas.length, 1)] ?? correta;

      if (escolhida) {
        await prisma.respostaMultiplaEscolha.create({
          data: {
            aluno_id: alunoId,
            resposta_aluno_id: escolhida.opcao_id,
            data_resposta: momento,
          },
        });
      }
    } else if (atividade.associacao_imagens) {
      const associacaoId = atividade.associacao_imagens.associacao_id;
      const esquerdos = atividade.associacao_imagens.itens
        .filter((item) => item.lado === 'esquerdo')
        .map((item) => item.item_associacao_id);

      const paresCorretos = await prisma.associacaoCorreta.findMany({
        where: { item_1_id: { in: esquerdos } },
      });

      let pares = paresCorretos.map((p) => ({
        item_1_id: p.item_1_id,
        item_2_id: p.item_2_id,
      }));

      if (!acertou && pares.length > 1) {
        const direitos = pares.map((p) => p.item_2_id);
        const rotacionados = [...direitos.slice(1), direitos[0]];
        pares = pares.map((p, idx) => ({
          item_1_id: p.item_1_id,
          item_2_id: rotacionados[idx],
        }));
      }

      await prisma.tentativaAssociacao.create({
        data: {
          user_id: alunoId,
          associacao_id: associacaoId,
          data_tentativa: momento,
          respostas: { create: pares },
        },
      });
    }

    await prisma.progressoAtividade.create({
      data: {
        aluno_id: alunoId,
        atividade_id: atividadeId,
        status: 'feito',
        data_inicio: momento,
        data_conclusao: new Date(momento.getTime() + 20 * 60 * 1000),
      },
    });
  }
}

type AlunoSeed = { nome: string; email: string };
type AlunoCriado = { id: number; nome: string; email: string; turma_id: number | null };

type ProfessorRicoInput = {
  professor: { id: number; nome: string };
  turmaLotada: { nome_turma: string; descricao_turma: string };
  turmaParcial: { nome_turma: string; descricao_turma: string };
  alunosLotada: AlunoSeed[]; // 10 — o 1º é o aluno demo (estilo Maria)
  alunosParcial: AlunoSeed[]; // 6
  senha: string;
  /** Se true, alunos respondem todas as atividades dos cursos fáceis com acertos/erros misturados. */
  variarRespostasAtividades?: boolean;
};

type ProfessorRicoResultado = {
  turmaLotadaId: number;
  turmaParcialId: number;
  alunos: number;
  modulos: number;
  licoes: number;
  conteudos: number;
  quizzes: number;
  associacoes: number;
  comentarios: number;
  demoEmail: string;
  demoNome: string;
};

function primeiroNome(nome: string) {
  return nome.split(' ')[0];
}

/** Mesmo padrão do Carlos: 2 turmas (10/10 + 6/10), 6 cursos espelhados, progresso e comentários. */
async function povoarProfessorRico(input: ProfessorRicoInput): Promise<ProfessorRicoResultado> {
  const { professor, senha } = input;
  console.log(`🏫 Povoando ${professor.nome} (2 turmas + cursos + progresso)...`);

  const turmaLotada = await prisma.turma.create({
    data: {
      nome_turma: input.turmaLotada.nome_turma,
      descricao_turma: input.turmaLotada.descricao_turma,
      capacidade_maxima: 10,
      professor_id: professor.id,
    },
  });

  const turmaParcial = await prisma.turma.create({
    data: {
      nome_turma: input.turmaParcial.nome_turma,
      descricao_turma: input.turmaParcial.descricao_turma,
      capacidade_maxima: 10,
      professor_id: professor.id,
    },
  });

  const alunos: AlunoCriado[] = [];
  for (const a of input.alunosLotada) {
    alunos.push(
      await prisma.user.create({
        data: {
          nome: a.nome,
          email: a.email,
          senha,
          permissions: ['ALUNO_IDOSO'],
          approved: true,
          turma_id: turmaLotada.turma_id,
        },
        select: { id: true, nome: true, email: true, turma_id: true },
      }),
    );
  }
  for (const a of input.alunosParcial) {
    alunos.push(
      await prisma.user.create({
        data: {
          nome: a.nome,
          email: a.email,
          senha,
          permissions: ['ALUNO_IDOSO'],
          approved: true,
          turma_id: turmaParcial.turma_id,
        },
        select: { id: true, nome: true, email: true, turma_id: true },
      }),
    );
  }

  const demo = alunos[0];
  const alunosLotada = alunos.filter((a) => a.turma_id === turmaLotada.turma_id);
  const alunosParcial = alunos.filter((a) => a.turma_id === turmaParcial.turma_id);

  const cursosLotada: CursoCriado[] = [];
  const cursosParcial: CursoCriado[] = [];
  let modulos = 0;
  let licoes = 0;
  let conteudos = 0;
  let quizzes = 0;
  let associacoes = 0;

  for (const curso of cursosCarlosTemplate) {
    const cL = await criarCursoCompleto(curso, turmaLotada.turma_id);
    const cP = await criarCursoCompleto(curso, turmaParcial.turma_id);
    cursosLotada.push(cL);
    cursosParcial.push(cP);
    modulos += 2;
    licoes += cL.licoes + cP.licoes;
    conteudos += cL.conteudos + cP.conteudos;
    quizzes += cL.quizzes + cP.quizzes;
    associacoes += cL.associacoes + cP.associacoes;
  }

  const faceisL = cursosLotada.filter((c) => c.modulo.dificuldade === 'Fácil');
  const mediosL = cursosLotada.filter((c) => c.modulo.dificuldade === 'Médio');
  const dificeisL = cursosLotada.filter((c) => c.modulo.dificuldade === 'Difícil');
  const faceisP = cursosParcial.filter((c) => c.modulo.dificuldade === 'Fácil');
  const mediosP = cursosParcial.filter((c) => c.modulo.dificuldade === 'Médio');
  const dificeisP = cursosParcial.filter((c) => c.modulo.dificuldade === 'Difícil');

  // Demo: 2 cursos fáceis 100% + todas as atividades deles
  const dataDemo = new Date('2026-07-08T09:00:00');
  const variar = input.variarRespostasAtividades === true;

  for (const curso of faceisL) {
    await marcarConteudosConcluidos(demo.id, curso.conteudoIds, dataDemo);
    if (variar) {
      await responderAtividadesComVariacao(demo.id, curso.atividadeIds, dataDemo);
    } else {
      await marcarAtividadesFeitas(demo.id, curso.atividadeIds, dataDemo);
    }
  }

  // Colegas da turma lotada: cursos fáceis concluídos
  for (const aluno of alunosLotada.filter((a) => a.id !== demo.id)) {
    for (const curso of faceisL) {
      await marcarConteudosConcluidos(aluno.id, curso.conteudoIds, new Date('2026-07-09T10:00:00'));
      if (variar) {
        // Todas as atividades dos dois cursos fáceis, com acertos e erros
        await responderAtividadesComVariacao(
          aluno.id,
          curso.atividadeIds,
          new Date('2026-07-09T11:00:00'),
        );
      } else {
        await marcarAtividadesFeitas(aluno.id, curso.atividadeIds.slice(0, 2), new Date('2026-07-09T11:00:00'));
      }
    }
  }

  // Turma parcial: mesmos cursos fáceis
  for (const aluno of alunosParcial) {
    for (const curso of faceisP) {
      await marcarConteudosConcluidos(aluno.id, curso.conteudoIds, new Date('2026-07-10T19:00:00'));
      if (variar) {
        await responderAtividadesComVariacao(
          aluno.id,
          curso.atividadeIds,
          new Date('2026-07-10T20:00:00'),
        );
      } else {
        await marcarAtividadesFeitas(aluno.id, curso.atividadeIds.slice(0, 2), new Date('2026-07-10T20:00:00'));
      }
    }
  }

  const demoNome = primeiroNome(demo.nome);
  const profNome = primeiroNome(professor.nome.replace(/^Professor(a)?\s+/i, ''));

  type ComentarioSeed = {
    alunoId: number;
    conteudoId: number;
    texto: string;
    resposta?: string;
    createdAt: Date;
    respostaAt?: Date;
  };

  const comentarios: ComentarioSeed[] = [
    {
      alunoId: demo.id,
      conteudoId: faceisL[0].conteudoIds[0],
      texto: `O vídeo me ajudou muito! Quase caí num golpe parecido no WhatsApp semana passada.`,
      resposta: `Que bom que ajudou, ${demoNome}! Sempre confirme no número antigo antes de transferir.`,
      createdAt: new Date('2026-07-11T10:00:00'),
      respostaAt: new Date('2026-07-12T14:00:00'),
    },
    {
      alunoId: demo.id,
      conteudoId: faceisL[0].conteudoIds[1],
      texto: 'As 5 regras de ouro ficaram fáceis de lembrar. Já mostrei para a família.',
      resposta: 'Ótimo! Compartilhar com a família reforça a segurança de todos.',
      createdAt: new Date('2026-07-11T10:10:00'),
      respostaAt: new Date('2026-07-12T14:05:00'),
    },
    {
      alunoId: demo.id,
      conteudoId: faceisL[0].conteudoIds[2],
      texto: 'Consegui ativar a confirmação em duas etapas seguindo o passo a passo.',
      createdAt: new Date('2026-07-11T10:20:00'),
    },
    {
      alunoId: demo.id,
      conteudoId: faceisL[1].conteudoIds[0],
      texto: 'Agora sei enviar áudio e foto para os meus netos. Estou muito feliz!',
      resposta: `Parabéns, ${demoNome}! Na próxima lição vamos treinar a videochamada.`,
      createdAt: new Date('2026-07-11T10:30:00'),
      respostaAt: new Date('2026-07-12T14:10:00'),
    },
    {
      alunoId: demo.id,
      conteudoId: faceisL[1].conteudoIds[1],
      texto: 'A explicação do campo de mensagem na parte de baixo da tela foi bem clara.',
      createdAt: new Date('2026-07-11T10:40:00'),
    },
    {
      alunoId: demo.id,
      conteudoId: faceisL[1].conteudoIds[3],
      texto: 'Fiz uma videochamada com minha irmã ontem. Funcionou de primeira!',
      resposta: 'Excelente! Continue praticando no horário que for mais confortável.',
      createdAt: new Date('2026-07-11T10:50:00'),
      respostaAt: new Date('2026-07-12T14:15:00'),
    },
  ];

  // Comentários de colegas na turma lotada (fácil / médio / difícil)
  const colegasLotada = alunosLotada.filter((a) => a.id !== demo.id);
  const textosLotada: { idx: number; conteudoId: number; texto: string; resposta?: string }[] = [
    {
      idx: 0,
      conteudoId: faceisL[0].conteudoIds[0],
      texto: 'Eu também quase enviei dinheiro. Esse curso chegou na hora certa!',
      resposta: `${primeiroNome(colegasLotada[0]?.nome ?? 'Colega')}, sempre desconfie de urgência pedindo Pix.`,
    },
    {
      idx: 1,
      conteudoId: faceisL[0].conteudoIds[3],
      texto: 'Guardei o código de recuperação no caderno, como a professora orientou.',
    },
    {
      idx: 2,
      conteudoId: faceisL[1].conteudoIds[0],
      texto: 'No começo eu tinha medo do WhatsApp. Agora mando mensagem todo dia.',
      resposta: `Que conquista! O medo vai passando com a prática.`,
    },
    {
      idx: 3,
      conteudoId: faceisL[1].conteudoIds[2],
      texto: `A videochamada ficou fácil depois do vídeo. Obrigada, ${profNome}!`,
    },
    {
      idx: 4,
      conteudoId: mediosL[0].conteudoIds[0],
      texto: 'Aprendi a desconfiar de "compartilhe com todos". Muito útil!',
      resposta: 'Isso mesmo. Na dúvida, não compartilhe.',
    },
    {
      idx: 5,
      conteudoId: mediosL[0].conteudoIds[1],
      texto: 'Agora eu verifico a data da notícia antes de acreditar.',
    },
    {
      idx: 6,
      conteudoId: mediosL[1].conteudoIds[0],
      texto: 'O tutorial do Pix me deixou mais tranquilo(a) para pagar a farmácia.',
      resposta: 'Lembre sempre de conferir nome e valor antes de confirmar.',
    },
    {
      idx: 7,
      conteudoId: mediosL[1].conteudoIds[2],
      texto: 'Coloquei limite noturno baixo no aplicativo do banco.',
    },
    {
      idx: 8,
      conteudoId: dificeisL[0].conteudoIds[0],
      texto: 'Nunca mais vou usar a data de aniversário como senha.',
    },
    {
      idx: 1,
      conteudoId: dificeisL[0].conteudoIds[1],
      texto: 'Gostei da dica de senha única por serviço. Vou anotar as minhas.',
      resposta: 'Perfeito. Guarde as anotações em local privado.',
    },
    {
      idx: 0,
      conteudoId: dificeisL[1].conteudoIds[0],
      texto: 'Desconfiei de uma loja que só aceitava Pix. Foi golpe mesmo!',
      resposta: 'Ótima observação. Prefira lojas conhecidas com CNPJ.',
    },
    {
      idx: 3,
      conteudoId: dificeisL[1].conteudoIds[1],
      texto: 'Recebi SMS de "taxa de liberação" e ignorei. Obrigado pelas dicas!',
    },
  ];

  for (const t of textosLotada) {
    const aluno = colegasLotada[t.idx];
    if (!aluno) continue;
    comentarios.push({
      alunoId: aluno.id,
      conteudoId: t.conteudoId,
      texto: t.texto,
      resposta: t.resposta,
      createdAt: new Date('2026-07-12T11:00:00'),
      respostaAt: t.resposta ? new Date('2026-07-13T15:00:00') : undefined,
    });
  }

  // Comentários da turma parcial
  const textosParcial: { idx: number; conteudoId: number; texto: string; resposta?: string }[] = [
    {
      idx: 0,
      conteudoId: faceisP[0].conteudoIds[0],
      texto: 'Nesta turma também vimos esse golpe. Muito importante!',
      resposta: 'Continue alertando os colegas do grupo da família.',
    },
    {
      idx: 1,
      conteudoId: faceisP[0].conteudoIds[1],
      texto: 'As regras de ouro estão coladas na geladeira daqui de casa.',
    },
    {
      idx: 2,
      conteudoId: faceisP[1].conteudoIds[0],
      texto: 'Mandei meu primeiro áudio hoje. A aula foi bem prática.',
      resposta: 'Parabéns! Na próxima aula treinamos videochamada.',
    },
    {
      idx: 3,
      conteudoId: faceisP[1].conteudoIds[2],
      texto: 'Consegui fazer videochamada com minha filha que mora longe.',
    },
    {
      idx: 4,
      conteudoId: mediosP[0].conteudoIds[0],
      texto: 'Antes eu repassava tudo. Agora verifico em site confiável.',
      resposta: 'Excelente hábito. Assim você protege toda a família.',
    },
    {
      idx: 5,
      conteudoId: mediosP[1].conteudoIds[1],
      texto: 'Ainda tenho um pouco de medo do Pix, mas estou praticando com valores pequenos.',
    },
    {
      idx: 1,
      conteudoId: dificeisP[0].conteudoIds[0],
      texto: 'Troquei a senha fraca por uma frase longa, como o curso ensinou.',
    },
    {
      idx: 0,
      conteudoId: dificeisP[1].conteudoIds[0],
      texto: 'Vi uma oferta boa demais e lembrei da aula. Não comprei.',
      resposta: 'Ótimo! Preço bom demais costuma ser sinal de alerta.',
    },
  ];

  for (const t of textosParcial) {
    const aluno = alunosParcial[t.idx];
    if (!aluno) continue;
    comentarios.push({
      alunoId: aluno.id,
      conteudoId: t.conteudoId,
      texto: t.texto,
      resposta: t.resposta,
      createdAt: new Date('2026-07-13T20:00:00'),
      respostaAt: t.resposta ? new Date('2026-07-14T21:00:00') : undefined,
    });
  }

  for (const c of comentarios) {
    await prisma.comentarioAluno.create({
      data: {
        alunoId: c.alunoId,
        conteudoId: c.conteudoId,
        texto: c.texto,
        resposta: c.resposta ?? null,
        respostaAt: c.respostaAt ?? null,
        createdAt: c.createdAt,
      },
    });
  }

  return {
    turmaLotadaId: turmaLotada.turma_id,
    turmaParcialId: turmaParcial.turma_id,
    alunos: alunos.length,
    modulos,
    licoes,
    conteudos,
    quizzes,
    associacoes,
    comentarios: comentarios.length,
    demoEmail: demo.email,
    demoNome: demo.nome,
  };
}

async function main() {
  console.log('🌱 Iniciando a semeadura do banco de dados...');

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

  for (const p of professoresPendentesData) {
    await prisma.user.create({
      data: {
        nome: p.nome,
        email: p.email,
        senha,
        permissions: ['PROFESSOR'],
        approved: false,
        rejected: false,
      },
    });
  }

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
  // Cada professor aprovado: 2 turmas (10/10 + 6/10), 6 cursos espelhados,
  // progresso nos fáceis e comentários (1º aluno da lotada = demo estilo Maria)
  // ---------------------------------------------------------------------------
  const resultadosProfessores: ProfessorRicoResultado[] = [];

  resultadosProfessores.push(
    await povoarProfessorRico({
      professor: profCarlos,
      senha,
      variarRespostasAtividades: true,
      turmaLotada: {
        nome_turma: 'Turma A - Inclusão Digital (Manhã)',
        descricao_turma: 'Turma de inclusão digital para a terceira idade no período matutino.',
      },
      turmaParcial: {
        nome_turma: 'Turma B - Inclusão Digital (Noite)',
        descricao_turma: 'Turma de inclusão digital para a terceira idade no período noturno.',
      },
      alunosLotada: [
        { nome: 'Maria Souza', email: 'maria@revistuda.com.br' },
        { nome: 'João Silva', email: 'joao@revistuda.com.br' },
        { nome: 'Antônio Ferreira', email: 'antonio@revistuda.com.br' },
        { nome: 'Terezinha Oliveira', email: 'terezinha@revistuda.com.br' },
        { nome: 'Francisco Barbosa', email: 'francisco@revistuda.com.br' },
        { nome: 'Rita Nascimento', email: 'rita@revistuda.com.br' },
        { nome: 'Ana Costa', email: 'ana@revistuda.com.br' },
        { nome: 'Pedro Lima', email: 'pedro@revistuda.com.br' },
        { nome: 'José Carlos Mendes', email: 'josecarlos@revistuda.com.br' },
        { nome: 'Lourdes Almeida', email: 'lourdes@revistuda.com.br' },
      ],
      alunosParcial: [
        { nome: 'Sebastião Ramos', email: 'sebastiao@revistuda.com.br' },
        { nome: 'Neide Carvalho', email: 'neide@revistuda.com.br' },
        { nome: 'Geraldo Pinto', email: 'geraldo@revistuda.com.br' },
        { nome: 'Ivone Duarte', email: 'ivone@revistuda.com.br' },
        { nome: 'Osvaldo Teixeira', email: 'osvaldo@revistuda.com.br' },
        { nome: 'Marlene Rocha', email: 'marlene@revistuda.com.br' },
      ],
    }),
  );

  resultadosProfessores.push(
    await povoarProfessorRico({
      professor: profFernanda,
      senha,
      turmaLotada: {
        nome_turma: 'Turma C - Inclusão Digital (Tarde)',
        descricao_turma: 'Turma da tarde da Professora Fernanda.',
      },
      turmaParcial: {
        nome_turma: 'Turma D - Informática Básica (Manhã)',
        descricao_turma: 'Turma matutina de informática básica da Professora Fernanda.',
      },
      alunosLotada: [
        { nome: 'Clara Mendes', email: 'clara@revistuda.com.br' },
        { nome: 'Beatriz Souza', email: 'beatriz@revistuda.com.br' },
        { nome: 'Dolores Pinto', email: 'dolores@revistuda.com.br' },
        { nome: 'Elias Barbosa', email: 'elias@revistuda.com.br' },
        { nome: 'Fátima Rocha', email: 'fatima@revistuda.com.br' },
        { nome: 'Gilberto Nunes', email: 'gilberto@revistuda.com.br' },
        { nome: 'Isabel Freitas', email: 'isabel@revistuda.com.br' },
        { nome: 'Jacira Lopes', email: 'jacira@revistuda.com.br' },
        { nome: 'Karen Dias', email: 'karen@revistuda.com.br' },
        { nome: 'Lúcia Azevedo', email: 'lucia@revistuda.com.br' },
      ],
      alunosParcial: [
        { nome: 'Manuel Correia', email: 'manuel@revistuda.com.br' },
        { nome: 'Nilza Prado', email: 'nilza@revistuda.com.br' },
        { nome: 'Orlando Vieira', email: 'orlando@revistuda.com.br' },
        { nome: 'Patrícia Gomes', email: 'patricia@revistuda.com.br' },
        { nome: 'Quitéria Ramos', email: 'quiteria@revistuda.com.br' },
        { nome: 'Raul Fernandes', email: 'raul@revistuda.com.br' },
      ],
    }),
  );

  resultadosProfessores.push(
    await povoarProfessorRico({
      professor: profRoberto,
      senha,
      turmaLotada: {
        nome_turma: 'Turma E - Inclusão Digital (Sábado)',
        descricao_turma: 'Turma de sábado do Professor Roberto.',
      },
      turmaParcial: {
        nome_turma: 'Turma I - Celular no Dia a Dia (Noite)',
        descricao_turma: 'Turma noturna do Professor Roberto.',
      },
      alunosLotada: [
        { nome: 'Paulo Henrique Costa', email: 'paulo@revistuda.com.br' },
        { nome: 'Aparecida Melo', email: 'aparecida@revistuda.com.br' },
        { nome: 'Benedito Alves', email: 'benedito@revistuda.com.br' },
        { nome: 'Carmem Lúcia', email: 'carmem@revistuda.com.br' },
        { nome: 'Davi Moreira', email: 'davi@revistuda.com.br' },
        { nome: 'Edna Barbosa', email: 'edna@revistuda.com.br' },
        { nome: 'Flávio Castro', email: 'flavio@revistuda.com.br' },
        { nome: 'Glória Pires', email: 'gloria@revistuda.com.br' },
        { nome: 'Hélio Martins', email: 'helio@revistuda.com.br' },
        { nome: 'Iracema Souza', email: 'iracema@revistuda.com.br' },
      ],
      alunosParcial: [
        { nome: 'Jorge Lima', email: 'jorge@revistuda.com.br' },
        { nome: 'Leila Campos', email: 'leila@revistuda.com.br' },
        { nome: 'Miguel Torres', email: 'miguel@revistuda.com.br' },
        { nome: 'Nair Batista', email: 'nair@revistuda.com.br' },
        { nome: 'Otávio Ribeiro', email: 'otavio@revistuda.com.br' },
        { nome: 'Pilar Monteiro', email: 'pilar@revistuda.com.br' },
      ],
    }),
  );

  resultadosProfessores.push(
    await povoarProfessorRico({
      professor: profJuliana,
      senha,
      turmaLotada: {
        nome_turma: 'Turma G - WhatsApp e Comunicação',
        descricao_turma: 'Turma de comunicação da Professora Juliana.',
      },
      turmaParcial: {
        nome_turma: 'Turma J - Mensagens e Família (Tarde)',
        descricao_turma: 'Turma da tarde da Professora Juliana.',
      },
      alunosLotada: [
        { nome: 'Sônia Regina', email: 'sonia@revistuda.com.br' },
        { nome: 'Aldo Pereira', email: 'aldo@revistuda.com.br' },
        { nome: 'Branca Oliveira', email: 'branca@revistuda.com.br' },
        { nome: 'Cícero Santos', email: 'cicero@revistuda.com.br' },
        { nome: 'Dora Magalhães', email: 'dora@revistuda.com.br' },
        { nome: 'Eurico Vasconcelos', email: 'eurico@revistuda.com.br' },
        { nome: 'Fiona Cardoso', email: 'fiona@revistuda.com.br' },
        { nome: 'Gastão Moura', email: 'gastao@revistuda.com.br' },
        { nome: 'Hilda Rezende', email: 'hilda@revistuda.com.br' },
        { nome: 'Ítalo Braga', email: 'italo@revistuda.com.br' },
      ],
      alunosParcial: [
        { nome: 'Jussara Nogueira', email: 'jussara@revistuda.com.br' },
        { nome: 'Kleber Antunes', email: 'kleber@revistuda.com.br' },
        { nome: 'Leda Figueiredo', email: 'leda@revistuda.com.br' },
        { nome: 'Moacir Brandão', email: 'moacir@revistuda.com.br' },
        { nome: 'Nádia Xavier', email: 'nadia@revistuda.com.br' },
        { nome: 'Onofre Guimarães', email: 'onofre@revistuda.com.br' },
      ],
    }),
  );

  resultadosProfessores.push(
    await povoarProfessorRico({
      professor: profMarcelo,
      senha,
      turmaLotada: {
        nome_turma: 'Turma H - Segurança e Golpes',
        descricao_turma: 'Turma de segurança digital do Professor Marcelo.',
      },
      turmaParcial: {
        nome_turma: 'Turma K - Privacidade Online (Manhã)',
        descricao_turma: 'Turma matutina do Professor Marcelo.',
      },
      alunosLotada: [
        { nome: 'Vera Lúcia Campos', email: 'vera@revistuda.com.br' },
        { nome: 'Waldemar Souza', email: 'waldemar@revistuda.com.br' },
        { nome: 'Yara Cristina', email: 'yara@revistuda.com.br' },
        { nome: 'Zélia Duarte', email: 'zelia@revistuda.com.br' },
        { nome: 'Amélia Rocha', email: 'amelia@revistuda.com.br' },
        { nome: 'Bento Carvalho', email: 'bento@revistuda.com.br' },
        { nome: 'Célia Prado', email: 'celia@revistuda.com.br' },
        { nome: 'Décio Navarro', email: 'decio@revistuda.com.br' },
        { nome: 'Elvira Matos', email: 'elvira@revistuda.com.br' },
        { nome: 'Fábio Tavares', email: 'fabio@revistuda.com.br' },
      ],
      alunosParcial: [
        { nome: 'Gina Barbosa', email: 'gina@revistuda.com.br' },
        { nome: 'Horácio Pimentel', email: 'horacio@revistuda.com.br' },
        { nome: 'Inês Valente', email: 'ines@revistuda.com.br' },
        { nome: 'Jonas Peixoto', email: 'jonas@revistuda.com.br' },
        { nome: 'Kátia Siqueira', email: 'katia@revistuda.com.br' },
        { nome: 'Lauro Mendes', email: 'lauro@revistuda.com.br' },
      ],
    }),
  );

  console.log('🏫 Criando turma sem professor...');
  const turmaSemProfessor = await prisma.turma.create({
    data: {
      nome_turma: 'Turma F - Aguardando Professor',
      descricao_turma: 'Turma criada e ainda sem professor designado.',
      capacidade_maxima: 12,
      professor_id: null,
    },
  });

  const totalAlunos = resultadosProfessores.reduce((n, r) => n + r.alunos, 0);
  const totalModulos = resultadosProfessores.reduce((n, r) => n + r.modulos, 0);
  const totalLicoes = resultadosProfessores.reduce((n, r) => n + r.licoes, 0);
  const totalConteudos = resultadosProfessores.reduce((n, r) => n + r.conteudos, 0);
  const totalQuizzes = resultadosProfessores.reduce((n, r) => n + r.quizzes, 0);
  const totalAssociacoes = resultadosProfessores.reduce((n, r) => n + r.associacoes, 0);
  const totalComentarios = resultadosProfessores.reduce((n, r) => n + r.comentarios, 0);

  console.log('📰 Criando atividades recentes do painel admin...');
  await prisma.atividadeRecente.createMany({
    data: [
      {
        tipo: 'aluno_cadastrado',
        descricao: 'Aluno(a) Maria Souza se cadastrou no sistema',
        data: new Date('2026-06-20T09:00:00'),
      },
      {
        tipo: 'aluno_cadastrado',
        descricao: 'Aluno(a) Clara Mendes se cadastrou no sistema',
        data: new Date('2026-06-21T09:00:00'),
      },
      {
        tipo: 'aluno_cadastrado',
        descricao: 'Aluno(a) Paulo Henrique Costa se cadastrou no sistema',
        data: new Date('2026-06-22T09:00:00'),
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
        descricao: 'Professor(a) Carlos foi designado(a) para a Turma A - Inclusão Digital (Manhã)',
        data: new Date('2026-06-15T10:00:00'),
      },
      {
        tipo: 'professor_designado',
        descricao: 'Professor(a) Fernanda foi designado(a) para a Turma C - Inclusão Digital (Tarde)',
        data: new Date('2026-06-16T10:00:00'),
      },
      {
        tipo: 'professor_designado',
        descricao: 'Professor(a) Roberto foi designado(a) para a Turma E - Inclusão Digital (Sábado)',
        data: new Date('2026-06-17T10:00:00'),
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
  console.log('👩‍🏫 Professores aprovados + aluno demo:');
  const demos = [
    { prof: 'Carlos', email: 'professor@revistuda.com.br', demo: 'maria@revistuda.com.br' },
    { prof: 'Fernanda', email: 'fernanda@revistuda.com.br', demo: 'clara@revistuda.com.br' },
    { prof: 'Roberto', email: 'roberto@revistuda.com.br', demo: 'paulo@revistuda.com.br' },
    { prof: 'Juliana', email: 'juliana@revistuda.com.br', demo: 'sonia@revistuda.com.br' },
    { prof: 'Marcelo', email: 'marcelo@revistuda.com.br', demo: 'vera@revistuda.com.br' },
  ];
  for (const d of demos) {
    console.log(`   ${d.prof}: ${d.email} | demo aluno: ${d.demo}`);
  }
  console.log('');
  console.log(`🏫 Turmas com professor: ${resultadosProfessores.length * 2} (+ 1 sem professor)`);
  console.log(`🎓 Alunos: ${totalAlunos} (16 por professor × 5)`);
  console.log(`📚 Módulos: ${totalModulos}`);
  console.log(`📖 Lições: ${totalLicoes}`);
  console.log(`📄 Conteúdos: ${totalConteudos}`);
  console.log(`🎯 Atividades: ${totalQuizzes} quiz + ${totalAssociacoes} associação`);
  console.log(`💬 Comentários: ${totalComentarios}`);
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
