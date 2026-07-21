import { Injectable, signal } from '@angular/core';

export type TutorialStep = 
  | 'none' 
  | 'step1' 
  | 'pergunta' 
  | 'preencherEmail' 
  | 'preencherSenha' 
  | 'preencherNome' 
  | 'preencherEmailCadastro' 
  | 'preencherSenhaCadastro' 
  | 'clicarCadastrar'
  | 'irParaLogin'
  | 'step3'
  | 'dashboardContinuar'
  | 'dashboardMeusCursos'
  | 'dashboardMinhasAtividades'
  | 'dashboardDesempenho'
  | 'dashboardPendentes'
  | 'atividadesComentarios'
  | 'atividadesLista'
  | 'atividadesFazer'
  | 'atividadesPaginacao'
  | 'cursosLista'
  | 'comentariosExplicacao'
  | 'comentariosPendentes';

@Injectable({
  providedIn: 'root'
})
export class TutorialService {
  active = signal<boolean>(false);
  step = signal<TutorialStep>('none');
  showSuccessFeedback = signal<boolean>(false);
  temConta = signal<boolean | null>(null);
  
  audioEnabled = signal<boolean>(true);

  private stepTexts: Record<string, string> = {
    step1: 'Tarefa: Clique no botão "Sou Idoso" abaixo para prosseguir de forma prática.',
    pergunta: 'Pergunta importante: Você já tem e-mail e senha cadastrados ou precisa criar uma conta? Responda no bloco ao lado.',
    preencherEmail: 'Tarefa: Clique no campo "Seu e-mail" destacado abaixo e preencha-o.',
    preencherSenha: 'Tarefa: Ótimo! Agora clique no campo "Sua senha" destacado abaixo e preencha-a.',
    preencherNome: 'Tarefa: Clique no campo "Seu nome completo" destacado abaixo para iniciar a criação da conta.',
    preencherEmailCadastro: 'Tarefa: Agora clique no campo "Seu e-mail" destacado abaixo.',
    preencherSenhaCadastro: 'Tarefa: Muito bem! Agora clique no campo "Crie uma senha" destacado abaixo.',
    clicarCadastrar: 'Tarefa: Perfeito! Agora clique no botão "Cadastrar" destacado em amarelo abaixo para criar sua conta.',
    irParaLogin: 'Tarefa: Muito bem! Você preencheu tudo. Agora clique no botão "Já tenho conta — Entrar" destacado abaixo para ir ao login.',
    step3: 'Tarefa: Muito bem! Você conseguiu. Agora clique no botão "Entrar" destacado abaixo para terminar o tutorial.',
    dashboardContinuar: 'Clique aqui quando quiser continuar estudando sua última aula assistida de forma rápida!',
    dashboardMeusCursos: 'Aqui você encontra todos os seus cursos e matérias disponíveis para estudar.',
    dashboardMinhasAtividades: 'Acompanhe aqui a quantidade de atividades escolares que você ainda tem para realizar.',
    dashboardDesempenho: 'Este círculo mostra a sua nota e desempenho geral em porcentagem nos estudos!',
    dashboardPendentes: 'Aqui você visualiza uma lista rápida das suas lições e atividades que precisam ser feitas hoje!',
    atividadesComentarios: 'Clique aqui para acessar os seus comentários e conversar com o professor sobre as aulas!',
    atividadesLista: 'Aqui você vê o título e a descrição de cada tarefa de casa disponível.',
    cursosLista: 'Aqui você vê os seus cursos! Clique no card para abrir o curso e começar a estudar as lições.',
    comentariosExplicacao: 'Aqui fica a lista com todos os comentários e dúvidas que você enviou nas aulas, junto com as respostas do professor.',
    comentariosPendentes: 'Comentários Pendentes são dúvidas que você enviou e o professor ainda não respondeu. Quando ele responder, passará para Respondidos!'
  };

  private synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;

  toggleAudio(): void {
    this.audioEnabled.set(!this.audioEnabled());
    if (!this.audioEnabled()) {
      this.stopSpeaking();
    } else {
      // Speak current step text if active
      this.speakStep(this.step());
    }
  }

  private stopSpeaking(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  private speakStep(stepName: TutorialStep): void {
    if (!this.audioEnabled() || !this.synth) return;
    
    this.stopSpeaking();
    
    const text = this.stepTexts[stepName as string];
    if (text) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.0;
      this.synth.speak(utterance);
    }
  }

  startTutorial(): void {
    this.active.set(true);
    this.showSuccessFeedback.set(false);
    this.temConta.set(null);
    this.setStepAndSpeak('step1');
  }

  nextStep(): void {
    const current = this.step();
    if (current === 'step1') {
      this.showSuccessFeedback.set(true);
      this.setStepAndSpeak('pergunta');
      setTimeout(() => {
        this.showSuccessFeedback.set(false);
      }, 4000);
    }
  }

  setEscolhaConta(tem: boolean): void {
    this.temConta.set(tem);
    if (tem) {
      this.setStepAndSpeak('preencherEmail');
    } else {
      this.setStepAndSpeak('preencherNome');
    }
  }

  avancarPreenchimento(campoAtual: 'email' | 'senha' | 'nome' | 'emailCadastro' | 'senhaCadastro'): void {
    if (!this.active()) return;
    
    if (campoAtual === 'email' && this.step() === 'preencherEmail') {
      this.setStepAndSpeak('preencherSenha');
    } else if (campoAtual === 'senha' && this.step() === 'preencherSenha') {
      this.setStepAndSpeak('step3');
    } else if (campoAtual === 'nome' && this.step() === 'preencherNome') {
      this.setStepAndSpeak('preencherEmailCadastro');
    } else if (campoAtual === 'emailCadastro' && this.step() === 'preencherEmailCadastro') {
      this.setStepAndSpeak('preencherSenhaCadastro');
    } else if (campoAtual === 'senhaCadastro' && this.step() === 'preencherSenhaCadastro') {
      this.setStepAndSpeak('clicarCadastrar');
    }
  }

  completeTutorial(): void {
    // Ao completar o login/cadastro, avançamos o tutorial para o dashboard
    this.setStepAndSpeak('dashboardContinuar');
    this.showSuccessFeedback.set(true);
    setTimeout(() => {
      this.showSuccessFeedback.set(false);
    }, 4000);
  }

  avancarDashboard(): void {
    if (!this.active()) return;
    const current = this.step();
    if (current === 'dashboardContinuar') {
      this.setStepAndSpeak('dashboardMeusCursos');
    } else if (current === 'dashboardMeusCursos') {
      this.setStepAndSpeak('dashboardMinhasAtividades');
    } else if (current === 'dashboardMinhasAtividades') {
      this.setStepAndSpeak('dashboardDesempenho');
    } else if (current === 'dashboardDesempenho') {
      this.setStepAndSpeak('dashboardPendentes');
    } else if (current === 'dashboardPendentes') {
      this.completeTutorialDefinitivo();
    }
  }

  avancarAtividades(): void {
    if (!this.active()) return;
    const current = this.step();
    if (current === 'atividadesComentarios') {
      this.setStepAndSpeak('atividadesLista');
    } else if (current === 'atividadesLista') {
      this.completeTutorialDefinitivo();
    }
  }

  avancarCursos(): void {
    if (!this.active()) return;
    const current = this.step();
    if (current === 'cursosLista') {
      this.completeTutorialDefinitivo();
    }
  }

  avancarComentarios(): void {
    if (!this.active()) return;
    const current = this.step();
    if (current === 'comentariosExplicacao') {
      this.setStepAndSpeak('comentariosPendentes');
    } else if (current === 'comentariosPendentes') {
      this.completeTutorialDefinitivo();
    }
  }

  completeTutorialDefinitivo(): void {
    this.active.set(false);
    this.setStepAndSpeak('none');
    this.showSuccessFeedback.set(false);
    this.temConta.set(null);
  }

  cancelTutorial(): void {
    this.active.set(false);
    this.setStepAndSpeak('none');
    this.showSuccessFeedback.set(false);
    this.temConta.set(null);
  }

  setStepAndSpeak(stepName: TutorialStep): void {
    this.step.set(stepName);
    this.speakStep(stepName);
  }
}
