import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnimalBusca, ProntuarioOut } from '../sessoes/prontuarios/prontuarios.model';

@Injectable({ providedIn: 'root' })
export class ProntuarioService {
  private http = inject(HttpClient);
  private api = 'http://localhost:8000/prontuarios';

  buscarAnimais(busca: string): Observable<AnimalBusca[]> {
    const params = new HttpParams().set('busca', busca);
    return this.http.get<AnimalBusca[]>(`${this.api}/animais`, { params });
  }



 obterProntuario(animalId: number): Observable<ProntuarioOut> {
  return this.http.get<ProntuarioOut>(`${this.api}/animais/${animalId}`);
 
}
}