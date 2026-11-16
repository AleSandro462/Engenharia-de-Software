import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VeterinarioService } from '../../services/veterinario';
import { Veterinario } from './veterinarios.model';

@Component({
  selector: 'app-veterinarios',
  imports: [FormsModule],
  styleUrl: './veterinarios.css',
  templateUrl: './veterinarios.html',
})
export class Veterinarios implements OnInit {
  private service = inject(VeterinarioService);

  veterinarios = signal<Veterinario[]>([]);
  erro = signal('');
  sucesso = signal('');
  editandoId = signal<number | null>(null);

  form: Veterinario = this.novoFormulario();

  ngOnInit() {
    this.carregarVeterinarios();
  }

  novoFormulario(): Veterinario {
    return {
      nome: '',
      crmv: '',
      telefone: '',
      email: '',
      especialidade: '',
    };
  }

  carregarVeterinarios() {
    this.service.listar().subscribe({
      next: (lista) => this.veterinarios.set(lista),
      error: () => this.erro.set('Não foi possível carregar os veterinários.'),
    });
  }

  salvar() {
    this.erro.set('');
    this.sucesso.set('');

    const payload: Veterinario = {
      ...this.form,
      especialidade: this.form.especialidade?.trim() || undefined,
    };

    const id = this.editandoId();
    if (id !== null) {
      this.service.atualizar(id, payload).subscribe({
        next: () => {
          this.sucesso.set('Veterinário atualizado com sucesso!');
          this.cancelarEdicao();
          this.carregarVeterinarios();
        },
        error: (err) => this.erro.set(err?.error?.detail || 'Erro ao atualizar veterinário.'),
      });
    } else {
      this.service.cadastrar(payload).subscribe({
        next: () => {
          this.sucesso.set('Veterinário cadastrado com sucesso!');
          this.form = this.novoFormulario();
          this.carregarVeterinarios();
        },
        error: (err) => this.erro.set(err?.error?.detail || 'Erro ao cadastrar veterinário.'),
      });
    }
  }

  editar(vet: Veterinario) {
    this.erro.set('');
    this.sucesso.set('');
    this.editandoId.set(vet.id ?? null);
    this.form = { ...vet };
  }

  cancelarEdicao() {
    this.editandoId.set(null);
    this.form = this.novoFormulario();
  }

  excluir(id?: number) {
    if (!id) return;
    this.service.deletar(id).subscribe({
      next: () => {
        this.sucesso.set('Veterinário removido.');
        this.carregarVeterinarios();
      },
      error: () => this.erro.set('Erro ao excluir veterinário.'),
    });
  }
}