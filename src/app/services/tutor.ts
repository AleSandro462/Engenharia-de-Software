import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Animal, AnimalDados, Tutor, TutorDados } from '../sessoes/tutores/tutores.model';

@Injectable({ providedIn: 'root' })
export class TutorService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/tutores';

  listar(): Observable<Tutor[]> {
    return this.http.get<Tutor[]>(`${this.apiUrl}/`);
  }

  criar(dados: TutorDados): Observable<Tutor> {
    return this.http.post<Tutor>(`${this.apiUrl}/`, this.limpar(dados));
  }

  atualizar(id: number, dados: TutorDados): Observable<Tutor> {
    return this.http.put<Tutor>(`${this.apiUrl}/${id}`, this.limpar(dados));
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  adicionarAnimal(tutorId: number, dados: AnimalDados): Observable<Animal> {
    return this.http.post<Animal>(`${this.apiUrl}/${tutorId}/animais`, this.limpar(dados));
  }

  atualizarAnimal(tutorId: number, animalId: number, dados: AnimalDados): Observable<Animal> {
    return this.http.put<Animal>(`${this.apiUrl}/${tutorId}/animais/${animalId}`, this.limpar(dados));
  }

  excluirAnimal(tutorId: number, animalId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${tutorId}/animais/${animalId}`);
  }

  // Campos opcionais vazios vão como null (a API rejeita e-mail/data em branco)
  private limpar<T extends object>(dados: T): T {
    return Object.fromEntries(
      Object.entries(dados).map(([campo, valor]) => [campo, valor === '' ? null : valor]),
    ) as T;
  }
}
