import { Component, signal, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

// A Web Speech API não tem tipos oficiais no TS por padrão — declaramos
// aqui só o mínimo necessário para não precisar usar "any".
interface SpeechRecognitionResultLike {
  transcript: string;
}

interface SpeechRecognitionEventLike extends Event {
  results: { [index: number]: { [index: number]: SpeechRecognitionResultLike } };
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionLike;
}

interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

@Component({
  selector: 'app-login-idoso',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-idoso.component.html',
  styleUrl: './login-idoso.component.scss'
})
export class LoginIdosoComponent implements OnDestroy {
  email = '';
  senha = '';
  nome = '';
  emailCadastro = '';
  senhaCadastro = '';

  mostrarSenha = false;
  mostrarSenhaCadastro = false;
  carregando = signal(false);
  erro = signal<string | null>(null);

  emailTocado = false;
  senhaTocada = false;
  nomeTocado = false;
  emailCadastroTocado = false;
  senhaCadastroTocada = false;

  modoLogin = signal(true);

  escutando = signal(false);
  campoAlvo = signal<string | null>(null);
  mensagemVoz = signal<string | null>(null);

  private recognition: SpeechRecognitionLike | null = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  isLogin() { return this.modoLogin(); }

  setModo(login: boolean) {
    this.modoLogin.set(login);
    this.erro.set(null);
    this.pararVoz();
  }

  toggleSenha() { this.mostrarSenha = !this.mostrarSenha; }
  toggleSenhaCadastro() { this.mostrarSenhaCadastro = !this.mostrarSenhaCadastro; }

  marcarTocado(campo: string) {
    if (campo === 'email') this.emailTocado = true;
    if (campo === 'senha') this.senhaTocada = true;
    if (campo === 'nome') this.nomeTocado = true;
    if (campo === 'emailCadastro') this.emailCadastroTocado = true;
    if (campo === 'senhaCadastro') this.senhaCadastroTocada = true;
  }

  private tamanhoFonte = 100;

  aumentarFonte() {
    this.tamanhoFonte = Math.min(this.tamanhoFonte + 10, 150);
    document.documentElement.style.setProperty('--fonte-idoso', `${this.tamanhoFonte}%`);
  }

  diminuirFonte() {
    this.tamanhoFonte = Math.max(this.tamanhoFonte - 10, 80);
    document.documentElement.style.setProperty('--fonte-idoso', `${this.tamanhoFonte}%`);
  }

  loginPorVoz() {
    const win = window as WindowWithSpeechRecognition;
    const SpeechRecognitionCtor = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      this.erro.set('Seu navegador não suporta reconhecimento de voz. Use o Chrome ou Edge.');
      return;
    }

    if (this.escutando()) {
      this.pararVoz();
      return;
    }

    this.recognition = new SpeechRecognitionCtor();

    this.recognition.lang = 'pt-BR';
    this.recognition.continuous = false;
    this.recognition.interimResults = false;

    const campoInicial = this.modoLogin() ? 'email' : 'nome';
    this.campoAlvo.set(campoInicial);
    this.escutando.set(true);
    this.mensagemVoz.set(this.getMensagemInstrucao(campoInicial));

    this.recognition.start();

    this.recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const textoFalado = event.results[0][0].transcript.trim();
      this.processarVoz(textoFalado);
    };

    this.recognition.onend = () => {
      if (this.escutando() && this.campoAlvo()) {
        this.recognition?.start();
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      if (event.error === 'not-allowed') {
        this.erro.set('Permissão de microfone negada. Habilite o microfone no navegador.');
      } else if (event.error === 'no-speech') {
        this.mensagemVoz.set('Não ouvi nada. Tente falar mais perto do microfone.');
      } else {
        this.erro.set(`Erro no microfone: ${event.error}`);
      }
      this.escutando.set(false);
    };
  }

  private processarVoz(texto: string) {
    const campo = this.campoAlvo();

    switch (campo) {
      case 'email': {
        const emailFormatado = this.textoParaEmail(texto);
        this.email = emailFormatado;
        this.campoAlvo.set('senha');
        this.mensagemVoz.set(`E-mail: "${emailFormatado}". Agora fale sua senha.`);
        break;
      }

      case 'senha': {
        const senhaLimpa = texto.replace(/minha senha é /i, '').replace(/senha /i, '');
        this.senha = senhaLimpa;
        this.campoAlvo.set(null);
        this.escutando.set(false);
        this.mensagemVoz.set(`Senha preenchida! Confira os dados e clique em Entrar.`);
        this.pararVoz();
        break;
      }

      case 'nome':
        this.nome = texto;
        this.campoAlvo.set('emailCadastro');
        this.mensagemVoz.set(`Nome: "${texto}". Agora fale seu e-mail.`);
        break;

      case 'emailCadastro': {
        const emailCadFormatado = this.textoParaEmail(texto);
        this.emailCadastro = emailCadFormatado;
        this.campoAlvo.set('senhaCadastro');
        this.mensagemVoz.set(`E-mail: "${emailCadFormatado}". Agora fale sua senha.`);
        break;
      }

      case 'senhaCadastro': {
        const senhaCadLimpa = texto.replace(/minha senha é /i, '').replace(/senha /i, '');
        this.senhaCadastro = senhaCadLimpa;
        this.campoAlvo.set(null);
        this.escutando.set(false);
        this.mensagemVoz.set(`Pronto! Confira os dados e clique em Cadastrar.`);
        this.pararVoz();
        break;
      }
    }
  }

  private textoParaEmail(texto: string): string {
    return texto
      .toLowerCase()
      .replace(/\s+arroba\s+/g, '@')
      .replace(/\s+ponto\s+/g, '.')
      .replace(/\s+underline\s+/g, '_')
      .replace(/\s+traço\s+/g, '-')
      .replace(/\s/g, '');
  }

  private getMensagemInstrucao(campo: string): string {
    const mensagens: Record<string, string> = {
      email: 'Fale seu e-mail. Diga "arroba" para @ e "ponto" para .',
      senha: 'Fale sua senha.',
      nome: 'Fale seu nome completo.',
      emailCadastro: 'Fale seu e-mail. Diga "arroba" para @ e "ponto" para .',
      senhaCadastro: 'Fale uma senha com pelo menos 6 caracteres.',
    };
    return mensagens[campo] || 'Fale o campo solicitado.';
  }

  pararVoz() {
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }
    this.escutando.set(false);
    this.campoAlvo.set(null);
  }

  ngOnDestroy() {
    this.pararVoz();
  }

  async login() {
    this.emailTocado = true;
    this.senhaTocada = true;

    if (!this.email.trim() || !this.senha.trim()) return;

    try {
      this.carregando.set(true);
      this.erro.set(null);
      const data = await this.authService.login({ email: this.email, senha: this.senha });
      this.authService.redirectUserBasedOnRole(data.user);
    } catch (err: unknown) {
      this.erro.set(getErrorMessage(err, 'E-mail ou senha incorretos.'));
    } finally {
      this.carregando.set(false);
    }
  }

  async cadastrar() {
    this.nomeTocado = true;
    this.emailCadastroTocado = true;
    this.senhaCadastroTocada = true;

    if (!this.nome.trim() || !this.emailCadastro.trim() || this.senhaCadastro.trim().length < 6) return;

    try {
      this.carregando.set(true);
      this.erro.set(null);
      await this.authService.register({
        nome: this.nome,
        email: this.emailCadastro,
        senha: this.senhaCadastro,
        permission: 'ALUNO_IDOSO'
      });
      this.setModo(true);
    } catch (err: unknown) {
      this.erro.set(getErrorMessage(err, 'Erro ao cadastrar.'));
    } finally {
      this.carregando.set(false);
    }
  }

  irParaEsqueciSenha() {
    this.router.navigate(['/esqueci-senha']);
  }
}