// =====================================================================
// APOIO PARA OS TESTES DA AGENDA (não é usado pelo app).
// FakeAgendaService reproduz em memória as regras do backend
// (backend/app/routers/consultas.py), para os specs rodarem sem API.
// =====================================================================
import { Observable, of, throwError } from 'rxjs';
import { AgendaService } from '../../services/agenda';
import { Tutor } from '../tutores/tutores.model';
import {
  Consulta,
  NovaConsulta,
  hhmm,
  minutos,
  paraIso,
  semanaInicial,
  somarDias,
  VeterinarioAgenda,
} from './agenda.model';

export const VETERINARIOS_FAKE: VeterinarioAgenda[] = [
  { id: 1, nome: 'Dra. Beatriz Lins', crmv: 'CRMV-SP 38.412', telefone: '(71) 99999-0001', email: 'beatriz@vetcare.com', especialidade: 'Dermatologia' },
  { id: 2, nome: 'Dr. Felipe Silva', crmv: 'CRMV-SP 42.109', telefone: '(71) 99999-0002', email: 'felipe@vetcare.com', especialidade: 'Clínico geral' },
  { id: 3, nome: 'Dra. Helena Silva', crmv: 'CRMV-SP 29.870', telefone: '(71) 99999-0003', email: 'helena@vetcare.com', especialidade: 'Odontologia' },
];

export const TUTORES_FAKE: Tutor[] = [
  {
    id: 1,
    nome: 'Carlos Eduardo Mendes',
    cpf: '111.111.111-11',
    telefone: '(71) 98873-2214',
    email: 'carlos.mendes@email.com',
    endereco: null,
    animais: [{ id: 1, nome: 'Thor', especie: 'Cão', raca: 'Golden Retriever', sexo: 'M', data_nascimento: '2021-03-12' }],
  },
  {
    id: 2,
    nome: 'Ana Paula Ribeiro',
    cpf: '222.222.222-22',
    telefone: '(71) 99111-0000',
    email: 'ana.ribeiro@email.com',
    endereco: null,
    animais: [
      { id: 2, nome: 'Mel', especie: 'Gato', raca: 'Siamês', sexo: 'F', data_nascimento: '2022-07-01' },
      { id: 3, nome: 'Pipoca', especie: 'Cão', raca: 'Poodle', sexo: 'F', data_nascimento: '2019-11-20' },
    ],
  },
  {
    id: 3,
    nome: 'João Batista',
    cpf: '333.333.333-33',
    telefone: '(71) 98888-7777',
    email: null,
    endereco: null,
    animais: [
      { id: 4, nome: 'Bob', especie: 'Cão', raca: 'Vira-lata', sexo: 'M', data_nascimento: '2018-05-05' },
      { id: 5, nome: 'Mia', especie: 'Gato', raca: null, sexo: 'F', data_nascimento: null },
    ],
  },
];

/** Gera consultas de exemplo dentro da semana que começa em `segunda`. */
export function gerarConsultasFake(segunda: Date): Consulta[] {
  const d = (offset: number) => paraIso(somarDias(segunda, offset));
  const base = { observacoes: null, motivo_cancelamento: null };
  return [
    { ...base, id: 1, animal_id: 1, animal_nome: 'Thor', tutor_id: 1, tutor_nome: 'Carlos Eduardo Mendes', veterinario_id: 1, data: d(1), hora_inicio: '10:00', duracao_min: 45, tipo: 'Retorno', status: 'confirmada', observacoes: 'Acompanhamento de dermatite atópica sazonal.' },
    { ...base, id: 2, animal_id: 2, animal_nome: 'Mel', tutor_id: 2, tutor_nome: 'Ana Paula Ribeiro', veterinario_id: 2, data: d(1), hora_inicio: '11:00', duracao_min: 30, tipo: 'Consulta', status: 'aguardando' },
    { ...base, id: 3, animal_id: 3, animal_nome: 'Pipoca', tutor_id: 2, tutor_nome: 'Ana Paula Ribeiro', veterinario_id: 3, data: d(1), hora_inicio: '13:30', duracao_min: 60, tipo: 'Vacinação', status: 'confirmada' },
    { ...base, id: 4, animal_id: 4, animal_nome: 'Bob', tutor_id: 3, tutor_nome: 'João Batista', veterinario_id: 2, data: d(2), hora_inicio: '14:45', duracao_min: 30, tipo: 'Consulta', status: 'confirmada' },
    { ...base, id: 5, animal_id: 5, animal_nome: 'Mia', tutor_id: 3, tutor_nome: 'João Batista', veterinario_id: 1, data: d(3), hora_inicio: '16:00', duracao_min: 45, tipo: 'Exame', status: 'confirmada' },
    { ...base, id: 6, animal_id: 2, animal_nome: 'Mel', tutor_id: 2, tutor_nome: 'Ana Paula Ribeiro', veterinario_id: 3, data: d(0), hora_inicio: '09:00', duracao_min: 30, tipo: 'Consulta', status: 'concluida' },
    { ...base, id: 7, animal_id: 4, animal_nome: 'Bob', tutor_id: 3, tutor_nome: 'João Batista', veterinario_id: 2, data: d(2), hora_inicio: '09:00', duracao_min: 30, tipo: 'Consulta', status: 'cancelada', motivo_cancelamento: 'Tutor não poderá comparecer.' },
  ];
}

/** Uso: `{ provide: AgendaService, useClass: FakeAgendaService }` nos providers do TestBed. */
export class FakeAgendaService
  implements Pick<AgendaService, 'listar' | 'agendar' | 'cancelar' | 'listarTutores' | 'listarVeterinarios'>
{
  private consultas: Consulta[] = gerarConsultasFake(semanaInicial());
  private proximoId = 100;

  listar(inicio: string, fim: string): Observable<Consulta[]> {
    return of(this.consultas.filter((c) => c.data >= inicio && c.data <= fim).map((c) => ({ ...c })));
  }

  listarTutores(): Observable<Tutor[]> {
    return of(TUTORES_FAKE);
  }

  listarVeterinarios(): Observable<VeterinarioAgenda[]> {
    return of(VETERINARIOS_FAKE);
  }

  agendar(d: NovaConsulta): Observable<Consulta> {
    const tutor = TUTORES_FAKE.find((t) => t.id === d.tutor_id);
    const animal = tutor?.animais.find((a) => a.id === d.animal_id);
    if (!tutor) return this.erro(404, 'Tutor não encontrado');
    if (!animal) return this.erro(400, 'O animal não pertence a este tutor');
    if (!VETERINARIOS_FAKE.some((v) => v.id === d.veterinario_id)) {
      return this.erro(404, 'Veterinário não encontrado');
    }
    if (new Date(`${d.data}T${d.hora_inicio}`) < new Date()) {
      return this.erro(400, 'Não é possível agendar no passado');
    }
    const ini = minutos(d.hora_inicio);
    const fim = ini + d.duracao_min;
    const conflito = this.consultas.find(
      (c) =>
        c.veterinario_id === d.veterinario_id &&
        c.data === d.data &&
        c.status !== 'cancelada' &&
        ini < minutos(c.hora_inicio) + c.duracao_min &&
        minutos(c.hora_inicio) < fim,
    );
    if (conflito) {
      return this.erro(409, `O veterinário já tem uma consulta às ${hhmm(conflito.hora_inicio)} neste dia`);
    }
    const nova: Consulta = {
      ...d,
      id: this.proximoId++,
      animal_nome: animal.nome,
      tutor_nome: tutor.nome,
      status: 'aguardando',
      motivo_cancelamento: null,
    };
    this.consultas.push(nova);
    return of({ ...nova });
  }

  cancelar(id: number, motivo: string | null): Observable<Consulta> {
    const c = this.consultas.find((x) => x.id === id);
    if (!c) return this.erro(404, 'Consulta não encontrada');
    if (c.status === 'cancelada') return this.erro(400, 'A consulta já está cancelada');
    if (c.status === 'concluida' || c.status === 'em_atendimento') {
      return this.erro(400, 'Só é possível cancelar consultas ainda não iniciadas');
    }
    c.status = 'cancelada';
    c.motivo_cancelamento = motivo;
    return of({ ...c });
  }

  private erro(status: number, detail: string) {
    return throwError(() => ({ status, error: { detail } }));
  }
}
