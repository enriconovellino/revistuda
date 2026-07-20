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

  startTutorial(): void {
    this.active.set(true);
    this.step.set('step1');
    this.showSuccessFeedback.set(false);
    this.temConta.set(null);
  }

  nextStep(): void {
    const current = this.step();
    if (current === 'step1') {
      this.showSuccessFeedback.set(true);
      this.step.set('pergunta');
      setTimeout(() => {
        this.showSuccessFeedback.set(false);
      }, 4000);
    }
  }

  setEscolhaConta(tem: boolean): void {
    this.temConta.set(tem);
    if (tem) {
      this.step.set('preencherEmail');
    } else {
      this.step.set('preencherNome');
    }
  }

  avancarPreenchimento(campoAtual: 'email' | 'senha' | 'nome' | 'emailCadastro' | 'senhaCadastro'): void {
    if (!this.active()) return;
    
    if (campoAtual === 'email' && this.step() === 'preencherEmail') {
      this.step.set('preencherSenha');
    } else if (campoAtual === 'senha' && this.step() === 'preencherSenha') {
      this.step.set('step3');
    } else if (campoAtual === 'nome' && this.step() === 'preencherNome') {
      this.step.set('preencherEmailCadastro');
    } else if (campoAtual === 'emailCadastro' && this.step() === 'preencherEmailCadastro') {
      this.step.set('preencherSenhaCadastro');
    } else if (campoAtual === 'senhaCadastro' && this.step() === 'preencherSenhaCadastro') {
      this.step.set('clicarCadastrar');
    }
  }

  completeTutorial(): void {
    // Ao completar o login/cadastro, avançamos o tutorial para o dashboard
    this.step.set('dashboardContinuar');
    this.showSuccessFeedback.set(true);
    setTimeout(() => {
      this.showSuccessFeedback.set(false);
    }, 4000);
  }

  avancarDashboard(): void {
    if (!this.active()) return;
    const current = this.step();
    if (current === 'dashboardContinuar') {
      this.step.set('dashboardMeusCursos');
    } else if (current === 'dashboardMeusCursos') {
      this.step.set('dashboardMinhasAtividades');
    } else if (current === 'dashboardMinhasAtividades') {
      this.step.set('dashboardDesempenho');
    } else if (current === 'dashboardDesempenho') {
      this.step.set('dashboardPendentes');
    } else if (current === 'dashboardPendentes') {
      this.completeTutorialDefinitivo();
    }
  }

  avancarAtividades(): void {
    if (!this.active()) return;
    const current = this.step();
    if (current === 'atividadesComentarios') {
      this.step.set('atividadesLista');
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
      this.step.set('comentariosPendentes');
    } else if (current === 'comentariosPendentes') {
      this.completeTutorialDefinitivo();
    }
  }

  completeTutorialDefinitivo(): void {
    this.active.set(false);
    this.step.set('none');
    this.showSuccessFeedback.set(false);
    this.temConta.set(null);
  }

  cancelTutorial(): void {
    this.active.set(false);
    this.step.set('none');
    this.showSuccessFeedback.set(false);
    this.temConta.set(null);
  }
}
