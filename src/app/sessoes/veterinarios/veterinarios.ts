import { Component, OnInit, inject, signal } from '@angular/core';
import { VeterinarioService } from '../../services/veterinario';
import { Veterinario } from './veterinarios.model';

@Component({
  selector: 'app-veterinarios',
  imports: [],
  styleUrl: './veterinarios.css',
  templateUrl: './veterinarios.html',
})
export class Veterinarios implements OnInit {
  private service = inject(VeterinarioService);

  veterinarios = signal<Veterinario[]>([]);
  erro = signal('');

  ngOnInit() {
    this.service.listar().subscribe({
      next: (lista) => this.veterinarios.set(lista),
      error: () => this.erro.set('Não foi possível carregar os veterinários.')
    });
  }
}