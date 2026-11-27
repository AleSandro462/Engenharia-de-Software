import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AtendimentoService, ConsultaPendente } from '../../services/atendimento';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-atendimentos',
  imports: [FormsModule, DatePipe],
  styleUrl: './atendimentos.css',
  templateUrl: './atendimentos.html',
})
export class Atendimentos implements OnInit {
  private service = inject(AtendimentoService);

  consultas = signal<ConsultaPendente[]>([]);
  consultaSelecionada = signal<ConsultaPendente | null>(null);
  
  carregando = signal(false);
  salvando = signal(false);
  erro = signal('');
  sucesso = signal('');

  // Campos do formulário do veterinário
  diagnostico = '';
  procedimentos = '';
  observacoes = '';

  ngOnInit() {
    this.carregarFila();
  }

  carregarFila() {
    this.carregando.set(true);
    this.erro.set('');
    this.service.listarConsultasAguardando().subscribe({
      next: (lista) => {
        this.consultas.set(lista);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar as consultas aguardando atendimento.');
        this.carregando.set(false);
      },
    });
  }

  iniciarAtendimento(consulta: ConsultaPendente) {
    this.consultaSelecionada.set(consulta);
    this.diagnostico = '';
    this.procedimentos = '';
    this.observacoes = '';
    this.erro.set('');
    this.sucesso.set('');
  }

  cancelarSelecao() {
    this.consultaSelecionada.set(null);
  }

  confirmarRealizacao() {
    const consulta = this.consultaSelecionada();
    if (!consulta) return;

    if (!this.diagnostico.trim()) {
      this.erro.set('O diagnóstico é obrigatório para confirmar o atendimento.');
      return;
    }

    this.salvando.set(true);
    this.erro.set('');

    this.service
      .confirmarAtendimento({
        consulta_id: consulta.id,
        diagnostico: this.diagnostico.trim(),
        procedimentos: this.procedimentos.trim() || null,
        observacoes: this.observacoes.trim() || null,
      })
      .subscribe({
        next: () => {
          this.salvando.set(false);
          this.sucesso.set(`Atendimento da consulta #${consulta.id} confirmado e salvo no prontuário!`);
          this.consultaSelecionada.set(null);
          this.carregarFila(); // Atualiza a fila removendo a consulta concluída
        },
        error: (err) => {
          this.salvando.set(false);
          this.erro.set(err?.error?.detail || 'Erro ao registrar o atendimento.');
        },
      });
  }
}