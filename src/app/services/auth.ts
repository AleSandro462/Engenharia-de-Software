import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginPayload {
  nome?: string;
  email: string;
  senha: string;
}

export interface LoginResponse {
  mensagem: string;
  usuario: {
    id: number;
    nome: string;
    email: string;
    perfil: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000';

  login(credenciais: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/usuarios/login`, credenciais);
  }

  cadastrar(usuario: { nome: string; email: string; senha: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios`, usuario);
  }
}