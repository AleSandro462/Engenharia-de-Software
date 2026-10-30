import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  imports: [CommonModule],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  // Abrir pop up para cadastro de novo atendimento
  

metricsExample = {
    consultasHoje: 28,
    consultasRestantes: 8,
    atendimentosConcluidos: 14,
    proximasConsultas: 6,
    proximaDetalhe: 'Thor (Golden Retriever) • Sala 2',
    receitaDia: 6840.00,
    metaDiaria: '+8.4%'
  };




}
