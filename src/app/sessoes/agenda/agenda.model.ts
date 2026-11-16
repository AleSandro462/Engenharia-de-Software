import { Veterinario } from '../veterinarios/veterinarios.model';

export type StatusConsulta =
  | 'aguardando'
  | 'confirmada'
  | 'em_atendimento'
  | 'concluida'
  | 'cancelada';

/** Mesmo formato devolvido por GET /consultas/ no backend. */
export interface Consulta {
  id: number;
  animal_id: number;
  animal_nome: string;
  tutor_id: number;
  tutor_nome: string;
  veterinario_id: number;
  data: string; // 'YYYY-MM-DD'
  hora_inicio: string; // 'HH:MM' ou 'HH:MM:SS'
  duracao_min: number;
  tipo: string;
  observacoes: string | null;
  status: StatusConsulta;
  motivo_cancelamento: string | null;
}

/** Corpo do POST /consultas/ */
export interface NovaConsulta {
  animal_id: number;
  tutor_id: number;
  veterinario_id: number;
  data: string;
  hora_inicio: string;
  duracao_min: number;
  tipo: string;
  observacoes: string | null;
}

/** Veterinário como vem de GET /veterinarios/ (REQ 06); lá o id é opcional só porque o mesmo tipo serve para o cadastro. */
export type VeterinarioAgenda = Veterinario & { id: number };

export const STATUS_INFO: Record<StatusConsulta, { rotulo: string }> = {
  aguardando: { rotulo: 'Aguardando' },
  confirmada: { rotulo: 'Confirmada' },
  em_atendimento: { rotulo: 'Em atendimento' },
  concluida: { rotulo: 'Concluída' },
  cancelada: { rotulo: 'Cancelada' },
};

export const TIPOS_CONSULTA = ['Consulta', 'Retorno', 'Vacinação', 'Exame', 'Cirurgia'];

/** Duração sugerida (min) de cada tipo; o usuário ainda pode ajustar no agendamento. */
export const DURACAO_POR_TIPO: Record<string, number> = {
  Consulta: 30,
  Retorno: 30,
  Vacinação: 15,
  Exame: 45,
  Cirurgia: 120,
};

// ---------- utilitários de data (sempre no fuso local, sem converter para UTC) ----------

export function paraIso(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function deIso(iso: string): Date {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a, m - 1, d);
}

export function somarDias(d: Date, dias: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + dias);
  return r;
}

/** Segunda-feira da semana de `d` (domingo conta como semana anterior). */
export function segundaDaSemana(d: Date): Date {
  const dia = d.getDay(); // 0 = domingo
  return somarDias(new Date(d.getFullYear(), d.getMonth(), d.getDate()), dia === 0 ? -6 : 1 - dia);
}

/** Semana exibida ao abrir a agenda: a atual (aos domingos, a próxima, pois a grade é Seg–Sáb). */
export function semanaInicial(): Date {
  const hoje = new Date();
  return segundaDaSemana(hoje.getDay() === 0 ? somarDias(hoje, 1) : hoje);
}

export function hhmm(hora: string): string {
  return hora.slice(0, 5);
}

export function minutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

export function somarMinutos(hora: string, min: number): string {
  const total = minutos(hora) + min;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function numeroSemanaIso(d: Date): number {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dia = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dia);
  const inicioAno = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - inicioAno.getTime()) / 86400000 + 1) / 7);
}
