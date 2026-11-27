import { Component,inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  imports: [CommonModule, FormsModule, RouterLink],
  selector: 'app-cadastro',
  styleUrl: './cadastro.css',
  templateUrl: './cadastro.html',
})
export class Cadastro {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  nome = '';
  email = '';
  senha = '';
  perfil = '';
  
  erroMensagem = '';
  sucessoMensagem = '';
  carregando = false;

  onSubmit() {
    if (!this.nome || !this.email || !this.senha || !this.perfil) {
      this.erroMensagem = 'Preencha todos os campos.';
      return;
    }

    this.carregando = true;
    this.erroMensagem = '';
    this.sucessoMensagem = '';

    const novoUsuario = {
      nome: this.nome,
      email: this.email,
      senha: this.senha,
      perfil: this.perfil
    };

    this.authService.cadastrar(novoUsuario).subscribe({
      next: () => {
        this.carregando = false;
        this.sucessoMensagem = 'Conta criada com sucesso! Redirecionando para o login...';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.carregando = false;
        const detalhe = err.error?.detail;
        this.erroMensagem = typeof detalhe === 'string' ? detalhe : 'Erro ao cadastrar usuário. Confira os campos.';
        this.cdr.detectChanges();
      }
    });
  }}
