import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AgendaService } from '../../services/agenda';
import { Tutor } from '../tutores/tutores.model';
import {
  Consulta,
  DURACAO_POR_TIPO,
  NovaConsulta,
  STATUS_INFO,
  StatusConsulta,
  TIPOS_CONSULTA,
  VeterinarioAgenda,
  deIso,
  hhmm,
  minutos,
  numeroSemanaIso,
  paraIso,
  segundaDaSemana,
  somarDias,
  somarMinutos,
} from './agenda.model';

const HORA_INICIO = 8;
const HORA_FIM = 18;
const PX_HORA = 88;
const NOMES_DIA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const NOMES_DIA_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const LIMITE_TUTORES = 8;

/** minúsculas e sem acentos, para a busca ignorar maiúsculas e acentuação */
const normalizar = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const UNIDADE = 'Clínica Salvador - Matriz';

export type Visao = 'dia' | 'semana' | 'mes';

/** Hoje; aos domingos (clínica fechada) usa a segunda seguinte. */
function hojeUtil(): Date {
  const h = new Date();
  return h.getDay() === 0 ? somarDias(h, 1) : h;
}

interface FormAgendamento {
  tutor_id: number | null;
  animal_id: number | null;
  veterinario_id: number | null;
  data: string;
  hora_inicio: string;
  duracao_min: number;
  tipo: string;
  observacoes: string;
}

interface GrupoHorarios {
  titulo: string;
  vetId: number;
  data: string;
  slots: { hora: string; livre: boolean; motivo: string }[];
}

const formVazio = (): FormAgendamento => ({
  tutor_id: null,
  animal_id: null,
  veterinario_id: null,
  data: '',
  hora_inicio: '',
  duracao_min: 30,
  tipo: 'Consulta',
  observacoes: '',
});

@Component({
  imports: [FormsModule],
  selector: 'app-agenda',
  styleUrl: './agenda.css',
  templateUrl: './agenda.html',
})
export class Agenda implements OnInit {
  private service = inject(AgendaService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // constantes usadas no template
  readonly horas = Array.from({ length: HORA_FIM - HORA_INICIO }, (_, i) => HORA_INICIO + i);
  readonly pxHora = PX_HORA;
  readonly alturaGrade = (HORA_FIM - HORA_INICIO) * PX_HORA;
  readonly statusInfo = STATUS_INFO;
  readonly statusLista = Object.keys(STATUS_INFO) as StatusConsulta[];
  readonly tipos = TIPOS_CONSULTA;
  readonly duracoes = [15, 30, 45, 60, 90, 120];
  readonly horarios = Array.from({ length: (HORA_FIM - HORA_INICIO) * 2 }, (_, i) =>
    somarMinutos(`${String(HORA_INICIO).padStart(2, '0')}:00`, i * 30),
  );
  readonly hoje = paraIso(new Date());
  readonly nomesDia = NOMES_DIA;
  readonly visoes: { valor: Visao; rotulo: string }[] = [
    { valor: 'dia', rotulo: 'Dia' },
    { valor: 'semana', rotulo: 'Semana' },
    { valor: 'mes', rotulo: 'Mês' },
  ];
  readonly hhmm = hhmm;
  readonly unidade = UNIDADE;

  // dados
  visao = signal<Visao>('semana');
  ancora = signal<Date>(hojeUtil()); // data de referência do período exibido
  vetFiltro = signal<number | null>(null);
  statusFiltro = signal<StatusConsulta | ''>('');
  consultas = signal<Consulta[]>([]);
  tutores = signal<Tutor[]>([]);
  veterinarios = signal<VeterinarioAgenda[]>([]);
  selecionadaId = signal<number | null>(null);
  erro = signal('');

  // modal "Novo agendamento"
  modalNovo = signal(false);
  form = signal<FormAgendamento>(formVazio());
  erroForm = signal('');
  ocupadas = signal<Consulta[]>([]); // consultas do veterinário/dia escolhidos no modal
  salvando = signal(false);

  // campo de busca de tutor
  tutorBusca = signal('');
  tutorAberto = signal(false);
  tutorIdx = signal(0);

  // modal "Cancelar consulta"
  modalCancelar = signal(false);
  motivoCancelamento = signal('');
  erroCancelar = signal('');

  // ---------- derivados ----------
  selecionada = computed(() => this.consultas().find((c) => c.id === this.selecionadaId()) ?? null);

  semanaInicio = computed(() => segundaDaSemana(this.ancora()));

  /** Colunas da grade de horários: 1 no modo Dia, 6 (Seg–Sáb) no modo Semana. */
  dias = computed(() => {
    const datas =
      this.visao() === 'dia'
        ? [this.ancora()]
        : NOMES_DIA.map((_, i) => somarDias(this.semanaInicio(), i));
    return datas.map((d) => {
      const iso = paraIso(d);
      return { iso, nome: NOMES_DIA_SEMANA[d.getDay()], numero: d.getDate(), ehHoje: iso === this.hoje };
    });
  });

  titulo = computed(() => {
    const ancora = this.ancora();
    if (this.visao() === 'dia') {
      return ancora.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
    if (this.visao() === 'mes') {
      return ancora.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    }
    const ini = this.semanaInicio();
    const fim = somarDias(ini, 5);
    const mes = (d: Date, curto: boolean) =>
      d.toLocaleDateString('pt-BR', { month: curto ? 'short' : 'long' }).replace('.', '');
    if (ini.getMonth() === fim.getMonth()) {
      return `${ini.getDate()} a ${fim.getDate()} de ${mes(fim, false)} de ${fim.getFullYear()}`;
    }
    return `${ini.getDate()} de ${mes(ini, true)} a ${fim.getDate()} de ${mes(fim, true)} de ${fim.getFullYear()}`;
  });

  numeroSemana = computed(() => numeroSemanaIso(this.semanaInicio()));

  /** Consultas depois do filtro de veterinário (usadas na legenda). */
  doVeterinario = computed(() => {
    const vet = this.vetFiltro();
    return vet === null ? this.consultas() : this.consultas().filter((c) => c.veterinario_id === vet);
  });

  /** Consultas depois dos filtros de veterinário e status (usadas nas grades). */
  visiveis = computed(() => {
    const st = this.statusFiltro();
    return st === '' ? this.doVeterinario() : this.doVeterinario().filter((c) => c.status === st);
  });

  colunas = computed(() =>
    this.dias().map((dia) => ({
      dia,
      cards: this.posicionar(this.visiveis().filter((c) => c.data === dia.iso)),
    })),
  );

  /** Grade do mês: semanas de Seg a Sáb cobrindo o mês da âncora. */
  mesGrade = computed(() => {
    if (this.visao() !== 'mes') return [];
    const mes = this.ancora().getMonth();
    const semanas = [];
    const ultimoDia = new Date(this.ancora().getFullYear(), mes + 1, 0);
    for (let ini = this.inicioGradeMes(); ini <= ultimoDia; ini = somarDias(ini, 7)) {
      semanas.push({
        chave: paraIso(ini),
        dias: NOMES_DIA.map((_, i) => {
          const d = somarDias(ini, i);
          const iso = paraIso(d);
          return {
            iso,
            numero: d.getDate(),
            fora: d.getMonth() !== mes,
            ehHoje: iso === this.hoje,
            itens: this.visiveis()
              .filter((c) => c.data === iso)
              .sort((a, b) => minutos(a.hora_inicio) - minutos(b.hora_inicio)),
          };
        }),
      });
    }
    return semanas;
  });

  contagem = computed(() => {
    const total = {} as Record<StatusConsulta, number>;
    for (const s of this.statusLista) total[s] = 0;
    for (const c of this.doVeterinario()) total[c.status]++;
    return total;
  });

  /**
   * Tutores da busca: filtra por nome, CPF, telefone ou e-mail (todos os termos digitados
   * precisam aparecer) e ordena alfabeticamente; quem começa com o texto vem primeiro.
   */
  tutoresFiltrados = computed(() => {
    const termos = this.tutorBusca().split(/\s+/).filter(Boolean).map((t) => (/\d/.test(t) ? t.replace(/\D/g, '') : normalizar(t)));
    const primeiro = termos[0] ?? '';
    const lista = this.tutores()
      .filter((t) => {
        const alvo = `${normalizar(t.nome)} ${t.cpf.replace(/\D/g, '')} ${t.telefone.replace(/\D/g, '')} ${normalizar(t.email ?? '')}`;
        return termos.every((termo) => alvo.includes(termo));
      })
      .sort((a, b) => {
        const ca = normalizar(a.nome).startsWith(primeiro) ? 0 : 1;
        const cb = normalizar(b.nome).startsWith(primeiro) ? 0 : 1;
        return ca - cb || a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' });
      });
    return { itens: lista.slice(0, LIMITE_TUTORES), restantes: Math.max(lista.length - LIMITE_TUTORES, 0) };
  });

  animaisDoTutor = computed(
    () => this.tutores().find((t) => t.id === this.form().tutor_id)?.animais ?? [],
  );

  /**
   * Disponibilidade mostrada no modal. Funciona com qualquer campo sozinho:
   *  - só data         -> um grupo por veterinário
   *  - só veterinário  -> um grupo por dia (próximos dias)
   *  - os dois         -> um único grupo
   */
  grupos = computed<GrupoHorarios[]>(() => {
    const f = this.form();
    if (f.data) {
      const vets =
        f.veterinario_id !== null
          ? this.veterinarios().filter((v) => v.id === f.veterinario_id)
          : this.veterinarios();
      return vets.map((v) => ({
        titulo: f.veterinario_id !== null ? '' : v.especialidade ? `${v.nome} — ${v.especialidade}` : v.nome,
        vetId: v.id,
        data: f.data,
        slots: this.slotsPara(v.id, f.data),
      }));
    }
    if (f.veterinario_id !== null) {
      return this.proximosDias().map((iso) => ({
        titulo: deIso(iso).toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: '2-digit',
          month: '2-digit',
        }),
        vetId: f.veterinario_id!,
        data: iso,
        slots: this.slotsPara(f.veterinario_id!, iso),
      }));
    }
    return [];
  });

  totalLivres = computed(() =>
    this.grupos().reduce((n, g) => n + g.slots.filter((s) => s.livre).length, 0),
  );


  // dados do paciente/tutor da consulta selecionada (painel de detalhes)
  tutor = computed(() => this.tutores().find((t) => t.id === this.selecionada()?.tutor_id) ?? null);
  animal = computed(
    () => this.tutor()?.animais.find((a) => a.id === this.selecionada()?.animal_id) ?? null,
  );
  idadeAnimal = computed(() => {
    const nasc = this.animal()?.data_nascimento;
    if (!nasc) return '';
    const n = deIso(nasc);
    const h = new Date();
    let meses = (h.getFullYear() - n.getFullYear()) * 12 + (h.getMonth() - n.getMonth());
    if (h.getDate() < n.getDate()) meses--;
    if (meses < 0) return '';
    const anos = Math.floor(meses / 12);
    const resto = meses % 12;
    const partes = [];
    if (anos) partes.push(`${anos} ${anos === 1 ? 'ano' : 'anos'}`);
    if (resto || !anos) partes.push(`${resto} ${resto === 1 ? 'mês' : 'meses'}`);
    return partes.join(' e ');
  });

  /** Frase do cartão "Data & horário": "Hoje • 10:15 - 11:00" ou "ter., 17/11 • 10:00 - 10:45". */
  quando(c: Consulta): string {
    const dia =
      c.data === this.hoje
        ? 'Hoje'
        : deIso(c.data).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
    return `${dia} • ${hhmm(c.hora_inicio)} - ${this.fimConsulta(c)}`;
  }

  emojiEspecie(especie: string | undefined): string {
    const e = (especie ?? '').toLowerCase();
    if (e.includes('cão') || e.includes('cao') || e.includes('cachorro')) return '🐶';
    if (e.includes('gato')) return '🐱';
    return '🐾';
  }

  /** Resumo do que será agendado, mostrado antes do botão de confirmar. */
  resumo = computed(() => {
    const f = this.form();
    if (f.tutor_id === null || f.animal_id === null || f.veterinario_id === null || !f.data || !f.hora_inicio) {
      return null;
    }
    const animal = this.animaisDoTutor().find((a) => a.id === f.animal_id);
    const dia = deIso(f.data).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
    return {
      animal: animal?.nome ?? '',
      veterinario: this.nomeVeterinario(f.veterinario_id),
      quando: `${dia}, ${f.hora_inicio} – ${somarMinutos(f.hora_inicio, f.duracao_min)}`,
      tipo: f.tipo,
    };
  });

  podeCancelar = computed(() => {
    const s = this.selecionada()?.status;
    return s === 'aguardando' || s === 'confirmada';
  });

  ngOnInit() {
    this.service.listarTutores().subscribe((t) => this.tutores.set(t));
    this.service.listarVeterinarios().subscribe((v) => this.veterinarios.set(v));
    this.carregar();

    // O botão "+ Novo agendamento" do header chega aqui com ?novo=1
    this.route.queryParamMap.subscribe((q) => {
      if (q.has('novo')) {
        this.abrirNovo();
        this.router.navigate([], { queryParams: { novo: null }, replaceUrl: true });
      }
    });
  }

  // ---------- navegação do período ----------
  private inicioGradeMes(): Date {
    const a = this.ancora();
    return segundaDaSemana(new Date(a.getFullYear(), a.getMonth(), 1));
  }

  private periodo(): { inicio: string; fim: string } {
    switch (this.visao()) {
      case 'dia':
        return { inicio: paraIso(this.ancora()), fim: paraIso(this.ancora()) };
      case 'semana':
        return { inicio: paraIso(this.semanaInicio()), fim: paraIso(somarDias(this.semanaInicio(), 5)) };
      default: {
        const ini = this.inicioGradeMes();
        return { inicio: paraIso(ini), fim: paraIso(somarDias(ini, 6 * 7)) };
      }
    }
  }

  carregar() {
    const { inicio, fim } = this.periodo();
    this.service.listar(inicio, fim).subscribe({
      next: (lista) => {
        this.consultas.set(lista);
        this.erro.set('');
      },
      error: () => this.erro.set('Não foi possível carregar a agenda.'),
    });
  }

  mudar(delta: number) {
    const a = this.ancora();
    switch (this.visao()) {
      case 'dia':
        this.ancora.set(somarDias(a, delta));
        break;
      case 'semana':
        this.ancora.set(somarDias(a, delta * 7));
        break;
      default:
        this.ancora.set(new Date(a.getFullYear(), a.getMonth() + delta, 1));
    }
    this.selecionadaId.set(null);
    this.carregar();
  }

  irParaHoje() {
    this.ancora.set(this.visao() === 'semana' ? hojeUtil() : new Date());
    this.selecionadaId.set(null);
    this.carregar();
  }

  setVisao(v: Visao) {
    if (v === 'semana' && this.ancora().getDay() === 0) this.ancora.update((a) => somarDias(a, 1));
    this.visao.set(v);
    this.selecionadaId.set(null);
    this.carregar();
  }

  /** Clique em um dia da visão mensal: abre aquele dia. */
  abrirDia(iso: string) {
    this.ancora.set(deIso(iso));
    this.visao.set('dia');
    this.selecionadaId.set(null);
    this.carregar();
  }

  selecionar(c: Consulta) {
    this.selecionadaId.set(c.id);
  }

  nomeVeterinario(id: number): string {
    return this.veterinarios().find((v) => v.id === id)?.nome ?? `Veterinário #${id}`;
  }

  veterinario(id: number): VeterinarioAgenda | undefined {
    return this.veterinarios().find((v) => v.id === id);
  }

  dataExtenso(iso: string): string {
    return deIso(iso).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  fimConsulta(c: Consulta): string {
    return somarMinutos(hhmm(c.hora_inicio), c.duracao_min);
  }

  // Lado a lado quando há consultas de veterinários diferentes no mesmo horário.
  private posicionar(lista: Consulta[]) {
    const ordenada = [...lista].sort((a, b) => minutos(a.hora_inicio) - minutos(b.hora_inicio));
    const fimDaFaixa: number[] = [];
    const itens = ordenada.map((c) => {
      const ini = minutos(c.hora_inicio);
      let faixa = fimDaFaixa.findIndex((fim) => fim <= ini);
      if (faixa === -1) faixa = fimDaFaixa.length;
      fimDaFaixa[faixa] = ini + c.duracao_min;
      return { c, ini, faixa };
    });
    const total = Math.max(fimDaFaixa.length, 1);
    return itens.map(({ c, ini, faixa }) => ({
      consulta: c,
      top: ((ini - HORA_INICIO * 60) / 60) * PX_HORA,
      height: Math.max((c.duracao_min / 60) * PX_HORA, 30),
      left: (faixa / total) * 100,
      width: 100 / total,
    }));
  }

  // ---------- REQ 07: agendar ----------
  abrirNovo(pre?: { data: string; hora: string }) {
    const f = formVazio();
    if (pre) {
      f.data = pre.data;
      // com um veterinário filtrado, o horário clicado já vem escolhido
      const vet = this.vetFiltro();
      if (vet !== null) {
        f.veterinario_id = vet;
        if (new Date(`${pre.data}T${pre.hora}`) >= new Date()) f.hora_inicio = pre.hora;
      }
    }
    this.form.set(f);
    this.erroForm.set('');
    this.ocupadas.set([]);
    this.tutorBusca.set('');
    this.tutorAberto.set(false);
    this.tutorIdx.set(0);
    this.modalNovo.set(true);
    if (pre) this.carregarOcupadas();
  }

  /** Clique em uma área vazia da grade: abre o agendamento naquele dia e horário. */
  agendarNoHorario(evento: MouseEvent, iso: string) {
    if (evento.target !== evento.currentTarget) return; // clicou em um cartão
    const minutosDoDia = HORA_INICIO * 60 + Math.floor(evento.offsetY / PX_HORA * 2) * 30;
    const hora = somarMinutos('00:00', minutosDoDia);
    this.abrirNovo({ data: iso, hora });
  }

  fecharNovo() {
    if (!this.salvando()) this.modalNovo.set(false);
  }

  setCampo<K extends keyof FormAgendamento>(campo: K, valor: FormAgendamento[K]) {
    this.form.update((f) => ({ ...f, [campo]: valor }));
    if (campo === 'tipo') {
      // cada tipo tem sua duração padrão (ajustável depois)
      const duracao = DURACAO_POR_TIPO[valor as string];
      if (duracao) this.form.update((f) => ({ ...f, duracao_min: duracao }));
      this.setCampoHorario('');
    }
    if (campo === 'veterinario_id' || campo === 'data' || campo === 'duracao_min') {
      this.setCampoHorario('');
      if (campo !== 'duracao_min') this.carregarOcupadas();
    }
  }

  setCampoHorario(hora: string) {
    this.form.update((f) => ({ ...f, hora_inicio: hora }));
  }

  /** Marca um horário: preenche veterinário, data e hora de uma vez. */
  selecionarHorario(vetId: number, data: string, hora: string) {
    this.form.update((f) => ({ ...f, veterinario_id: vetId, data, hora_inicio: hora }));
  }

  horarioSelecionado(g: GrupoHorarios, hora: string): boolean {
    const f = this.form();
    return f.hora_inicio === hora && f.veterinario_id === g.vetId && f.data === g.data;
  }

  livresDoGrupo(g: GrupoHorarios): number {
    return g.slots.filter((s) => s.livre).length;
  }

  private proximosDias(): string[] {
    const dias: string[] = [];
    const base = new Date();
    for (let i = 0; dias.length < 7 && i < 14; i++) {
      const d = somarDias(base, i);
      if (d.getDay() !== 0) dias.push(paraIso(d)); // clínica não abre aos domingos
    }
    return dias;
  }

  private slotsPara(vetId: number, data: string) {
    const duracao = this.form().duracao_min;
    const agora = new Date();
    return this.horarios.map((hora) => {
      const ini = minutos(hora);
      const fim = ini + duracao;
      if (fim > HORA_FIM * 60) return { hora, livre: false, motivo: 'Termina após o expediente' };
      if (new Date(`${data}T${hora}`) < agora) return { hora, livre: false, motivo: 'Horário já passou' };
      const choque = this.ocupadas().find(
        (c) =>
          c.veterinario_id === vetId &&
          c.data === data &&
          c.status !== 'cancelada' &&
          ini < minutos(c.hora_inicio) + c.duracao_min &&
          minutos(c.hora_inicio) < fim,
      );
      return choque
        ? { hora, livre: false, motivo: `Ocupado (${choque.animal_nome})` }
        : { hora, livre: true, motivo: 'Disponível' };
    });
  }

  /** Carrega as consultas do período exibido (um dia, ou os próximos dias se só há veterinário). */
  private carregarOcupadas() {
    const { veterinario_id, data } = this.form();
    let inicio: string;
    let fim: string;
    if (data) {
      inicio = fim = data;
    } else if (veterinario_id !== null) {
      const dias = this.proximosDias();
      inicio = dias[0];
      fim = dias[dias.length - 1];
    } else {
      this.ocupadas.set([]);
      return;
    }
    this.service.listar(inicio, fim).subscribe((lista) => {
      const atual = this.form();
      const mesmoPedido = data ? atual.data === data : !atual.data && atual.veterinario_id !== null;
      if (mesmoPedido) this.ocupadas.set(lista);
    });
  }

  escolherTutor(id: number | null) {
    const animais = this.tutores().find((t) => t.id === id)?.animais ?? [];
    // tutor com um único animal: já deixa o animal escolhido
    this.form.update((f) => ({ ...f, tutor_id: id, animal_id: animais.length === 1 ? animais[0].id : null }));
  }

  // ---- busca de tutor ----
  digitarTutor(texto: string) {
    this.tutorBusca.set(texto);
    this.tutorIdx.set(0);
    this.tutorAberto.set(true);
    if (this.form().tutor_id !== null) this.escolherTutor(null); // texto mudou: desfaz a escolha
  }

  escolherTutorLista(t: Tutor) {
    this.escolherTutor(t.id);
    this.tutorBusca.set(t.nome);
    this.tutorAberto.set(false);
  }

  limparTutor() {
    this.escolherTutor(null);
    this.tutorBusca.set('');
    this.tutorIdx.set(0);
    this.tutorAberto.set(true);
  }

  fecharListaTutor() {
    this.tutorAberto.set(false);
    const escolhido = this.tutores().find((t) => t.id === this.form().tutor_id);
    if (escolhido) this.tutorBusca.set(escolhido.nome); // restaura o nome
  }

  teclaTutor(e: KeyboardEvent) {
    const itens = this.tutoresFiltrados().itens;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.tutorAberto.set(true);
      this.tutorIdx.update((i) => Math.min(i + 1, itens.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.tutorIdx.update((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && this.tutorAberto()) {
      e.preventDefault(); // não envia o formulário
      const t = itens[this.tutorIdx()];
      if (t) this.escolherTutorLista(t);
    } else if (e.key === 'Escape' && this.tutorAberto()) {
      e.stopPropagation();
      this.fecharListaTutor();
    }
  }

  salvarAgendamento() {
    const f = this.form();
    if (
      f.tutor_id === null ||
      f.animal_id === null ||
      f.veterinario_id === null ||
      !f.data ||
      !f.hora_inicio
    ) {
      this.erroForm.set('Preencha tutor e animal e escolha um horário disponível.');
      return;
    }
    const dados: NovaConsulta = {
      tutor_id: f.tutor_id,
      animal_id: f.animal_id,
      veterinario_id: f.veterinario_id,
      data: f.data,
      hora_inicio: f.hora_inicio,
      duracao_min: f.duracao_min,
      tipo: f.tipo,
      observacoes: f.observacoes.trim() || null,
    };
    this.salvando.set(true);
    this.service.agendar(dados).subscribe({
      next: (nova) => {
        this.salvando.set(false);
        this.modalNovo.set(false);
        // mostra a semana da consulta criada e a seleciona
        this.ancora.set(deIso(nova.data));
        if (this.vetFiltro() !== null && this.vetFiltro() !== nova.veterinario_id) this.vetFiltro.set(null);
        this.statusFiltro.set('');
        this.selecionadaId.set(nova.id);
        this.carregar();
      },
      error: (e) => {
        this.salvando.set(false);
        this.erroForm.set(this.mensagemDeErro(e, 'Não foi possível agendar a consulta.'));
      },
    });
  }

  // ---------- REQ 08: cancelar ----------
  abrirCancelar() {
    this.motivoCancelamento.set('');
    this.erroCancelar.set('');
    this.modalCancelar.set(true);
  }

  confirmarCancelamento() {
    const c = this.selecionada();
    if (!c) return;
    this.service.cancelar(c.id, this.motivoCancelamento().trim() || null).subscribe({
      next: () => {
        this.modalCancelar.set(false);
        this.carregar();
      },
      error: (e) =>
        this.erroCancelar.set(this.mensagemDeErro(e, 'Não foi possível cancelar a consulta.')),
    });
  }

  private mensagemDeErro(e: { error?: { detail?: unknown } }, padrao: string): string {
    const detail = e?.error?.detail;
    return typeof detail === 'string' ? detail : padrao;
  }
}
