import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { AgendaService } from '../../services/agenda';
import { Agenda } from './agenda';
import { FakeAgendaService } from './agenda.testing';

describe('Agenda (rota)', () => {
  it('?novo=1 abre o modal de novo agendamento e limpa o parâmetro da URL', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideRouter([{ path: 'agenda', component: Agenda }]),
        { provide: AgendaService, useClass: FakeAgendaService },
      ],
    });
    const harness = await RouterTestingHarness.create();
    const agenda = await harness.navigateByUrl('/agenda?novo=1', Agenda);
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(agenda.modalNovo()).toBe(true);
    expect(harness.routeNativeElement?.querySelector('#titulo-novo')).toBeTruthy();
  });
});
