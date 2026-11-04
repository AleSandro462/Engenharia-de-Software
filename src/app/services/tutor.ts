import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tutor } from '../sessoes/tutores/tutores.model';

@Injectable({ providedIn: 'root' })
export class TutorService {
  private http = inject(HttpClient);

  listar(): Observable<Tutor[]> {
    return this.http.get<Tutor[]>('http://localhost:8000/tutores/');
  }
}