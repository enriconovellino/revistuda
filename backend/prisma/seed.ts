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
  await prisma.comentarioAluno.deleteMany({});
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
      nome_turma: 'Turma A - Inclusão Digital (Manhã)',
      descricao_turma: 'Turma de inclusão digital para a terceira idade no período matutino.',
      capacidade_maxima: 10,
      professor_id: professor.id,
    },
  });

  const turmaB = await prisma.turma.create({
    data: {
      nome_turma: 'Turma B - Inclusão Digital (Noite)',
      descricao_turma: 'Turma de inclusão digital para a terceira idade no período noturno.',
      capacidade_maxima: 10,
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

  const antonio = await prisma.user.create({
    data: {
      nome: 'Antônio Ferreira',
      email: 'antonio@revistuda.com.br',
      senha: defaultPasswordHash,
      permissions: ['ALUNO_IDOSO'],
      approved: true,
      turma_id: turmaA.turma_id,
    },
  });

  const terezinha = await prisma.user.create({
    data: {
      nome: 'Terezinha Oliveira',
      email: 'terezinha@revistuda.com.br',
      senha: defaultPasswordHash,
      permissions: ['ALUNO_IDOSO'],
      approved: true,
      turma_id: turmaA.turma_id,
    },
  });

  const josecarlos = await prisma.user.create({
    data: {
      nome: 'José Carlos Mendes',
      email: 'josecarlos@revistuda.com.br',
      senha: defaultPasswordHash,
      permissions: ['ALUNO_IDOSO'],
      approved: true,
      turma_id: turmaB.turma_id,
    },
  });

  await prisma.user.create({
    data: {
      nome: 'Lourdes Almeida',
      email: 'lourdes@revistuda.com.br',
      senha: defaultPasswordHash,
      permissions: ['ALUNO_IDOSO'],
      approved: true,
      turma_id: turmaB.turma_id,
    },
  });

  console.log('📚 Criando módulos...');
  const moduloSeguranca = await prisma.modulo.create({
    data: {
      titulo_modulo: 'Segurança Digital',
      descricao_modulo: 'Aprenda a reconhecer e evitar os golpes mais comuns na internet e no celular.',
      dificuldade: 'Fácil',
      imagem_url: '/uploads/modulo-seguranca.jpg',
      turma_id: turmaA.turma_id,
    },
  });

  const moduloWhatsapp = await prisma.modulo.create({
    data: {
      titulo_modulo: 'WhatsApp no Dia a Dia',
      descricao_modulo: 'Envie mensagens, áudios e faça videochamadas para conversar com a família.',
      dificuldade: 'Fácil',
      imagem_url: '/uploads/modulo-whatsapp.jpg',
      turma_id: turmaA.turma_id,
    },
  });

  const moduloFakeNews = await prisma.modulo.create({
    data: {
      titulo_modulo: 'Notícias Falsas (Fake News)',
      descricao_modulo: 'Como identificar informações falsas antes de acreditar ou compartilhar.',
      dificuldade: 'Médio',
      imagem_url: '/uploads/modulo-fakenews.jpg',
      turma_id: turmaB.turma_id,
    },
  });

  const moduloPix = await prisma.modulo.create({
    data: {
      titulo_modulo: 'Pix e Banco pelo Celular',
      descricao_modulo: 'Use o aplicativo do banco e faça Pix com tranquilidade e segurança.',
      dificuldade: 'Médio',
      imagem_url: '/uploads/modulo-pix.jpg',
      turma_id: turmaA.turma_id,
    },
  });

  const moduloFotos = await prisma.modulo.create({
    data: {
      titulo_modulo: 'Fotos e Memórias no Celular',
      descricao_modulo: 'Tire fotos bonitas, encontre suas imagens na galeria e compartilhe com a família.',
      dificuldade: 'Fácil',
      imagem_url: '/uploads/modulo-fotos.jpg',
      turma_id: turmaA.turma_id,
    },
  });

  const moduloSaude = await prisma.modulo.create({
    data: {
      titulo_modulo: 'Saúde na Palma da Mão',
      descricao_modulo: 'Use o celular para cuidar da saúde: carteira de vacinação, exames e consultas pelo Meu SUS Digital.',
      dificuldade: 'Médio',
      imagem_url: '/uploads/modulo-saude.jpg',
      turma_id: turmaB.turma_id,
    },
  });

  const moduloCompras = await prisma.modulo.create({
    data: {
      titulo_modulo: 'Compras Online com Segurança',
      descricao_modulo: 'Aprenda a comprar pela internet sem cair em sites falsos e ofertas enganosas.',
      dificuldade: 'Médio',
      imagem_url: '/uploads/modulo-compras.jpg',
      turma_id: turmaB.turma_id,
    },
  });

  console.log('📖 Criando lições...');
  const licaoGolpes = await prisma.licao.create({
    data: {
      titulo_licao: 'Lição 1 - Como evitar golpes no WhatsApp e no celular',
      comentario: 'Conheça os golpes mais comuns e aprenda atitudes simples para se proteger.',
      modulo_id: moduloSeguranca.modulo_id,
    },
  });

  const licaoWhatsapp = await prisma.licao.create({
    data: {
      titulo_licao: 'Lição 1 - Primeiros passos e videochamadas',
      comentario: 'Aprenda o básico do WhatsApp e como fazer uma videochamada com a família.',
      modulo_id: moduloWhatsapp.modulo_id,
    },
  });

  const licaoFakeNews = await prisma.licao.create({
    data: {
      titulo_licao: 'Lição 1 - Como identificar uma notícia falsa',
      comentario: 'Dicas práticas para desconfiar, verificar e não espalhar informações falsas.',
      modulo_id: moduloFakeNews.modulo_id,
    },
  });

  const licaoPix = await prisma.licao.create({
    data: {
      titulo_licao: 'Lição 1 - Fazendo um Pix com segurança',
      comentario: 'Passo a passo do Pix e os cuidados essenciais antes de confirmar um pagamento.',
      modulo_id: moduloPix.modulo_id,
    },
  });

  const licaoFotos = await prisma.licao.create({
    data: {
      titulo_licao: 'Lição 1 - Tirando e compartilhando fotos',
      comentario: 'Aprenda a fotografar, encontrar as fotos na galeria e enviar para a família.',
      modulo_id: moduloFotos.modulo_id,
    },
  });

  const licaoSaude = await prisma.licao.create({
    data: {
      titulo_licao: 'Lição 1 - Conhecendo o Meu SUS Digital',
      comentario: 'Veja como acessar sua carteira de vacinação, exames e consultas pelo celular.',
      modulo_id: moduloSaude.modulo_id,
    },
  });

  const licaoCompras = await prisma.licao.create({
    data: {
      titulo_licao: 'Lição 1 - Comprando pela internet sem cair em golpes',
      comentario: 'Como reconhecer um site confiável e desconfiar de ofertas boas demais.',
      modulo_id: moduloCompras.modulo_id,
    },
  });

  console.log('📝 Criando conteúdos...');
  await prisma.conteudo.createMany({
    data: [
      {
        nome_conteudo: 'Vídeo: Golpe no WhatsApp - como funciona e como se proteger',
        tipo_conteudo: 'Vídeo',
        url_conteudo: 'https://www.youtube.com/watch?v=U6dGh0R0t58',
        texto_conteudo:
          'Assista ao vídeo para entender como funciona o golpe do WhatsApp, em que criminosos se passam por um parente pedindo dinheiro com urgência.',
        licao_id: licaoGolpes.licao_id,
      },
      {
        nome_conteudo: 'Vídeo: Os 10 golpes mais comuns contra idosos',
        tipo_conteudo: 'Vídeo',
        url_conteudo: 'https://www.youtube.com/watch?v=_6b1ZvG8e4Q',
        texto_conteudo:
          'Conheça os golpes mais aplicados contra pessoas idosas: falso parente, falso banco, falso prêmio e outros.',
        licao_id: licaoGolpes.licao_id,
      },
      {
        nome_conteudo: 'Leitura: 5 regras de ouro para não cair em golpes',
        tipo_conteudo: 'Texto',
        texto_conteudo:
          '1) Desconfie de mensagens com urgência pedindo dinheiro, mesmo com foto de um parente. ' +
          '2) Antes de fazer qualquer transferência, ligue para o número antigo da pessoa e confirme. ' +
          '3) Banco nunca liga pedindo senha, código ou para "transferir o dinheiro por segurança". ' +
          '4) Não clique em links de promoções ou prêmios recebidos por mensagem. ' +
          '5) Ative a confirmação em duas etapas do WhatsApp: Configurações > Conta > Confirmação em duas etapas.',
        licao_id: licaoGolpes.licao_id,
      },
      {
        nome_conteudo: 'Vídeo: Aula de WhatsApp básico para idosos',
        tipo_conteudo: 'Vídeo',
        url_conteudo: 'https://www.youtube.com/watch?v=dR5PNZhaLzU',
        texto_conteudo:
          'Aula passo a passo mostrando como enviar mensagens, áudios e fotos no WhatsApp.',
        licao_id: licaoWhatsapp.licao_id,
      },
      {
        nome_conteudo: 'Leitura: Como fazer uma videochamada',
        tipo_conteudo: 'Texto',
        texto_conteudo:
          'Para fazer uma videochamada: 1) Abra a conversa com a pessoa desejada. ' +
          '2) Toque no ícone de câmera de vídeo no canto superior da tela. ' +
          '3) Aguarde a pessoa atender — você verá o rosto dela e ela verá o seu. ' +
          '4) Para encerrar, toque no botão vermelho.',
        licao_id: licaoWhatsapp.licao_id,
      },
      {
        nome_conteudo: 'Vídeo: 5 características das fake news',
        tipo_conteudo: 'Vídeo',
        url_conteudo: 'https://www.youtube.com/watch?v=V3atlyamy70',
        texto_conteudo:
          'Aprenda a reconhecer os sinais de uma notícia falsa: títulos alarmantes, erros de português, fontes desconhecidas e pedidos de compartilhamento.',
        licao_id: licaoFakeNews.licao_id,
      },
      {
        nome_conteudo: 'Leitura: Verifique antes de compartilhar',
        tipo_conteudo: 'Texto',
        texto_conteudo:
          'Recebeu uma notícia impressionante? Antes de repassar: 1) Procure o assunto em um site de notícias conhecido. ' +
          '2) Desconfie de mensagens que pedem "compartilhe com todos". ' +
          '3) Verifique a data — muitas notícias antigas voltam a circular como se fossem novas. ' +
          '4) Na dúvida, não compartilhe.',
        licao_id: licaoFakeNews.licao_id,
      },
      {
        nome_conteudo: 'Vídeo: Pix na prática - tutorial passo a passo',
        tipo_conteudo: 'Vídeo',
        url_conteudo: 'https://www.youtube.com/watch?v=lPr-hL9CZd0',
        texto_conteudo:
          'Tutorial mostrando na prática como cadastrar uma chave e fazer um Pix pelo aplicativo do banco.',
        licao_id: licaoPix.licao_id,
      },
      {
        nome_conteudo: 'Leitura: Cuidados antes de confirmar um Pix',
        tipo_conteudo: 'Texto',
        texto_conteudo:
          '1) Antes de confirmar, confira sempre o NOME da pessoa que vai receber e o VALOR na tela. ' +
          '2) Configure um limite baixo para o Pix noturno no aplicativo do banco. ' +
          '3) O banco nunca liga pedindo para você fazer um Pix "de teste" ou "por segurança" — isso é golpe. ' +
          '4) Depois de enviado, o Pix cai na hora; por isso, confira tudo com calma antes de apertar confirmar.',
        licao_id: licaoPix.licao_id,
      },
      {
        nome_conteudo: 'Vídeo: Aprenda a tirar fotos com seu celular',
        tipo_conteudo: 'Vídeo',
        url_conteudo: 'https://www.youtube.com/watch?v=GgHhqwHiOsE',
        texto_conteudo:
          'Dicas simples para tirar fotos mais bonitas com a câmera do celular.',
        licao_id: licaoFotos.licao_id,
      },
      {
        nome_conteudo: 'Leitura: Como enviar uma foto para a família',
        tipo_conteudo: 'Texto',
        texto_conteudo:
          'Para enviar uma foto pelo WhatsApp: 1) Abra a conversa da pessoa. ' +
          '2) Toque no ícone de clipe de papel (ou câmera) ao lado do campo de mensagem. ' +
          '3) Escolha "Galeria" e toque na foto desejada. ' +
          '4) Toque na setinha verde para enviar. Pronto, a família recebe na hora!',
        licao_id: licaoFotos.licao_id,
      },
      {
        nome_conteudo: 'Vídeo: Como usar o Meu SUS Digital',
        tipo_conteudo: 'Vídeo',
        url_conteudo: 'https://www.youtube.com/watch?v=z-YMX_bgOVc',
        texto_conteudo:
          'Veja como baixar e usar o aplicativo oficial do SUS: cartão do SUS digital, carteira de vacinação e resultados de exames.',
        licao_id: licaoSaude.licao_id,
      },
      {
        nome_conteudo: 'Leitura: O que dá para fazer no Meu SUS Digital',
        tipo_conteudo: 'Texto',
        texto_conteudo:
          'Com o aplicativo Meu SUS Digital você pode: ver sua carteira de vacinação (inclusive da gripe e da COVID), ' +
          'consultar resultados de exames, ver o histórico de atendimentos e acessar o seu cartão do SUS pelo celular, ' +
          'sem precisar carregar o papel. O aplicativo é gratuito e oficial do Ministério da Saúde.',
        licao_id: licaoSaude.licao_id,
      },
      {
        nome_conteudo: 'Vídeo: Como fazer compras online com segurança',
        tipo_conteudo: 'Vídeo',
        url_conteudo: 'https://www.youtube.com/watch?v=eZspUgfpuzY',
        texto_conteudo:
          'A Serasa ensina dicas práticas para comprar pela internet sem cair em golpes.',
        licao_id: licaoCompras.licao_id,
      },
      {
        nome_conteudo: 'Leitura: Sinais de um site falso',
        tipo_conteudo: 'Texto',
        texto_conteudo:
          'Desconfie quando: 1) O preço está bom demais para ser verdade — geralmente é golpe. ' +
          '2) O site só aceita Pix ou boleto e não aceita cartão. ' +
          '3) O endereço do site tem erros de escrita, como "magazineluiza-ofertas.com". ' +
          '4) A loja não tem telefone, CNPJ ou endereço. ' +
          'Prefira sempre lojas conhecidas e, na dúvida, peça ajuda a um familiar antes de pagar.',
        licao_id: licaoCompras.licao_id,
      },
    ],
  });

  console.log('🎯 Criando atividades...');
  const atividadeGolpes = await prisma.atividade.create({
    data: {
      titulo_atividade: 'Quiz: Você sabe evitar golpes?',
      tipo_atividade: 'multipla_escolha',
      enunciado:
        'Você recebe uma mensagem de um número desconhecido com a foto do seu filho pedindo dinheiro com urgência. O que você deve fazer?',
      explicacao:
        'Golpistas usam fotos de parentes para criar urgência. Ligue para o número que você já tem salvo e confirme antes de qualquer transferência.',
      licao_id: licaoGolpes.licao_id,
      multipla_escolha: {
        create: {
          opcoes: {
            create: [
              { letra: 'a', texto_opcao: 'Transferir o dinheiro rapidamente, pois é uma emergência', correta: false },
              { letra: 'b', texto_opcao: 'Ligar para o número antigo do seu filho e confirmar se é ele mesmo', correta: true },
              { letra: 'c', texto_opcao: 'Responder pedindo mais detalhes sobre a conta', correta: false },
              { letra: 'd', texto_opcao: 'Enviar metade do valor por precaução', correta: false },
            ],
          },
        },
      },
    },
    include: {
      multipla_escolha: { include: { opcoes: true } },
    },
  });

  const atividadeWhatsapp = await prisma.atividade.create({
    data: {
      titulo_atividade: 'Quiz: Videochamada no WhatsApp',
      tipo_atividade: 'multipla_escolha',
      enunciado: 'Qual ícone você deve tocar para iniciar uma videochamada no WhatsApp?',
      explicacao: 'O ícone de câmera de vídeo, no canto superior da conversa, inicia a videochamada.',
      licao_id: licaoWhatsapp.licao_id,
      multipla_escolha: {
        create: {
          opcoes: {
            create: [
              { letra: 'a', texto_opcao: 'O ícone de câmera de vídeo no topo da conversa', correta: true },
              { letra: 'b', texto_opcao: 'O ícone de clipe de papel', correta: false },
              { letra: 'c', texto_opcao: 'O ícone de microfone ao lado da mensagem', correta: false },
            ],
          },
        },
      },
    },
    include: {
      multipla_escolha: { include: { opcoes: true } },
    },
  });

  await prisma.atividade.create({
    data: {
      titulo_atividade: 'Quiz: Notícia verdadeira ou falsa?',
      tipo_atividade: 'multipla_escolha',
      enunciado:
        'Você recebe no WhatsApp uma notícia alarmante pedindo "compartilhe com todos antes que apaguem". Qual a atitude correta?',
      explicacao:
        'Pedidos de compartilhamento urgente são um sinal clássico de fake news. Verifique em um site de notícias confiável antes de repassar.',
      licao_id: licaoFakeNews.licao_id,
      multipla_escolha: {
        create: {
          opcoes: {
            create: [
              { letra: 'a', texto_opcao: 'Compartilhar logo, pois pode ser importante', correta: false },
              { letra: 'b', texto_opcao: 'Verificar em um site de notícias conhecido antes de compartilhar', correta: true },
              { letra: 'c', texto_opcao: 'Compartilhar só com a família', correta: false },
            ],
          },
        },
      },
    },
  });

  const atividadePix = await prisma.atividade.create({
    data: {
      titulo_atividade: 'Quiz: Pix com segurança',
      tipo_atividade: 'multipla_escolha',
      enunciado: 'Antes de apertar "confirmar" em um Pix, o que você deve sempre conferir?',
      explicacao:
        'O Pix cai na hora e é difícil de reverter. Por isso, confira sempre o nome do destinatário e o valor antes de confirmar.',
      licao_id: licaoPix.licao_id,
      multipla_escolha: {
        create: {
          opcoes: {
            create: [
              { letra: 'a', texto_opcao: 'Nada, o aplicativo do banco confere sozinho', correta: false },
              { letra: 'b', texto_opcao: 'O nome de quem vai receber e o valor', correta: true },
              { letra: 'c', texto_opcao: 'Apenas se a internet está funcionando', correta: false },
            ],
          },
        },
      },
    },
    include: {
      multipla_escolha: { include: { opcoes: true } },
    },
  });

  await prisma.atividade.create({
    data: {
      titulo_atividade: 'Quiz: Enviando fotos para a família',
      tipo_atividade: 'multipla_escolha',
      enunciado: 'Onde ficam guardadas as fotos que você tira com o celular?',
      explicacao: 'As fotos ficam no aplicativo Galeria (ou Fotos), de onde você pode vê-las e compartilhá-las.',
      licao_id: licaoFotos.licao_id,
      multipla_escolha: {
        create: {
          opcoes: {
            create: [
              { letra: 'a', texto_opcao: 'No aplicativo Galeria (ou Fotos)', correta: true },
              { letra: 'b', texto_opcao: 'Elas somem depois de um dia', correta: false },
              { letra: 'c', texto_opcao: 'Só ficam no WhatsApp', correta: false },
            ],
          },
        },
      },
    },
  });

  await prisma.atividade.create({
    data: {
      titulo_atividade: 'Quiz: Meu SUS Digital',
      tipo_atividade: 'multipla_escolha',
      enunciado: 'O que você consegue ver no aplicativo Meu SUS Digital?',
      explicacao:
        'O aplicativo oficial do Ministério da Saúde mostra a carteira de vacinação, resultados de exames e o cartão do SUS digital.',
      licao_id: licaoSaude.licao_id,
      multipla_escolha: {
        create: {
          opcoes: {
            create: [
              { letra: 'a', texto_opcao: 'Apenas notícias sobre saúde', correta: false },
              { letra: 'b', texto_opcao: 'Carteira de vacinação, exames e o cartão do SUS', correta: true },
              { letra: 'c', texto_opcao: 'Somente o telefone do hospital', correta: false },
            ],
          },
        },
      },
    },
  });

  await prisma.atividade.create({
    data: {
      titulo_atividade: 'Quiz: Site confiável ou golpe?',
      tipo_atividade: 'multipla_escolha',
      enunciado:
        'Você encontra uma loja desconhecida vendendo um celular pela metade do preço, mas ela só aceita Pix. O que isso indica?',
      explicacao:
        'Preço bom demais + pagamento só por Pix ou boleto são sinais clássicos de site falso. Prefira lojas conhecidas.',
      licao_id: licaoCompras.licao_id,
      multipla_escolha: {
        create: {
          opcoes: {
            create: [
              { letra: 'a', texto_opcao: 'Uma ótima oportunidade que não pode ser perdida', correta: false },
              { letra: 'b', texto_opcao: 'Provavelmente é um golpe — melhor não comprar', correta: true },
              { letra: 'c', texto_opcao: 'Que a loja é nova e está fazendo promoção', correta: false },
            ],
          },
        },
      },
    },
  });

  const opcoesGolpes = atividadeGolpes.multipla_escolha!.opcoes;
  const opcoesWhatsapp = atividadeWhatsapp.multipla_escolha!.opcoes;
  const opcoesPix = atividadePix.multipla_escolha!.opcoes;

  const opcaoGolpesCorreta = opcoesGolpes.find((o) => o.correta)!;
  const opcaoGolpesErrada = opcoesGolpes.find((o) => !o.correta)!;
  const opcaoWhatsappCorreta = opcoesWhatsapp.find((o) => o.correta)!;
  const opcaoWhatsappErrada = opcoesWhatsapp.find((o) => !o.correta)!;
  const opcaoPixCorreta = opcoesPix.find((o) => o.correta)!;
  const opcaoPixErrada = opcoesPix.find((o) => !o.correta)!;

  console.log('📊 Criando respostas de desempenho...');
  // Maria: 1 acerto + 1 erro
  await prisma.respostaMultiplaEscolha.createMany({
    data: [
      { aluno_id: maria.id, resposta_aluno_id: opcaoGolpesCorreta.opcao_id },
      { aluno_id: maria.id, resposta_aluno_id: opcaoWhatsappErrada.opcao_id },
      // João: 2 acertos
      { aluno_id: joao.id, resposta_aluno_id: opcaoGolpesCorreta.opcao_id },
      { aluno_id: joao.id, resposta_aluno_id: opcaoWhatsappCorreta.opcao_id },
      // Ana: 1 acerto (atividade da Turma A — ainda conta no desempenho geral do professor)
      { aluno_id: ana.id, resposta_aluno_id: opcaoGolpesCorreta.opcao_id },
      // Antônio: 3 acertos (aluno destaque)
      { aluno_id: antonio.id, resposta_aluno_id: opcaoGolpesCorreta.opcao_id },
      { aluno_id: antonio.id, resposta_aluno_id: opcaoWhatsappCorreta.opcao_id },
      { aluno_id: antonio.id, resposta_aluno_id: opcaoPixCorreta.opcao_id },
      // Terezinha: 1 acerto + 2 erros
      { aluno_id: terezinha.id, resposta_aluno_id: opcaoWhatsappCorreta.opcao_id },
      { aluno_id: terezinha.id, resposta_aluno_id: opcaoGolpesErrada.opcao_id },
      { aluno_id: terezinha.id, resposta_aluno_id: opcaoPixErrada.opcao_id },
      // José Carlos: 1 acerto + 1 erro
      { aluno_id: josecarlos.id, resposta_aluno_id: opcaoPixCorreta.opcao_id },
      { aluno_id: josecarlos.id, resposta_aluno_id: opcaoGolpesErrada.opcao_id },
      // Pedro e Lourdes: sem respostas
    ],
  });

  console.log('✅ Semeadura concluída com sucesso!');
  console.log('   Professor: professor@revistuda.com.br / 123456');
  console.log('   Turma A: Maria, João, Antônio e Terezinha');
  console.log('   Turma B: Ana, Pedro, José Carlos e Lourdes');
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
