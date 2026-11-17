import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { TutorService } from '../../services/tutor';
import { Animal, AnimalDados, Tutor, TutorDados } from './tutores.model';

@Component({
  selector: 'app-tutores',
  imports: [FormsModule, DatePipe],
  styleUrl: './tutores.css',
  templateUrl: './tutores.html',
})
export class Tutores implements OnInit {
  private service = inject(TutorService);

  tutores = signal<Tutor[]>([]);
  erro = signal('');
  busca = signal('');
  tutorForm = signal<(TutorDados & { id?: number }) | null>(null);
  animalForm = signal<(AnimalDados & { id?: number }) | null>(null);
  selecionadoId = signal<number | null>(null);

  filtrados = computed(() => {
    const termo = this.busca().toLowerCase();
    return this.tutores().filter((t) => t.nome.toLowerCase().includes(termo) || t.cpf.includes(termo));
  });
  selecionado = computed(() => this.tutores().find((t) => t.id === this.selecionadoId()));

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.service.listar().subscribe({
      next: (lista) => this.tutores.set(lista),
      error: () => this.erro.set('Não foi possível carregar os tutores.'),
    });
  }

  // ---- Tutor (REQ 04) ----
  novoTutor() {
    this.tutorForm.set({ nome: '', cpf: '', telefone: '', email: '', endereco: '' });
  }

  editarTutor({ animais, ...dados }: Tutor) {
    this.tutorForm.set(dados);
  }

  salvarTutor() {
    const { id, ...dados } = this.tutorForm()!;
    if (!dados.nome || !dados.cpf || !dados.telefone) {
      this.erro.set('Preencha nome, CPF e telefone do tutor.');
      return;
    }
    const req = id ? this.service.atualizar(id, dados) : this.service.criar(dados);
    this.executar(req, () => this.tutorForm.set(null));
  }

  excluirTutor(t: Tutor) {
    if (!confirm(`Excluir o tutor ${t.nome} e todos os seus animais?`)) return;
    this.executar(this.service.excluir(t.id), () => {
      if (this.selecionadoId() === t.id) this.selecionadoId.set(null);
    });
  }

  // ---- Animal (REQ 05) ----
  verAnimais(t: Tutor) {
    this.selecionadoId.set(this.selecionadoId() === t.id ? null : t.id);
    this.animalForm.set(null);
  }

  novoAnimal() {
    this.animalForm.set({ nome: '', especie: '', raca: '', sexo: 'M', data_nascimento: '' });
  }

  editarAnimal(a: Animal) {
    this.animalForm.set({ ...a });
  }

  salvarAnimal() {
    const tutorId = this.selecionadoId()!;
    const { id, ...dados } = this.animalForm()!;
    if (!dados.nome || !dados.especie || !dados.sexo) {
      this.erro.set('Preencha nome, espécie e sexo do animal.');
      return;
    }
    const req = id
      ? this.service.atualizarAnimal(tutorId, id, dados)
      : this.service.adicionarAnimal(tutorId, dados);
    this.executar(req, () => this.animalForm.set(null));
  }

  excluirAnimal(a: Animal) {
    if (!confirm(`Excluir o animal ${a.nome}?`)) return;
    this.executar(this.service.excluirAnimal(this.selecionadoId()!, a.id), () => {});
  }

  private executar(req: Observable<unknown>, aoConcluir: () => void) {
    this.erro.set('');
    req.subscribe({
      next: () => {
        aoConcluir();
        this.carregar();
      },
      error: (err) => {
        const detalhe = err.error?.detail;
        this.erro.set(typeof detalhe === 'string' ? detalhe : 'Verifique os dados informados.');
      },
    });
  }
}
