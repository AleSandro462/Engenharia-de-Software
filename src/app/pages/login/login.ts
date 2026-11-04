import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef); // <-- 1. Adicionado para forçar atualização do ecrã

  email = '';
  senha = '';
  
  erroMensagem = '';
  carregando = false;

  onSubmit() {
    if (!this.email || !this.senha) {
      this.erroMensagem = 'Por favor, preencha o e-mail e a senha.';
      return;
    }

    this.carregando = true;
    this.erroMensagem = ''; 

    this.authService.login({ 
      email: this.email, 
      senha: this.senha 
    }).subscribe({
      next: (resposta) => {
        this.carregando = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Erro recebido do backend:', err);
        this.carregando = false; 
        
        if (err.status === 401 || err.status === 404) {
          this.erroMensagem = 'E-mail ou senha incorretos.';
        } else if (err.status === 422) {
          this.erroMensagem = 'Formato de dados inválido.';
        } else {
          const detalhe = err.error?.detail;
          this.erroMensagem = typeof detalhe === 'string' ? detalhe : 'Erro ao tentar fazer login.';
        }

        // <-- 2. Força o Angular a renderizar a mensagem de erro e tirar o botão do "Entrando..."
        this.cdr.detectChanges(); 
      }
    });
  }
}