import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-recuperar-senha',
  imports: [FormsModule, RouterLink],
  styleUrl: '../login/login.css',
  templateUrl: './recuperar-senha.html',
})
export class RecuperarSenha {
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  email = '';
  erroMensagem = '';
  sucessoMensagem = '';
  carregando = false;

  onSubmit() {
    if (!this.email) {
      this.erroMensagem = 'Informe o seu e-mail.';
      return;
    }

    this.carregando = true;
    this.erroMensagem = '';
    this.sucessoMensagem = '';

    this.authService.recuperarSenha(this.email).subscribe({
      next: (resposta) => {
        this.carregando = false;
        this.sucessoMensagem = resposta.mensagem;
        this.cdr.detectChanges();
      },
      error: () => {
        this.carregando = false;
        this.erroMensagem = 'Não foi possível enviar o pedido. Tente novamente.';
        this.cdr.detectChanges();
      },
    });
  }
}