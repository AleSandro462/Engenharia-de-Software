import { Component, OnInit, inject, signal } from '@angular/core';
import { TutorService } from '../../services/tutor';
import { Tutor } from './tutores.model';

@Component({
  selector: 'app-tutores',
  imports: [],
  styleUrl: './tutores.css',
  templateUrl: './tutores.html',
})
export class Tutores implements OnInit {
  private service = inject(TutorService);

  tutores = signal<Tutor[]>([]);
  erro = signal('');

  ngOnInit() {
    this.service.listar().subscribe({
      next: (lista) => this.tutores.set(lista),
      error: () => this.erro.set('Não foi possível carregar os tutores.'),
    });
  }
}