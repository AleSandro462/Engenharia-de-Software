// =====================================================================
// DADOS MOCKADOS DA AGENDA (REQ 07 e 08)
// Usados só enquanto USAR_MOCK = true em services/agenda.ts.
// =====================================================================
import { Tutor } from '../tutores/tutores.model';
import { Consulta, Veterinario, paraIso, somarDias } from './agenda.model';

// TODO(REQ 06): APAGAR esta lista quando o PR de veterinários (Alessandro) for aprovado
// e trocar AgendaService.listarVeterinarios() por GET /veterinarios/.
export const VETERINARIOS_MOCK: Veterinario[] = [
  { id: 1, nome: 'Dra. Beatriz Lins', crmv: 'CRMV-SP 38.412', especialidade: 'Dermatologia' },
  { id: 2, nome: 'Dr. Felipe Silva', crmv: 'CRMV-SP 42.109', especialidade: 'Clínico geral' },
  { id: 3, nome: 'Dra. Helena Silva', crmv: 'CRMV-SP 29.870', especialidade: 'Odontologia' },
];

export const TUTORES_MOCK: Tutor[] = [
  {
    id: 1,
    nome: 'Carlos Eduardo Mendes',
    cpf: '111.111.111-11',
    telefone: '(71) 98873-2214',
    email: 'carlos.mendes@email.com',
    animais: [{ id: 1, nome: 'Thor', especie: 'Cão', raca: 'Golden Retriever', data_nascimento: '2021-03-12' }],
  },
  {
    id: 2,
    nome: 'Ana Paula Ribeiro',
    cpf: '222.222.222-22',
    telefone: '(71) 99111-0000',
    email: 'ana.ribeiro@email.com',
    animais: [
      { id: 2, nome: 'Mel', especie: 'Gato', raca: 'Siamês', data_nascimento: '2022-07-01' },
      { id: 3, nome: 'Pipoca', especie: 'Cão', raca: 'Poodle', data_nascimento: '2019-11-20' },
    ],
  },
  {
    id: 3,
    nome: 'João Batista',
    cpf: '333.333.333-33',
    telefone: '(71) 98888-7777',
    email: null,
    animais: [
      { id: 4, nome: 'Bob', especie: 'Cão', raca: 'Vira-lata', data_nascimento: '2018-05-05' },
      { id: 5, nome: 'Mia', especie: 'Gato', raca: null, data_nascimento: null },
    ],
  },
];

/** Gera consultas de exemplo dentro da semana que começa em `segunda`. */
export function gerarConsultasMock(segunda: Date): Consulta[] {
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
