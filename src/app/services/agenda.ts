import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tutor } from '../sessoes/tutores/tutores.model';
import { TutorService } from './tutor';
import { VeterinarioService } from './veterinario';
import { Consulta, NovaConsulta, VeterinarioAgenda } from '../sessoes/agenda/agenda.model';

const API = 'http://localhost:8000';

@Injectable({ providedIn: 'root' })
export class AgendaService {
  private http = inject(HttpClient);
  private tutorService = inject(TutorService);
  private veterinarioService = inject(VeterinarioService);

  listar(inicio: string, fim: string): Observable<Consulta[]> {
    const params = new HttpParams().set('inicio', inicio).set('fim', fim);
    return this.http.get<Consulta[]>(`${API}/consultas/`, { params });
  }

  /** REQ 07 */
  agendar(dados: NovaConsulta): Observable<Consulta> {
    return this.http.post<Consulta>(`${API}/consultas/`, dados);
  }

  /** REQ 08 */
  cancelar(id: number, motivo: string | null): Observable<Consulta> {
    return this.http.patch<Consulta>(`${API}/consultas/${id}/cancelar`, { motivo });
  }

  /** Tutores e animais vêm do REQ 04/05 (TutorService). */
  listarTutores(): Observable<Tutor[]> {
    return this.tutorService.listar();
  }

  /** Veterinários vêm do REQ 06 (VeterinarioService). */
  listarVeterinarios(): Observable<VeterinarioAgenda[]> {
    return this.veterinarioService.listar() as Observable<VeterinarioAgenda[]>;
  }
}
