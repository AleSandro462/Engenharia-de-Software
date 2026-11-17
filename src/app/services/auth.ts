import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000';
  private readonly storageKey = 'vetcare_usuario';

  usuarioLogado = signal<Usuario | null>(this.carregarUsuarioSalvo());

  private carregarUsuarioSalvo(): Usuario | null {
    if (typeof localStorage === 'undefined') return null;
    const salvo = localStorage.getItem(this.storageKey);
    return salvo ? JSON.parse(salvo) : null;
  }

  login(credenciais: LoginPayload): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/usuarios/login`, credenciais).pipe(
      tap((usuario) => {
        this.usuarioLogado.set(usuario);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(this.storageKey, JSON.stringify(usuario));
        }
      })
    );
  }

  cadastrar(usuario: { nome: string; email: string; senha: string }): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/usuarios/`, usuario);
  }

  logout(): void {
    this.usuarioLogado.set(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }
  }

  podeGerenciarVeterinarios(): boolean {
    const perfil = this.usuarioLogado()?.perfil?.toLowerCase();
    return perfil !== 'veterinario';
  }
}