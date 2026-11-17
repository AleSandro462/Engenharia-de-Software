import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AgendaService } from '../../services/agenda';
import { Agenda } from './agenda';
import { FakeAgendaService } from './agenda.testing';
import { deIso, paraIso, somarDias } from './agenda.model';

describe('Agenda', () => {
  let component: Agenda;
  let fixture: ComponentFixture<Agenda>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Agenda],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: AgendaService, useClass: FakeAgendaService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Agenda);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('carrega as consultas da semana e mostra os cartões', () => {
    expect(component.consultas().length).toBeGreaterThan(0);
    fixture.detectChanges();
    const cartoes = fixture.nativeElement.querySelectorAll('.card-consulta');
    expect(cartoes.length).toBe(component.consultas().length);
  });

  it('REQ 07: agenda uma consulta e ela aparece na semana', () => {
    const antes = component.consultas().length;
    const amanha = paraIso(somarDias(new Date(), 1));
    component.abrirNovo();
    component.escolherTutor(1);
    component.setCampo('animal_id', 1);
    component.setCampo('veterinario_id', 3);
    component.setCampo('data', amanha);
    component.setCampo('hora_inicio', '17:00');
    component.salvarAgendamento();
    expect(component.erroForm()).toBe('');
    expect(component.modalNovo()).toBe(false);
    expect(component.consultas().length).toBe(antes + 1);
    expect(component.selecionada()?.status).toBe('aguardando');
  });

  it('REQ 07: recusa agendamento com campos faltando', () => {
    component.abrirNovo();
    component.salvarAgendamento();
    expect(component.erroForm()).toContain('Preencha');
    expect(component.modalNovo()).toBe(true);
  });

  it('REQ 07: recusa conflito de horário do mesmo veterinário', () => {
    const existente = component.consultas().find((c) => c.status === 'confirmada')!;
    component.abrirNovo();
    component.escolherTutor(2);
    component.setCampo('animal_id', 2);
    component.setCampo('veterinario_id', existente.veterinario_id);
    component.setCampo('data', existente.data);
    component.setCampo('hora_inicio', existente.hora_inicio.slice(0, 5));
    component.salvarAgendamento();
    expect(component.modalNovo()).toBe(true);
    expect(component.erroForm()).not.toBe('');
  });

  it('REQ 08: cancela uma consulta confirmada', () => {
    const alvo = component.consultas().find((c) => c.status === 'confirmada')!;
    component.selecionar(alvo);
    expect(component.podeCancelar()).toBe(true);
    component.abrirCancelar();
    component.motivoCancelamento.set('Tutor desistiu');
    component.confirmarCancelamento();
    expect(component.selecionada()?.status).toBe('cancelada');
    expect(component.selecionada()?.motivo_cancelamento).toBe('Tutor desistiu');
    expect(component.podeCancelar()).toBe(false);
  });

  it('REQ 08: não permite cancelar consulta concluída', () => {
    const concluida = component.consultas().find((c) => c.status === 'concluida')!;
    component.selecionar(concluida);
    expect(component.podeCancelar()).toBe(false);
  });

  it('horários: marca como ocupado o horário já agendado do veterinário', () => {
    const existente = component.consultas().find((c) => c.status === 'confirmada')!;
    component.abrirNovo();
    component.setCampo('veterinario_id', existente.veterinario_id);
    component.setCampo('data', existente.data);
    expect(component.grupos().length).toBe(1);
    const slot = component.grupos()[0].slots.find((s) => s.hora === existente.hora_inicio.slice(0, 5))!;
    expect(slot.livre).toBe(false);
    expect(slot.motivo).toContain('Ocupado');
  });

  it('horários: horário de consulta cancelada volta a ficar livre', () => {
    const cancelada = component.consultas().find((c) => c.status === 'cancelada')!;
    component.abrirNovo();
    component.setCampo('veterinario_id', cancelada.veterinario_id);
    component.setCampo('data', cancelada.data);
    const slot = component.grupos()[0].slots.find((s) => s.hora === cancelada.hora_inicio.slice(0, 5))!;
    expect(slot.motivo).not.toContain('Ocupado');
  });

  it('horários: só com a data, lista todos os veterinários', () => {
    component.abrirNovo();
    component.setCampo('data', component.consultas()[0].data);
    expect(component.grupos().length).toBe(component.veterinarios().length);
  });

  it('horários: só com o veterinário, lista os próximos dias (sem domingo)', () => {
    component.abrirNovo();
    component.setCampo('veterinario_id', 1);
    const grupos = component.grupos();
    expect(grupos.length).toBe(7);
    expect(grupos.every((g) => deIso(g.data).getDay() !== 0)).toBe(true);
  });

  it('horários: sem data e sem veterinário, não mostra nada', () => {
    component.abrirNovo();
    expect(component.grupos().length).toBe(0);
    expect(component.totalLivres()).toBe(0);
  });

  it('horários: clicar em um horário preenche veterinário, data e hora', () => {
    component.abrirNovo();
    component.setCampo('veterinario_id', 2);
    const g = component.grupos().find((x) => x.slots.some((s) => s.livre))!;
    const livre = g.slots.find((s) => s.livre)!;
    component.selecionarHorario(g.vetId, g.data, livre.hora);
    expect(component.form().data).toBe(g.data);
    expect(component.form().hora_inicio).toBe(livre.hora);
    expect(component.horarioSelecionado(g, livre.hora)).toBe(true);
  });

  it('modo Dia mostra uma única coluna', () => {
    component.setVisao('dia');
    expect(component.dias().length).toBe(1);
    expect(component.colunas().length).toBe(1);
  });

  it('modo Mês monta a grade de semanas com as consultas do mês', () => {
    component.setVisao('mes');
    const semanas = component.mesGrade();
    expect(semanas.length).toBeGreaterThanOrEqual(4);
    expect(semanas.every((s) => s.dias.length === 6)).toBe(true);
    const total = semanas.reduce((n, s) => n + s.dias.reduce((m, d) => m + d.itens.length, 0), 0);
    expect(total).toBeGreaterThan(0);
  });

  it('modo Mês: clicar em um dia abre o modo Dia naquela data', () => {
    component.setVisao('mes');
    const iso = component.mesGrade()[1].dias[2].iso;
    component.abrirDia(iso);
    expect(component.visao()).toBe('dia');
    expect(paraIso(component.ancora())).toBe(iso);
  });

  it('navegação respeita o modo: dia ±1, semana ±7, mês ±1 mês', () => {
    component.setVisao('dia');
    const antes = component.ancora();
    component.mudar(1);
    expect(paraIso(component.ancora())).toBe(paraIso(somarDias(antes, 1)));
    component.setVisao('mes');
    const mes = component.ancora().getMonth();
    component.mudar(1);
    expect(component.ancora().getMonth()).toBe((mes + 1) % 12);
  });

  it('filtro de veterinário e de status escondem as outras consultas', () => {
    const todas = component.visiveis().length;
    component.vetFiltro.set(2);
    expect(component.visiveis().every((c) => c.veterinario_id === 2)).toBe(true);
    expect(component.visiveis().length).toBeLessThan(todas);
    component.vetFiltro.set(null);
    component.statusFiltro.set('cancelada');
    expect(component.visiveis().every((c) => c.status === 'cancelada')).toBe(true);
  });

  it('clique em horário vazio abre o agendamento no dia (e veterinário/hora se filtrado)', () => {
    const amanha = paraIso(somarDias(new Date(), 1));
    component.vetFiltro.set(2);
    component.abrirNovo({ data: amanha, hora: '15:30' });
    expect(component.modalNovo()).toBe(true);
    expect(component.form().data).toBe(amanha);
    expect(component.form().veterinario_id).toBe(2);
    expect(component.form().hora_inicio).toBe('15:30');
  });

  it('sem filtro de veterinário, o clique só pré-preenche a data', () => {
    const amanha = paraIso(somarDias(new Date(), 1));
    component.abrirNovo({ data: amanha, hora: '15:30' });
    expect(component.form().data).toBe(amanha);
    expect(component.form().veterinario_id).toBeNull();
    expect(component.form().hora_inicio).toBe('');
  });

  it('painel de detalhes mostra paciente, tutor, raça e idade', () => {
    const thor = component.consultas().find((c) => c.animal_nome === 'Thor')!;
    component.selecionar(thor);
    expect(component.tutor()?.nome).toBe(thor.tutor_nome);
    expect(component.animal()?.raca).toBe('Golden Retriever');
    expect(component.idadeAnimal()).toMatch(/anos?/);
    fixture.detectChanges();
    const texto = fixture.nativeElement.textContent;
    expect(texto).toContain('Golden Retriever');
    expect(texto).toContain('carlos.mendes@email.com');
    expect(texto).toContain('Tipo de atendimento');
  });

  it('modal mostra o resumo quando tudo foi escolhido', () => {
    component.abrirNovo();
    expect(component.resumo()).toBeNull();
    component.escolherTutor(1);
    component.setCampo('animal_id', 1);
    component.setCampo('veterinario_id', 1);
    component.setCampo('data', paraIso(somarDias(new Date(), 1)));
    component.setCampo('hora_inicio', '10:00');
    expect(component.resumo()?.animal).toBe('Thor');
  });

  it('busca de tutor: lista em ordem alfabética quando não há busca', () => {
    component.abrirNovo();
    const nomes = component.tutoresFiltrados().itens.map((t) => t.nome);
    expect(nomes).toEqual([...nomes].sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })));
  });

  it('busca de tutor: filtra por nome sem diferenciar acento ou maiúscula', () => {
    component.abrirNovo();
    component.digitarTutor('joao');
    const itens = component.tutoresFiltrados().itens;
    expect(itens.length).toBe(1);
    expect(itens[0].nome).toBe('João Batista');
  });

  it('busca de tutor: filtra por CPF e por telefone, com ou sem pontuação', () => {
    component.abrirNovo();
    component.digitarTutor('222.222');
    expect(component.tutoresFiltrados().itens.map((t) => t.nome)).toEqual(['Ana Paula Ribeiro']);
    component.digitarTutor('98873');
    expect(component.tutoresFiltrados().itens.map((t) => t.nome)).toEqual(['Carlos Eduardo Mendes']);
  });

  it('busca de tutor: vários termos precisam aparecer todos', () => {
    component.abrirNovo();
    component.digitarTutor('ana ribeiro');
    expect(component.tutoresFiltrados().itens.length).toBe(1);
    component.digitarTutor('ana batista');
    expect(component.tutoresFiltrados().itens.length).toBe(0);
  });

  it('busca de tutor: escolher preenche o nome e libera os animais; digitar de novo desfaz', () => {
    component.abrirNovo();
    const ana = component.tutores().find((t) => t.nome.startsWith('Ana'))!;
    component.escolherTutorLista(ana);
    expect(component.form().tutor_id).toBe(ana.id);
    expect(component.tutorBusca()).toBe(ana.nome);
    expect(component.animaisDoTutor().length).toBe(2);
    component.digitarTutor('Ana P');
    expect(component.form().tutor_id).toBeNull();
  });

  it('tutor com um único animal já vem com o animal escolhido', () => {
    component.abrirNovo();
    const carlos = component.tutores().find((t) => t.nome.startsWith('Carlos'))!;
    component.escolherTutorLista(carlos);
    expect(component.form().animal_id).toBe(carlos.animais[0].id);
  });

  it('a duração acompanha o tipo de consulta e limpa o horário escolhido', () => {
    component.abrirNovo();
    component.setCampo('hora_inicio', '10:00');
    component.setCampo('tipo', 'Cirurgia');
    expect(component.form().duracao_min).toBe(120);
    expect(component.form().hora_inicio).toBe('');
    component.setCampo('tipo', 'Vacinação');
    expect(component.form().duracao_min).toBe(15);
    component.setCampo('duracao_min', 30); // ainda dá para ajustar
    expect(component.form().duracao_min).toBe(30);
  });
});
