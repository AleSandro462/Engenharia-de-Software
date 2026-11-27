export interface AnimalBusca {
  id: number;
  nome: string;
  especie: string;
  raca?: string | null;
  tutor_nome: string;
}

export interface RegistroProntuario {
  atendimento_id: number;
  data: string;
  hora: string;
  tipo: string;
  veterinario_nome: string;
  diagnostico: string;
  observacoes?: string | null;
  procedimentos?: string | null;
}

export interface ProntuarioOut {
  animal: AnimalBusca;
  atendimentos: RegistroProntuario[];
}