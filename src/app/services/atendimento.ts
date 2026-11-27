import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ConsultaPendente {
  id: number;
  data: string;
  hora_inicio: string;
  tipo: string;
  status: string;
  animal_id: number;
  tutor_id: number;
  veterinario_id: number;
  // Caso seu ConsultaOut já traga os nomes aninhados ou diretos:
  animal_nome?: string;
  tutor_nome?: string;
  veterinario_nome?: string;
}

export interface AtendimentoCreate {
  consulta_id: number;
  diagnostico: string;
  procedimentos?: string | null;
  observacoes?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AtendimentoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000'; // Ajuste se usar environment.apiUrl

  listarConsultasAguardando(): Observable<ConsultaPendente[]> {
    return this.http.get<ConsultaPendente[]>(`${this.apiUrl}/consultas/?status=aguardando`);
  }

  confirmarAtendimento(dados: AtendimentoCreate): Observable<any> {
    return this.http.post(`${this.apiUrl}/atendimentos/`, dados);
  }
}