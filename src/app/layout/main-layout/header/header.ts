import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  imports: [],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  private router = inject(Router);

  /** Abre a Agenda já com o modal "Novo agendamento" aberto (REQ 07). */
  novoAgendamento(): void {
    this.router.navigate(['/agenda'], { queryParams: { novo: 1 } });
  }
}
