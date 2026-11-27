import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ProntuarioService } from '../../services/prontuario';
import { AnimalBusca, ProntuarioOut } from './prontuarios.model';

@Component({
  selector: 'app-prontuarios',
  imports: [FormsModule, DatePipe],
  styleUrl: './prontuarios.css',
  templateUrl: './prontuarios.html',
})
export class Prontuarios implements OnInit {
  private service = inject(ProntuarioService);

  busca = '';
  animais = signal<AnimalBusca[]>([]);
  erro = signal('');

  animalAbertoId = signal<number | null>(null);
  prontuarioAtual = signal<ProntuarioOut | null>(null);
  carregandoProntuario = signal(false);

  ngOnInit() {
    this.buscar();
  }

  buscar() {
    this.erro.set('');
    this.animalAbertoId.set(null);
    this.prontuarioAtual.set(null);
    this.service.buscarAnimais(this.busca).subscribe({
      next: (lista) => this.animais.set(lista),
      error: () => this.erro.set('Não foi possível buscar os animais.'),
    });
  }

  toggleProntuario(animalId: number) {
    // Se clicou no animal que já está aberto, recolhe e volta ao original
    if (this.animalAbertoId() === animalId) {
      this.animalAbertoId.set(null);
      setTimeout(() => {
        if (this.animalAbertoId() === null) {
          this.prontuarioAtual.set(null);
        }
      }, 280); // Aguarda a animação de fechar terminar
      return;
    }

    this.erro.set('');
    this.animalAbertoId.set(animalId);
    this.prontuarioAtual.set(null);
    this.carregandoProntuario.set(true);

    this.service.obterProntuario(animalId).subscribe({
      next: (dados) => {
        this.prontuarioAtual.set(dados);
        this.carregandoProntuario.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar o prontuário deste animal.');
        this.carregandoProntuario.set(false);
      },
    });
  }
}